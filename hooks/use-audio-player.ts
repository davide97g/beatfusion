"use client";

import { useAudioManager } from "./use-audio-manager";

// Re-export the audio manager as the audio player for backward compatibility
export function useAudioPlayer() {
  return useAudioManager();
}
