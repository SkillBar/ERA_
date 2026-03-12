import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

export interface TickerProps {
  /** Элементы для бегущей строки (дублируются для бесшовного цикла) */
  children: React.ReactNode
  /** Скорость: пикселей в секунду (при reduced-motion не используется) */
  speed?: number
  /** Дополнительные классы контейнера */
  className?: string
  /** Останавливать при наведении */
  pauseOnHover?: boolean
}

/**
 * Бегущая строка (marquee) по best practices:
 * - CSS transform + keyframes (GPU), не <marquee>
 * - Дублирование контента для бесшовного цикла
 * - prefers-reduced-motion: анимация отключается
 * - aria-hidden на дубликате, user-select: none
 * - Лёгкая маска по краям (опционально)
 */
export function Ticker({
  children,
  speed = 60,
  className,
  pauseOnHover = true,
}: TickerProps) {
  const [reducedMotion, setReducedMotion] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const trackRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    setReducedMotion(mq.matches)
    const handler = () => setReducedMotion(mq.matches)
    mq.addEventListener("change", handler)
    return () => mq.removeEventListener("change", handler)
  }, [])

  useEffect(() => {
    const el = trackRef.current
    if (!el) return
    const setDuration = () => {
      const width = el.offsetWidth
      const contentWidth = width / 2
      const durationSec = contentWidth / speed
      el.style.setProperty("--ticker-duration", `${durationSec}s`)
    }
    setDuration()
    const ro = new ResizeObserver(setDuration)
    ro.observe(el)
    return () => ro.disconnect()
  }, [speed, children])

  const shouldAnimate = !reducedMotion && !isPaused

  return (
    <div
      className={cn("overflow-hidden border-t border-border/60 bg-muted/30", className)}
      role="region"
      aria-label="Бегущая строка"
    >
      <div
        className="relative flex h-9 items-center"
        onMouseEnter={pauseOnHover ? () => setIsPaused(true) : undefined}
        onMouseLeave={pauseOnHover ? () => setIsPaused(false) : undefined}
      >
        {/* Маска по краям (best practice: fade вместо обрезки) */}
        <div
          className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 shrink-0 bg-gradient-to-r from-muted/30 to-transparent"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 shrink-0 bg-gradient-to-l from-muted/30 to-transparent"
          aria-hidden
        />

        <div
          ref={trackRef}
          className={cn(
            "flex shrink-0 items-center gap-8 whitespace-nowrap text-sm text-muted-foreground select-none",
            shouldAnimate && "animate-ticker"
          )}
          style={{ width: "max-content" }}
        >
          <span className="inline-flex shrink-0 items-center gap-8">{children}</span>
          <span className="inline-flex shrink-0 items-center gap-8" aria-hidden="true">
            {children}
          </span>
        </div>
      </div>
    </div>
  )
}
