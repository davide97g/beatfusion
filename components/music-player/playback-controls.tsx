"use client"

import { useState } from "react"
import type { Mix } from "@/types/music"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAudioPlayer } from "@/hooks/use-audio-player"
import { Play, Pause, Square, SkipBack, SkipForward, Volume2, VolumeX, Repeat, Shuffle } from "lucide-react"

interface PlaybackControlsProps {
  currentMix: Mix | null
}

export function PlaybackControls({ currentMix }: PlaybackControlsProps) {
  const [isShuffled, setIsShuffled] = useState(false)
  const [isRepeating, setIsRepeating] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [previousVolume, setPreviousVolume] = useState(1)

  const {
    isPlaying,
    currentTime,
    duration,
    volume,
    currentSectionIndex,
    isLoading,
    playMix,
    pause,
    resume,
    stop,
    seekTo,
    setVolume,
    skipToSection,
  } = useAudioPlayer()

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const handlePlayPause = () => {
    if (!currentMix) return

    if (isPlaying) {
      pause()
    } else if (currentTime > 0) {
      resume()
    } else {
      playMix(currentMix)
    }
  }

  const handleStop = () => {
    stop()
  }

  const handlePrevious = () => {
    if (!currentMix) return
    const prevIndex = Math.max(0, currentSectionIndex - 1)
    skipToSection(prevIndex)
  }

  const handleNext = () => {
    if (!currentMix) return
    const nextIndex = Math.min(currentMix.sections.length - 1, currentSectionIndex + 1)
    skipToSection(nextIndex)
  }

  const handleSeek = (value: number[]) => {
    seekTo(value[0])
  }

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0] / 100
    setVolume(newVolume)
    if (newVolume > 0 && isMuted) {
      setIsMuted(false)
    }
  }

  const handleMute = () => {
    if (isMuted) {
      setVolume(previousVolume)
      setIsMuted(false)
    } else {
      setPreviousVolume(volume)
      setVolume(0)
      setIsMuted(true)
    }
  }

  const currentSection = currentMix?.sections[currentSectionIndex]
  const totalDuration =
    currentMix?.sections.reduce((total, section) => {
      const sectionDuration =
        section.customEndTime && section.customStartTime
          ? section.customEndTime - section.customStartTime
          : section.section.duration
      return total + sectionDuration
    }, 0) || 0

  return (
    <Card className="p-4 border-t">
      <div className="flex items-center gap-6">
        {/* Current Track Info */}
        <div className="min-w-0 flex-1">
          {currentSection ? (
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h4 className="font-medium truncate">{currentSection.song.title}</h4>
                <Badge variant="secondary" className="text-xs">
                  {currentSection.section.type}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground truncate">
                {currentSection.song.artist} • Section {currentSectionIndex + 1} of {currentMix?.sections.length}
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              <h4 className="font-medium text-muted-foreground">No mix selected</h4>
              <p className="text-sm text-muted-foreground">Create a mix to start playing</p>
            </div>
          )}
        </div>

        {/* Main Controls */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsShuffled(!isShuffled)}
            className={isShuffled ? "bg-accent text-accent-foreground" : ""}
          >
            <Shuffle className="w-4 h-4" />
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={handlePrevious}
            disabled={!currentMix || currentSectionIndex === 0}
          >
            <SkipBack className="w-4 h-4" />
          </Button>

          <Button size="lg" onClick={handlePlayPause} disabled={!currentMix || isLoading} className="w-12 h-12">
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : isPlaying ? (
              <Pause className="w-5 h-5" />
            ) : (
              <Play className="w-5 h-5" />
            )}
          </Button>

          <Button size="sm" variant="outline" onClick={handleStop} disabled={!currentMix}>
            <Square className="w-4 h-4" />
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={handleNext}
            disabled={!currentMix || currentSectionIndex === (currentMix?.sections.length || 0) - 1}
          >
            <SkipForward className="w-4 h-4" />
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsRepeating(!isRepeating)}
            className={isRepeating ? "bg-accent text-accent-foreground" : ""}
          >
            <Repeat className="w-4 h-4" />
          </Button>
        </div>

        {/* Progress Bar */}
        <div className="flex-1 space-y-2">
          <Slider
            value={[currentTime]}
            max={duration || 100}
            step={1}
            onValueChange={handleSeek}
            className="w-full"
            disabled={!currentMix}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Volume Control */}
        <div className="flex items-center gap-2 min-w-0">
          <Button size="sm" variant="ghost" onClick={handleMute}>
            {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </Button>
          <Slider value={[volume * 100]} max={100} step={1} onValueChange={handleVolumeChange} className="w-20" />
        </div>

        {/* Mix Info */}
        {currentMix && (
          <div className="text-right min-w-0">
            <div className="text-sm font-medium truncate">{currentMix.name}</div>
            <div className="text-xs text-muted-foreground">{formatTime(totalDuration)} total</div>
          </div>
        )}
      </div>
    </Card>
  )
}
