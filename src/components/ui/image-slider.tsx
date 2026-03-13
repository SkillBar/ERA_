"use client"

import { useCallback, useEffect, useState } from "react"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

const AUTO_ADVANCE_MS = 6000
const SWIPE_THRESHOLD_PX = 50

export interface ImageSliderProps {
  /** Список URL изображений (два и более для переключения) */
  images: string[]
  alt: string
  /** Дополнительные классы для контейнера слайдера */
  className?: string
  /** Класс для изображения */
  imageClassName?: string
}

/**
 * Слайдер изображений на базе Tabs: переключение точками, свайп на тач-устройствах, автопрокрутка каждые 6 с.
 */
export function ImageSlider({
  images,
  alt,
  className,
  imageClassName,
}: ImageSliderProps) {
  const [value, setValue] = useState(String(0))
  const [touchStartX, setTouchStartX] = useState<number | null>(null)
  const [touchStartY, setTouchStartY] = useState<number | null>(null)

  const goTo = useCallback(
    (index: number) => {
      const next = Math.max(0, Math.min(index, images.length - 1))
      setValue(String(next))
    },
    [images.length]
  )

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX)
    setTouchStartY(e.touches[0].clientY)
  }, [])

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (touchStartX === null || touchStartY === null || images.length < 2) return
      const dx = Math.abs(e.touches[0].clientX - touchStartX)
      const dy = Math.abs(e.touches[0].clientY - touchStartY)
      if (dx > dy && dx > SWIPE_THRESHOLD_PX) e.preventDefault()
    },
    [touchStartX, touchStartY, images.length]
  )

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (touchStartX === null || images.length < 2) return
      const endX = e.changedTouches[0].clientX
      const delta = endX - touchStartX
      setTouchStartX(null)
      setTouchStartY(null)
      if (Math.abs(delta) < SWIPE_THRESHOLD_PX) return
      const current = Number(value)
      if (delta > 0) goTo(current - 1)
      else goTo(current + 1)
    },
    [touchStartX, value, images.length, goTo]
  )

  useEffect(() => {
    if (images.length < 2) return
    const id = setInterval(() => {
      setValue((prev) => String((Number(prev) + 1) % images.length))
    }, AUTO_ADVANCE_MS)
    return () => clearInterval(id)
  }, [images.length])

  if (images.length === 0) return null
  if (images.length === 1) {
    return (
      <div className={cn("relative overflow-hidden", className)}>
        <img
          src={images[0]}
          alt={alt}
          className={cn("size-full object-cover", imageClassName)}
          onError={(e) => {
            e.currentTarget.style.display = "none"
          }}
        />
      </div>
    )
  }

  return (
    <Tabs value={value} onValueChange={setValue} className={cn("relative size-full", className)}>
      <div
        className="relative size-full overflow-hidden"
        style={{ touchAction: "pan-y" }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {images.map((src, i) => (
          <TabsContent
            key={i}
            value={String(i)}
            className="absolute inset-0 mt-0 data-[state=inactive]:pointer-events-none data-[state=inactive]:opacity-0 data-[state=active]:opacity-100 transition-opacity duration-500"
            forceMount
          >
            <img
              src={src}
              alt={`${alt} — ${i + 1}`}
              className={cn("size-full object-cover", imageClassName)}
              onError={(e) => {
                e.currentTarget.style.display = "none"
              }}
            />
          </TabsContent>
        ))}
      </div>
      {/* Точки переключения поверх картинки (на мобиле без них нельзя листать) */}
      <div className="absolute bottom-2 left-0 right-0 z-10 flex justify-center gap-1.5">
        {images.map((_, i) => (
          <button
            type="button"
            key={i}
            aria-label={`Фото ${i + 1} из ${images.length}`}
            aria-pressed={value === String(i)}
            onClick={() => setValue(String(i))}
            className={cn(
              "h-2 w-2 rounded-full transition-colors",
              value === String(i)
                ? "bg-primary"
                : "bg-white/60 hover:bg-white/80"
            )}
          />
        ))}
      </div>
    </Tabs>
  )
}
