"use client"

import { useState, useEffect, useCallback } from "react"
import type { Mix } from "@/types/music"

const STORAGE_KEY = "music-mixer-mixes"

export function useMixStorage() {
  const [savedMixes, setSavedMixes] = useState<Mix[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Load mixes from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const mixes = JSON.parse(stored)
        // Convert date strings back to Date objects
        const parsedMixes = mixes.map((mix: any) => ({
          ...mix,
          createdAt: new Date(mix.createdAt),
          updatedAt: new Date(mix.updatedAt),
        }))
        setSavedMixes(parsedMixes)
      }
    } catch (error) {
      console.error("Failed to load mixes from storage:", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Save mixes to localStorage whenever savedMixes changes
  useEffect(() => {
    if (!isLoading) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(savedMixes))
      } catch (error) {
        console.error("Failed to save mixes to storage:", error)
      }
    }
  }, [savedMixes, isLoading])

  const saveMix = useCallback((mix: Mix) => {
    setSavedMixes((prev) => {
      const existingIndex = prev.findIndex((m) => m.id === mix.id)
      const updatedMix = { ...mix, updatedAt: new Date() }

      if (existingIndex >= 0) {
        // Update existing mix
        const updated = [...prev]
        updated[existingIndex] = updatedMix
        return updated
      } else {
        // Add new mix
        return [...prev, updatedMix]
      }
    })
    return mix
  }, [])

  const deleteMix = useCallback((mixId: string) => {
    setSavedMixes((prev) => prev.filter((mix) => mix.id !== mixId))
  }, [])

  const loadMix = useCallback(
    (mixId: string): Mix | null => {
      return savedMixes.find((mix) => mix.id === mixId) || null
    },
    [savedMixes],
  )

  const duplicateMix = useCallback(
    (mixId: string): Mix | null => {
      const originalMix = savedMixes.find((mix) => mix.id === mixId)
      if (!originalMix) return null

      const duplicatedMix: Mix = {
        ...originalMix,
        id: Date.now().toString(),
        name: `${originalMix.name} (Copy)`,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      setSavedMixes((prev) => [...prev, duplicatedMix])
      return duplicatedMix
    },
    [savedMixes],
  )

  const exportMix = useCallback(
    (mixId: string): string | null => {
      const mix = savedMixes.find((m) => m.id === mixId)
      if (!mix) return null

      try {
        return JSON.stringify(mix, null, 2)
      } catch (error) {
        console.error("Failed to export mix:", error)
        return null
      }
    },
    [savedMixes],
  )

  const importMix = useCallback((mixData: string): Mix | null => {
    try {
      const mix = JSON.parse(mixData)

      // Validate mix structure
      if (!mix.id || !mix.name || !mix.sections || !Array.isArray(mix.sections)) {
        throw new Error("Invalid mix format")
      }

      // Generate new ID to avoid conflicts
      const importedMix: Mix = {
        ...mix,
        id: Date.now().toString(),
        name: `${mix.name} (Imported)`,
        createdAt: new Date(mix.createdAt || new Date()),
        updatedAt: new Date(),
      }

      setSavedMixes((prev) => [...prev, importedMix])
      return importedMix
    } catch (error) {
      console.error("Failed to import mix:", error)
      return null
    }
  }, [])

  const exportAllMixes = useCallback((): string => {
    try {
      return JSON.stringify(savedMixes, null, 2)
    } catch (error) {
      console.error("Failed to export all mixes:", error)
      return "[]"
    }
  }, [savedMixes])

  const clearAllMixes = useCallback(() => {
    setSavedMixes([])
  }, [])

  return {
    savedMixes,
    isLoading,
    saveMix,
    deleteMix,
    loadMix,
    duplicateMix,
    exportMix,
    importMix,
    exportAllMixes,
    clearAllMixes,
  }
}
