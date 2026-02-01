"use client";

import { cn } from "@/lib/utils";

interface BadgeProps {
  variant?: "default" | "fire" | "ice" | "victory" | "warning" | "muted" | "steel";
  size?: "sm" | "md";
  children: React.ReactNode;
  className?: string;
}

export function Badge({
  variant = "default",
  size = "sm",
  children,
  className,
}: BadgeProps) {
  const variants = {
    default: "bg-white/5 text-muted-foreground border-white/15",
    fire: "bg-pink-500/10 text-pink-500 border-neon-pink/25",
    ice: "bg-cyan-500/10 text-cyan-500 border-neon-cyan/25",
    victory: "bg-white/10 text-foreground border-white/25",
    warning: "bg-orange-500/10 text-orange-500 border-neon-orange/25",
    muted: "bg-white/5 text-muted-foreground border-border",
    steel: "bg-zinc-500/10 text-zinc-500 border-zinc-500/25",
  };

  const sizes = {
    sm: "px-2 py-0.5 text-[10px] tracking-[0.06em] uppercase",
    md: "px-3 py-1 text-xs tracking-[0.06em] uppercase",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border font-medium font-mono",
        variants[variant],
        sizes[size],
        className
      )}
    >
      {children}
    </span>
  );
}
