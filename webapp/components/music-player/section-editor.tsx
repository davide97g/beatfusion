"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import type { SongSection, ToneAttributes } from "@/types/music";
import { Save, X } from "lucide-react";
import { useState } from "react";

interface SectionEditorProps {
  section: SongSection;
  onSave: (updatedSection: SongSection) => void;
  onCancel: () => void;
}

export function SectionEditor({
  section,
  onSave,
  onCancel,
}: SectionEditorProps) {
  const [editedSection, setEditedSection] = useState<SongSection>({
    ...section,
  });

  const handleToneAttributeChange = (key: keyof ToneAttributes, value: any) => {
    setEditedSection({
      ...editedSection,
      toneAttributes: {
        ...editedSection.toneAttributes,
        [key]: value,
      },
    });
  };

  const handleTimeChange = (field: "startTime" | "endTime", value: number) => {
    const newSection = { ...editedSection, [field]: value };
    if (field === "startTime" || field === "endTime") {
      newSection.duration = newSection.endTime - newSection.startTime;
    }
    setEditedSection(newSection);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 1000);
    return `${mins}:${secs.toString().padStart(2, "0")}.${ms
      .toString()
      .padStart(3, "0")}`;
  };

  return (
    <Card className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Edit Section</h3>
        <div className="flex gap-2">
          <Button size="sm" onClick={() => onSave(editedSection)}>
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>
          <Button size="sm" variant="outline" onClick={onCancel}>
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
        </div>
      </div>

      {/* Section Type and Timing */}
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Section Type</Label>
          <Select
            value={editedSection.type}
            onValueChange={(value) =>
              setEditedSection({ ...editedSection, type: value as any })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="intro">Intro</SelectItem>
              <SelectItem value="verse">Verse</SelectItem>
              <SelectItem value="chorus">Chorus</SelectItem>
              <SelectItem value="bridge">Bridge</SelectItem>
              <SelectItem value="outro">Outro</SelectItem>
              <SelectItem value="instrumental">Instrumental</SelectItem>
              <SelectItem value="breakdown">Breakdown</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Start Time (seconds)</Label>
          <Input
            type="number"
            value={editedSection.startTime}
            onChange={(e) =>
              handleTimeChange("startTime", Number(e.target.value))
            }
            min={0}
          />
          <div className="text-xs text-muted-foreground">
            {formatTime(editedSection.startTime)}
          </div>
        </div>

        <div className="space-y-2">
          <Label>End Time (seconds)</Label>
          <Input
            type="number"
            value={editedSection.endTime}
            onChange={(e) =>
              handleTimeChange("endTime", Number(e.target.value))
            }
            min={editedSection.startTime}
          />
          <div className="text-xs text-muted-foreground">
            {formatTime(editedSection.endTime)}
          </div>
        </div>
      </div>

      {/* Duration Display */}
      <div className="p-3 bg-muted/20 rounded-lg">
        <div className="text-sm text-muted-foreground">Duration</div>
        <div className="text-lg font-semibold">
          {formatTime(editedSection.duration)}
        </div>
      </div>

      {/* Tone Attributes */}
      <div className="space-y-6">
        <h4 className="font-medium">Tone Attributes</h4>

        {/* Energy Level */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Energy Level</Label>
            <span className="text-sm text-muted-foreground">
              {editedSection.toneAttributes.energy}%
            </span>
          </div>
          <Slider
            value={[editedSection.toneAttributes.energy]}
            onValueChange={([value]) =>
              handleToneAttributeChange("energy", value)
            }
            max={100}
            step={1}
            className="w-full"
          />
        </div>

        {/* Intensity */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Intensity</Label>
            <span className="text-sm text-muted-foreground">
              {editedSection.toneAttributes.intensity}%
            </span>
          </div>
          <Slider
            value={[editedSection.toneAttributes.intensity]}
            onValueChange={([value]) =>
              handleToneAttributeChange("intensity", value)
            }
            max={100}
            step={1}
            className="w-full"
          />
        </div>

        {/* Dynamic Characteristics */}
        <div className="space-y-4">
          <Label>Dynamic Characteristics</Label>
          <div className="grid grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <Switch
                checked={editedSection.toneAttributes.strongStart}
                onCheckedChange={(checked) =>
                  handleToneAttributeChange("strongStart", checked)
                }
              />
              <Label className="text-sm">Strong Start</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                checked={editedSection.toneAttributes.buildingUp}
                onCheckedChange={(checked) =>
                  handleToneAttributeChange("buildingUp", checked)
                }
              />
              <Label className="text-sm">Building Up</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                checked={editedSection.toneAttributes.slowingDown}
                onCheckedChange={(checked) =>
                  handleToneAttributeChange("slowingDown", checked)
                }
              />
              <Label className="text-sm">Slowing Down</Label>
            </div>
          </div>
        </div>

        {/* Mood */}
        <div className="space-y-2">
          <Label>Mood</Label>
          <Select
            value={editedSection.toneAttributes.mood}
            onValueChange={(value) => handleToneAttributeChange("mood", value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="uplifting">Uplifting</SelectItem>
              <SelectItem value="melancholic">Melancholic</SelectItem>
              <SelectItem value="energetic">Energetic</SelectItem>
              <SelectItem value="calm">Calm</SelectItem>
              <SelectItem value="dramatic">Dramatic</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </Card>
  );
}
