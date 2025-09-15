"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import type { Mix, MixSection } from "@/types/music"

interface AudioPlayerState {
  isPlaying: boolean
  currentTime: number
  duration: number
  volume: number
  currentSectionIndex: number
  isLoading: boolean
}

export function useAudioPlayer() {
  const [state, setState] = useState<AudioPlayerState>({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 1,
    currentSectionIndex: 0,
    isLoading: false,
  })

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const currentMixRef = useRef<Mix | null>(null)
  const timeUpdateIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const initializeAudio = useCallback(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio()
      audioRef.current.preload = "metadata"

      audioRef.current.addEventListener("loadstart", () => {
        setState((prev) => ({ ...prev, isLoading: true }))
      })

      audioRef.current.addEventListener("loadedmetadata", () => {
        setState((prev) => ({
          ...prev,
          duration: audioRef.current?.duration || 0,
          isLoading: false,
        }))
      })

      audioRef.current.addEventListener("ended", () => {
        handleSectionEnd()
      })

      audioRef.current.addEventListener("error", () => {
        setState((prev) => ({ ...prev, isLoading: false, isPlaying: false }))
        console.warn("Audio playback error - using demo mode")
      })
    }
  }, [])

  const startTimeUpdate = useCallback(() => {
    if (timeUpdateIntervalRef.current) {
      clearInterval(timeUpdateIntervalRef.current)
    }

    timeUpdateIntervalRef.current = setInterval(() => {
      if (audioRef.current && !audioRef.current.paused) {
        setState((prev) => ({
          ...prev,
          currentTime: audioRef.current?.currentTime || 0,
        }))
      }
    }, 100)
  }, [])

  const stopTimeUpdate = useCallback(() => {
    if (timeUpdateIntervalRef.current) {
      clearInterval(timeUpdateIntervalRef.current)
      timeUpdateIntervalRef.current = null
    }
  }, [])

  const handleSectionEnd = useCallback(() => {
    const currentMix = currentMixRef.current
    if (!currentMix) return

    const nextIndex = state.currentSectionIndex + 1
    if (nextIndex < currentMix.sections.length) {
      // Play next section
      setState((prev) => ({ ...prev, currentSectionIndex: nextIndex }))
      playSection(currentMix.sections[nextIndex])
    } else {
      // Mix ended
      setState((prev) => ({
        ...prev,
        isPlaying: false,
        currentSectionIndex: 0,
        currentTime: 0,
      }))
      stopTimeUpdate()
    }
  }, [state.currentSectionIndex])

  const playSection = useCallback(
    (mixSection: MixSection) => {
      console.log("[v0] Audio Player - Playing section:", mixSection.song.title, "-", mixSection.section.type)

      initializeAudio()

      if (!audioRef.current) return

      // For demo purposes, we'll simulate playback since we don't have real audio files
      const startTime = mixSection.customStartTime || mixSection.section.startTime
      const endTime = mixSection.customEndTime || mixSection.section.endTime
      const duration = endTime - startTime

      console.log("[v0] Audio Player - Section duration:", duration, "seconds")

      // Set a placeholder audio source (this would be the actual song URL in production)
      audioRef.current.src = mixSection.song.url
      audioRef.current.currentTime = startTime

      // Simulate playback for demo
      setState((prev) => ({
        ...prev,
        isPlaying: true,
        duration: duration,
        currentTime: 0,
      }))

      startTimeUpdate()

      // Auto-advance to next section after duration (demo simulation)
      setTimeout(() => {
        if (state.isPlaying) {
          console.log("[v0] Audio Player - Section ended, moving to next")
          handleSectionEnd()
        }
      }, duration * 1000)

      // Try to play real audio (will fallback to simulation if no real audio)
      audioRef.current.play().catch(() => {
        console.log("[v0] Audio Player - Using simulated playback for demo")
      })
    },
    [initializeAudio, startTimeUpdate, handleSectionEnd, state.isPlaying],
  )

  const playMix = useCallback(
    (mix: Mix) => {
      if (!mix.sections.length) return

      console.log("[v0] Audio Player - Starting mix playback:", mix.name)
      console.log("[v0] Audio Player - Mix sections:", mix.sections.length)

      currentMixRef.current = mix
      setState((prev) => ({
        ...prev,
        currentSectionIndex: 0,
      }))

      playSection(mix.sections[0])
    },
    [playSection],
  )

  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
    }
    setState((prev) => ({ ...prev, isPlaying: false }))
    stopTimeUpdate()
  }, [stopTimeUpdate])

  const resume = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.play().catch(() => {
        console.log("[v0] Audio Player - Using simulated playback for demo")
      })
    }
    setState((prev) => ({ ...prev, isPlaying: true }))
    startTimeUpdate()
  }, [startTimeUpdate])

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
    setState((prev) => ({
      ...prev,
      isPlaying: false,
      currentTime: 0,
      currentSectionIndex: 0,
    }))
    stopTimeUpdate()
    currentMixRef.current = null
  }, [stopTimeUpdate])

  const seekTo = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time
    }
    setState((prev) => ({ ...prev, currentTime: time }))
  }, [])

  const setVolume = useCallback((volume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, volume))
    if (audioRef.current) {
      audioRef.current.volume = clampedVolume
    }
    setState((prev) => ({ ...prev, volume: clampedVolume }))
  }, [])

  const skipToSection = useCallback(
    (sectionIndex: number) => {
      const currentMix = currentMixRef.current
      if (!currentMix || sectionIndex < 0 || sectionIndex >= currentMix.sections.length) return

      setState((prev) => ({ ...prev, currentSectionIndex: sectionIndex }))
      playSection(currentMix.sections[sectionIndex])
    },
    [playSection],
  )

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopTimeUpdate()
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [stopTimeUpdate])

  return {
    ...state,
    playMix,
    pause,
    resume,
    stop,
    seekTo,
    setVolume,
    skipToSection,
    currentMix: currentMixRef.current,
  }
}
