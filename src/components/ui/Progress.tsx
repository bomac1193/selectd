"use client";

import { cn } from "@/lib/utils";

interface ProgressProps {
  value: number;
  max?: number;
  variant?: "default" | "fire" | "ice" | "victory" | "xp" | "steel";
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

export function Progress({
  value,
  max = 100,
  variant = "default",
  size = "md",
  showLabel = false,
  className,
}: ProgressProps) {
  const percent = Math.min(100, (value / max) * 100);

  const variants = {
    default: "bg-white/70",
    fire: "bg-pink-500/70",
    ice: "bg-cyan-500/70",
    victory: "bg-white/90",
    xp: "bg-white/80",
    steel: "bg-zinc-500/70",
  };

  const sizes = {
    sm: "h-1",
    md: "h-2",
    lg: "h-3",
  };

  return (
    <div className={cn("w-full", className)}>
      <div
        className={cn(
          "w-full bg-secondary rounded-full overflow-hidden",
          sizes[size]
        )}
      >
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500 ease-out",
            variants[variant]
          )}
          style={{ width: `${percent}%` }}
        />
      </div>
      {showLabel && (
        <div className="flex justify-between mt-1 text-xs text-muted-foreground">
          <span>{value}</span>
          <span>{max}</span>
        </div>
      )}
    </div>
  );
}

interface VoteBarProps {
  leftPercent: number;
  rightPercent: number;
  leftLabel?: string;
  rightLabel?: string;
  revealed?: boolean;
  winner?: "left" | "right" | null;
}

export function VoteBar({
  leftPercent,
  rightPercent,
  leftLabel,
  rightLabel,
  revealed = true,
  winner,
}: VoteBarProps) {
  return (
    <div className="w-full">
      <div className="flex h-8 rounded-xl overflow-hidden bg-secondary">
        <div
          className={cn(
            "flex items-center justify-center transition-all duration-1000 ease-out",
            winner === "left" ? "bg-white/80" : "bg-pink-500/70",
            !revealed && "opacity-50"
          )}
          style={{ width: revealed ? `${leftPercent}%` : "50%" }}
        >
          {revealed && leftPercent > 15 && (
            <span className="text-primary-foreground font-bold text-sm">
              {Math.round(leftPercent)}%
            </span>
          )}
        </div>
        <div
          className={cn(
            "flex items-center justify-center transition-all duration-1000 ease-out",
            winner === "right" ? "bg-white/80" : "bg-cyan-500/70",
            !revealed && "opacity-50"
          )}
          style={{ width: revealed ? `${rightPercent}%` : "50%" }}
        >
          {revealed && rightPercent > 15 && (
            <span className="text-primary-foreground font-bold text-sm">
              {Math.round(rightPercent)}%
            </span>
          )}
        </div>
      </div>
      {(leftLabel || rightLabel) && (
        <div className="flex justify-between mt-2 text-sm text-muted-foreground">
          <span>{leftLabel}</span>
          <span>{rightLabel}</span>
        </div>
      )}
    </div>
  );
}
