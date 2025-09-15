"use client";

import type React from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Song, SongSection } from "@/types/music";
import { Play, RotateCcw, Scissors } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface IntervalSelectorProps {
  section: SongSection;
  song: Song;
  onIntervalSelect: (startTime: number, endTime: number) => void;
  onCancel: () => void;
  onPreviewInterval?: (song: Song, startTime: number, endTime: number) => void;
}

export function IntervalSelector({
  section,
  song,
  onIntervalSelect,
  onCancel,
  onPreviewInterval,
}: IntervalSelectorProps) {
  const [customStart, setCustomStart] = useState(section.startTime);
  const [customEnd, setCustomEnd] = useState(section.endTime);
  const [isDragging, setIsDragging] = useState(false);
  const [dragType, setDragType] = useState<"start" | "end" | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 1000);
    return `${mins}:${secs.toString().padStart(2, "0")}.${ms
      .toString()
      .padStart(3, "0")}`;
  };

  const drawWaveform = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const width = rect.width;
    const height = rect.height;
    const centerY = height / 2;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw placeholder waveform background
    ctx.fillStyle = "#e5e7eb";
    ctx.fillRect(0, centerY - 2, width, 4);

    // Draw selected interval
    const startX =
      ((customStart - section.startTime) / section.duration) * width;
    const endX = ((customEnd - section.startTime) / section.duration) * width;

    // Highlight selected area
    ctx.fillStyle = "rgba(99, 102, 241, 0.3)";
    ctx.fillRect(startX, 0, endX - startX, height);

    // Draw selected waveform area
    ctx.fillStyle = "#6366f1";
    ctx.fillRect(startX, centerY - 2, endX - startX, 4);

    // Draw selection handles
    ctx.fillStyle = "#dc2626";
    ctx.fillRect(startX - 2, 0, 4, height); // Start handle
    ctx.fillRect(endX - 2, 0, 4, height); // End handle

    // Draw time labels
    ctx.fillStyle = "#1f2937";
    ctx.font = "12px sans-serif";
    ctx.fillText(formatTime(customStart), startX + 4, 16);
    ctx.fillText(formatTime(customEnd), endX + 4, 16);
  };

  useEffect(() => {
    drawWaveform();
  }, [customStart, customEnd, section]);

  const handleCanvasMouseDown = (
    event: React.MouseEvent<HTMLCanvasElement>
  ) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const timePosition =
      (x / rect.width) * section.duration + section.startTime;

    const startX =
      ((customStart - section.startTime) / section.duration) * rect.width;
    const endX =
      ((customEnd - section.startTime) / section.duration) * rect.width;

    // Check if clicking near handles
    if (Math.abs(x - startX) < 10) {
      setDragType("start");
      setIsDragging(true);
    } else if (Math.abs(x - endX) < 10) {
      setDragType("end");
      setIsDragging(true);
    } else if (x > startX && x < endX) {
      // Clicking in the middle - move both handles
      const offset = timePosition - (customStart + customEnd) / 2;
      const newStart = Math.max(section.startTime, customStart + offset);
      const newEnd = Math.min(section.endTime, customEnd + offset);
      setCustomStart(newStart);
      setCustomEnd(newEnd);
    }
  };

  const handleCanvasMouseMove = (
    event: React.MouseEvent<HTMLCanvasElement>
  ) => {
    if (!isDragging || !dragType) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const timePosition =
      (x / rect.width) * section.duration + section.startTime;

    if (dragType === "start") {
      setCustomStart(
        Math.max(section.startTime, Math.min(timePosition, customEnd - 1))
      );
    } else if (dragType === "end") {
      setCustomEnd(
        Math.min(section.endTime, Math.max(timePosition, customStart + 1))
      );
    }
  };

  const handleCanvasMouseUp = () => {
    setIsDragging(false);
    setDragType(null);
  };

  const resetInterval = () => {
    setCustomStart(section.startTime);
    setCustomEnd(section.endTime);
  };

  const applyInterval = () => {
    onIntervalSelect(customStart, customEnd);
  };

  return (
    <Card className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Select Custom Interval</h3>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={resetInterval}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
          <Button size="sm" onClick={applyInterval}>
            <Scissors className="w-4 h-4 mr-2" />
            Apply
          </Button>
          <Button size="sm" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </div>

      {/* Section Info */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label className="text-sm text-muted-foreground">Section</Label>
          <div className="font-medium">{section.type}</div>
        </div>
        <div>
          <Label className="text-sm text-muted-foreground">
            Original Duration
          </Label>
          <div className="font-medium">{formatTime(section.duration)}</div>
        </div>
        <div>
          <Label className="text-sm text-muted-foreground">
            Selected Duration
          </Label>
          <div className="font-medium">
            {formatTime(customEnd - customStart)}
          </div>
        </div>
      </div>

      {/* Interactive Waveform */}
      <div className="space-y-4">
        <Label>Drag the red handles to select your interval</Label>
        <div className="w-full h-32 bg-muted/20 rounded-lg overflow-hidden">
          <canvas
            ref={canvasRef}
            className="w-full h-full cursor-pointer"
            onMouseDown={handleCanvasMouseDown}
            onMouseMove={handleCanvasMouseMove}
            onMouseUp={handleCanvasMouseUp}
            onMouseLeave={handleCanvasMouseUp}
            style={{ width: "100%", height: "100%" }}
          />
        </div>
      </div>

      {/* Manual Time Input */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Start Time (seconds)</Label>
          <Input
            type="number"
            value={customStart}
            onChange={(e) =>
              setCustomStart(
                Math.max(
                  section.startTime,
                  Math.min(Number(e.target.value), customEnd - 1)
                )
              )
            }
            min={section.startTime}
            max={customEnd - 1}
            step={0.1}
          />
          <div className="text-xs text-muted-foreground">
            {formatTime(customStart)}
          </div>
        </div>
        <div className="space-y-2">
          <Label>End Time (seconds)</Label>
          <Input
            type="number"
            value={customEnd}
            onChange={(e) =>
              setCustomEnd(
                Math.min(
                  section.endTime,
                  Math.max(Number(e.target.value), customStart + 1)
                )
              )
            }
            min={customStart + 1}
            max={section.endTime}
            step={0.1}
          />
          <div className="text-xs text-muted-foreground">
            {formatTime(customEnd)}
          </div>
        </div>
      </div>

      {/* Preview Buttons */}
      <div className="space-y-4">
        <Label>Preview Selection</Label>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              // Play first 10 seconds of selection
              const previewStart = customStart;
              const previewEnd = Math.min(customStart + 10, customEnd);
              if (onPreviewInterval) {
                onPreviewInterval(song, previewStart, previewEnd);
              }
            }}
            disabled={customEnd - customStart < 10}
          >
            <Play className="w-4 h-4 mr-2" />
            Preview Start (10s)
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              // Play last 10 seconds of selection
              const previewStart = Math.max(customEnd - 10, customStart);
              const previewEnd = customEnd;
              if (onPreviewInterval) {
                onPreviewInterval(song, previewStart, previewEnd);
              }
            }}
            disabled={customEnd - customStart < 10}
          >
            <Play className="w-4 h-4 mr-2" />
            Preview End (10s)
          </Button>
        </div>
      </div>
    </Card>
  );
}
