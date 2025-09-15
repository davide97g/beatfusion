"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import type { Song } from "@/types/music";
import { AlertCircle, BarChart3, Loader2, Music } from "lucide-react";

interface SidebarProps {
  songs: Song[];
  selectedSongs: Song[];
  onSongSelect: (song: Song, selected: boolean) => void;
  onAnalyzeSongs: () => void;
}

export function Sidebar({
  songs,
  selectedSongs,
  onSongSelect,
  onAnalyzeSongs,
}: SidebarProps) {
  console.log(
    "[v0] Sidebar - songs:",
    songs.map((s) => s.title)
  );
  console.log(
    "[v0] Sidebar - selectedSongs:",
    selectedSongs.map((s) => s.title)
  );

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 1000);
    return `${mins}:${secs.toString().padStart(2, "0")}.${ms
      .toString()
      .padStart(3, "0")}`;
  };

  return (
    <div className="w-80 bg-sidebar border-r border-sidebar-border p-4 flex flex-col">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-sidebar-foreground mb-4">
          Music Library
        </h2>
        <p className="text-xs text-muted-foreground mb-4">
          Select songs below to analyze their sections and create custom mixes
        </p>

        {selectedSongs.length > 0 && (
          <Button
            onClick={onAnalyzeSongs}
            className="w-full mb-4"
            variant="default"
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            Analyze Selected ({selectedSongs.length})
          </Button>
        )}
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto">
        {songs.map((song) => {
          const isSelected = selectedSongs.some((s) => s.id === song.id);

          return (
            <Card
              key={song.id}
              className={`p-3 cursor-pointer transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground ${
                isSelected
                  ? "bg-sidebar-accent text-sidebar-accent-foreground border-primary"
                  : "bg-sidebar-primary"
              }`}
              onClick={() => onSongSelect(song, !isSelected)}
            >
              <div className="flex items-start gap-3">
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={(checked) => onSongSelect(song, !!checked)}
                  className="mt-1"
                  onClick={(e) => e.stopPropagation()}
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Music className="w-4 h-4 text-sidebar-accent" />
                    <h3 className="font-medium text-sidebar-primary-foreground truncate">
                      {song.title}
                    </h3>
                  </div>

                  <p className="text-sm text-muted-foreground mb-2">
                    {song.artist}
                  </p>
                  <p className="text-xs text-muted-foreground mb-2">
                    Duration: {formatDuration(song.duration)}
                  </p>

                  {/* Analysis Status */}
                  {song.isAnalyzing && (
                    <div className="flex items-center gap-2 mb-2">
                      <Loader2 className="w-3 h-3 animate-spin text-blue-500" />
                      <span className="text-xs text-blue-600">
                        Analyzing...
                      </span>
                    </div>
                  )}

                  {!song.isAnalyzing &&
                    !song.analysis &&
                    song.id.startsWith("uploaded-") && (
                      <div className="flex items-center gap-2 mb-2">
                        <AlertCircle className="w-3 h-3 text-orange-500" />
                        <span className="text-xs text-orange-600">
                          Analysis failed
                        </span>
                      </div>
                    )}

                  {song.sections && song.sections.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {song.sections.map((section) => (
                        <Badge
                          key={section.id}
                          variant="outline"
                          className="text-xs text-foreground bg-background"
                        >
                          {section.type}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {song.analysis && (
                    <div className="mt-2 text-xs text-muted-foreground">
                      <div>BPM: {Math.round(song.analysis.tempo_bpm)}</div>
                      <div>Sections: {song.sections?.length || 0}</div>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
