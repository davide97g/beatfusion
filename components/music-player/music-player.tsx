"use client"

import { useState, useEffect } from "react"
import type { Song, Mix } from "@/types/music"
import { demoSongs, demoMix } from "@/lib/demo-data"
import { useMixStorage } from "@/hooks/use-mix-storage"
import { Header } from "./header"
import { Sidebar } from "./sidebar"
import { MainContent } from "./main-content"
import { PlaybackControls } from "./playback-controls"

export function MusicPlayer() {
  const [songs] = useState<Song[]>(demoSongs)
  const [selectedSongs, setSelectedSongs] = useState<Song[]>([])
  const [currentMix, setCurrentMix] = useState<Mix | null>(demoMix)
  const { saveMix } = useMixStorage()

  useEffect(() => {
    console.log(
      "[v0] Demo songs loaded:",
      demoSongs.map((s) => s.title),
    )
    console.log("[v0] Demo mix loaded:", demoMix?.name)

    if (demoMix && selectedSongs.length === 0) {
      const mixSongs = Array.from(new Set(demoMix.sections.map((section) => section.song)))
      console.log(
        "[v0] Auto-selecting songs from demo mix:",
        mixSongs.map((s) => s.title),
      )
      setSelectedSongs(mixSongs)
    }

    if (demoMix) {
      saveMix(demoMix)
    }
  }, [saveMix]) // Removed selectedSongs from dependency array to prevent infinite loop

  const handleSongSelect = (song: Song, selected: boolean) => {
    console.log("[v0] Song selection changed:", song.title, "selected:", selected)
    if (selected) {
      setSelectedSongs((prev) => {
        const newSelection = [...prev, song]
        console.log(
          "[v0] New selected songs:",
          newSelection.map((s) => s.title),
        )
        return newSelection
      })
    } else {
      setSelectedSongs((prev) => {
        const newSelection = prev.filter((s) => s.id !== song.id)
        console.log(
          "[v0] New selected songs:",
          newSelection.map((s) => s.title),
        )
        return newSelection
      })
    }
  }

  const handleAnalyzeSongs = () => {
    // Songs are already analyzed with demo data
    console.log(
      "[v0] Analyzing songs:",
      selectedSongs.map((s) => s.title),
    )
  }

  const handleSetCurrentMix = (mix: Mix | null) => {
    console.log("[v0] Setting current mix:", mix?.name || "null")
    setCurrentMix(mix)
    if (mix) {
      // Auto-save when mix is updated
      saveMix(mix)
    }
  }

  const handleLoadMix = (mix: Mix) => {
    console.log("[v0] Loading mix:", mix.name)
    setCurrentMix(mix)
    // Set selected songs based on mix
    const mixSongs = Array.from(new Set(mix.sections.map((section) => section.song)))
    console.log(
      "[v0] Auto-selecting songs from mix:",
      mixSongs.map((s) => s.title),
    )
    setSelectedSongs(mixSongs)
  }

  return (
    <div className="flex h-screen bg-background text-foreground">
      {/* Sidebar */}
      <Sidebar
        songs={songs}
        selectedSongs={selectedSongs}
        onSongSelect={handleSongSelect}
        onAnalyzeSongs={handleAnalyzeSongs}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <Header currentMix={currentMix} onLoadMix={handleLoadMix} />

        {/* Main Content */}
        <MainContent selectedSongs={selectedSongs} currentMix={currentMix} setCurrentMix={handleSetCurrentMix} />

        {/* Playback Controls */}
        <PlaybackControls currentMix={currentMix} />
      </div>
    </div>
  )
}
