import { useNavigate } from "react-router-dom"
import type { ProjectWithCreators } from "@/types/project"
import { RaisedButton } from "@/components/ui/raised-button"
import { cn } from "@/lib/utils"

function formatGoal(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)} млн ₽`
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)} тыс. ₽`
  return `${value} ₽`
}

export interface ProjectCardProps {
  project: ProjectWithCreators
  className?: string
}

/**
 * Карточка проекта по образцу Roi UI card-image-section:
 * изображение → контент (заголовок + описание) → CTA.
 * Один слой фона (bg-card), переходы только по border/shadow/transform — без лагов и артефактов при смене темы.
 * @see https://www.roiui.com/blocks/card-image-section
 * @see https://www.roiui.com/docs/ui/card (Image Card, variant lift)
 */
export function ProjectCard({ project, className }: ProjectCardProps) {
  const navigate = useNavigate()
  const description =
    project.shortDescription ?? project.creators.map((c) => c.name).join(", ")

  return (
    <article
      role="link"
      tabIndex={0}
      onClick={() => navigate(`/project/${project.id}`)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          navigate(`/project/${project.id}`)
        }
      }}
      className={cn(
        "block cursor-pointer outline-none",
        className,
          "project-card flex flex-col overflow-hidden rounded-card border border-border text-card-foreground",
          "min-h-0",
          "transition-[border-color,box-shadow,transform] duration-200 ease-out",
          "hover:border-primary/30 hover:shadow-lg hover:-translate-y-1",
          "focus-within:border-primary/30 focus-within:shadow-lg focus-within:-translate-y-1"
        )}
    >
        <div className="project-card__image-zone aspect-video w-full shrink-0 overflow-hidden rounded-t-card">
          <img
            src={project.imageUrl}
            alt=""
            className="h-full w-full object-cover"
            loading="lazy"
            decoding="async"
          />
        </div>

        <div className="project-card__content flex flex-1 flex-col rounded-b-card p-5">
          <div className="flex items-start gap-3">
            <div className="h-11 w-11 shrink-0 overflow-hidden rounded-card border border-border/50">
              <img
                src={project.iconUrl ?? project.imageUrl}
                alt=""
                className="h-full w-full object-cover"
                loading="lazy"
                decoding="async"
              />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="line-clamp-2 text-lg font-semibold leading-tight tracking-tight text-foreground">
                {project.title}
              </h3>
            </div>
          </div>
          <p className="mt-3 line-clamp-3 text-sm text-muted-foreground">
            {description}
          </p>
          <p className="mt-2 text-xs font-medium text-primary">
            Привлекаемые инвестиции: {formatGoal(project.goal)}
          </p>
          <div className="mt-3" onClick={(e) => e.stopPropagation()}>
            <RaisedButton
              size="default"
              color="#3b82f6"
              className="w-full text-white"
              onClick={() => navigate(`/project/${project.id}`)}
            >
              Подробнее
            </RaisedButton>
          </div>
        </div>
      </article>
  )
}
