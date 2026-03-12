"use client"

import { cn } from "@/lib/utils"

export interface LoaderHelixProps {
  /** Количество точек в спирали (на одну нить) */
  dots?: number
  /** Скорость анимации в секундах */
  speed?: number
  /** Вариант: dna (две нити + перемычки), ribbon (градиент), minimal (только точки) */
  variant?: "dna" | "ribbon" | "minimal"
  className?: string
}

/**
 * Helix Loader — DNA-спираль с точками вдоль синусоиды.
 * По мотиву https://www.tryelements.dev/docs/loaders/loader-helix
 */
export function LoaderHelix({
  dots = 12,
  speed = 2,
  variant = "dna",
  className,
}: LoaderHelixProps) {
  return (
    <div
      className={cn("relative inline-flex items-center justify-center", className)}
      style={{ ["--helix-speed" as string]: `${speed}s` }}
      aria-label="Загрузка"
      role="status"
    >
      <div className="relative h-14 w-10">
        {/* Левая нить — точки распределены по высоте, двигаются по синусоиде */}
        <div className="absolute left-0 top-0 flex h-full w-3 flex-col justify-between py-1">
          {Array.from({ length: dots }).map((_, i) => (
            <div
              key={`l-${i}`}
              className={cn(
                "h-2 w-2 shrink-0 rounded-full bg-current",
                variant === "ribbon" && "bg-primary",
                variant === "dna" && "bg-foreground"
              )}
              style={{
                animation: `helix-sine-left var(--helix-speed, 2s) ease-in-out infinite`,
                animationDelay: `${(i / dots) * speed * 0.5}s`,
              }}
            />
          ))}
        </div>
        {/* Правая нить — фаза сдвинута для эффекта спирали */}
        <div className="absolute right-0 top-0 flex h-full w-3 flex-col justify-between py-1">
          {Array.from({ length: dots }).map((_, i) => (
            <div
              key={`r-${i}`}
              className={cn(
                "h-2 w-2 shrink-0 rounded-full bg-current",
                variant === "ribbon" && "bg-primary",
                variant === "dna" && "bg-foreground"
              )}
              style={{
                animation: `helix-sine-right var(--helix-speed, 2s) ease-in-out infinite`,
                animationDelay: `${(i / dots) * speed * 0.5}s`,
              }}
            />
          ))}
        </div>
      </div>
      <style>{`
        @keyframes helix-sine-left {
          0%, 100% { transform: translateX(0) scale(1); opacity: 0.7; }
          50% { transform: translateX(4px) scale(1.15); opacity: 1; }
        }
        @keyframes helix-sine-right {
          0%, 100% { transform: translateX(0) scale(1); opacity: 1; }
          50% { transform: translateX(-4px) scale(0.9); opacity: 0.7; }
        }
      `}</style>
    </div>
  )
}
