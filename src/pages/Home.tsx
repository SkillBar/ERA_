import { useMemo, useState } from "react"
import { motion } from "framer-motion"
import { Link } from "react-router-dom"
import { BookOpen, Brain, Cpu, Heart } from "lucide-react"
import { SearchAutocomplete } from "@/components/SearchAutocomplete"
import { ProjectCard } from "@/components/ProjectCard"
import { ProjectManagementTable } from "@/components/ui/project-management-table"
import { getProjectsWithCreators } from "@/data/database"
import type { ProjectCategory } from "@/types/project"
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
  icon: React.ComponentType<{ className?: string }>
}[] = [
  { id: "technology", label: "Технологии", icon: Cpu },
  { id: "education", label: "Образование", icon: BookOpen },
  { id: "neuro", label: "Нейро", icon: Brain },
  { id: "health", label: "Здоровье", icon: Heart },
]

const PROJECT_NEWS = [
  {
    projectId: "pilot",
    label: "Нейро",
    title: "Pilot тестирует новый формат гонок, где внимание пилота влияет на поведение машины",
    excerpt:
      "Проект на стыке FPV-симулятора и нейроинтерфейсов выходит в фазу демонстрационного прототипа и готовит первые публичные показы.",
  },
  {
    projectId: "formula",
    label: "Здоровье",
    title: "Formula расширяет рынок healthy food и готовит следующую волну партнёрств",
    excerpt:
      "Команда масштабирует маркетплейс здорового питания, усиливая витрину брендов и локальную доставку.",
  },
  {
    projectId: "nexus",
    label: "Технологии",
    title: "Nexus собирает инфраструктурный стек для команд новой цифровой экономики",
    excerpt:
      "Сервис делает ставку на прозрачные процессы, автоматизацию и быстрый запуск совместных продуктов.",
  },
  {
    projectId: "level-up",
    label: "Образование",
    title: "Level Up превращает игровые механики в ежедневный продукт для вовлечения аудитории",
    excerpt:
      "Проект развивается как прикладная платформа с игровыми сценариями, достижениями и лёгким входом для новых пользователей.",
  },
]

type HomeNewsItem = (typeof PROJECT_NEWS)[number] & {
  project: ReturnType<typeof getProjectsWithCreators>[number]
}

export function Home() {
  const [activeCategory, setActiveCategory] = useState<ProjectCategory>("technology")
  const projects = useMemo(() => getProjectsWithCreators(), [])
  const projectsById = useMemo(
    () => new Map(projects.map((project) => [project.id, project])),
    [projects]
  )
  const newsItems = useMemo(
    () =>
      PROJECT_NEWS.map((item) => ({
        ...item,
        project: projectsById.get(item.projectId),
      })).filter((item): item is HomeNewsItem => item.project != null),
    [projectsById]
  )
  const leadNewsItem = newsItems[0]

  return (
    <main className="min-h-screen">
      <section className="border-b border-border bg-background px-4 py-12 md:py-16">
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

          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.9fr)]">
            {leadNewsItem && (
              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45 }}
              >
                <Link to={`/project/${leadNewsItem.project.id}`} className="block">
                  <Card className="overflow-hidden border-border/80 bg-card/80 transition-colors hover:border-primary/30">
                    <div className="aspect-[16/9] overflow-hidden">
                      <img
                        src={leadNewsItem.project.imageUrl}
                        alt={leadNewsItem.title}
                        className="h-full w-full object-cover transition-transform duration-300 hover:scale-[1.02]"
                      />
                    </div>
                    <CardContent className="space-y-4 p-6">
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
                        {leadNewsItem.label}
                      </p>
                      <h2 className="text-2xl font-semibold leading-tight text-foreground md:text-3xl">
                        {leadNewsItem.title}
                      </h2>
                      <p className="max-w-2xl text-sm leading-6 text-muted-foreground md:text-base">
                        {leadNewsItem.excerpt}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            )}

            <div className="grid gap-4">
              {newsItems.slice(1).map((item, index) => (
                <motion.div
                  key={item.project.id}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.05 * (index + 1) }}
                >
                  <Link to={`/project/${item.project.id}`} className="block">
                    <Card className="border-border/80 bg-card/70 transition-colors hover:border-primary/30">
                      <CardContent className="flex gap-4 p-4">
                        <img
                          src={item.project.imageUrl}
                          alt={item.title}
                          className="h-24 w-24 shrink-0 rounded-card object-cover"
                        />
                        <div className="min-w-0">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
                            {item.label}
                          </p>
                          <h3 className="mt-2 line-clamp-3 text-base font-semibold leading-snug text-foreground">
                            {item.title}
                          </h3>
                          <p className="mt-2 line-clamp-3 text-sm leading-5 text-muted-foreground">
                            {item.excerpt}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-t-8 border-muted/70 bg-surface px-4 py-12 md:py-14">
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
                      <Icon className="h-4 w-4 shrink-0" />
                      {category.label}
                    </TabsTrigger>
                  )
                })}
              </TabsList>
              <div className="w-full">
                <SearchAutocomplete
                  large
                  placeholder="Поиск проектов, создателей и категорий..."
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
