"use client"

import { cn } from "@/lib/utils"

export type StatusIndicatorState = "active" | "down" | "fixing" | "idle"

const stateStyles: Record<
  StatusIndicatorState,
  { dot: string; label?: string }
> = {
  active: {
    dot: "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)] animate-status-pulse",
  },
  down: {
    dot: "bg-red-500",
  },
  fixing: {
    dot: "bg-amber-500 animate-pulse",
  },
  idle: {
    dot: "bg-muted-foreground/50",
  },
}

export interface StatusIndicatorProps {
  state?: StatusIndicatorState
  label?: string
  size?: "sm" | "default" | "lg"
  className?: string
}

/**
 * Индикатор статуса (как 8starlabs Status Indicator): точка + подпись.
 * state="down" — красная точка (Systems down).
 */
export function StatusIndicator({
  state = "down",
  label,
  size = "default",
  className,
}: StatusIndicatorProps) {
  const dotSize =
    size === "sm" ? "h-1.5 w-1.5" : size === "lg" ? "h-2.5 w-2.5" : "h-2 w-2"
  const textSize =
    size === "sm" ? "text-xs" : size === "lg" ? "text-base" : "text-sm"

  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 shrink-0",
        className
      )}
      role="status"
      aria-live="polite"
    >
      <span
        className={cn(
          "rounded-full shrink-0",
          dotSize,
          stateStyles[state].dot
        )}
        aria-hidden
      />
      {label != null && (
        <span className={cn("font-medium text-foreground", textSize)}>
          {label}
        </span>
      )}
    </span>
  )
}
