"use client"

import { useState } from "react"
import type { Song, Mix } from "@/types/music"
import { demoSongs } from "@/lib/demo-data"
import { Header } from "./music-player/header"
import { Sidebar } from "./music-player/sidebar"
import { MainContent } from "./music-player/main-content"
import { PlaybackControls } from "./music-player/playback-controls"

export function MusicPlayer() {
  const [songs] = useState<Song[]>(demoSongs)
  const [selectedSongs, setSelectedSongs] = useState<Song[]>([])
  const [currentMix, setCurrentMix] = useState<Mix | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)

  const handleSongSelect = (song: Song, selected: boolean) => {
    if (selected) {
      setSelectedSongs((prev) => [...prev, song])
    } else {
      setSelectedSongs((prev) => prev.filter((s) => s.id !== song.id))
    }
  }

  const handleAnalyzeSongs = () => {
    // Songs are already analyzed with demo data
    console.log("Analyzing songs:", selectedSongs)
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
        <Header currentMix={currentMix} />

        {/* Main Content */}
        <MainContent selectedSongs={selectedSongs} currentMix={currentMix} setCurrentMix={setCurrentMix} />

        {/* Playback Controls */}
        <PlaybackControls
          isPlaying={isPlaying}
          setIsPlaying={setIsPlaying}
          currentTime={currentTime}
          setCurrentTime={setCurrentTime}
          currentMix={currentMix}
        />
      </div>
    </div>
  )
}
