"use client";

import { cn } from "@/lib/utils";

interface SelectionVSProps {
  animated?: boolean;
  size?: "sm" | "md" | "lg";
}

export function SelectionVS({ animated = true, size = "md" }: SelectionVSProps) {
  const sizes = {
    sm: "w-12 h-12 text-lg",
    md: "w-20 h-20 text-2xl",
    lg: "w-28 h-28 text-4xl",
  };

  return (
    <div className="relative flex items-center justify-center">
      {/* VS Badge */}
      <div
        className={cn(
          "relative rounded-full bg-card border border-white/20 flex items-center justify-center font-display font-bold",
          sizes[size],
          animated && "animate-pulse-slow"
        )}
      >
        <span className="text-foreground">VS</span>
      </div>
    </div>
  );
}
