import { useMemo } from "react"
import type { Project, ProjectPageDetail } from "@/types/project"
import { useThemeSwitch } from "@/hooks/useThemeSwitch"
import {
  getProjectImageUrl as getProjectImageUrlFn,
  getHeroImageUrl as getHeroImageUrlFn,
} from "@/lib/projectImage"

type ProjectImagePick = Pick<Project, "imageUrl" | "imageUrlDark" | "imageUrlLight">

/**
 * Возвращает URL обложки проекта с учётом текущей темы.
 * Мемоизирован по project + theme — при смене темы пересчитывается один раз.
 */
export function useProjectImageUrl(
  project: ProjectImagePick | null | undefined
): string {
  const { theme } = useThemeSwitch()
  return useMemo(
    () => (project ? getProjectImageUrlFn(project, theme) : ""),
    [project, theme]
  )
}

/**
 * Возвращает URL hero-обложки страницы проекта с учётом темы.
 * Используется на странице проекта для верхнего баннера.
 */
export function useHeroImageUrl(
  detail: ProjectPageDetail | undefined,
  project: ProjectImagePick | null | undefined
): string {
  const { theme } = useThemeSwitch()
  return useMemo(
    () => (project ? getHeroImageUrlFn(detail, project, theme) : ""),
    [detail, project, theme]
  )
}
