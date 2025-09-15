"use client"

import type React from "react"

import { useEffect, useRef } from "react"
import type { Song } from "@/types/music"

interface WaveformVisualizationProps {
  song: Song
  selectedSectionId: string | null
  onSectionSelect: (sectionId: string | null) => void
}

export function WaveformVisualization({ song, selectedSectionId, onSectionSelect }: WaveformVisualizationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !song.waveformData) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * window.devicePixelRatio
    canvas.height = rect.height * window.devicePixelRatio
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio)

    const width = rect.width
    const height = rect.height
    const centerY = height / 2

    // Clear canvas
    ctx.clearRect(0, 0, width, height)

    // Draw waveform
    const barWidth = width / song.waveformData.length
    const maxAmplitude = Math.max(...song.waveformData)

    song.waveformData.forEach((amplitude, index) => {
      const x = index * barWidth
      const barHeight = (amplitude / maxAmplitude) * (height * 0.8)

      // Determine color based on section
      let color = "#6366f1" // Default accent color
      if (song.sections) {
        const timePosition = (index / song.waveformData.length) * song.duration
        const currentSection = song.sections.find(
          (section) => timePosition >= section.startTime && timePosition <= section.endTime,
        )

        if (currentSection) {
          if (currentSection.id === selectedSectionId) {
            color = "#dc2626" // Highlight selected section
          } else {
            // Color by section type
            const sectionColors: Record<string, string> = {
              intro: "#0891b2",
              verse: "#6366f1",
              chorus: "#f59e0b",
              bridge: "#8b5cf6",
              outro: "#4b5563",
              instrumental: "#10b981",
              breakdown: "#dc2626",
            }
            color = sectionColors[currentSection.type] || "#6366f1"
          }
        }
      }

      ctx.fillStyle = color
      ctx.fillRect(x, centerY - barHeight / 2, Math.max(barWidth - 1, 1), barHeight)
    })

    // Draw section boundaries
    if (song.sections) {
      song.sections.forEach((section) => {
        const startX = (section.startTime / song.duration) * width
        const endX = (section.endTime / song.duration) * width

        // Draw section boundary lines
        ctx.strokeStyle = "#374151"
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(startX, 0)
        ctx.lineTo(startX, height)
        ctx.stroke()

        // Draw section labels
        ctx.fillStyle = "#1f2937"
        ctx.font = "12px sans-serif"
        ctx.fillText(section.type, startX + 4, 16)
      })
    }
  }, [song, selectedSectionId])

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas || !song.sections) return

    const rect = canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const timePosition = (x / rect.width) * song.duration

    // Find clicked section
    const clickedSection = song.sections.find(
      (section) => timePosition >= section.startTime && timePosition <= section.endTime,
    )

    if (clickedSection) {
      onSectionSelect(clickedSection.id === selectedSectionId ? null : clickedSection.id)
    }
  }

  return (
    <div className="w-full h-64 bg-muted/20 rounded-lg overflow-hidden">
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-pointer"
        onClick={handleCanvasClick}
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  )
}
