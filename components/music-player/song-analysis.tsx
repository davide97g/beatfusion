"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { Song } from "@/types/music";
import { BarChart3, Clock, Music } from "lucide-react";
import { useState } from "react";
import { ToneAttributesPanel } from "./tone-attributes-panel";
import { WaveformVisualization } from "./waveform-visualization";

interface SongAnalysisProps {
  songs: Song[];
}

export function SongAnalysis({ songs }: SongAnalysisProps) {
  const [selectedSong, setSelectedSong] = useState<Song>(songs[0]);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(
    null
  );

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 1000);
    return `${mins}:${secs.toString().padStart(2, "0")}.${ms
      .toString()
      .padStart(3, "0")}`;
  };

  const selectedSection = selectedSong.sections?.find(
    (s) => s.id === selectedSectionId
  );

  return (
    <div className="h-full flex gap-6">
      {/* Song List */}
      <div className="w-80 space-y-3">
        <h3 className="text-lg font-semibold mb-4">Selected Songs</h3>
        {songs.map((song) => (
          <Card
            key={song.id}
            className={`p-4 cursor-pointer transition-colors ${
              selectedSong.id === song.id
                ? "bg-accent text-accent-foreground"
                : "hover:bg-muted/50"
            }`}
            onClick={() => setSelectedSong(song)}
          >
            <div className="flex items-center gap-3 mb-2">
              <Music className="w-4 h-4" />
              <div className="flex-1 min-w-0">
                <h4 className="font-medium truncate">{song.title}</h4>
                <p className="text-sm text-muted-foreground">{song.artist}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              {formatDuration(song.duration)}
              <BarChart3 className="w-3 h-3 ml-2" />
              {song.sections?.length || 0} sections
            </div>
          </Card>
        ))}
      </div>

      {/* Analysis Content */}
      <div className="flex-1 flex flex-col gap-6">
        {/* Song Header */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold">{selectedSong.title}</h2>
              <p className="text-lg text-muted-foreground">
                {selectedSong.artist}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Duration</p>
              <p className="text-lg font-semibold">
                {formatDuration(selectedSong.duration)}
              </p>
            </div>
          </div>

          {/* Sections Overview */}
          <div className="flex flex-wrap gap-2">
            {selectedSong.sections?.map((section) => (
              <Badge
                key={section.id}
                variant={
                  selectedSectionId === section.id ? "default" : "outline"
                }
                className={`cursor-pointer ${
                  selectedSectionId === section.id
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground bg-background hover:bg-muted"
                }`}
                onClick={() =>
                  setSelectedSectionId(
                    section.id === selectedSectionId ? null : section.id
                  )
                }
              >
                {section.type} ({formatDuration(section.duration)})
              </Badge>
            ))}
          </div>
        </Card>

        {/* Waveform Visualization */}
        <Card className="p-6 flex-1">
          <h3 className="text-lg font-semibold mb-4">Waveform Analysis</h3>
          <WaveformVisualization
            song={selectedSong}
            selectedSectionId={selectedSectionId}
            onSectionSelect={setSelectedSectionId}
          />
        </Card>

        {/* Tone Attributes Panel */}
        {selectedSection && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">
              Section Analysis:{" "}
              {selectedSection.type.charAt(0).toUpperCase() +
                selectedSection.type.slice(1)}
            </h3>
            <ToneAttributesPanel section={selectedSection} />
          </Card>
        )}
      </div>
    </div>
  );
}
