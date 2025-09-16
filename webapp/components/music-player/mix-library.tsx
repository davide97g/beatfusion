"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAudioPlayer } from "@/hooks/use-audio-player";
import { useMixStorage } from "@/hooks/use-mix-storage";
import type { Mix } from "@/types/music";
import {
  Calendar,
  Copy,
  Download,
  Edit,
  FileText,
  Play,
  Trash2,
  Upload,
} from "lucide-react";
import { useState } from "react";

interface MixLibraryProps {
  onLoadMix: (mix: Mix) => void;
}

export function MixLibrary({ onLoadMix }: MixLibraryProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [importData, setImportData] = useState("");
  const [exportData, setExportData] = useState("");
  const [selectedMix, setSelectedMix] = useState<Mix | null>(null);

  const {
    savedMixes,
    isLoading,
    deleteMix,
    duplicateMix,
    exportMix,
    importMix,
    exportAllMixes,
    clearAllMixes,
  } = useMixStorage();

  const { playMix } = useAudioPlayer();

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 1000);
    return `${mins}:${secs.toString().padStart(2, "0")}.${ms
      .toString()
      .padStart(3, "0")}`;
  };

  const getMixDuration = (mix: Mix) => {
    return mix.sections.reduce((total, section) => {
      const sectionDuration =
        section.customEndTime && section.customStartTime
          ? section.customEndTime - section.customStartTime
          : section.section.duration;
      return total + sectionDuration;
    }, 0);
  };

  const filteredMixes = savedMixes.filter((mix) =>
    mix.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExportMix = (mixId: string) => {
    const data = exportMix(mixId);
    if (data) {
      setExportData(data);
      const mix = savedMixes.find((m) => m.id === mixId);
      setSelectedMix(mix || null);
    }
  };

  const handleImportMix = () => {
    if (importData.trim()) {
      const imported = importMix(importData);
      if (imported) {
        setImportData("");
        alert("Mix imported successfully!");
      } else {
        alert("Failed to import mix. Please check the format.");
      }
    }
  };

  const handleExportAll = () => {
    const data = exportAllMixes();
    setExportData(data);
    setSelectedMix(null);
  };

  const downloadExport = () => {
    const filename = selectedMix
      ? `${selectedMix.name}.json`
      : "all-mixes.json";
    const blob = new Blob([exportData], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-current border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Loading mixes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Actions */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search mixes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Upload className="w-4 h-4 mr-2" />
              Import
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Import Mix</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Mix Data (JSON)</Label>
                <Textarea
                  placeholder="Paste mix JSON data here..."
                  value={importData}
                  onChange={(e) => setImportData(e.target.value)}
                  rows={10}
                />
              </div>
              <Button onClick={handleImportMix} disabled={!importData.trim()}>
                Import Mix
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Button variant="outline" size="sm" onClick={handleExportAll}>
          <Download className="w-4 h-4 mr-2" />
          Export All
        </Button>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              disabled={savedMixes.length === 0}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear All
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Clear All Mixes</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete all saved mixes. This action cannot
                be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={clearAllMixes}>
                Clear All
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* Mix Grid */}
      {filteredMixes.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg mb-2">
            {searchTerm ? "No mixes found" : "No saved mixes"}
          </p>
          <p className="text-sm">
            {searchTerm
              ? "Try a different search term"
              : "Create and save your first mix to see it here"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMixes.map((mix) => (
            <Card
              key={mix.id}
              className="p-4 hover:shadow-md transition-shadow"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">{mix.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(mix.updatedAt)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>{mix.sections.length} sections</span>
                  <span>{formatDuration(getMixDuration(mix))}</span>
                </div>

                <div className="flex flex-wrap gap-1">
                  {mix.sections.slice(0, 3).map((section, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="text-xs text-foreground bg-background"
                    >
                      {section.section.type}
                    </Badge>
                  ))}
                  {mix.sections.length > 3 && (
                    <Badge
                      variant="outline"
                      className="text-xs text-foreground bg-background"
                    >
                      +{mix.sections.length - 3} more
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Button size="sm" onClick={() => playMix(mix)}>
                    <Play className="w-3 h-3 mr-1" />
                    Play
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onLoadMix(mix)}
                  >
                    <Edit className="w-3 h-3 mr-1" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => duplicateMix(mix.id)}
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleExportMix(mix.id)}
                  >
                    <Download className="w-3 h-3" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-destructive hover:text-destructive bg-transparent"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Mix</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{mix.name}"? This
                          action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => deleteMix(mix.id)}>
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Export Dialog */}
      {exportData && (
        <Dialog open={!!exportData} onOpenChange={() => setExportData("")}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                Export {selectedMix ? `"${selectedMix.name}"` : "All Mixes"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>JSON Data</Label>
                <Textarea
                  value={exportData}
                  readOnly
                  rows={15}
                  className="font-mono text-sm"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={downloadExport}>
                  <Download className="w-4 h-4 mr-2" />
                  Download File
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(exportData);
                    alert("Copied to clipboard!");
                  }}
                >
                  Copy to Clipboard
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
