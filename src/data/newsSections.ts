import {
  Brain,
  Building2,
  Car,
  CircleDollarSign,
  Cpu,
  Dna,
  Gamepad2,
  Globe,
  LayoutGrid,
  Megaphone,
  Microchip,
  Plane,
  Rocket,
  ShoppingCart,
  Sparkles,
  TrendingUp,
  Zap,
} from "lucide-react"
import type { NewsCategory, NewsSection } from "@/types/news"

/**
 * Разделы и категории новостей (БД/витрина).
 * Со звёздочкой в ТЗ — разделы (sections), под ними — категории (categories).
 */
export const NEWS_SECTIONS: NewsSection[] = [
  {
    id: "technology",
    title: "Технологии",
    icon: Cpu,
    categories: [
      { id: "technology_ai", title: "ИИ", icon: Brain },
      { id: "technology_robotics", title: "Робототехника", icon: LayoutGrid },
      { id: "technology_quantum", title: "Квантовые технологии", icon: Sparkles },
      { id: "technology_chips", title: "Чипы", icon: Microchip },
    ],
  },
  {
    id: "transport",
    title: "Транспорт",
    icon: Car,
    categories: [
      { id: "transport_ev", title: "Электромобили", icon: Car },
      { id: "transport_autonomous", title: "Автономный транспорт", icon: LayoutGrid },
      { id: "transport_flying", title: "Летающий транспорт", icon: Plane },
    ],
  },
  {
    id: "energy",
    title: "Энергия",
    icon: Zap,
    categories: [
      { id: "energy_power", title: "Энергетика", icon: Zap },
      { id: "energy_nuclear", title: "Ядерная энергия", icon: Sparkles },
      { id: "energy_climate", title: "Климатические технологии", icon: Globe },
    ],
  },
  {
    id: "energetics",
    title: "Энергетика",
    icon: Zap,
    categories: [
      { id: "energetics_grid", title: "Энергосети", icon: LayoutGrid },
      { id: "energetics_renewable", title: "ВИЭ", icon: Globe },
      { id: "energetics_hydrogen", title: "Водород", icon: Sparkles },
    ],
  },
  {
    id: "biology",
    title: "Биология и человек",
    icon: Dna,
    categories: [
      { id: "biology_biotech", title: "Биотехнологии", icon: Dna },
      { id: "biology_longevity", title: "Продление жизни", icon: Sparkles },
      { id: "biology_neuro", title: "Нейротехнологии", icon: Brain },
      { id: "biology_consciousness", title: "Сознание", icon: Brain },
    ],
  },
  {
    id: "civilization",
    title: "Цивилизация",
    icon: Globe,
    categories: [
      { id: "civilization_peace", title: "Мир", icon: Globe },
      { id: "civilization_cooperation", title: "Международное сотрудничество", icon: Building2 },
      { id: "civilization_digital_society", title: "Цифровое общество", icon: LayoutGrid },
      { id: "civilization_future_cities", title: "Города будущего", icon: Building2 },
    ],
  },
  {
    id: "economy",
    title: "Экономика",
    icon: TrendingUp,
    categories: [
      { id: "economy_web3", title: "Web3", icon: Rocket },
      { id: "economy_crypto", title: "Криптовалюты", icon: CircleDollarSign },
      { id: "economy_fintech", title: "Финтех", icon: TrendingUp },
      { id: "economy_digital_economy", title: "Цифровая экономика", icon: LayoutGrid },
      { id: "economy_startups", title: "Стартапы", icon: Rocket },
      { id: "economy_venture", title: "Венчурные инвестиции", icon: TrendingUp },
    ],
  },
  {
    id: "media",
    title: "Медиа",
    icon: Gamepad2,
    categories: [
      { id: "media_games", title: "Игры", icon: Gamepad2 },
      { id: "media_content_platforms", title: "Контент-платформы", icon: Megaphone },
    ],
  },
  {
    id: "commerce",
    title: "Коммерция",
    icon: ShoppingCart,
    categories: [
      { id: "commerce_ecommerce", title: "Электронная коммерция", icon: ShoppingCart },
      { id: "commerce_marketplaces", title: "Маркетплейсы", icon: LayoutGrid },
      { id: "commerce_digital_ads", title: "Цифровая реклама", icon: Megaphone },
    ],
  },
]

/** Все категории в плоском списке (sectionId не дублируется в объекте, можно вывести из родителя). */
export function getAllNewsCategories(): Array<NewsCategory & { sectionId: string }> {
  const result: Array<NewsCategory & { sectionId: string }> = []
  for (const section of NEWS_SECTIONS) {
    for (const category of section.categories) {
      result.push({ ...category, sectionId: section.id })
    }
  }
  return result
}

export type NewsCategoryId = (typeof NEWS_SECTIONS)[number]["categories"][number]["id"]
export type NewsSectionId = (typeof NEWS_SECTIONS)[number]["id"]

/** Элемент новости (привязка к проекту и разделу/категории). */
export interface NewsItemRecord {
  projectId: string
  sectionId: NewsSectionId
  categoryId?: NewsCategoryId
  title: string
  excerpt: string
}

/**
 * Новости проектов для блока на главной (БД/лента).
 * sectionId — раздел из NEWS_SECTIONS, categoryId — опционально категория внутри раздела.
 */
export const NEWS_ITEMS: NewsItemRecord[] = [
  {
    projectId: "pilot",
    sectionId: "biology",
    categoryId: "biology_neuro",
    title: "Level Up Games тестирует новый формат гонок, где внимание пилота влияет на поведение машины",
    excerpt:
      "Проект на стыке FPV-симулятора и нейроинтерфейсов выходит в фазу демонстрационного прототипа и готовит первые публичные показы.",
  },
  {
    projectId: "formula",
    sectionId: "biology",
    categoryId: "biology_longevity",
    title: "Formula расширяет рынок healthy food и готовит следующую волну партнёрств",
    excerpt:
      "Команда масштабирует маркетплейс здорового питания, усиливая витрину брендов и локальную доставку.",
  },
  {
    projectId: "nexus",
    sectionId: "technology",
    categoryId: "technology_chips",
    title: "Nexus собирает инфраструктурный стек для команд новой цифровой экономики",
    excerpt:
      "Сервис делает ставку на прозрачные процессы, автоматизацию и быстрый запуск совместных продуктов.",
  },
  {
    projectId: "level-up",
    sectionId: "media",
    categoryId: "media_games",
    title: "Level Up превращает игровые механики в ежедневный продукт для вовлечения аудитории",
    excerpt:
      "Проект развивается как прикладная платформа с игровыми сценариями, достижениями и лёгким входом для новых пользователей.",
  },
]
