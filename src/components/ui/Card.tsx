"use client";

import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "glow" | "battle" | "panel";
  padding?: "none" | "sm" | "md" | "lg";
}

export function Card({
  className,
  variant = "default",
  padding = "md",
  children,
  ...props
}: CardProps) {
  const variants = {
    default:
      "bg-card/80 border border-white/8 shadow-[var(--shadow-card)] backdrop-blur-3xl",
    elevated:
      "bg-secondary/80 border border-white/8 shadow-[0_15px_35px_rgba(3,4,18,0.45)]",
    glow: "bg-secondary/30 border border-white/8 shadow-[var(--shadow-card)]",
    battle:
      "bg-card/70 border border-white/8 hover:border-white/40 transition-colors shadow-[0_10px_25px_rgba(0,0,0,0.35)]",
    panel: "bg-white/[0.04] border border-white/8 shadow-[var(--shadow-card)] backdrop-blur-3xl",
  };

  const paddings = {
    none: "",
    sm: "p-3",
    md: "p-4",
    lg: "p-6",
  };

  return (
    <div
      className={cn(
        "rounded-xl",
        variants[variant],
        paddings[padding],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("mb-4", className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn("text-xl font-bold text-foreground", className)}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardDescription({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn("text-muted-foreground text-sm mt-1", className)} {...props}>
      {children}
    </p>
  );
}
