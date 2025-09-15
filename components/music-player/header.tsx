"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { MixLibrary } from "./mix-library"
import { useMixStorage } from "@/hooks/use-mix-storage"
import { Upload, Save, FolderOpen, Music } from "lucide-react"
import type { Mix } from "@/types/music"

interface HeaderProps {
  currentMix: Mix | null
  onLoadMix?: (mix: Mix) => void
}

export function Header({ currentMix, onLoadMix }: HeaderProps) {
  const [showLibrary, setShowLibrary] = useState(false)
  const { saveMix } = useMixStorage()

  const handleSaveMix = () => {
    if (currentMix) {
      saveMix(currentMix)
      alert(`Mix "${currentMix.name}" saved successfully!`)
    }
  }

  const handleLoadMix = (mix: Mix) => {
    if (onLoadMix) {
      onLoadMix(mix)
    }
    setShowLibrary(false)
  }

  return (
    <header className="h-16 border-b border-border bg-card px-6 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Music className="w-6 h-6 text-accent" />
          <h1 className="text-xl font-semibold text-foreground">Music Mixer Pro</h1>
        </div>
        {currentMix && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Current Mix:</span>
            <span className="font-medium">{currentMix.name}</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm">
          <Upload className="w-4 h-4 mr-2" />
          Upload Songs
        </Button>

        <Dialog open={showLibrary} onOpenChange={setShowLibrary}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <FolderOpen className="w-4 h-4 mr-2" />
              Mix Library
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Mix Library</DialogTitle>
            </DialogHeader>
            <MixLibrary onLoadMix={handleLoadMix} />
          </DialogContent>
        </Dialog>

        <Button variant="default" size="sm" disabled={!currentMix} onClick={handleSaveMix}>
          <Save className="w-4 h-4 mr-2" />
          Save Mix
        </Button>
      </div>
    </header>
  )
}
