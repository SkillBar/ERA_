import { useState, useEffect, useMemo } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft, Globe, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { RaisedButton } from "@/components/ui/raised-button"
import { Progress } from "@/components/ui/progress"
import { SectionCard } from "@/components/ui/section-card"
import { CostBreakdownTable } from "@/components/CostBreakdownTable"
import { ImageTextCard } from "@/components/ui/image-text-card"
import { TierCard } from "@/components/ui/tier-card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { getProjectWithCreatorsById } from "@/data/database"
import {
  getProjectPageDetail,
  getProjectStageLabel,
} from "@/data/projectDetails"
import { cn } from "@/lib/utils"

function formatMoneyFull(value: number): string {
  return new Intl.NumberFormat("ru-RU").format(value)
}

const INVESTMENT_TYPE_LABELS: Record<string, string> = {
  ordinary: "Обычные инвестиции",
  crowdfunding: "Краудфандинг",
}

type SectionItem = { id: string; label: string; children?: { id: string; label: string }[] }

/** Секции для сайдбара (дерево на 1 уровень вниз) и scroll spy. */
function getSectionConfig(detail: NonNullable<ReturnType<typeof getProjectPageDetail>>): SectionItem[] {
  const aboutItem: SectionItem = {
    id: "section-about",
    label: "О проекте",
    children: detail.gameModes?.length ? [{ id: "section-game-modes", label: "Режим игр" }] : undefined,
  }
  const items: SectionItem[] = [
    aboutItem,
    { id: "section-audience", label: "Целевая аудитория" },
  ]
  if (detail.investmentTerms) items.push({ id: "section-terms", label: "Условия инвестиций" })
  if (detail.breakdown?.length) items.push({ id: "section-breakdown", label: "Использование средств" })
  if (detail.roadmap?.length) items.push({ id: "section-roadmap", label: "Дорожная карта" })
  items.push({ id: "section-risks", label: "Риски и вызовы" })
  if (detail.teamMembers?.length) items.push({ id: "section-team", label: "Команда" })
  if (detail.perks?.length) items.push({ id: "section-perks", label: "Варианты поддержки" })
  return items
}

/** Все id секций для scroll spy (включая дочерние). */
function getSectionIdsFlat(detail: NonNullable<ReturnType<typeof getProjectPageDetail>>): string[] {
  const ids: string[] = []
  getSectionConfig(detail).forEach((s) => {
    ids.push(s.id)
    s.children?.forEach((c) => ids.push(c.id))
  })
  return ids
}

export function ProjectPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()
  const [logoError, setLogoError] = useState(false)
  const [activeSection, setActiveSection] = useState<string>("")
  const project = projectId ? getProjectWithCreatorsById(projectId) : undefined
  const detail = projectId ? getProjectPageDetail(projectId) : undefined

  const sectionIds = useMemo(() => (detail ? getSectionIdsFlat(detail) : []), [detail])

  // Scroll spy: IntersectionObserver — активная секция та, что в верхней части вьюпорта
  useEffect(() => {
    if (sectionIds.length === 0) return
    const visibility = new Map<string, boolean>()
    const setActiveFromVisible = () => {
      const visible = sectionIds.filter((id) => visibility.get(id))
      if (visible.length > 0) {
        const tops = visible
          .map((id) => ({ id, top: document.getElementById(id)?.getBoundingClientRect().top ?? Infinity }))
          .filter((x) => x.top !== Infinity)
          .sort((a, b) => a.top - b.top)
        const best = tops.find((x) => x.top >= 80) ?? tops[tops.length - 1]
        setActiveSection(best.id)
        return
      }
      // Ни одна секция не в зоне: выбираем ближайшую к верху вьюпорта
      const allTops = sectionIds
        .map((id) => ({ id, top: document.getElementById(id)?.getBoundingClientRect().top ?? Infinity }))
        .filter((x) => x.top !== Infinity)
        .sort((a, b) => a.top - b.top)
      if (allTops.length === 0) return
      const nearest = allTops.reduce((prev, curr) => (Math.abs(curr.top - 120) < Math.abs(prev.top - 120) ? curr : prev))
      setActiveSection(nearest.id)
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          visibility.set(e.target.id, e.isIntersecting)
        }
        setActiveFromVisible()
      },
      { rootMargin: "-80px 0px -50% 0px", threshold: 0 }
    )
    sectionIds.forEach((id) => {
      const el = document.getElementById(id)
      if (el) {
        visibility.set(id, false)
        observer.observe(el)
      }
    })
    setActiveFromVisible()
    const onScroll = () => setActiveFromVisible()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => {
      observer.disconnect()
      window.removeEventListener("scroll", onScroll)
    }
  }, [sectionIds])

  if (!project) {
    return (
      <main className="container mx-auto px-4 py-16 text-center">
        <p className="text-muted-foreground">Проект не найден</p>
        <Button variant="link" onClick={() => navigate("/")} className="mt-4">
          На главную
        </Button>
      </main>
    )
  }

  const fundedPercent = Math.min(
    100,
    Math.round((project.raised / project.goal) * 100)
  )

  return (
    <main className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-b-card border-b border-border bg-surface">
        <div className="absolute inset-0">
          <img
            src={detail?.heroImageUrl ?? project.imageUrl}
            alt=""
            className="h-full w-full object-cover opacity-40 dark:opacity-30"
            onError={(e) => {
              e.currentTarget.src = "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200&h=600&fit=crop"
              e.currentTarget.onerror = null
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
        </div>
        <div className="container relative mx-auto px-4 py-8 md:py-12">
          <Button
            variant="ghost"
            size="sm"
            className="mb-6 text-muted-foreground hover:text-foreground"
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Назад
          </Button>
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="space-y-4">
              {detail?.logoUrl && !logoError ? (
                <img
                  src={detail.logoUrl}
                  alt={project.title}
                  className="h-14 w-auto max-w-[12rem] object-contain object-left dark:invert"
                  onError={() => setLogoError(true)}
                />
              ) : (
                <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl lg:text-5xl">
                  {project.title}
                </h1>
              )}
              {detail?.links && detail.links.length > 0 && (
                <div className="flex items-center gap-3">
                  {detail.links.map((link) => (
                    <a
                      key={link.url}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground transition-colors hover:text-foreground"
                      aria-label={link.label}
                    >
                      <Globe className="h-5 w-5" />
                    </a>
                  ))}
                  <button
                    type="button"
                    className="text-muted-foreground transition-colors hover:text-foreground"
                    aria-label="Поделиться"
                  >
                    <Share2 className="h-5 w-5" />
                  </button>
                </div>
              )}
              {detail?.shortDescription && (
                <p className="max-w-2xl text-muted-foreground">
                  {detail.shortDescription}
                </p>
              )}
              {detail?.targetAudience && (
                <p className="max-w-2xl text-sm text-muted-foreground/90">
                  <span className="font-medium text-foreground">Кому это нужно:</span>{" "}
                  {detail.targetAudience}
                </p>
              )}
              {detail?.whatGivesContribution && (
                <div className="rounded-card border border-primary/20 bg-primary/5 px-4 py-3">
                  <p className="text-sm font-medium text-foreground">
                    {detail.whatGivesContribution}
                  </p>
                </div>
              )}
            </div>
            <div className="flex shrink-0 flex-col gap-3 md:items-end">
              <RaisedButton color="#3b82f6" size="lg" className="text-white">
                Поддержать разработку
              </RaisedButton>
            </div>
          </div>
        </div>
      </section>

      {/* Метрики: тип инвестиций (вкладка), сумма (для обычных инвестиций — только цель, без «из» и без прогресс-бара), стадия. */}
      <section className="border-b border-border bg-surface py-6">
        <div className="container mx-auto px-4">
          {detail?.investmentType && (
            <div className="mb-4">
              <p className="mb-1.5 text-sm text-muted-foreground">Тип инвестиций</p>
              <span
                className={cn(
                  "inline-flex items-center rounded-lg border px-3 py-1.5 text-sm font-medium",
                  detail.investmentType === "ordinary"
                    ? "border-primary/30 bg-primary/10 text-primary"
                    : "border-border bg-muted/50 text-foreground"
                )}
              >
                {INVESTMENT_TYPE_LABELS[detail.investmentType] ?? detail.investmentType}
              </span>
            </div>
          )}
          <div className="flex flex-wrap items-center gap-8">
            <div>
              <p className="text-sm text-muted-foreground">
                {detail?.investmentType === "ordinary" ? "Сумма привлечения" : "Собрано"}
              </p>
              <p className="text-2xl font-semibold text-foreground">
                {detail?.investmentType === "ordinary"
                  ? `${formatMoneyFull(project.goal)} ₽`
                  : `${formatMoneyFull(project.raised)} из ${formatMoneyFull(project.goal)} ₽`}
              </p>
            </div>
            {detail?.stage && (
              <>
                <div className="h-8 w-px bg-border" />
                <div>
                  <p className="text-sm text-muted-foreground">Стадия</p>
                  <p className="text-xl font-semibold text-foreground">
                    {getProjectStageLabel(detail.stage)}
                  </p>
                </div>
              </>
            )}
          </div>
          {detail?.investmentType === "crowdfunding" && (
            <div className="mt-4">
              <Progress
                value={fundedPercent}
                className="h-2 [&>div]:bg-gradient-to-r [&>div]:from-blue-500 [&>div]:to-indigo-500"
              />
            </div>
          )}
        </div>
      </section>

      {/* Креаторы (кратко) */}
      {project.creators.length > 0 && (
        <section className="border-b border-border py-6">
          <div className="container mx-auto px-4">
            <h2 className="mb-4 text-lg font-semibold text-foreground">
              Креаторы
            </h2>
            <div className="flex flex-wrap gap-4">
              {project.creators.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center gap-3 rounded-card border border-border bg-card px-4 py-3"
                >
                  {c.avatarUrl ? (
                    <img
                      src={c.avatarUrl}
                      alt=""
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-sm font-medium text-muted-foreground">
                      {c.name.charAt(0)}
                    </div>
                  )}
                  <span className="font-medium text-foreground">{c.name}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Полное описание: resizable сайдбар + контент (desktop), scroll spy по секциям */}
      {detail &&
        (() => {
          const sidebarNav = (
            <div className="rounded-card border border-border bg-card text-card-foreground">
              <ScrollArea className="h-[calc(100vh-7rem)]">
                <nav className="flex flex-col gap-0.5 p-2">
                  {getSectionConfig(detail).map((item) => (
                    <div key={item.id} className="space-y-0.5">
                      <a
                        href={`#${item.id}`}
                        onClick={(e) => {
                          e.preventDefault()
                          document.getElementById(item.id)?.scrollIntoView({ behavior: "smooth", block: "start" })
                        }}
                        className={cn(
                          "flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                          activeSection === item.id
                            ? "bg-accent text-accent-foreground"
                            : "text-muted-foreground"
                        )}
                      >
                        {item.label}
                      </a>
                      {item.children && item.children.length > 0 && (
                        <div className="relative ml-3 border-l border-border pl-3">
                          {item.children.map((child) => (
                            <a
                              key={child.id}
                              href={`#${child.id}`}
                              onClick={(e) => {
                                e.preventDefault()
                                document.getElementById(child.id)?.scrollIntoView({ behavior: "smooth", block: "start" })
                              }}
                              className={cn(
                                "flex items-center rounded-md py-1.5 text-sm transition-colors hover:text-foreground",
                                activeSection === child.id
                                  ? "text-primary font-medium"
                                  : "text-muted-foreground"
                              )}
                            >
                              {child.label}
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </nav>
              </ScrollArea>
            </div>
          )

          const mainContent = (
            <div className="container mx-auto space-y-10">
          <div className="space-y-10">
            <SectionCard id="section-about" title="О проекте" contentClassName="space-y-4">
              {detail.fullDescriptionImageUrl && (
                <div className="overflow-hidden rounded-card border border-border">
                  <img
                    src={detail.fullDescriptionImageUrl}
                    alt="Как выглядит проект"
                    className="w-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = "none"
                    }}
                  />
                </div>
              )}
              <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground">
                {detail.fullDescription.split("\n").map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </SectionCard>

            {detail.gameModes && detail.gameModes.length > 0 && (
              <section id="section-game-modes" className="space-y-4">
                <h2 className="text-xl font-semibold">Режим игр</h2>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  {detail.gameModes.map((mode, idx) => (
                    <ImageTextCard
                      key={idx}
                      imageUrl={mode.imageUrl}
                      imageAlt={mode.title}
                      title={mode.title}
                      description={mode.description}
                      imageUrls={mode.imageUrls}
                      details={mode.details}
                      badge={mode.badge}
                      stacked
                    />
                  ))}
                </div>
              </section>
            )}

            <SectionCard id="section-audience" title="Целевая аудитория / Кому это нужно" contentClassName="text-muted-foreground">
              {detail.targetAudience}
            </SectionCard>

            {detail.investmentTerms && (
              <SectionCard id="section-terms" title="Условия инвестиций" contentClassName="whitespace-pre-line text-muted-foreground">
                {detail.investmentTerms}
              </SectionCard>
            )}

            {(detail.breakdown?.length || detail.costBreakdownTable?.length) ? (
              <SectionCard
                id="section-breakdown"
                title="Использование средств"
                description="Breakdown распределения"
                contentClassName="space-y-6"
              >
                {detail.breakdown && detail.breakdown.length > 0 && (
                  <div className="space-y-3">
                    {detail.breakdown.map((item) => (
                      <div key={item.label} className="flex items-center gap-4">
                        <span className="w-32 text-sm text-muted-foreground">
                          {item.label}
                        </span>
                        <Progress value={item.percent} className="flex-1" />
                        <span className="text-sm font-medium">{item.percent}%</span>
                      </div>
                    ))}
                  </div>
                )}
                {detail.costBreakdownTable && detail.costBreakdownTable.length > 0 && (
                  <CostBreakdownTable rows={detail.costBreakdownTable} className={detail.breakdown?.length ? "mt-6" : undefined} />
                )}
              </SectionCard>
            ) : null}

            {detail.roadmap && detail.roadmap.length > 0 && (
              <SectionCard
                id="section-roadmap"
                title="Дорожная карта"
                description="Основные этапы"
              >
                <ul className="space-y-4">
                  {detail.roadmap.map((m) => (
                    <li
                      key={m.quarter + m.title}
                      className={cn(
                        "flex gap-4 border-l-2 pl-4",
                        m.status === "done" && "border-green-500",
                        m.status === "current" && "border-blue-500",
                        m.status === "planned" && "border-border"
                      )}
                    >
                      <span className="text-sm font-medium text-muted-foreground">
                        {m.quarter}
                      </span>
                      <div>
                        <p className="font-medium text-foreground">
                          {m.title}
                          {m.status === "current" && (
                            <span className="ml-2 text-xs text-primary">
                              (текущий этап)
                            </span>
                          )}
                        </p>
                        {m.description && (
                          <p className="text-sm text-muted-foreground">
                            {m.description}
                          </p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </SectionCard>
            )}

            <SectionCard id="section-risks" title="Риски и вызовы" contentClassName="text-sm text-muted-foreground">
              {detail.risks}
            </SectionCard>
          </div>

          {detail.teamMembers && detail.teamMembers.length > 0 && (
            <SectionCard
              id="section-team"
              title="Команда"
              description="Детали команды"
              contentClassName="space-y-6"
            >
              {detail.teamMembers.map((member) => (
                <div key={member.id} className="flex gap-4">
                  {member.avatarUrl ? (
                    <img
                      src={member.avatarUrl}
                      alt=""
                      className="h-14 w-14 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-muted text-lg font-medium text-muted-foreground">
                      {member.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-foreground">
                      {member.name}
                    </p>
                    {member.role ? (
                      <p className="text-sm text-primary">{member.role}</p>
                    ) : null}
                    {member.bio ? (
                      <p className="mt-1 text-sm text-muted-foreground">
                        {member.bio}
                      </p>
                    ) : null}
                  </div>
                </div>
              ))}
            </SectionCard>
          )}

          {detail.perks && detail.perks.length > 0 && (
            <SectionCard
              id="section-perks"
              title="Варианты поддержки"
              description="Уровни и перки"
              contentClassName="space-y-4"
            >
              {detail.perks.map((tier) => (
                <TierCard
                  key={tier.title}
                  title={tier.title}
                  amount={tier.amount}
                  description={tier.description}
                  features={tier.features}
                  popular={tier.popular}
                />
              ))}
            </SectionCard>
          )}
        </div>
          )

          return (
            <>
              <div id="project-scroll-root" className="hidden gap-8 px-4 py-10 lg:flex">
                <aside className="sticky top-24 w-56 shrink-0 self-start">
                  {sidebarNav}
                </aside>
                <div className="min-w-0 flex-1">{mainContent}</div>
              </div>
              <div className="flex px-4 py-10 lg:hidden">
                <div className="min-w-0 flex-1">{mainContent}</div>
              </div>
            </>
          )
        })()}

      {!detail && (
        <section className="container mx-auto px-4 py-16 text-center">
          <p className="text-muted-foreground">
            Полное описание проекта скоро появится.
          </p>
        </section>
      )}
    </main>
  )
}
