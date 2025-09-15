"use client"

import type React from "react"

import { useRef, useEffect } from "react"
import type { MixSection } from "@/types/music"
import { Card } from "@/components/ui/card"

interface MixTimelineProps {
  mixSections: MixSection[]
  currentTime?: number
  onTimelineClick?: (time: number) => void
}

export function MixTimeline({ mixSections, currentTime = 0, onTimelineClick }: MixTimelineProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const totalDuration = mixSections.reduce((total, section) => {
    const sectionDuration =
      section.customEndTime && section.customStartTime
        ? section.customEndTime - section.customStartTime
        : section.section.duration
    return total + sectionDuration
  }, 0)

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const drawTimeline = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * window.devicePixelRatio
    canvas.height = rect.height * window.devicePixelRatio
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio)

    const width = rect.width
    const height = rect.height

    // Clear canvas
    ctx.clearRect(0, 0, width, height)

    if (mixSections.length === 0 || totalDuration === 0) {
      // Draw empty state
      ctx.fillStyle = "#e5e7eb"
      ctx.fillRect(0, height / 2 - 2, width, 4)
      ctx.fillStyle = "#9ca3af"
      ctx.font = "14px sans-serif"
      ctx.textAlign = "center"
      ctx.fillText("No sections in mix", width / 2, height / 2 + 20)
      return
    }

    let currentX = 0

    // Section colors by type
    const sectionColors: Record<string, string> = {
      intro: "#0891b2",
      verse: "#6366f1",
      chorus: "#f59e0b",
      bridge: "#8b5cf6",
      outro: "#4b5563",
      instrumental: "#10b981",
      breakdown: "#dc2626",
    }

    // Draw sections
    mixSections.forEach((mixSection, index) => {
      const sectionDuration =
        mixSection.customEndTime && mixSection.customStartTime
          ? mixSection.customEndTime - mixSection.customStartTime
          : mixSection.section.duration

      const sectionWidth = (sectionDuration / totalDuration) * width
      const color = sectionColors[mixSection.section.type] || "#6366f1"

      // Draw section bar
      ctx.fillStyle = color
      ctx.fillRect(currentX, height / 2 - 15, sectionWidth, 30)

      // Draw section border
      ctx.strokeStyle = "#ffffff"
      ctx.lineWidth = 2
      ctx.strokeRect(currentX, height / 2 - 15, sectionWidth, 30)

      // Draw section label if wide enough
      if (sectionWidth > 60) {
        ctx.fillStyle = "#ffffff"
        ctx.font = "12px sans-serif"
        ctx.textAlign = "center"
        ctx.fillText(mixSection.section.type, currentX + sectionWidth / 2, height / 2 - 2)
        ctx.fillText(formatTime(sectionDuration), currentX + sectionWidth / 2, height / 2 + 12)
      }

      currentX += sectionWidth
    })

    // Draw playhead
    if (currentTime > 0 && totalDuration > 0) {
      const playheadX = (currentTime / totalDuration) * width
      ctx.strokeStyle = "#dc2626"
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.moveTo(playheadX, 0)
      ctx.lineTo(playheadX, height)
      ctx.stroke()

      // Draw playhead time
      ctx.fillStyle = "#dc2626"
      ctx.font = "12px sans-serif"
      ctx.textAlign = "center"
      ctx.fillText(formatTime(currentTime), playheadX, height - 5)
    }

    // Draw time markers
    const markerInterval = Math.max(30, Math.floor(totalDuration / 10)) // Every 30 seconds or 1/10th of total
    for (let time = 0; time <= totalDuration; time += markerInterval) {
      const x = (time / totalDuration) * width
      ctx.strokeStyle = "#9ca3af"
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(x, height - 20)
      ctx.lineTo(x, height)
      ctx.stroke()

      ctx.fillStyle = "#6b7280"
      ctx.font = "10px sans-serif"
      ctx.textAlign = "center"
      ctx.fillText(formatTime(time), x, height - 5)
    }
  }

  useEffect(() => {
    drawTimeline()
  }, [mixSections, currentTime, totalDuration])

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!onTimelineClick || totalDuration === 0) return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const clickTime = (x / rect.width) * totalDuration

    onTimelineClick(clickTime)
  }

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-medium">Mix Timeline</h4>
        <div className="text-sm text-muted-foreground">Total Duration: {formatTime(totalDuration)}</div>
      </div>
      <div className="w-full h-24 bg-muted/20 rounded-lg overflow-hidden">
        <canvas
          ref={canvasRef}
          className="w-full h-full cursor-pointer"
          onClick={handleCanvasClick}
          style={{ width: "100%", height: "100%" }}
        />
      </div>
    </Card>
  )
}
