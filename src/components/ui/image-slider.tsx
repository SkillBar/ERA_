"use client"

import { useEffect, useState } from "react"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

const AUTO_ADVANCE_MS = 6000

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
 * Слайдер изображений на базе Tabs: переключение точками, автопрокрутка каждые 6 с (плавный переход).
 */
export function ImageSlider({
  images,
  alt,
  className,
  imageClassName,
}: ImageSliderProps) {
  const [value, setValue] = useState(String(0))

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
      <div className="relative size-full overflow-hidden">
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
