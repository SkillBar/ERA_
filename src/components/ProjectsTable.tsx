import type { ProjectStatus, ProjectWithCreators } from "@/types/project"
import { cn } from "@/lib/utils"

const STATUS_LABELS: Record<ProjectStatus, string> = {
  live: "Уже работает",
  in_progress: "Только делается",
  closed: "Закрыт",
}

/** Градиенты для кнопки статуса */
const STATUS_GRADIENTS: Record<ProjectStatus, { background: string; color: string; boxShadow: string }> = {
  live: {
    background: "linear-gradient(90deg, #10b981 0%, #22c55e 100%)",
    color: "#fff",
    boxShadow: "0 2px 8px rgba(16, 185, 129, 0.4)",
  },
  in_progress: {
    background: "linear-gradient(90deg, #fbbf24 0%, #eab308 100%)",
    color: "#0f172a",
    boxShadow: "0 2px 8px rgba(251, 191, 36, 0.35)",
  },
  closed: {
    background: "linear-gradient(90deg, #b91c1c 0%, #9f1239 100%)",
    color: "#fff",
    boxShadow: "0 2px 8px rgba(185, 28, 28, 0.4)",
  },
}

function formatMoney(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`
  return String(value)
}

function StatusBadge({ status }: { status: ProjectStatus }) {
  const style = STATUS_GRADIENTS[status]
  return (
    <span
      className="inline-flex items-center rounded-full px-3 py-1.5 text-xs font-medium"
      style={{
        background: style.background,
        color: style.color,
        boxShadow: style.boxShadow,
      }}
    >
      {STATUS_LABELS[status]}
    </span>
  )
}

export interface ProjectsTableProps {
  projects: ProjectWithCreators[]
  className?: string
}

export function ProjectsTable({ projects, className }: ProjectsTableProps) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-card border border-slate-700 bg-slate-800/60",
        className
      )}
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-slate-700 bg-slate-800/80">
              <th className="px-5 py-4 font-semibold text-slate-200">
                Проект
              </th>
              <th className="px-5 py-4 font-semibold text-slate-200">
                Собрано
              </th>
              <th className="px-5 py-4 font-semibold text-slate-200">
                Цель
              </th>
              <th className="px-5 py-4 font-semibold text-slate-200">
                Поддержали
              </th>
              <th className="px-5 py-4 font-semibold text-slate-200">
                Дней
              </th>
              <th className="px-5 py-4 text-right font-semibold text-slate-200">
                Статус
              </th>
            </tr>
          </thead>
          <tbody className="[&_tr:last-child_td]:pb-0">
            {projects.map((project) => {
              const creatorNames = project.creators.map((c) => c.name).join(", ")
              return (
                <tr key={project.id}>
                  <td colSpan={6} className="border-none p-0 pb-3 align-top">
                    <div className="grid min-w-[640px] grid-cols-[minmax(200px,2fr)_minmax(70px,1fr)_minmax(60px,1fr)_minmax(80px,1fr)_minmax(50px,1fr)_minmax(100px,1fr)] items-center rounded-card border border-slate-700/80 bg-slate-800/50 transition-colors hover:bg-slate-700/40">
                      <div className="flex items-center gap-4 px-5 py-5">
                        <img
                          src={project.imageUrl}
                          alt=""
                          className="h-14 w-20 shrink-0 rounded-lg object-cover"
                        />
                        <div>
                          <span className="font-medium text-white">
                            {project.title}
                          </span>
                          {creatorNames ? (
                            <p className="mt-0.5 text-xs text-slate-500">
                              {creatorNames}
                            </p>
                          ) : null}
                        </div>
                      </div>
                      <div className="px-5 py-5 text-slate-300">
                        {formatMoney(project.raised)}
                      </div>
                      <div className="px-5 py-5 text-slate-400">
                        {formatMoney(project.goal)}
                      </div>
                      <div className="px-5 py-5 text-slate-300">
                        {project.backers.toLocaleString()}
                      </div>
                      <div className="px-5 py-5 text-slate-400">
                        {project.daysLeft}
                      </div>
                      <div className="px-5 py-5 text-right">
                        <StatusBadge status={project.status} />
                      </div>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
