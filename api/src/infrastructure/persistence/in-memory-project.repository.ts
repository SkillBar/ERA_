import type { Project, ProjectId } from "../../domain/project.entity.js"
import type { ProjectRepository } from "../../application/ports/project-repository.port.js"
import seed from "./seed/projects.seed.json" with { type: "json" }

/**
 * Временная реализация порта. Дальше: Prisma + Postgres, тот же интерфейс.
 */
export class InMemoryProjectRepository implements ProjectRepository {
  private readonly rows: Project[] = structuredClone(seed as Project[])

  async findAll(): Promise<Project[]> {
    return [...this.rows]
  }

  async findById(id: ProjectId): Promise<Project | null> {
    return this.rows.find((p) => p.id === id) ?? null
  }
}
