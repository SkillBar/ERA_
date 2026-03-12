import * as React from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"

export interface SectionCardProps {
  /** id для якоря и scroll spy (например section-about) */
  id?: string
  title: React.ReactNode
  description?: React.ReactNode
  children: React.ReactNode
  contentClassName?: string
  className?: string
}

/**
 * Карточка секции страницы проекта. Единый стиль (rounded-card, border)
 * для блоков «О проекте», «Целевая аудитория», «Условия», «Команда» и т.д.
 * Переиспользуется на любых страницах проектов.
 */
export const SectionCard = React.forwardRef<HTMLDivElement, SectionCardProps>(
  ({ id, title, description, children, contentClassName, className }, ref) => (
    <Card id={id} ref={ref} className={cn(className)}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description != null && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className={cn(contentClassName)}>{children}</CardContent>
    </Card>
  )
)
SectionCard.displayName = "SectionCard"
