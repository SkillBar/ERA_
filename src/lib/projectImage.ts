import type { ThemeId } from "@/constants/theme"
import type { Project, ProjectPageDetail } from "@/types/project"

/**
 * Возвращает URL обложки проекта с учётом темы.
 * Используется везде, где показывается обложка (карточки, лента новостей, hero при отсутствии detail).
 */
export function getProjectImageUrl(
  project: Pick<Project, "imageUrl" | "imageUrlDark" | "imageUrlLight">,
  theme: ThemeId | undefined
): string {
  if (theme === "dark" && project.imageUrlDark) return project.imageUrlDark
  if (theme === "light" && project.imageUrlLight) return project.imageUrlLight
  return project.imageUrl
}

/**
 * Возвращает URL hero-обложки страницы проекта с учётом темы.
 * Приоритет: detail.heroImageUrlDark/Light (если есть и тема известна) → detail.heroImageUrl → обложка проекта по теме.
 */
export function getHeroImageUrl(
  detail: ProjectPageDetail | undefined,
  project: Pick<Project, "imageUrl" | "imageUrlDark" | "imageUrlLight">,
  theme: ThemeId | undefined
): string {
  if (detail) {
    if (theme === "dark" && detail.heroImageUrlDark) return detail.heroImageUrlDark
    if (theme === "light" && detail.heroImageUrlLight) return detail.heroImageUrlLight
    if (detail.heroImageUrl) return detail.heroImageUrl
  }
  return getProjectImageUrl(project, theme)
}
