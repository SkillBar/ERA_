"use client"

import { Moon, Sun } from "lucide-react"
import { cn } from "@/lib/utils"
import { useThemeSwitch } from "@/hooks/useThemeSwitch"

const KNOB_OFFSET_PX = 28

export interface ThemeSwitcherToggleProps {
  className?: string
}

/**
 * Переключатель темы: светлая / тёмная. Один клик — смена темы.
 * Логика темы — в useThemeSwitch.
 */
export function ThemeSwitcherToggle({ className }: ThemeSwitcherToggleProps) {
  const { mounted, isDark, toggle } = useThemeSwitch()

  if (!mounted) {
    return (
      <div
        className={cn(
          "relative flex h-9 w-16 shrink-0 items-center justify-center rounded-full border border-border bg-muted",
          className
        )}
        aria-hidden
      >
        <Sun className="h-4 w-4 text-muted-foreground" />
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className={cn(
        "relative flex h-9 w-16 shrink-0 items-center rounded-full border border-border bg-muted transition-colors hover:bg-muted/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        className
      )}
      aria-label={isDark ? "Включить светлую тему" : "Включить тёмную тему"}
    >
      <span
        className="absolute top-1 left-1 h-7 w-7 rounded-full bg-background shadow-sm transition-[transform] duration-300 ease-in-out"
        style={{ transform: isDark ? `translateX(${KNOB_OFFSET_PX}px)` : "translateX(0)" }}
      />
      <span className="relative z-10 mx-auto flex w-[85%] items-stretch justify-between">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full">
          <Sun
            className={cn(
              "h-4 w-4 shrink-0 transition-colors duration-300 ease-in-out",
              isDark ? "text-muted-foreground" : "text-foreground"
            )}
          />
        </span>
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full">
          <Moon
            className={cn(
              "h-4 w-4 shrink-0 transition-colors duration-300 ease-in-out",
              isDark ? "text-foreground" : "text-muted-foreground"
            )}
          />
        </span>
      </span>
    </button>
  )
}
