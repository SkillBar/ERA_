import type { LucideIcon } from "lucide-react"

/**
 * Раздел новостей (верхний уровень, со звёздочкой в ТЗ).
 * Содержит список категорий.
 */
export interface NewsSection {
  id: string
  title: string
  icon: LucideIcon
  categories: NewsCategory[]
}

/**
 * Категория новостей (вложена в раздел).
 */
export interface NewsCategory {
  id: string
  title: string
  icon: LucideIcon
}
