import { cn } from "@/lib/utils"

export interface TierCardProps {
  title: string
  amount?: number
  description: string
  features: string[]
  popular?: boolean
  className?: string
}

/**
 * Карточка уровня поддержки / перка. Единый стиль (rounded-card, border)
 * с опциональным выделением «Популярный». Переиспользуется на страницах проектов.
 */
export function TierCard({
  title,
  amount,
  description,
  features,
  popular,
  className,
}: TierCardProps) {
  return (
    <div
      className={cn(
        "rounded-card border p-4",
        popular ? "border-primary/40 bg-primary/5" : "border-border",
        className
      )}
    >
      {popular && (
        <span className="mb-2 inline-block text-xs font-medium text-primary">
          Популярный
        </span>
      )}
      <p className="font-semibold text-foreground">{title}</p>
      {amount != null && (
        <p className="text-sm text-muted-foreground">от {amount} ₽</p>
      )}
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      <ul className="mt-2 list-inside list-disc text-sm text-muted-foreground">
        {features.map((f) => (
          <li key={f}>{f}</li>
        ))}
      </ul>
    </div>
  )
}
