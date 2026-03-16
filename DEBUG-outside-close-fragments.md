# Фрагменты для отладки outside-close (поиск + мобильное меню)

Ниже — минимальный, но полный код, который реально компилируется: всё, что связано с закрытием по клику снаружи и по Escape.

---

## 1. SearchAutocomplete.tsx — импорты

```ts
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { Search } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"
import { Link, useNavigate } from "react-router-dom"
import { getProjectsWithCreators } from "@/data/database"
import type { ProjectWithCreators } from "@/types/project"
import { useProjectImageUrl } from "@/hooks/useProjectImageUrl"
import { cn } from "@/lib/utils"
```

---

## 2. SearchAutocomplete — пропсы, связанные с закрытием

```ts
export interface SearchAutocompleteProps {
  // ...
  /** Вызвать при blur, когда выпадающий список закрыт — для свёртывания поиска в шапке */
  onCollapseRequest?: () => void
  /** Панель результатов раскрывается вверх (для таб-бара внизу экрана) */
  openUpward?: boolean
}
```

---

## 3. SearchAutocomplete — useState, useRef, производные

```ts
  const [query, setQuery] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const [isExiting, setIsExiting] = useState(false)
  const [highlightIndex, setHighlightIndex] = useState(0)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const internalInputRef = useRef<HTMLInputElement>(null)
  const inputRef = inputRefProp ?? internalInputRef
  const collapseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  // ...
  const showPanel = isOpen && (query.length > 0 || hits.length > 0)
  const panelVisible = showPanel || isExiting
  const [portalRect, setPortalRect] = useState<{ left: number; width: number; bottom: number; maxHeight: number } | null>(null)

  const isPanelOpenRef = useRef(false)
  useEffect(() => {
    isPanelOpenRef.current = openUpward && (showPanel || isExiting)
  }, [openUpward, showPanel, isExiting])

  const closeRef = useRef(close)
  useEffect(() => { closeRef.current = close }, [close])
  const dropdownRef = useRef<HTMLDivElement | null>(null)
```

---

## 4. SearchAutocomplete — close, handleInputBlur, blur-effect

```ts
  const close = useCallback(() => {
    if (collapseTimeoutRef.current) {
      clearTimeout(collapseTimeoutRef.current)
      collapseTimeoutRef.current = null
    }
    if (isPanelOpenRef.current) setIsExiting(true)
    setIsOpen(false)
    setHighlightIndex(0)
    onCollapseRequest?.()
  }, [onCollapseRequest])

  const handleInputBlur = useCallback(() => {
    // Не инициируем close из blur — только document pointerdown/Escape/выбор результата
  }, [])

  useEffect(() => {
    if (!showPanel && !isExiting) inputRef.current?.blur()
  }, [showPanel, isExiting])
```

---

## 5. SearchAutocomplete — document listeners (одна точка закрытия)

```ts
  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (!isPanelOpenRef.current) return
      const target = event.target as Node | null
      if (!target) return
      const wrapperEl = wrapperRef.current
      const dropdownEl = dropdownRef.current
      const path = typeof event.composedPath === "function" ? event.composedPath() : []
      const insideWrapper =
        !!wrapperEl && (wrapperEl.contains(target) || (path as Node[]).includes(wrapperEl))
      const insideDropdown =
        !!dropdownEl && (dropdownEl.contains(target) || (path as Node[]).includes(dropdownEl))
      if (insideWrapper || insideDropdown) return
      closeRef.current?.()
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isPanelOpenRef.current) return
      if (event.key === "Escape") closeRef.current?.()
    }
    const capture = true
    document.addEventListener("pointerdown", handlePointerDown, capture)
    document.addEventListener("keydown", handleKeyDown, capture)
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown, capture)
      document.removeEventListener("keydown", handleKeyDown, capture)
    }
  }, [])
```

---

## 6. SearchAutocomplete — JSX: корень (wrapperRef), input, onFocus/onBlur

```tsx
  return (
    <div
      ref={wrapperRef}
      role="search"
      className={cn("relative w-full min-w-0 cursor-text", ...)}
      onClick={handleWrapperClick}
    >
      {/* ... обводка ... */}
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            setIsFocused(true)
            setIsOpen(true)
            if (collapseTimeoutRef.current) {
              clearTimeout(collapseTimeoutRef.current)
              collapseTimeoutRef.current = null
            }
          }}
          onBlur={() => {
            setIsFocused(false)
            handleInputBlur()
          }}
          onKeyDown={handleKeyDown}
          // ...
        />
```

---

## 7. SearchAutocomplete — портал: backdrop + dropdownRef (motion.div)

```tsx
          {openUpward ? (
            portalRect &&
            createPortal(
              <AnimatePresence onExitComplete={() => setIsExiting(false)}>
                {(showPanel || isExiting) && (
                  <>
                    <div
                      aria-hidden
                      style={{ position: "fixed", inset: 0, zIndex: 99 }}
                      className="bg-transparent"
                    />
                    <motion.div
                      ref={dropdownRef}
                      data-search-dropdown
                      style={{
                        position: "fixed",
                        left: portalRect.left,
                        width: portalRect.width,
                        bottom: portalRect.bottom,
                        maxHeight: portalRect.maxHeight,
                        zIndex: 100,
                        // ...
                      }}
                    >
                      <ul id="search-results" role="listbox">
                        {/* hits */}
                      </ul>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>,
              document.body
            )
          ) : ( /* inline list */ )}
```

Важно: `dropdownRef` висит на **motion.div** (Framer Motion); ref пробрасывается на DOM-узел. `wrapperRef` — на корневом **div**.

---

## 8. Header.tsx — состояние, refs, closeMenu, document listeners

```ts
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchExpanded, setSearchExpanded] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const menuPanelRef = useRef<HTMLDivElement | null>(null)
  const menuButtonRef = useRef<HTMLButtonElement | null>(null)

  const mobileMenuOpenRef = useRef(false)
  useEffect(() => {
    mobileMenuOpenRef.current = mobileMenuOpen
  }, [mobileMenuOpen])

  const closeMenu = useCallback(() => setMobileMenuOpen(false), [])
  const closeMenuRef = useRef(closeMenu)
  useEffect(() => {
    closeMenuRef.current = closeMenu
  }, [closeMenu])

  useEffect(() => {
    if (searchExpanded) searchInputRef.current?.focus()
  }, [searchExpanded])

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (!mobileMenuOpenRef.current) return
      const target = event.target as Node | null
      if (!target) return
      const panelEl = menuPanelRef.current
      const buttonEl = menuButtonRef.current
      const path = typeof event.composedPath === "function" ? event.composedPath() : []
      const insidePanel =
        !!panelEl && (panelEl.contains(target) || (path as Node[]).includes(panelEl))
      const insideButton =
        !!buttonEl && (buttonEl.contains(target) || (path as Node[]).includes(buttonEl))
      if (insidePanel || insideButton) return
      closeMenuRef.current?.()
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!mobileMenuOpenRef.current) return
      if (event.key === "Escape") closeMenuRef.current?.()
    }
    const capture = true
    document.addEventListener("pointerdown", handlePointerDown, capture)
    document.addEventListener("keydown", handleKeyDown, capture)
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown, capture)
      document.removeEventListener("keydown", handleKeyDown, capture)
    }
  }, [])
```

---

## 9. Header.tsx — JSX кнопки-гамбургера (menuButtonRef)

```tsx
          <Button
            ref={menuButtonRef}
            type="button"
            variant="ghost"
            size="icon"
            aria-label={mobileMenuOpen ? "Закрыть меню" : "Открыть меню"}
            aria-expanded={mobileMenuOpen}
            aria-haspopup="true"
            aria-controls="mobile-menu-panel"
            onClick={() => setMobileMenuOpen((o) => !o)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
```

`Button` — из `@/components/ui/button`, с `forwardRef` на `HTMLButtonElement`.

---

## 10. Header.tsx — JSX панели меню (menuPanelRef)

```tsx
      {mobileMenuOpen && (
        <div
          id="mobile-menu-panel"
          ref={menuPanelRef}
          role="menu"
          className="border-t border-border bg-card/95 py-4 md:hidden [padding-inline:30px]"
          aria-label="Мобильное меню"
        >
          <div className="flex flex-col gap-2">
            <RaisedButton
              size="lg"
              color="#3b82f6"
              className="w-full justify-center text-white"
              onClick={closeMenu}
            >
              Войти
            </RaisedButton>
          </div>
        </div>
      )}
```

`menuPanelRef` на нативном **div**. Панель рендерится только при `mobileMenuOpen === true`, т.е. при закрытии ref может быть `null` до следующего открытия.

---

## 11. Родитель: использование поиска и шапки (App + Header)

**App.tsx** — только рендерит `<Header />`, не передаёт поиску/меню никаких пропсов и не хранит их состояние.

**Header.tsx — использование SearchAutocomplete:**

- Десктоп (поиск всегда виден, без внешнего контроля открытия):
  ```tsx
  <SearchAutocomplete placeholder="Поиск проектов" className="w-full" variant="soft" size="header" openUpward />
  ```
  Нет `showPanel`, нет `onCollapseRequest`. Только `openUpward`.

- Мобильный (поиск раскрывается по клику на иконку):
  ```tsx
  {!searchExpanded ? (
    <Button ... onClick={() => setSearchExpanded(true)}>
      <Search ... />
    </Button>
  ) : (
    <div className="min-w-0 flex-1">
      <SearchAutocomplete
        placeholder="Поиск проектов"
        variant="soft"
        size="header"
        inputRef={searchInputRef}
        onCollapseRequest={() => setSearchExpanded(false)}
        className="w-full"
        openUpward
      />
    </div>
  )}
  ```
  Нет пропса `showPanel`. Есть только `onCollapseRequest={() => setSearchExpanded(false)}`. При вызове `onCollapseRequest` шапка просто делает `setSearchExpanded(false)` и скрывает блок с поиском (и сам SearchAutocomplete размонтируется). Эффектов, которые снова открывают поиск после закрытия, в коде нет. При `searchExpanded` есть один эффект: `searchInputRef.current?.focus()`.

Итого по родителю:
- `showPanel` нигде снаружи не передаётся.
- `onCollapseRequest` только в мобильном варианте: `() => setSearchExpanded(false)`.
- Шапка при открытии поиска/меню не меняет layout радикально: блок поиска просто показывается/скрывается, панель меню условно рендерится под таб-баром.

---

## Чек-лист для отладки

- [ ] Есть ли ещё один обработчик (onClick/onPointerDown и т.д.), который открывает панель или оставляет её открытой после close?
- [ ] Может ли какой-то effect после close снова выставить isOpen/showPanel или mobileMenuOpen?
- [ ] Что именно делает onCollapseRequest у родителя (здесь только setSearchExpanded(false))?
- [ ] AnimatePresence/exit: не остаётся ли портал в DOM дольше, чем ожидается, и не даёт ли это путаницу с dropdownRef.current?
- [ ] Button с forwardRef: реально ли ref попадает на нативный button (проверить в devtools)?
- [ ] Есть ли stopPropagation/preventDefault/pointer-events/overlay/z-index, из-за которых pointerdown не доходит или target не тот?
- [ ] В момент outside-клика: не считает ли условие insideWrapper/insideDropdown или insidePanel/insideButton target внутренним (например, из-за портала или вложенности)?

Файлы целиком: `src/components/SearchAutocomplete.tsx`, `src/components/Header.tsx`, `src/App.tsx`.

---

## Дополнительные куски (для точечной правки)

### 1. handleWrapperClick из SearchAutocomplete.tsx

```ts
  const handleWrapperClick = useCallback(() => {
    inputRef.current?.focus()
  }, [])
```

Используется на корневом div: `onClick={handleWrapperClick}`. Любой клик по root фокусирует инпут (и может косвенно влиять на isOpen через onFocus).

---

### 2. handleKeyDown из SearchAutocomplete.tsx

```ts
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showPanel) return
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setHighlightIndex((i) => (i < hits.length - 1 ? i + 1 : 0))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setHighlightIndex((i) => (i > 0 ? i - 1 : hits.length - 1))
    } else if (e.key === "Escape") {
      close()
    } else if (e.key === "Enter" && hits[highlightIndex]) {
      e.preventDefault()
      selectProject(hits[highlightIndex])
    }
  }
```

На input: `onKeyDown={handleKeyDown}`. Escape вызывает close() напрямую (дублирует document keydown).

---

### 3. JSX контейнера поиска в Header.tsx (обёртка вокруг SearchAutocomplete)

Десктоп:

```tsx
        <div className="absolute left-1/2 top-1/2 z-30 hidden h-full w-full max-w-xl -translate-x-1/2 -translate-y-1/2 items-center justify-center md:flex [padding-inline:30px]">
          <SearchAutocomplete placeholder="Поиск проектов" className="w-full" variant="soft" size="header" openUpward />
        </div>
```

Мобильный (раскрытый поиск):

```tsx
            <div className="min-w-0 flex-1">
              <SearchAutocomplete
                placeholder="Поиск проектов"
                variant="soft"
                size="header"
                inputRef={searchInputRef}
                onCollapseRequest={() => setSearchExpanded(false)}
                className="w-full"
                openUpward
              />
            </div>
```

У SearchAutocomplete в пропсах `className="w-full"` — корневой div получает `w-full`, т.е. растягивается на всю доступную ширину контейнера (на мобильном это `min-w-0 flex-1`). Поэтому wrapperRef раньше мог охватывать большую зону.

---

### 4. JSX нижней шапки целиком (таб-бар + меню)

```tsx
    <header className="fixed bottom-0 left-0 right-0 z-40 w-full border-t border-border bg-white dark:bg-background">
      <div className="container relative z-20 mx-auto flex h-16 md:h-20 items-center justify-between gap-2">
        <Link to="/" className="relative z-10 flex shrink-0 ...">...</Link>
        {/* Десктоп: поиск по центру */}
        <div className="absolute left-1/2 top-1/2 z-30 hidden ... md:flex [padding-inline:30px]">
          <SearchAutocomplete ... openUpward />
        </div>
        {/* Мобильный: иконка поиска / раскрытый поиск + тема + кнопка меню */}
        <div className="flex min-w-0 flex-1 items-center justify-end gap-1 md:hidden">
          {!searchExpanded ? (
            <Button ... onClick={() => setSearchExpanded(true)}><Search /></Button>
          ) : (
            <div className="min-w-0 flex-1">
              <SearchAutocomplete ... onCollapseRequest={() => setSearchExpanded(false)} openUpward />
            </div>
          )}
          <ThemeSwitcherToggle className="shrink-0" />
          <Button ref={menuButtonRef} ... onClick={() => setMobileMenuOpen((o) => !o)}>
            {mobileMenuOpen ? <X /> : <Menu />}
          </Button>
        </div>
        <div className="relative z-10 hidden ... md:flex">...</div>
      </div>
      {mobileMenuOpen && (
        <div id="mobile-menu-panel" ref={menuPanelRef} role="menu" className="border-t ...">
          ...
        </div>
      )}
    </header>
```

Кнопка меню — `Button` из `@/components/ui/button` с `forwardRef` на `HTMLButtonElement` (при `asChild={false}` рендерит `<button ref={ref} ...>`).

---

## Правка: triggerRef вместо wrapperRef для поиска

В SearchAutocomplete добавлен **triggerRef** на визуальную область поля (div с градиентной обводкой), а не на корневой div. В document-handler проверяется `insideTrigger` (triggerRef), а не `insideWrapper` (wrapperRef). Так клик по «пустому месту» рядом с полем не считается «внутри» и закрывает список. В DEV добавлены логи `SEARCH outside check` и `MENU outside check` для проверки.
