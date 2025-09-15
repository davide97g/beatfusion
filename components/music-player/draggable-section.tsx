"use client"

import { useDrag, useDrop } from "react-dnd"
import type { MixSection } from "@/types/music"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { GripVertical, Edit, Trash2 } from "lucide-react"

interface DraggableSectionProps {
  mixSection: MixSection
  index: number
  onMove: (dragIndex: number, dropIndex: number) => void
  onEdit: (mixSection: MixSection) => void
  onDelete: (mixSectionId: string) => void
}

interface DragItem {
  type: string
  index: number
  id: string
}

export function DraggableSection({ mixSection, index, onMove, onEdit, onDelete }: DraggableSectionProps) {
  const [{ isDragging }, drag, dragPreview] = useDrag({
    type: "section",
    item: { type: "section", index, id: mixSection.id },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  })

  const [{ isOver }, drop] = useDrop({
    accept: "section",
    hover: (item: DragItem) => {
      if (item.index !== index) {
        onMove(item.index, index)
        item.index = index
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  })

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div ref={(node) => drag(drop(node))}>
      <Card
        className={`p-4 transition-all ${isDragging ? "opacity-50" : ""} ${isOver ? "border-accent" : ""} cursor-move`}
      >
        <div className="flex items-center gap-4">
          <div ref={drag} className="cursor-grab active:cursor-grabbing">
            <GripVertical className="w-4 h-4 text-muted-foreground" />
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium">{mixSection.song.title}</span>
              <Badge variant="outline" className="text-foreground bg-background">
                {mixSection.section.type}
              </Badge>
              <Badge variant="outline" className="text-xs text-foreground bg-background">
                {mixSection.section.toneAttributes.mood}
              </Badge>
            </div>
            <div className="text-sm text-muted-foreground">
              {formatTime(mixSection.section.startTime)} - {formatTime(mixSection.section.endTime)} (
              {formatTime(mixSection.section.duration)})
            </div>
            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
              <span>Energy: {mixSection.section.toneAttributes.energy}%</span>
              <span>Intensity: {mixSection.section.toneAttributes.intensity}%</span>
              {mixSection.section.toneAttributes.strongStart && (
                <Badge variant="outline" className="text-xs text-foreground bg-background">
                  Strong Start
                </Badge>
              )}
              {mixSection.section.toneAttributes.buildingUp && (
                <Badge variant="outline" className="text-xs text-foreground bg-background">
                  Building Up
                </Badge>
              )}
              {mixSection.section.toneAttributes.slowingDown && (
                <Badge variant="outline" className="text-xs text-foreground bg-background">
                  Slowing Down
                </Badge>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => onEdit(mixSection)}>
              <Edit className="w-3 h-3" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onDelete(mixSection.id)}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
