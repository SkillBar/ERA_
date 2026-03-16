import { useMemo, useState } from "react"
import { motion } from "framer-motion"
import { Link } from "react-router-dom"
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react"
import {
  AiChipIcon,
  AiBrain01Icon,
  Book01Icon,
  HealthIcon,
} from "@hugeicons/core-free-icons"
import { SearchAutocomplete } from "@/components/SearchAutocomplete"
import { ProjectCard } from "@/components/ProjectCard"
import { ProjectManagementTable } from "@/components/ui/project-management-table"
import { getProjectsWithCreators } from "@/data/database"
import {
  NEWS_ITEMS,
  NEWS_SECTIONS,
  type NewsSectionId,
} from "@/data/newsSections"
import type { ProjectCategory } from "@/types/project"
import { useThemeSwitch } from "@/hooks/useThemeSwitch"
import { getProjectImageUrl } from "@/lib/projectImage"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
}

const PROJECT_CATEGORIES: {
  id: ProjectCategory
  label: string
  icon: IconSvgElement
}[] = [
  { id: "technology", label: "Технологии", icon: AiChipIcon },
  { id: "education", label: "Образование", icon: Book01Icon },
  { id: "neuro", label: "Нейро", icon: AiBrain01Icon },
  { id: "health", label: "Здоровье", icon: HealthIcon },
]

type HomeNewsItem = (typeof NEWS_ITEMS)[number] & {
  project: ReturnType<typeof getProjectsWithCreators>[number]
}

function getSection(sectionId: NewsSectionId) {
  return NEWS_SECTIONS.find((s) => s.id === sectionId)
}

function getSectionTitle(sectionId: NewsSectionId): string {
  return getSection(sectionId)?.title ?? sectionId
}

export function Home() {
  const [activeCategory, setActiveCategory] = useState<ProjectCategory>("technology")
  const [newsFilter, setNewsFilter] = useState<NewsSectionId | "all">("all")
  const projects = useMemo(() => getProjectsWithCreators(), [])
  const projectsById = useMemo(
    () => new Map(projects.map((project) => [project.id, project])),
    [projects]
  )
  const allNewsItems = useMemo(
    () =>
      NEWS_ITEMS.map((item) => ({
        ...item,
        project: projectsById.get(item.projectId),
      })).filter((item): item is HomeNewsItem => item.project != null),
    [projectsById]
  )
  const newsItems = useMemo(() => {
    if (newsFilter === "all") return allNewsItems
    return allNewsItems.filter((item) => item.sectionId === newsFilter)
  }, [allNewsItems, newsFilter])
  const leadNewsItem = newsItems[0]
  const { theme } = useThemeSwitch()

  return (
    <main className="min-h-screen">
      <section className="border-b border-border bg-background py-12 md:py-16">
        <div className="container mx-auto">
          <motion.div
            className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.22em] text-primary">
                Новости проектов
              </p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground md:text-5xl">
                Истории и обновления о проектах ERA
              </h1>
            </div>
            <p className="max-w-xl text-sm leading-6 text-muted-foreground md:text-base">
              Верхний блок работает как редакционная витрина: крупный материал и короткие новости о проектах, в духе медиа-ленты.
            </p>
          </motion.div>

          {/* Главные разделы (со *) и подкатегории */}
          <motion.div
            className="mb-10 rounded-xl border border-border/80 bg-muted/30 px-5 py-6 md:px-6 md:py-7"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.08 }}
          >
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Разделы
            </h2>
            <div className="flex flex-wrap gap-x-8 gap-y-6 md:gap-x-12 md:gap-y-8">
              {NEWS_SECTIONS.map((section) => {
                const SectionIcon = section.icon
                return (
                  <div key={section.id} className="min-w-0">
                    <div className="mb-2 flex items-center gap-2">
                      <SectionIcon className="h-4 w-4 shrink-0 text-primary" aria-hidden />
                      <span className="text-sm font-semibold text-foreground">{section.title}</span>
                    </div>
                    <ul className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                      {section.categories.map((cat) => {
                        const CatIcon = cat.icon
                        return (
                          <li key={cat.id} className="flex items-center gap-1.5">
                            <CatIcon className="h-3 w-3 shrink-0 opacity-70" aria-hidden />
                            <span>{cat.title}</span>
                          </li>
                        )
                      })}
                    </ul>
                  </div>
                )
              })}
            </div>
          </motion.div>

          {/* Плашки разделов новостей (из БД) — с иконками */}
          <motion.div
            className="mb-6 flex flex-wrap items-center gap-1.5"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.1 }}
          >
            <button
              type="button"
              onClick={() => setNewsFilter("all")}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-[11px] font-medium transition-colors sm:text-xs",
                newsFilter === "all"
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-card/80 text-muted-foreground hover:border-primary/40 hover:text-foreground"
              )}
            >
              Все
            </button>
            {NEWS_SECTIONS.map((section) => {
              const isActive = newsFilter === section.id
              const SectionIcon = section.icon
              return (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => setNewsFilter(section.id)}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-[11px] font-medium transition-colors sm:text-xs",
                    isActive
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-card/80 text-muted-foreground hover:border-primary/40 hover:text-foreground"
                  )}
                >
                  <SectionIcon className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" aria-hidden />
                  {section.title}
                </button>
              )
            })}
          </motion.div>

          {/* Сетка новостей: magazine-style — крупный материал слева, колонка справа, затем ряд карточек */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
            {leadNewsItem && (
              <motion.div
                className="md:row-span-2 md:min-h-0"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45 }}
              >
                <Link to={`/project/${leadNewsItem.project.id}`} className="block h-full">
                  <Card className="h-full overflow-hidden border-border/80 bg-card/80 transition-colors hover:border-primary/30">
                    <div className="aspect-[16/9] overflow-hidden md:aspect-[4/3]">
                      <img
                        src={getProjectImageUrl(leadNewsItem.project, theme)}
                        alt={leadNewsItem.title}
                        fetchPriority="high"
                        className="h-full w-full object-cover transition-transform duration-300 hover:scale-[1.02]"
                      />
                    </div>
                    <CardContent className="space-y-3 p-5 md:p-6">
                      {(() => {
                        const sec = getSection(leadNewsItem.sectionId)
                        const SecIcon = sec?.icon
                        return (
                          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.22em] text-primary">
                            {SecIcon && <SecIcon className="h-3.5 w-3.5 shrink-0" aria-hidden />}
                            {getSectionTitle(leadNewsItem.sectionId)}
                          </p>
                        )
                      })()}
                      <h2 className="text-xl font-semibold leading-tight text-foreground md:text-2xl">
                        {leadNewsItem.title}
                      </h2>
                      <p className="line-clamp-3 text-sm leading-6 text-muted-foreground md:line-clamp-4 md:text-base">
                        {leadNewsItem.excerpt}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            )}

            {newsItems.slice(1, 3).map((item, index) => (
              <motion.div
                key={item.project.id}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.05 * (index + 1) }}
              >
                <Link to={`/project/${item.project.id}`} className="block">
                  <Card className="h-full border-border/80 bg-card/70 transition-colors hover:border-primary/30">
                    <CardContent className="flex gap-4 p-4">
                      <img
src={getProjectImageUrl(item.project, theme)}
                          alt={item.title}
                          className="h-20 w-20 shrink-0 rounded-card object-cover md:h-24 md:w-24"
                      />
                      <div className="min-w-0">
<p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
                            {(() => {
                              const sec = getSection(item.sectionId)
                              const SecIcon = sec?.icon
                              return (
                                <>
                                  {SecIcon && <SecIcon className="h-3 w-3 shrink-0" aria-hidden />}
                                  {getSectionTitle(item.sectionId)}
                                </>
                              )
                            })()}
                          </p>
                        <h3 className="mt-1 line-clamp-2 text-sm font-semibold leading-snug text-foreground md:line-clamp-3 md:text-base">
                          {item.title}
                        </h3>
                        <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground md:line-clamp-3 md:text-sm">
                          {item.excerpt}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}

            {newsItems[3] && (
              <motion.div
                className="md:col-span-3"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.15 }}
              >
                <Link to={`/project/${newsItems[3].project.id}`} className="block">
                  <Card className="overflow-hidden border-border/80 bg-card/70 transition-colors hover:border-primary/30">
                    <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center md:p-5">
                      <img
                        src={getProjectImageUrl(newsItems[3].project, theme)}
                        alt={newsItems[3].title}
                        className="h-40 w-full shrink-0 rounded-card object-cover sm:h-28 sm:w-44 md:h-32 md:w-52"
                      />
                      <div className="min-w-0">
                        <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
                          {(() => {
                            const sec = getSection(newsItems[3].sectionId)
                            const SecIcon = sec?.icon
                            return (
                              <>
                                {SecIcon && <SecIcon className="h-3 w-3 shrink-0" aria-hidden />}
                                {getSectionTitle(newsItems[3].sectionId)}
                              </>
                            )
                          })()}
                        </p>
                        <h3 className="mt-2 text-lg font-semibold leading-tight text-foreground md:text-xl">
                          {newsItems[3].title}
                        </h3>
                        <p className="mt-2 line-clamp-2 text-sm leading-5 text-muted-foreground md:line-clamp-3">
                          {newsItems[3].excerpt}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      <section className="border-t-8 border-muted/70 bg-surface py-12 md:py-14">
        <div className="container mx-auto">
          <Tabs
            value={activeCategory}
            onValueChange={(value) => setActiveCategory(value as ProjectCategory)}
            className="w-full"
          >
            <motion.div
              className="mb-6 w-full"
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35 }}
            >
              <TabsList className="mb-4 flex h-auto w-full flex-wrap justify-start gap-2 rounded-none border-0 bg-transparent p-0">
                {PROJECT_CATEGORIES.map((category) => {
                  const Icon = category.icon
                  return (
                    <TabsTrigger
                      key={category.id}
                      value={category.id}
                      className={cn(
                        "inline-flex items-center gap-2 rounded-full border-0 px-4 py-2.5 text-sm font-medium shadow-none transition-colors",
                        "data-[state=inactive]:bg-background/80 data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:bg-muted/80",
                        "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                      )}
                    >
                      <HugeiconsIcon icon={Icon} size={18} className="shrink-0" />
                      {category.label}
                    </TabsTrigger>
                  )
                })}
              </TabsList>
              <div className="w-full">
                <SearchAutocomplete
                  large
                  placeholder="Поиск проектов"
                  className="w-full"
                  variant="soft"
                />
              </div>
            </motion.div>

          {PROJECT_CATEGORIES.map((category) => (
            <TabsContent key={category.id} value={category.id}>
              {(() => {
                const categoryProjects = projects.filter(
                  (project) => project.categoryId === category.id
                )

                return (
                  <>
              <motion.div
                className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                variants={container}
                initial="hidden"
                animate="show"
              >
                {categoryProjects.map((project) => (
                  <motion.div key={project.id} variants={item}>
                    <ProjectCard project={project} />
                  </motion.div>
                ))}
              </motion.div>

              <motion.div
                className="mt-16"
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4 }}
              >
                <ProjectManagementTable title="Список проектов" projects={categoryProjects} className="p-0" />
              </motion.div>
                  </>
                )
              })()}
            </TabsContent>
          ))}
        </Tabs>
        </div>
      </section>
    </main>
  )
}
