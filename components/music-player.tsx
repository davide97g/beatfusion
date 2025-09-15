"use client";

import { AnalysisService } from "@/lib/analysis-service";
import { demoSongs } from "@/lib/demo-data";
import { generateSectionsFromAnalysis } from "@/lib/song-analysis-utils";
import type { Mix, Song } from "@/types/music";
import { useRef, useState } from "react";
import { Header } from "./music-player/header";
import { MainContent } from "./music-player/main-content";
import { PlaybackControls } from "./music-player/playback-controls";
import { Sidebar } from "./music-player/sidebar";

export function MusicPlayer() {
  const [songs, setSongs] = useState<Song[]>(demoSongs);
  const [selectedSongs, setSelectedSongs] = useState<Song[]>([]);
  const [currentMix, setCurrentMix] = useState<Mix | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSongSelect = (song: Song, selected: boolean) => {
    if (selected) {
      setSelectedSongs((prev) => [...prev, song]);
    } else {
      setSelectedSongs((prev) => prev.filter((s) => s.id !== song.id));
    }
  };

  const handleAnalyzeSongs = () => {
    // Songs are already analyzed with demo data
    console.log("Analyzing songs:", selectedSongs);
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    // Check if analysis server is available
    const isServerAvailable = await AnalysisService.isServerAvailable();
    if (!isServerAvailable) {
      alert(
        "Analysis server is not available. Please make sure the Python server is running on port 3001."
      );
      return;
    }

    const validAudioTypes = [
      "audio/mp3",
      "audio/wav",
      "audio/mpeg",
      "audio/mp4",
      "audio/ogg",
      "audio/webm",
    ];

    for (const file of Array.from(files)) {
      if (!validAudioTypes.includes(file.type)) {
        alert(
          `Unsupported file type: ${file.type}. Please upload MP3, WAV, or OGG files.`
        );
        continue;
      }

      // Create object URL for the file
      const url = URL.createObjectURL(file);

      // Extract filename without extension for title
      const fileName = file.name.replace(/\.[^/.]+$/, "");

      // Create a new song object
      const newSong: Song = {
        id: `uploaded-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        title: fileName,
        artist: "Unknown Artist",
        duration: 0, // Will be updated when audio loads
        url: url,
        waveformData: [], // Will be generated if needed
        sections: [], // Will be analyzed if needed
        isAnalyzing: true,
      };

      // Add to songs list immediately
      setSongs((prev) => [...prev, newSong]);

      // Get audio duration
      const audio = new Audio(url);
      audio.addEventListener("loadedmetadata", () => {
        setSongs((prev) =>
          prev.map((song) =>
            song.id === newSong.id
              ? { ...song, duration: audio.duration }
              : song
          )
        );
      });

      // Start analysis
      try {
        console.log(`Starting analysis for: ${fileName}`);
        const analysis = await AnalysisService.analyzeAudio(file);

        // Generate sections from analysis
        const sections = generateSectionsFromAnalysis(analysis, newSong.id);

        // Update song with analysis results
        setSongs((prev) =>
          prev.map((song) =>
            song.id === newSong.id
              ? {
                  ...song,
                  analysis,
                  sections,
                  waveformData: analysis.waveform_data,
                  isAnalyzing: false,
                }
              : song
          )
        );

        console.log(`Analysis completed for: ${fileName}`, {
          sections: sections.length,
        });
      } catch (error) {
        console.error(`Analysis failed for: ${fileName}`, error);

        // Update song to show analysis failed
        setSongs((prev) =>
          prev.map((song) =>
            song.id === newSong.id
              ? {
                  ...song,
                  isAnalyzing: false,
                }
              : song
          )
        );

        alert(
          `Analysis failed for ${fileName}. The song was uploaded but analysis could not be completed.`
        );
      }
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    // Show success message
    alert(
      `Successfully uploaded ${files.length} song(s)! Analysis is in progress...`
    );
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex h-screen bg-background text-foreground">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*"
        multiple
        onChange={handleFileUpload}
        className="hidden"
      />

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
        <Header currentMix={currentMix} onUploadClick={handleUploadClick} />

        {/* Main Content */}
        <MainContent
          selectedSongs={selectedSongs}
          currentMix={currentMix}
          setCurrentMix={setCurrentMix}
        />

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
  );
}
