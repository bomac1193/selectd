"use client";

import { useState, useRef, useEffect, useCallback } from "react";

interface UseAudioPlayerOptions {
  autoPlay?: boolean;
  loop?: boolean;
}

interface AudioPlayerState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  progress: number;
  isLoaded: boolean;
  error: string | null;
}

export function useAudioPlayer(
  audioUrl: string | null,
  options: UseAudioPlayerOptions = {}
) {
  const { autoPlay = false, loop = false } = options;
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [state, setState] = useState<AudioPlayerState>({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    progress: 0,
    isLoaded: false,
    error: null,
  });

  // Initialize audio element
  useEffect(() => {
    if (!audioUrl) return;

    const audio = new Audio(audioUrl);
    audio.loop = loop;
    audio.preload = "metadata";
    audioRef.current = audio;

    const handleLoadedMetadata = () => {
      setState((prev) => ({
        ...prev,
        duration: audio.duration,
        isLoaded: true,
      }));
    };

    const handleTimeUpdate = () => {
      setState((prev) => ({
        ...prev,
        currentTime: audio.currentTime,
        progress: audio.duration ? (audio.currentTime / audio.duration) * 100 : 0,
      }));
    };

    const handleEnded = () => {
      setState((prev) => ({ ...prev, isPlaying: false }));
    };

    const handleError = () => {
      setState((prev) => ({
        ...prev,
        error: "Failed to load audio",
        isLoaded: false,
      }));
    };

    const handleCanPlay = () => {
      if (autoPlay) {
        audio.play().catch(() => {
          // Autoplay blocked by browser
        });
      }
    };

    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError);
    audio.addEventListener("canplay", handleCanPlay);

    return () => {
      audio.pause();
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("error", handleError);
      audio.removeEventListener("canplay", handleCanPlay);
      audioRef.current = null;
    };
  }, [audioUrl, autoPlay, loop]);

  const play = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.play().then(() => {
        setState((prev) => ({ ...prev, isPlaying: true }));
      }).catch((err) => {
        console.error("Play error:", err);
      });
    }
  }, []);

  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setState((prev) => ({ ...prev, isPlaying: false }));
    }
  }, []);

  const toggle = useCallback(() => {
    if (state.isPlaying) {
      pause();
    } else {
      play();
    }
  }, [state.isPlaying, play, pause]);

  const seek = useCallback((percent: number) => {
    if (audioRef.current && state.duration) {
      const time = (percent / 100) * state.duration;
      audioRef.current.currentTime = time;
    }
  }, [state.duration]);

  const setVolume = useCallback((volume: number) => {
    if (audioRef.current) {
      audioRef.current.volume = Math.max(0, Math.min(1, volume));
    }
  }, []);

  return {
    ...state,
    play,
    pause,
    toggle,
    seek,
    setVolume,
  };
}
