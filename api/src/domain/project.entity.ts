/**
 * Доменная модель проекта (ядро). Не зависит от HTTP, БД, блокчейна.
 * При смене хранилища типы остаются здесь или в value-objects рядом.
 */
export type ProjectId = string

export type ProjectStatus = "live" | "in_progress" | "closed"

export type ProjectCategoryId = string

export interface Project {
  id: ProjectId
  title: string
  shortDescription: string
  raised: number
  goal: number
  backers: number
  daysLeft: number
  creatorIds: string[]
  status: ProjectStatus
  country: string
  categoryId: ProjectCategoryId
  projectType: string
}
