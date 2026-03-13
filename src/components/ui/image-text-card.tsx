"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardDescription, CardTitle } from "@/components/ui/card"
import { ImageSlider } from "@/components/ui/image-slider"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import { cn } from "@/lib/utils"

const BADGE_CLASSES = {
  green:
    "border-transparent bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300",
  yellow:
    "border-transparent bg-amber-50 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300",
} as const

export interface ImageTextCardProps {
  imageUrl: string
  imageAlt: string
  title: string
  description: string
  /** Два фото: ручка по центру разделяет их (если задано 2+ — показывается Resizable между ними) */
  imageUrls?: string[]
  /** Дополнительные пункты (мелким текстом под описанием) */
  details?: string[]
  /** Бейдж над заголовком (Q1, Q2, Q3, Seed Round). variant: green = актуальный, yellow = остальные */
  badge?: { label: string; variant: "green" | "yellow" }
  /** Вертикальная раскладка: сверху картинка, снизу текст (как в карточке-превью) */
  stacked?: boolean
  className?: string
}

/** Одна картинка на всю область (object-cover) */
function SingleImage({
  src,
  alt,
  className,
}: {
  src: string
  alt: string
  className?: string
}) {
  return (
    <img
      src={src}
      alt={alt}
      className={cn("size-full object-cover", className)}
      onError={(e) => {
        e.currentTarget.style.display = "none"
      }}
    />
  )
}

/**
 * Карточка «медиа + текст». На десктопе при двух фото — ручка по центру картинки разделяет два изображения (Resizable).
 */
export function ImageTextCard({
  imageUrl,
  imageAlt,
  title,
  description,
  imageUrls,
  details,
  badge,
  stacked = false,
  className,
}: ImageTextCardProps) {
  const hasTwoImages = imageUrls != null && imageUrls.length >= 2
  const img1 = imageUrls?.[0] ?? imageUrl
  const img2 = imageUrls?.[1] ?? imageUrl

  const textBlock = (
    <div className="flex flex-col justify-center p-4 sm:p-5">
      <div className="flex flex-wrap items-center gap-2">
        <CardTitle className="text-lg text-foreground">{title}</CardTitle>
        {badge && (
          <Badge className={cn("shrink-0", BADGE_CLASSES[badge.variant])}>
            {badge.label}
          </Badge>
        )}
      </div>
      <CardDescription className="mt-1.5">{description}</CardDescription>
      {details != null && details.length > 0 && (
        <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
          {details.map((d, i) => (
            <li key={i}>{d}</li>
          ))}
        </ul>
      )}
    </div>
  )

  const imageBlockStacked = hasTwoImages ? (
    <div className="shrink-0 w-full aspect-video overflow-hidden rounded-t-card">
      {/* Телефон и узкий планшет: слайдер (свайп/точки), без скролла */}
      <div className="h-full w-full md:hidden">
        <ImageSlider
          images={imageUrls!}
          alt={imageAlt}
          className="size-full"
          imageClassName="size-full object-cover"
        />
      </div>
      {/* Планшет и десктоп (md+): две картинки с ручкой, как на компе */}
      <div className="hidden h-full w-full md:block">
        <ResizablePanelGroup
          id={`game-mode-${title}-resize`}
          orientation="horizontal"
          className="h-full w-full"
          resizeTargetMinimumSize={{ coarse: 24, fine: 12 }}
        >
          <ResizablePanel defaultSize="50" minSize="25" maxSize="75" id={`${title}-left`}>
            <div className="h-full w-full overflow-hidden">
              <SingleImage src={img1} alt={`${imageAlt} — 1`} />
            </div>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize="50" minSize="25" maxSize="75" id={`${title}-right`}>
            <div className="h-full w-full overflow-hidden">
              <SingleImage src={img2} alt={`${imageAlt} — 2`} />
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  ) : (
    <div className="shrink-0 w-full overflow-hidden rounded-t-card aspect-video">
      <SingleImage src={imageUrl} alt={imageAlt} />
    </div>
  )

  if (stacked) {
    return (
      <Card className={cn("overflow-hidden pt-0", className)}>
        {imageBlockStacked}
        {textBlock}
      </Card>
    )
  }

  return (
    <Card className={cn("overflow-hidden", className)}>
      {/* Телефон и узкий планшет: сверху слайдер или одна картинка, снизу текст (без скролла по картинке) */}
      <div className="flex flex-col md:hidden">
        <div className="shrink-0 w-full aspect-square overflow-hidden rounded-t-card md:rounded-t-none md:rounded-l-card">
          {hasTwoImages ? (
            <ImageSlider
              images={imageUrls!}
              alt={imageAlt}
              className="size-full"
              imageClassName="size-full object-cover"
            />
          ) : (
            <SingleImage src={imageUrl} alt={imageAlt} />
          )}
        </div>
        {textBlock}
      </div>

      {/* Планшет и десктоп (md+): слева две картинки с ручкой, справа текст — как на компе */}
      <div className="hidden md:flex md:min-h-[300px]">
        <div className="min-h-0 w-[min(50%,540px)] shrink-0 overflow-hidden rounded-t-card md:rounded-l-card md:rounded-r-none">
          {hasTwoImages ? (
            <ResizablePanelGroup orientation="horizontal" className="h-full min-h-[300px]">
              <ResizablePanel defaultSize="50%" minSize="25%" maxSize="75%">
                <div className="h-full w-full overflow-hidden">
                  <SingleImage src={img1} alt={`${imageAlt} — 1`} />
                </div>
              </ResizablePanel>
              <ResizableHandle withHandle />
              <ResizablePanel defaultSize="50%" minSize="25%" maxSize="75%">
                <div className="h-full w-full overflow-hidden">
                  <SingleImage src={img2} alt={`${imageAlt} — 2`} />
                </div>
              </ResizablePanel>
            </ResizablePanelGroup>
          ) : (
            <div className="h-full w-full overflow-hidden rounded-t-card md:rounded-l-card">
              <SingleImage src={imageUrl} alt={imageAlt} />
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">{textBlock}</div>
      </div>
    </Card>
  )
}
