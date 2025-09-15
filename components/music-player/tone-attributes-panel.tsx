import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { SongSection } from "@/types/music";
import { TrendingDown, TrendingUp, Volume2, Zap } from "lucide-react";

interface ToneAttributesPanelProps {
  section: SongSection;
}

export function ToneAttributesPanel({ section }: ToneAttributesPanelProps) {
  const { toneAttributes } = section;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 1000);
    return `${mins}:${secs.toString().padStart(2, "0")}.${ms
      .toString()
      .padStart(3, "0")}`;
  };

  return (
    <div className="space-y-6">
      {/* Section Info */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Start Time</div>
          <div className="text-lg font-semibold">
            {formatTime(section.startTime)}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">End Time</div>
          <div className="text-lg font-semibold">
            {formatTime(section.endTime)}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Duration</div>
          <div className="text-lg font-semibold">
            {formatTime(section.duration)}
          </div>
        </Card>
      </div>

      {/* Energy and Intensity Metrics */}
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-accent" />
            <span className="font-medium">Energy Level</span>
            <span className="text-sm text-muted-foreground">
              ({toneAttributes.energy}%)
            </span>
          </div>
          <Progress value={toneAttributes.energy} className="h-3" />
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-accent" />
            <span className="font-medium">Intensity</span>
            <span className="text-sm text-muted-foreground">
              ({toneAttributes.intensity}%)
            </span>
          </div>
          <Progress value={toneAttributes.intensity} className="h-3" />
        </div>
      </div>

      {/* Dynamic Attributes */}
      <div className="space-y-3">
        <h4 className="font-medium">Dynamic Characteristics</h4>
        <div className="flex flex-wrap gap-2">
          {toneAttributes.strongStart && (
            <Badge variant="default" className="flex items-center gap-1">
              <Zap className="w-3 h-3" />
              Strong Start
            </Badge>
          )}
          {toneAttributes.buildingUp && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              Building Up
            </Badge>
          )}
          {toneAttributes.slowingDown && (
            <Badge variant="outline" className="flex items-center gap-1">
              <TrendingDown className="w-3 h-3" />
              Slowing Down
            </Badge>
          )}
        </div>
      </div>

      {/* Mood */}
      <div className="space-y-3">
        <h4 className="font-medium">Mood</h4>
        <Badge variant="default" className="text-sm px-3 py-1">
          {toneAttributes.mood.charAt(0).toUpperCase() +
            toneAttributes.mood.slice(1)}
        </Badge>
      </div>
    </div>
  );
}
