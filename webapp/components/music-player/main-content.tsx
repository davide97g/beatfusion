"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Mix, Song } from "@/types/music";
import { useState } from "react";
import { MixCreator } from "./mix-creator";
import { SongAnalysis } from "./song-analysis";

interface MainContentProps {
  selectedSongs: Song[];
  currentMix: Mix | null;
  setCurrentMix: (mix: Mix | null) => void;
  onPreviewInterval?: (song: Song, startTime: number, endTime: number) => void;
  onStopPreview?: () => void;
  isPreviewPlaying?: boolean;
  previewTimeRemaining?: number;
}

export function MainContent({
  selectedSongs,
  currentMix,
  setCurrentMix,
  onPreviewInterval,
  onStopPreview,
  isPreviewPlaying = false,
  previewTimeRemaining = 0,
}: MainContentProps) {
  const [activeTab, setActiveTab] = useState("analysis");

  console.log(
    "[v0] MainContent - selectedSongs:",
    selectedSongs.map((s) => s.title)
  );

  if (selectedSongs.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center bg-muted/20">
        <div className="text-center">
          <h3 className="text-lg font-medium text-muted-foreground mb-2">
            No Songs Selected
          </h3>
          <p className="text-sm text-muted-foreground">
            Select songs from the sidebar to start analyzing
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Upload songs using the "Upload Songs" button to get started
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6">
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="h-full flex flex-col"
      >
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="analysis">Song Analysis</TabsTrigger>
          <TabsTrigger value="mix">Mix Creator</TabsTrigger>
        </TabsList>

        <TabsContent value="analysis" className="flex-1">
          <SongAnalysis
            songs={selectedSongs}
            onPreviewInterval={onPreviewInterval}
            onStopPreview={onStopPreview}
            isPreviewPlaying={isPreviewPlaying}
            previewTimeRemaining={previewTimeRemaining}
          />
        </TabsContent>

        <TabsContent value="mix" className="flex-1 min-h-0">
          <MixCreator
            songs={selectedSongs}
            currentMix={currentMix}
            setCurrentMix={setCurrentMix}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
