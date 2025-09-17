"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAudioPlayer } from "@/hooks/use-audio-player";
import type { Mix, MixSection, Song } from "@/types/music";
import { BarChart3, Play, Plus, Save, Scissors } from "lucide-react";
import { useState } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { DraggableSection } from "./draggable-section";
import { IntervalSelector } from "./interval-selector";
import { MixTimeline } from "./mix-timeline";
import { SectionEditor } from "./section-editor";

interface MixCreatorProps {
  songs: Song[];
  currentMix: Mix | null;
  setCurrentMix: (mix: Mix | null) => void;
}

export function MixCreator({
  songs,
  currentMix,
  setCurrentMix,
}: MixCreatorProps) {
  const [mixName, setMixName] = useState(currentMix?.name || "New Mix");
  const [mixSections, setMixSections] = useState<MixSection[]>(
    currentMix?.sections || []
  );
  const [editingSection, setEditingSection] = useState<MixSection | null>(null);
  const [selectingInterval, setSelectingInterval] = useState<{
    song: Song;
    section: any;
  } | null>(null);
  const {
    playMix,
    currentTime,
    isPlaying,
    currentSectionIndex,
    previewInterval,
  } = useAudioPlayer();

  const createNewMix = () => {
    const newMix: Mix = {
      id: Date.now().toString(),
      name: mixName,
      sections: mixSections,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setCurrentMix(newMix);
  };

  const previewMix = () => {
    if (mixSections.length === 0) return;

    console.log(
      "[v0] Starting mix preview with",
      mixSections.length,
      "sections"
    );

    const tempMix: Mix = {
      id: "preview",
      name: mixName,
      sections: mixSections,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    console.log(
      "[v0] Mix sections:",
      mixSections.map((s) => `${s.song.title} - ${s.section.type}`)
    );
    playMix(tempMix);
  };

  const addSectionToMix = (songId: string, sectionId: string) => {
    const song = songs.find((s) => s.id === songId);
    const section = song?.sections?.find((s) => s.id === sectionId);

    if (song && section) {
      const newMixSection: MixSection = {
        id: Date.now().toString(),
        sectionId: section.id,
        song,
        section,
        startTime: section.startTime,
        endTime: section.endTime,
        order: mixSections.length,
      };
      setMixSections([...mixSections, newMixSection]);
    }
  };

  const addCustomInterval = (songId: string, sectionId: string) => {
    const song = songs.find((s) => s.id === songId);
    const section = song?.sections?.find((s) => s.id === sectionId);

    if (song && section) {
      setSelectingInterval({ song, section });
    }
  };

  const handleIntervalSelect = (startTime: number, endTime: number) => {
    if (!selectingInterval) return;

    const newMixSection: MixSection = {
      id: Date.now().toString(),
      sectionId: selectingInterval.section.id,
      song: selectingInterval.song,
      section: selectingInterval.section,
      startTime: selectingInterval.section.startTime,
      endTime: selectingInterval.section.endTime,
      order: mixSections.length,
      customInterval: {
        start: startTime,
        end: endTime,
      },
    };
    setMixSections([...mixSections, newMixSection]);
    setSelectingInterval(null);
  };

  const removeSectionFromMix = (mixSectionId: string) => {
    setMixSections(mixSections.filter((s) => s.id !== mixSectionId));
  };

  const moveMixSection = (dragIndex: number, dropIndex: number) => {
    const draggedSection = mixSections[dragIndex];
    const newSections = [...mixSections];
    newSections.splice(dragIndex, 1);
    newSections.splice(dropIndex, 0, draggedSection);

    const updatedSections = newSections.map((section, index) => ({
      ...section,
      order: index,
    }));

    setMixSections(updatedSections);
  };

  const handleEditSection = (mixSection: MixSection) => {
    setEditingSection(mixSection);
  };

  const handleSaveSection = (updatedSection: any) => {
    setMixSections(
      mixSections.map((ms) =>
        ms.id === editingSection?.id ? { ...ms, section: updatedSection } : ms
      )
    );
    setEditingSection(null);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 1000);
    return `${mins}:${secs.toString().padStart(2, "0")}.${ms
      .toString()
      .padStart(3, "0")}`;
  };

  const totalDuration = mixSections.reduce((total, mixSection) => {
    const sectionDuration = mixSection.customInterval
      ? mixSection.customInterval.end - mixSection.customInterval.start
      : mixSection.section.duration;
    return total + sectionDuration;
  }, 0);

  // Handle different views
  if (selectingInterval) {
    return (
      <div className="h-full">
        <IntervalSelector
          section={selectingInterval.section}
          song={selectingInterval.song}
          onIntervalSelect={handleIntervalSelect}
          onCancel={() => setSelectingInterval(null)}
          onPreviewInterval={previewInterval}
        />
      </div>
    );
  }

  if (editingSection) {
    return (
      <div className="h-full">
        <SectionEditor
          section={editingSection.section}
          onSave={handleSaveSection}
          onCancel={() => setEditingSection(null)}
        />
      </div>
    );
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="h-full flex flex-col gap-6">
        {/* Mix Controls */}
        <div className="flex items-center gap-4">
          <Input
            value={mixName}
            onChange={(e) => setMixName(e.target.value)}
            placeholder="Mix name"
            className="max-w-xs"
          />
          <Button onClick={createNewMix} variant="default">
            <Save className="w-4 h-4 mr-2" />
            Save Mix
          </Button>
          <Button
            variant={isPlaying ? "secondary" : "outline"}
            disabled={mixSections.length === 0}
            onClick={previewMix}
            className={
              isPlaying ? "bg-green-100 border-green-300 text-green-800" : ""
            }
          >
            <Play className="w-4 h-4 mr-2" />
            {isPlaying ? "Playing Preview..." : "Preview Mix"}
          </Button>
          <div className="text-sm text-muted-foreground">
            Total: {formatDuration(totalDuration)} • {mixSections.length}{" "}
            sections
            {isPlaying && mixSections[currentSectionIndex] && (
              <span className="ml-2 text-green-600 font-medium">
                • Now: {mixSections[currentSectionIndex].song.title} (
                {mixSections[currentSectionIndex].section.type})
              </span>
            )}
          </div>
        </div>

        {isPlaying && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-center gap-2 text-green-800">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">
                Playing mix preview - Section {currentSectionIndex + 1} of{" "}
                {mixSections.length}
              </span>
            </div>
            <div className="text-xs text-green-600 mt-1">
              Current: {mixSections[currentSectionIndex]?.song.title} -{" "}
              {mixSections[currentSectionIndex]?.section.type}
            </div>
          </div>
        )}

        {/* Mix Timeline */}
        {mixSections.length > 0 && (
          <MixTimeline
            mixSections={mixSections}
            currentTime={currentTime}
            onPreviewInterval={previewInterval}
          />
        )}

        <div className="flex-1 flex gap-6 min-h-0">
          {/* Available Sections */}
          <div className="w-96 lg:w-[32rem] xl:w-[36rem] 2xl:w-[40rem] flex flex-col space-y-4 min-h-0">
            <h3 className="text-lg font-semibold">Available Sections</h3>
            <div className="flex-1 space-y-3 overflow-y-auto pr-2">
              {songs.map((song) => (
                <Card key={song.id} className="p-4">
                  <h4 className="font-medium mb-3 truncate" title={song.title}>
                    {song.title}
                  </h4>
                  <div className="space-y-2">
                    {song.sections?.map((section) => (
                      <div key={section.id} className="space-y-2">
                        <div className="flex items-center justify-between p-2 bg-muted/20 rounded">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="p-1 h-6 w-6 flex-shrink-0"
                              onClick={() => {
                                const startTime = section.startTime;
                                const endTime = Math.min(
                                  section.startTime + 10,
                                  section.endTime
                                );
                                previewInterval(song, startTime, endTime);
                              }}
                              title="Play 10s preview"
                            >
                              <Play className="w-3 h-3" />
                            </Button>
                            <Badge
                              variant="outline"
                              className="text-xs text-foreground bg-background flex-shrink-0"
                            >
                              {section.type}
                            </Badge>
                            <span className="text-sm flex-shrink-0">
                              {formatDuration(section.duration)}
                            </span>
                            <Badge
                              variant="outline"
                              className="text-xs text-foreground bg-background flex-shrink-0"
                            >
                              {section.toneAttributes.mood}
                            </Badge>
                          </div>
                          <div className="flex gap-1 flex-shrink-0">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                addSectionToMix(song.id, section.id)
                              }
                              title="Add to mix"
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                addCustomInterval(song.id, section.id)
                              }
                              title="Custom interval"
                            >
                              <Scissors className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-muted-foreground pl-8">
                          <BarChart3 className="w-3 h-3" />
                          <span>Energy: {section.toneAttributes.energy}%</span>
                          <span>
                            Intensity: {section.toneAttributes.intensity}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Mix Builder */}
          <div className="flex-1 space-y-4 min-h-0">
            <Card className="p-6 flex-1 flex flex-col min-h-0">
              <h3 className="text-lg font-semibold mb-4">Mix Sections</h3>
              {mixSections.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <p className="text-lg mb-2">No sections added yet</p>
                  <p className="text-sm">
                    Add sections from the left panel to build your mix
                  </p>
                  <p className="text-sm">
                    Use the <Scissors className="w-3 h-3 inline mx-1" /> button
                    to select custom intervals
                  </p>
                </div>
              ) : (
                <div className="flex-1 space-y-3 overflow-y-auto pr-2">
                  {mixSections.map((mixSection, index) => (
                    <DraggableSection
                      key={mixSection.id}
                      mixSection={mixSection}
                      index={index}
                      onMove={moveMixSection}
                      onEdit={handleEditSection}
                      onDelete={removeSectionFromMix}
                      onPreviewInterval={previewInterval}
                    />
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </DndProvider>
  );
}
