import { InMemoryProjectRepository } from "./infrastructure/persistence/in-memory-project.repository.js"
import { NoopChainReadAdapter } from "./infrastructure/blockchain/noop-chain-read.adapter.js"
import { ListProjectsUseCase } from "./application/use-cases/list-projects.use-case.js"
import { GetProjectByIdUseCase } from "./application/use-cases/get-project-by-id.use-case.js"
import type { ChainReadPort } from "./application/ports/chain-read.port.js"

/**
 * Composition root: собираем зависимости. Позже сюда же — Prisma, Redis, EvmChainReadAdapter.
 */
export function createAppContext() {
  const projectRepository = new InMemoryProjectRepository()
  const chainRead: ChainReadPort = new NoopChainReadAdapter()

  const listProjects = new ListProjectsUseCase(projectRepository)
  const getProjectById = new GetProjectByIdUseCase(projectRepository)

  return {
    listProjects,
    getProjectById,
    chainRead,
  }
}

export type AppContext = ReturnType<typeof createAppContext>
