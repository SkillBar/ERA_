import type { CostBreakdownRow, ProjectPageDetail } from "@/types/project"

const DETAILS: Record<string, ProjectPageDetail> = {
  pilot: {
    heroImageUrl: "/projects/pilot/hero.png",
    logoUrl: undefined,
    fullDescriptionImageUrl: "/projects/pilot/description.png",
    links: [
      { label: "Telegram", url: "#", icon: "telegram" },
      { label: "Twitter", url: "#", icon: "twitter" },
      { label: "Сайт", url: "#", icon: "globe" },
    ],
    shortDescription:
      "Гонки в реальном мире от первого лица с управлением, в котором участвуют элементы силы мысли. Пилот — это не краудфандинг: мы создаём новый формат гейминга на стыке BCI и симуляторов.",
    targetAudience:
      "Геймеры, энтузиасты нейроинтерфейсов и киберспорта, инвесторы в immersive-технологии.",
    whatGivesContribution:
      "Ваша поддержка ускоряет выход прототипа и даёт ранний доступ к закрытым тестам и эксклюзивному контенту.",
    investmentType: "ordinary",
    investmentTerms: `Инвестиции принимаются на условиях прямого участия в проекте. Минимальная сумма входа обсуждается индивидуально. Доля в проекте или условия возврата и доходности определяются в отдельном соглашении после рассмотрения заявки. Отчётность перед инвесторами — ежеквартально.`,
    stage: "prototype",
    fullDescription: `
Pilot — это гоночный симулятор от первого лица, где управление дополняется элементами нейроинтерфейса (BCI): концентрация, внимание и состояние пилота влияют на геймплей. FPV-камеры установлены прямо в салоне машин, переднее стекло снято — вид как из кокпита без преград.

Мы объединяем реалистичную физику гонок, иммерсивный виртуальный мир и экспериментальное управление «силой мысли», чтобы создать новый формат соревнований. Проект не является краудфандингом в классическом смысле — это разработка продукта с возможностью поддержки на ранней стадии.

Команда работает над прототипом симулятора, интеграцией BCI-устройств и сценариями использования для киберспорта и развлечений.
    `.trim(),
    gameModes: [
      {
        title: "Дрифт",
        description:
          "Дрифт — управляемый занос на асфальте: игроки проходят повороты в контролируемом скольжении, набирая очки за угол, скорость и стиль. Вид от FPV-камеры в салоне даёт полный контроль над траекторией. Режим сочетает технику руления, работу с газом и тормозом и зрелищность прохождения трассы.",
        imageUrl: "/projects/pilot/drift.png",
        imageUrls: ["/projects/pilot/drift.png", "/projects/pilot/drift2.png"],
        badge: { label: "Q1", variant: "green" },
      },
      {
        title: "Off road",
        description:
          "Off road — гонки по бездорожью: пески, дюны, грунтовые трассы с прыжками и резкими поворотами. Игрок управляет машиной по виду от FPV-камеры в салоне (переднее стекло снято) и проходит маршрут на время, сохраняя скорость и контроль на песке, гравии и сложном рельефе. Режим требует высокой концентрации, быстрой реакции и умения чувствовать траекторию движения.",
        imageUrl: "/projects/pilot/offroad.png",
        imageUrls: ["/projects/pilot/offroad.png", "/projects/pilot/offroad2.png"],
        badge: { label: "Q3", variant: "yellow" },
      },
      {
        title: "Формула",
        description:
          "Формула — это скоростные гонки на идеально подготовленной трассе с длинными прямыми и точными поворотами. Игроки соревнуются одновременно на кольцевом треке, борясь за идеальную траекторию, грамотное торможение и тактику пит-стопов. Побеждает тот, кто сохраняет максимальную стабильность и контроль на высокой скорости.",
        imageUrl: "/projects/pilot/formula.png",
        imageUrls: ["/projects/pilot/formula.png", "/projects/pilot/formula2.png"],
        badge: { label: "Q2", variant: "yellow" },
      },
      {
        title: "Водные гонки",
        description:
          "Водные гонки проходят на трассе с буями и поворотами, где игрок управляет скоростной лодкой по виду от FPV-камеры в салоне (переднее стекло снято). Поверхность воды создаёт дополнительные сложности: волны, скольжение и инерцию движения. Победа зависит от точности управления и умения удерживать оптимальную скорость на воде.",
        imageUrl: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&h=340&fit=crop",
        badge: { label: "Seed Round", variant: "yellow" },
      },
      {
        title: "Воздушные гонки",
        description:
          "Воздушные гонки проходят с использованием микродронов, которые пролетают через специальные ворота и препятствия. Игрок видит мир глазами дрона и должен быстро реагировать на трёхмерную трассу с вертикальными манёврами. Этот режим требует максимальной реакции, пространственного мышления и точного контроля полёта.",
        imageUrl: "/projects/pilot/airrace.png",
        imageUrls: ["/projects/pilot/airrace.png", "/projects/pilot/airrace2.png"],
        badge: { label: "Seed Round", variant: "yellow" },
      },
    ],
    breakdown: [
      { label: "Разработка и R&D", percent: 50 },
      { label: "Оборудование и тесты BCI", percent: 25 },
      { label: "Маркетинг и партнёрства", percent: 15 },
      { label: "Операционные расходы", percent: 10 },
    ],
    costBreakdownTable: [
      { kind: "section", title: "Компоненты на создание одной трассы" },
      { kind: "item", label: "Базовые машинки 1:10", price: 50_000, qty: 8, total: 400_000 },
      { kind: "item", label: "Бортовой управляющий модуль (типа плат ESP)", price: 5_000, qty: 8, total: 40_000 },
      { kind: "section", title: "Электронные компоненты:" },
      {
        kind: "itemGroup",
        labels: [
          "Контроль заряда батареи",
          "RFID на машинках",
          "Питание и преобразование напряжения",
          "Крепление камеры и антивибрация",
          "Вычислительный модуль для видеопотока",
          "Расходники",
        ],
        price: 30_000,
        qty: 8,
        total: 240_000,
      },
      { kind: "item", label: "Камера типа GoPro", price: 30_000, qty: 8, total: 240_000 },
      { kind: "item", label: "Дополнительные сменные аккумуляторы", price: 20_000, qty: 1, total: 20_000 },
      { kind: "item", label: "Зарядная инфраструктура", price: 20_000, qty: 1, total: 20_000 },
      { kind: "item", label: "Сетевое оборудование", price: 300_000, qty: 1, total: 300_000 },
      { kind: "item", label: "Переоборудование машинок", price: 40_000, qty: 8, total: 320_000 },
      { kind: "item", label: "Город с освещением", price: 600_000, qty: 1, total: 600_000 },
      { kind: "subtotal", label: "ИТОГ на одну точку", value: 2_180_000 },
      { kind: "calc", label: "Два Города-Трассы", price: 2_180_000, qty: 2, total: 4_360_000 },
      { kind: "section", title: "Тип Работы" },
      { kind: "item", label: "Создание ПО на WebSocket для управления", price: 300_000, qty: 1, total: 300_000 },
      { kind: "item", label: "UI и сайт", price: 300_000, qty: 1, total: 300_000 },
      { kind: "subtotal", label: "ИТОГ по работам", value: 600_000 },
      { kind: "total", label: "ИТОГ", value: 4_960_000 },
    ] as CostBreakdownRow[],
    roadmap: [
      { quarter: "Q1 2024", title: "Концепт и дизайн", description: "Прототип геймплея и выбор BCI-стека", status: "done" },
      { quarter: "Q2 2024", title: "Прототип симулятора", description: "Интеграция BCI, первый playable build", status: "current" },
      { quarter: "Q3 2024", title: "Закрытая альфа", description: "Тесты с ранними сторонниками", status: "planned" },
      { quarter: "Q4 2024", title: "Публичная демо и пилотные события", description: "Демо на мероприятиях, сбор обратной связи", status: "planned" },
    ],
    teamMembers: [
      { id: "tm1", name: "Денис", role: "CEO", bio: "Стратегия и развитие продукта." },
      { id: "tm2", name: "Кирилл", role: "CTO", bio: "Технологии и архитектура проекта." },
      { id: "tm3", name: "Антон", role: "Product Manager", bio: "Дорожная карта, приоритеты и связь с командой." },
      { id: "tm4", name: "Илья", role: "In progress", bio: "Роль в команде уточняется." },
      { id: "tm5", name: "Эльф", role: "Электронщик", bio: "Роль в команде уточняется." },
      { id: "tm6", name: "Никита", role: "Электронщик", bio: "Роль в команде уточняется." },
    ],
    perks: [
      {
        title: "Ранний доступ",
        description: "Доступ к закрытой альфе и обратная связь в чат сообщества.",
        features: ["Альфа-ключ", "Discord-доступ", "Упоминание в титрах"],
      },
      {
        title: "Пилот-тестер",
        description: "Участие в тестах BCI-режима и приоритетная поддержка.",
        features: ["Всё из уровня «Ранний доступ»", "Участие в тестах BCI", "Эксклюзивный NFT-бейдж"],
        popular: true,
      },
    ],
    risks: `Участие в проекте связано с рисками: разработка BCI-интеграции и иммерсивных симуляторов сопряжена с технической и регуляторной неопределённостью. Сроки выхода версий могут сдвигаться. Мы обязуемся ежемесячно публиковать отчёты о прогрессе и ключевых решениях.`,
  },
}

const STAGE_LABELS: Record<string, string> = {
  idea: "Идея",
  prototype: "Прототип",
  active_funding: "Активный сбор",
  pre_seed: "Pre-seed",
  seed: "Seed",
  series_a: "Series A",
  live: "Запущен",
}

export function getProjectPageDetail(projectId: string): ProjectPageDetail | undefined {
  return DETAILS[projectId]
}

export function getProjectStageLabel(stage: string): string {
  return STAGE_LABELS[stage] ?? stage
}
