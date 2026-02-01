"use client";

import Image from "next/image";
import { cn, formatTime } from "@/lib/utils";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";

interface TrackCardProps {
  track: {
    id: string;
    title: string;
    artist: string | null;
    coverUrl: string | null;
    audioUrl: string;
    duration?: number | null;
  };
  side: "left" | "right";
  isSelected?: boolean;
  isWinner?: boolean;
  isLoser?: boolean;
  showVoteButton?: boolean;
  onVote?: () => void;
  disabled?: boolean;
}

export function TrackCard({
  track,
  side,
  isSelected = false,
  isWinner = false,
  isLoser = false,
  showVoteButton = false,
  onVote,
  disabled = false,
}: TrackCardProps) {
  const { isPlaying, progress, currentTime, duration, toggle, isLoaded } =
    useAudioPlayer(track.audioUrl);

  const sideStyles = {
    left: {
      border: "border-neon-pink/60",
      bg: "bg-pink-500/60",
      text: "text-pink-500",
    },
    right: {
      border: "border-neon-cyan/60",
      bg: "bg-cyan-500/60",
      text: "text-cyan-500",
    },
  };

  const styles = sideStyles[side];

  return (
    <div
      className={cn(
        "relative rounded-2xl overflow-hidden transition-all duration-300",
        isSelected && `ring-2 ${styles.border}`,
        isWinner && "ring-2 ring-white/60",
        isLoser && "opacity-50 grayscale"
      )}
    >
      {/* Cover Image / Visualizer */}
      <div className="relative aspect-square bg-secondary">
        {track.coverUrl ? (
          <Image
            src={track.coverUrl}
            alt={track.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-card" />
        )}

        {/* Audio Visualizer Overlay */}
        <div className="absolute inset-0 flex items-end justify-center gap-1 p-4">
          {isPlaying && (
            <>
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "w-2 rounded-full audio-bar",
                    styles.bg
                  )}
                  style={{
                    animationDelay: `${i * 0.1}s`,
                    height: `${20 + Math.random() * 60}%`,
                  }}
                />
              ))}
            </>
          )}
        </div>

        {/* Play Button */}
        <button
          onClick={toggle}
          disabled={!isLoaded}
          className={cn(
            "absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity",
            isPlaying && "opacity-100 bg-black/20"
          )}
        >
          <div
            className={cn(
              "w-16 h-16 rounded-full flex items-center justify-center text-3xl",
              "bg-white/20 backdrop-blur-sm hover:scale-110 transition-transform"
            )}
          >
            <span className="text-xs tracking-[0.2em] text-foreground">
              {isPlaying ? "PAUSE" : "PLAY"}
            </span>
          </div>
        </button>

        {/* Progress Bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/50">
          <div
            className={cn("h-full transition-all", styles.bg)}
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Winner Badge */}
        {isWinner && (
          <div className="absolute top-4 right-4 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-bold">
            WINNER
          </div>
        )}
      </div>

      {/* Track Info */}
      <div className="p-4 bg-card">
        <h3 className="font-bold text-lg truncate">{track.title}</h3>
        <p className="text-muted-foreground text-sm truncate">
          {track.artist || "Unknown Artist"}
        </p>

        {/* Duration */}
        {duration > 0 && (
          <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
            <span>{formatTime(Math.floor(currentTime))}</span>
            <span>/</span>
            <span>{formatTime(Math.floor(duration))}</span>
          </div>
        )}

        {/* Vote Button */}
        {showVoteButton && (
          <button
            onClick={onVote}
            disabled={disabled}
            className={cn(
              "w-full mt-4 py-3 rounded-xl font-bold text-lg transition-all",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              `border border-white/20 hover:border-white/40`
            )}
          >
            Vote This Track
          </button>
        )}
      </div>
    </div>
  );
}
