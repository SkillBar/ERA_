/**
 * Создатель проекта — один или несколько на проект (связь многие-ко-многим через creatorIds в проекте).
 */
export interface Creator {
  id: string
  name: string
  avatarUrl?: string
  /** Роль в проекте (для страницы проекта) */
  role?: string
  /** Краткое описание деятельности */
  bio?: string
  /** Ссылки (соцсети, сайт) */
  links?: { label: string; url: string }[]
}

/** Участник команды на странице проекта (имя, должность, описание). */
export interface TeamMember {
  id: string
  name: string
  role: string
  bio: string
  avatarUrl?: string
  links?: { label: string; url: string }[]
}

/** Стадия проекта для отображения на странице. */
export type ProjectStage =
  | "idea"
  | "prototype"
  | "active_funding"
  | "pre_seed"
  | "seed"
  | "series_a"
  | "live"

/** Один пункт дорожной карты. */
export interface RoadmapMilestone {
  quarter: string
  title: string
  description?: string
  status: "done" | "current" | "planned"
}

/** Уровень поддержки / перк. */
export interface PerkTier {
  title: string
  amount?: number
  description: string
  features: string[]
  popular?: boolean
}

/** Строка детальной сметы: заголовок секции, позиция (цена × кол-во = итог), промежуточный/общий итог. */
export type CostBreakdownRow =
  | { kind: "section"; title: string }
  | { kind: "item"; label: string; price: number; qty: number; total: number }
  | { kind: "itemGroup"; labels: string[]; price: number; qty: number; total: number }
  | { kind: "subtotal"; label: string; value: number }
  | { kind: "calc"; label: string; price: number; qty: number; total: number }
  | { kind: "total"; label: string; value: number }

/** Детали для полной страницы проекта (подтягиваются из БД/API). */
export interface ProjectPageDetail {
  /** Hero-изображение (верхний баннер) */
  heroImageUrl: string
  /** Логотип проекта (опционально) */
  logoUrl?: string
  /** Ссылки: соцсети, сайт */
  links?: { label: string; url: string; icon?: string }[]
  /** Краткое описание (1–2 предложения) */
  shortDescription: string
  /** Целевая аудитория / кому это нужно */
  targetAudience: string
  /** Что даёт вклад (первый блок после названия) */
  whatGivesContribution: string
  /** Тип инвестиций: обычные или краудфандинг */
  investmentType: "ordinary" | "crowdfunding"
  /** Условия инвестиций (текст) */
  investmentTerms?: string
  /** Стадия проекта */
  stage: ProjectStage
  /** Полное описание (с поддержкой изображений/видео — пока текст) */
  fullDescription: string
  /** Изображение в блоке «О проекте» (как выглядит проект) */
  fullDescriptionImageUrl?: string
  /** Подблок «О проекте»: режимы игр (карточки с картинкой, заголовком, описанием) */
  gameModes?: {
    title: string
    description: string
    imageUrl: string
    /** Два фото для карточки (ручка по центру): [первое, второе]. Если не задано — используется imageUrl для обоих. */
    imageUrls?: [string, string]
    details?: string[]
    /** Бейдж (Q1, Q2, Q3, Seed Round). Цвет: green = актуальный квартал, yellow = остальные. */
    badge?: { label: string; variant: "green" | "yellow" }
  }[]
  /** Breakdown использования средств (например "40% — разработка, 30% — маркетинг") */
  breakdown?: { label: string; percent: number }[]
  /** Детальная смета (таблица: наименование, цена, кол-во, итог) — показывается под блоком использования средств */
  costBreakdownTable?: CostBreakdownRow[]
  /** Дорожная карта */
  roadmap?: RoadmapMilestone[]
  /** Команда (3 человека: имя, должность, описание) */
  teamMembers: TeamMember[]
  /** Перки / уровни поддержки */
  perks?: PerkTier[]
  /** Риски и вызовы (обязательно) */
  risks: string
  /** Обновления (feed) — пока пустой массив */
  updates?: { date: string; title: string; body: string }[]

  /** Маркетинговый анализ: анализ рынка */
  marketAnalysis?: string
  /** Маркетинговый анализ: конкурентная среда */
  competitiveEnvironment?: string
  /** Маркетинговый анализ: тенденции рынка */
  marketTrends?: string
  /** Маркетинговый анализ: потенциалы роста */
  growthPotential?: string

  /** Организационная структура: форма организации */
  formOfOrganization?: string
  /** Организационная структура: роли и обязанности */
  rolesAndResponsibilities?: string
  /** Организационная структура: организационная структура (схема/описание) */
  organizationalStructure?: string

  /** Продукты или услуги: описание */
  productsOrServicesDescription?: string

  /** Маркетинговая стратегия */
  marketingStrategy?: string

  /** Финансовые прогнозы: прогнозы продаж */
  salesForecast?: string
  /** Финансовые прогнозы: доходы и расходы (текст или доп. к таблице) */
  incomeAndExpenses?: string

  /** Основные метрики проекта: NPV, ROI и т.д. (для карточки резюме) */
  projectMetrics?: { label: string; value: string }[]
}

/** Статус проекта в БД и при отображении. */
export type ProjectStatus = "live" | "in_progress" | "closed"

/** Категория проекта для витрины. */
export type ProjectCategory =
  | "health"
  | "technology"
  | "education"
  | "neuro"

/**
 * Проект как в БД: ссылки на создателей по id.
 * Категорию (categoryId) добавим позже.
 */
export interface Project {
  id: string
  title: string
  /** Краткое описание для карточки (как в Roi UI CardDescription) */
  shortDescription?: string
  imageUrl: string
  /** Иконка проекта (квадратная, для списков). Если нет — используется imageUrl */
  iconUrl?: string
  raised: number
  goal: number
  backers: number
  daysLeft: number
  /** Один или несколько создателей */
  creatorIds: string[]
  /** Статус: уже работает, только делается, закрыт */
  status: ProjectStatus
  /** Страна происхождения проекта (например РФ) */
  country?: string
  /** Категория для витрины проектов на главной */
  categoryId: ProjectCategory
  /**
   * Тип проекта в БД:
   * - Компания → коммерческая / некоммерческая
   * - Стартап
   */
  projectType?: "company_commercial" | "company_non_commercial" | "startup"
}

/**
 * Проект с подставленными создателями для отображения.
 */
export interface ProjectWithCreators extends Omit<Project, "creatorIds"> {
  creators: Creator[]
}
