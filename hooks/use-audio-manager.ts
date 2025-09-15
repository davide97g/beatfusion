"use client";

import type { Mix, MixSection, Song } from "@/types/music";
import { useCallback, useEffect, useRef, useState } from "react";

interface AudioManagerState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  currentSectionIndex: number;
  isLoading: boolean;
  currentSong: Song | null;
  currentSection: MixSection | null;
}

export function useAudioManager() {
  const [state, setState] = useState<AudioManagerState>({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 1,
    currentSectionIndex: 0,
    isLoading: false,
    currentSong: null,
    currentSection: null,
  });

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentMixRef = useRef<Mix | null>(null);
  const timeUpdateIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const sectionStartTimeRef = useRef<number>(0);

  const initializeAudio = useCallback(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.preload = "metadata";
      audioRef.current.crossOrigin = "anonymous";

      audioRef.current.addEventListener("loadstart", () => {
        setState((prev) => ({ ...prev, isLoading: true }));
      });

      audioRef.current.addEventListener("loadedmetadata", () => {
        setState((prev) => ({
          ...prev,
          duration: audioRef.current?.duration || 0,
          isLoading: false,
        }));
      });

      audioRef.current.addEventListener("timeupdate", () => {
        if (audioRef.current) {
          const currentTime = audioRef.current.currentTime;
          setState((prev) => ({ ...prev, currentTime }));
        }
      });

      audioRef.current.addEventListener("ended", () => {
        handleSectionEnd();
      });

      audioRef.current.addEventListener("error", (e) => {
        console.error("Audio playback error:", e);
        setState((prev) => ({ ...prev, isLoading: false, isPlaying: false }));
      });

      audioRef.current.addEventListener("canplaythrough", () => {
        setState((prev) => ({ ...prev, isLoading: false }));
      });
    }
  }, []);

  const startTimeUpdate = useCallback(() => {
    if (timeUpdateIntervalRef.current) {
      clearInterval(timeUpdateIntervalRef.current);
    }

    timeUpdateIntervalRef.current = setInterval(() => {
      if (audioRef.current && !audioRef.current.paused) {
        const currentTime = audioRef.current.currentTime;
        setState((prev) => ({ ...prev, currentTime }));
      }
    }, 100);
  }, []);

  const stopTimeUpdate = useCallback(() => {
    if (timeUpdateIntervalRef.current) {
      clearInterval(timeUpdateIntervalRef.current);
      timeUpdateIntervalRef.current = null;
    }
  }, []);

  const handleSectionEnd = useCallback(() => {
    const currentMix = currentMixRef.current;
    if (!currentMix) return;

    const nextIndex = state.currentSectionIndex + 1;
    if (nextIndex < currentMix.sections.length) {
      // Play next section
      setState((prev) => ({ ...prev, currentSectionIndex: nextIndex }));
      playSection(currentMix.sections[nextIndex]);
    } else {
      // Mix ended
      setState((prev) => ({
        ...prev,
        isPlaying: false,
        currentSectionIndex: 0,
        currentTime: 0,
        currentSong: null,
        currentSection: null,
      }));
      stopTimeUpdate();
    }
  }, [state.currentSectionIndex]);

  const playSection = useCallback(
    async (mixSection: MixSection) => {
      console.log(
        "[Audio Manager] Playing section:",
        mixSection.song.title,
        "-",
        mixSection.section.type
      );

      initializeAudio();

      if (!audioRef.current) return;

      try {
        // Set the audio source to the song URL
        audioRef.current.src = mixSection.song.url;

        // Calculate the start and end times for this section
        const startTime =
          mixSection.customInterval?.start || mixSection.section.startTime;
        const endTime =
          mixSection.customInterval?.end || mixSection.section.endTime;
        const sectionDuration = endTime - startTime;

        console.log(
          "[Audio Manager] Section timing:",
          `start: ${startTime}s, end: ${endTime}s, duration: ${sectionDuration}s`
        );

        // Set the current time to the start of the section
        audioRef.current.currentTime = startTime;
        sectionStartTimeRef.current = startTime;

        // Update state with current section info
        setState((prev) => ({
          ...prev,
          currentSong: mixSection.song,
          currentSection: mixSection,
          duration: sectionDuration,
          currentTime: 0,
          isLoading: true,
        }));

        // Wait for the audio to be ready
        await new Promise<void>((resolve, reject) => {
          if (!audioRef.current) {
            reject(new Error("Audio element not available"));
            return;
          }

          const handleCanPlay = () => {
            audioRef.current?.removeEventListener("canplay", handleCanPlay);
            audioRef.current?.removeEventListener("error", handleError);
            resolve();
          };

          const handleError = () => {
            audioRef.current?.removeEventListener("canplay", handleCanPlay);
            audioRef.current?.removeEventListener("error", handleError);
            reject(new Error("Failed to load audio"));
          };

          audioRef.current.addEventListener("canplay", handleCanPlay);
          audioRef.current.addEventListener("error", handleError);

          // If already loaded, resolve immediately
          if (audioRef.current.readyState >= 3) {
            handleCanPlay();
          }
        });

        // Start playing
        await audioRef.current.play();

        setState((prev) => ({
          ...prev,
          isPlaying: true,
          isLoading: false,
        }));

        startTimeUpdate();

        // Set up a timeout to stop at the end of the section
        const timeoutId = setTimeout(() => {
          if (audioRef.current && !audioRef.current.paused) {
            console.log(
              "[Audio Manager] Section time limit reached, moving to next"
            );
            handleSectionEnd();
          }
        }, sectionDuration * 1000);

        // Store timeout ID for cleanup
        (audioRef.current as any)._sectionTimeout = timeoutId;
      } catch (error) {
        console.error("[Audio Manager] Failed to play section:", error);
        setState((prev) => ({
          ...prev,
          isLoading: false,
          isPlaying: false,
        }));
      }
    },
    [initializeAudio, startTimeUpdate, handleSectionEnd]
  );

  const playMix = useCallback(
    async (mix: Mix) => {
      if (!mix.sections.length) return;

      console.log("[Audio Manager] Starting mix playback:", mix.name);
      console.log("[Audio Manager] Mix sections:", mix.sections.length);

      currentMixRef.current = mix;
      setState((prev) => ({
        ...prev,
        currentSectionIndex: 0,
      }));

      await playSection(mix.sections[0]);
    },
    [playSection]
  );

  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      // Clear the section timeout
      if ((audioRef.current as any)._sectionTimeout) {
        clearTimeout((audioRef.current as any)._sectionTimeout);
      }
    }
    setState((prev) => ({ ...prev, isPlaying: false }));
    stopTimeUpdate();
  }, [stopTimeUpdate]);

  const resume = useCallback(async () => {
    if (audioRef.current) {
      try {
        await audioRef.current.play();
        setState((prev) => ({ ...prev, isPlaying: true }));
        startTimeUpdate();
      } catch (error) {
        console.error("[Audio Manager] Failed to resume playback:", error);
      }
    }
  }, [startTimeUpdate]);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      // Clear the section timeout
      if ((audioRef.current as any)._sectionTimeout) {
        clearTimeout((audioRef.current as any)._sectionTimeout);
      }
    }
    setState((prev) => ({
      ...prev,
      isPlaying: false,
      currentTime: 0,
      currentSectionIndex: 0,
      currentSong: null,
      currentSection: null,
    }));
    stopTimeUpdate();
    currentMixRef.current = null;
  }, [stopTimeUpdate]);

  const seekTo = useCallback(
    (time: number) => {
      if (audioRef.current && state.currentSection) {
        const startTime =
          state.currentSection.customInterval?.start ||
          state.currentSection.section.startTime;
        const actualTime = startTime + time;
        audioRef.current.currentTime = actualTime;
        setState((prev) => ({ ...prev, currentTime: time }));
      }
    },
    [state.currentSection]
  );

  const setVolume = useCallback((volume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, volume));
    if (audioRef.current) {
      audioRef.current.volume = clampedVolume;
    }
    setState((prev) => ({ ...prev, volume: clampedVolume }));
  }, []);

  const skipToSection = useCallback(
    async (sectionIndex: number) => {
      const currentMix = currentMixRef.current;
      if (
        !currentMix ||
        sectionIndex < 0 ||
        sectionIndex >= currentMix.sections.length
      )
        return;

      setState((prev) => ({ ...prev, currentSectionIndex: sectionIndex }));
      await playSection(currentMix.sections[sectionIndex]);
    },
    [playSection]
  );

  const previewInterval = useCallback(
    (song: Song, startTime: number, endTime: number) => {
      if (!song.url) {
        console.error("No audio URL available for preview");
        return;
      }

      // Create a temporary audio element for preview
      const previewAudio = new Audio(song.url);
      previewAudio.currentTime = startTime;

      const playPreview = () => {
        previewAudio.play().catch(console.error);
      };

      const stopPreview = () => {
        previewAudio.pause();
        previewAudio.currentTime = 0;
      };

      // Set up timeout to stop at end time
      const duration = endTime - startTime;
      const timeoutId = setTimeout(() => {
        stopPreview();
      }, duration * 1000);

      // Store timeout ID for cleanup
      (previewAudio as any)._previewTimeout = timeoutId;

      // Handle audio events
      previewAudio.addEventListener("ended", stopPreview);
      previewAudio.addEventListener("error", (e) => {
        console.error("Preview audio error:", e);
        stopPreview();
      });

      // Start playing
      playPreview();

      // Return cleanup function
      return () => {
        clearTimeout(timeoutId);
        stopPreview();
        previewAudio.removeEventListener("ended", stopPreview);
        previewAudio.removeEventListener("error", stopPreview);
      };
    },
    []
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopTimeUpdate();
      if (audioRef.current) {
        audioRef.current.pause();
        if ((audioRef.current as any)._sectionTimeout) {
          clearTimeout((audioRef.current as any)._sectionTimeout);
        }
        audioRef.current = null;
      }
    };
  }, [stopTimeUpdate]);

  return {
    ...state,
    playMix,
    pause,
    resume,
    stop,
    seekTo,
    setVolume,
    skipToSection,
    previewInterval,
    currentMix: currentMixRef.current,
  };
}
