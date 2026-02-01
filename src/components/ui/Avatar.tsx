"use client";

import Image from "next/image";
import { cn, getInitials } from "@/lib/utils";

interface AvatarProps {
  src?: string | null;
  name?: string | null;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  glow?: boolean;
  rank?: number;
}

export function Avatar({
  src,
  name,
  size = "md",
  className,
  glow = false,
  rank,
}: AvatarProps) {
  const sizes = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-14 h-14 text-base",
    xl: "w-20 h-20 text-xl",
  };

  const imageSizes = {
    sm: 32,
    md: 40,
    lg: 56,
    xl: 80,
  };

  const rankColors = {
    1: "border-white/50 text-foreground",
    2: "border-white/30 text-white/90",
    3: "border-white/20 text-white/80",
  };

  return (
    <div className="relative">
      <div
        className={cn(
          "relative rounded-full overflow-hidden bg-secondary flex items-center justify-center font-bold text-foreground",
          sizes[size],
          glow && "ring-1 ring-white/20",
          className
        )}
      >
        {src ? (
          <Image
            src={src}
            alt={name || "Avatar"}
            width={imageSizes[size]}
            height={imageSizes[size]}
            className="object-cover w-full h-full"
          />
        ) : (
          <span className="text-muted-foreground">{getInitials(name)}</span>
        )}
      </div>
      {rank && rank <= 3 && (
        <div
          className={cn(
            "absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold bg-card border",
            rankColors[rank as keyof typeof rankColors]
          )}
        >
          {rank}
        </div>
      )}
    </div>
  );
}
