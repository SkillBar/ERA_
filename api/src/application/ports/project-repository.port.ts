import type { Project, ProjectId } from "../../domain/project.entity.js"

/**
 * Порт (интерфейс) репозитория — реализация снаружи домена (Postgres, Prisma, HTTP, mock).
 */
export interface ProjectRepository {
  findAll(): Promise<Project[]>
  findById(id: ProjectId): Promise<Project | null>
}
