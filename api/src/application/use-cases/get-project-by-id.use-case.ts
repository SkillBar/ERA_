import type { Project, ProjectId } from "../../domain/project.entity.js"
import type { ProjectRepository } from "../ports/project-repository.port.js"

export class GetProjectByIdUseCase {
  constructor(private readonly projects: ProjectRepository) {}

  execute(id: ProjectId): Promise<Project | null> {
    return this.projects.findById(id)
  }
}
