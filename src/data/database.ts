import type { Creator, Project, ProjectWithCreators } from "@/types/project"
import { CREATORS } from "./creators"
import { PROJECTS } from "./projects"

/**
 * Слой доступа к данным (имитация БД).
 * Позже заменить на вызовы API (fetch, React Query и т.д.).
 */

const creatorsById = new Map(CREATORS.map((c) => [c.id, c]))

export function getCreators(): Creator[] {
  return [...CREATORS]
}

export function getProjects(): Project[] {
  return [...PROJECTS]
}

/**
 * Проекты с подставленными создателями (как JOIN в БД).
 */
export function getProjectsWithCreators(): ProjectWithCreators[] {
  return PROJECTS.map((project) => ({
    ...project,
    creators: project.creatorIds
      .map((id) => creatorsById.get(id))
      .filter((c): c is Creator => c != null),
  }))
}

/**
 * Один проект по id с создателями (для страницы проекта).
 */
export function getProjectWithCreatorsById(
  id: string
): ProjectWithCreators | undefined {
  const project = PROJECTS.find((p) => p.id === id)
  if (!project) return undefined
  return {
    ...project,
    creators: project.creatorIds
      .map((id) => creatorsById.get(id))
      .filter((c): c is Creator => c != null),
  }
}
