import type { Project } from "../../domain/project.entity.js"
import type { ProjectRepository } from "../ports/project-repository.port.js"

export class ListProjectsUseCase {
  constructor(private readonly projects: ProjectRepository) {}

  execute(): Promise<Project[]> {
    return this.projects.findAll()
  }
}
