"use client";

import { cn } from "@/lib/utils";
import { useCountdown } from "@/hooks/useCountdown";

interface SelectionTimerProps {
  endTime: Date | null;
  onExpire?: () => void;
  size?: "sm" | "md" | "lg";
}

export function SelectionTimer({ endTime, onExpire, size = "md" }: SelectionTimerProps) {
  const { formatted, expired, total } = useCountdown(endTime);

  // Call onExpire when timer expires
  if (expired && onExpire && total === 0) {
    // Use setTimeout to avoid calling during render
    setTimeout(onExpire, 0);
  }

  const isUrgent = !expired && total < 30000; // Less than 30 seconds
  const isCritical = !expired && total < 10000; // Less than 10 seconds

  const sizes = {
    sm: "text-xl px-3 py-1",
    md: "text-3xl px-5 py-2",
    lg: "text-5xl px-8 py-4",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center justify-center rounded-xl font-mono font-bold",
        "bg-secondary border border-border",
        sizes[size],
        isUrgent && "text-orange-500 border-neon-orange/30",
        isCritical && "text-pink-500 border-neon-pink/30 animate-pulse",
        expired && "text-muted-foreground"
      )}
    >
      {expired ? (
        <span className="flex items-center gap-2">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          ENDED
        </span>
      ) : (
        <>
          <span className="mr-2">⏱</span>
          {formatted}
        </>
      )}
    </div>
  );
}
