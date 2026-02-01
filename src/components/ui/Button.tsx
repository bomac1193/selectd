"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "fire" | "ice" | "victory";
  size?: "sm" | "md" | "lg" | "xl";
  glow?: boolean;
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      glow = false,
      loading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "relative inline-flex items-center justify-center font-semibold font-mono rounded-md uppercase tracking-[0.06em] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:translate-y-px";

  const variants = {
    primary:
      "bg-gradient-to-r from-neon-pink/95 via-neon-orange/90 to-neon-yellow/80 text-black border border-transparent shadow-[0_10px_30px_rgba(255,94,140,0.35)]",
    secondary:
      "bg-white/5 text-foreground border border-white/20 hover:bg-white/10 hover:border-white/40",
    ghost:
      "bg-transparent text-white/70 border border-border hover:text-white hover:border-white/30",
    fire:
      "bg-pink-500/20 text-pink-500 border border-neon-pink/60 hover:bg-pink-500/30",
    ice:
      "bg-cyan-500/20 text-cyan-500 border border-neon-cyan/60 hover:bg-cyan-500/30",
    victory:
      "bg-primary text-primary-foreground border border-white/90 hover:bg-white/90",
  };

  const sizes = {
    sm: "px-4 py-1 text-[11px]",
    md: "px-6 py-2 text-sm",
    lg: "px-8 py-2.5 text-sm",
    xl: "px-10 py-3 text-base",
  };

    const glowStyles = glow ? "ring-1 ring-white/15" : "";

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          glowStyles,
          className
        )}
        {...props}
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <svg
              className="animate-spin h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            Loading...
          </span>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
