# ERA — Evolution of Reality

Платформа: журнал и краудфандинг проектов новой эры с Web3-элементами.

## Стек

- **React 19** + **TypeScript** + **Vite**
- **Tailwind CSS** + **shadcn/ui** (Card, Button, Input, Progress, Dialog)
- **Framer Motion** — анимации появления карточек
- Поиск: mock autocomplete (готов к замене на Algolia)

## Тема

- Фон: `#0f172a`, карточки: `#1e293b`, текст: `#f1f5f9`
- Акценты: градиент синий → индиго (`#60a5fa` → `#a5b4fc`)
- Dark mode через Tailwind: класс `dark` на `<html>`

## Установка и запуск

```bash
# Установить зависимости
npm install

# Запуск в режиме разработки
npm run dev

# Сборка
npm run build

# Превью продакшн-сборки
npm run preview
```

## Деплой на Vercel

Проект настроен для деплоя на Vercel (в т.ч. как приложение в монорепе).

1. **Через веб-интерфейс**
   - Зайди на [vercel.com](https://vercel.com), войди (GitHub/GitLab/Bitbucket).
   - **Add New** → **Project**, импортируй репозиторий.
   - Если это монорепо и сайт лежит в подпапке (например `site/`), в настройках проекта укажи **Root Directory**: `site`.
   - **Framework Preset**: Vite (подставится автоматически по `vercel.json`).
   - Нажми **Deploy**.

2. **Через Vercel CLI**
   ```bash
   npm i -g vercel
   cd /path/to/ERA/site   # корень этого приложения
   vercel
   ```
   Следуй подсказкам; при монорепе можно указать root при первом деплое.

В корне приложения уже есть `vercel.json`: заданы `buildCommand`, `outputDirectory: dist` и `rewrites` для SPA (React Router), чтобы маршруты не отдавали 404.

## Добавление компонентов shadcn/ui

Если нужно добавить ещё компоненты (уже установлены: card, button, input, progress, dialog):

```bash
npx shadcn@latest add <component-name>
```

Примеры: `npx shadcn@latest add dropdown-menu`, `npx shadcn@latest add sheet`.

## Структура

- `src/components/Header.tsx` — шапка с логотипом, поиском и кнопками (мобильное гамбургер-меню)
- `src/components/SearchAutocomplete.tsx` — поисковая строка с выпадающим списком (mock, готов к Algolia)
- `src/components/ProjectCard.tsx` — карточка проекта (progress, метрики, создатели, кнопка «Поддержать»)
- `src/pages/Home.tsx` — главная: hero + поиск + сетка проектов (данные из «БД»)
- `src/types/project.ts` — типы `Creator`, `Project` (с `creatorIds`), `ProjectWithCreators`
- `src/data/creators.ts` — таблица создателей (1 или несколько на проект)
- `src/data/projects.ts` — таблица проектов (Pilot, Portal, Nexus, Radar, Level Up, Музыкальные парки России, Орнитолог, Тесты на executive functions)
- `src/data/database.ts` — слой доступа: `getProjectsWithCreators()`, `getCreators()`, позже заменить на API

## Дальнейшая интеграция

- **Algolia**: заменить логику в `SearchAutocomplete` на `@algolia/autocomplete-js` или `react-instantsearch` с реальным индексом.
- **Wagmi / Web3**: подключить кошелёк и кнопку «Поддержать» (модальное окно через `Dialog` уже подготовлено в UI).
