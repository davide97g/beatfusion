"use client";

import { useAudioPlayer } from "@/hooks/use-audio-player";
import { useMixStorage } from "@/hooks/use-mix-storage";
import type { Mix, Song } from "@/types/music";
import { useState } from "react";
import { Header } from "./header";
import { MainContent } from "./main-content";
import { PlaybackControls } from "./playback-controls";
import { Sidebar } from "./sidebar";

export function MusicPlayer() {
  const [songs] = useState<Song[]>([]);
  const [selectedSongs, setSelectedSongs] = useState<Song[]>([]);
  const [currentMix, setCurrentMix] = useState<Mix | null>(null);
  const { saveMix } = useMixStorage();
  const {
    previewInterval,
    stopPreview,
    isPreviewPlaying,
    previewTimeRemaining,
  } = useAudioPlayer();

  const handleSongSelect = (song: Song, selected: boolean) => {
    console.log(
      "[v0] Song selection changed:",
      song.title,
      "selected:",
      selected
    );
    if (selected) {
      setSelectedSongs((prev) => {
        const newSelection = [...prev, song];
        console.log(
          "[v0] New selected songs:",
          newSelection.map((s) => s.title)
        );
        return newSelection;
      });
    } else {
      setSelectedSongs((prev) => {
        const newSelection = prev.filter((s) => s.id !== song.id);
        console.log(
          "[v0] New selected songs:",
          newSelection.map((s) => s.title)
        );
        return newSelection;
      });
    }
  };

  const handleAnalyzeSongs = () => {
    console.log(
      "[v0] Analyzing songs:",
      selectedSongs.map((s) => s.title)
    );
  };

  const handleSetCurrentMix = (mix: Mix | null) => {
    console.log("[v0] Setting current mix:", mix?.name || "null");
    setCurrentMix(mix);
    if (mix) {
      // Auto-save when mix is updated
      saveMix(mix);
    }
  };

  const handleLoadMix = (mix: Mix) => {
    console.log("[v0] Loading mix:", mix.name);
    setCurrentMix(mix);
    // Set selected songs based on mix
    const mixSongs = Array.from(
      new Set(mix.sections.map((section) => section.song))
    );
    console.log(
      "[v0] Auto-selecting songs from mix:",
      mixSongs.map((s) => s.title)
    );
    setSelectedSongs(mixSongs);
  };

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
        <MainContent
          selectedSongs={selectedSongs}
          currentMix={currentMix}
          setCurrentMix={handleSetCurrentMix}
          onPreviewInterval={previewInterval}
          onStopPreview={stopPreview}
          isPreviewPlaying={isPreviewPlaying}
          previewTimeRemaining={previewTimeRemaining}
        />

        {/* Playback Controls */}
        <PlaybackControls currentMix={currentMix} />
      </div>
    </div>
  );
}
