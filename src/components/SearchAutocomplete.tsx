import { forwardRef, useCallback, useEffect, useImperativeHandle, useLayoutEffect, useMemo, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { Search } from "lucide-react"
import { motion } from "framer-motion"
import { Link, useNavigate } from "react-router-dom"
import { getProjectsWithCreators } from "@/data/database"
import type { ProjectWithCreators } from "@/types/project"
import { useProjectImageUrl } from "@/hooks/useProjectImageUrl"
import { cn } from "@/lib/utils"

export interface SearchAutocompleteProps {
  className?: string
  placeholder?: string
  large?: boolean
  /** Высота: default (h-11), large (h-14), header (h-9, в одну линию со свитчером темы) */
  size?: "default" | "large" | "header"
  /** Мягкий стиль: светлый фон, тонкая обводка (как в Discord Discover) */
  variant?: "default" | "soft"
  /** Ref на input (для фокуса при раскрытии в шапке) */
  inputRef?: React.RefObject<HTMLInputElement | null>
  /** Вызвать при blur, когда выпадающий список закрыт — для свёртывания поиска в шапке */
  onCollapseRequest?: () => void
  /** Панель результатов раскрывается вверх (для таб-бара внизу экрана) */
  openUpward?: boolean
  /** Для диагностики логов: "desktop" | "mobile" */
  debugName?: "desktop" | "mobile"
}

export type SearchAutocompleteHandle = {
  close: () => void
}

function getMatchingProjects(
  query: string,
  projects: ProjectWithCreators[]
): ProjectWithCreators[] {
  if (!query.trim()) return projects.slice(0, 5)
  const q = query.toLowerCase()
  return projects.filter(
    (p) =>
      p.title.toLowerCase().includes(q) ||
      p.creators.some((c) => c.name.toLowerCase().includes(q))
  )
}

function SearchResultItem({
  item,
  index,
  isHighlighted,
  onHighlight,
  onNavigate,
}: {
  item: ProjectWithCreators
  index: number
  isHighlighted: boolean
  onHighlight: () => void
  /** Вызывается при переходе (клик или активация) — сброс поиска и закрытие панели. */
  onNavigate: () => void
}) {
  const imageUrl = useProjectImageUrl(item)
  const percent = Math.round((item.raised / item.goal) * 100)
  return (
    <li
      id={`search-result-${index}`}
      role="option"
      aria-selected={isHighlighted}
    >
      <Link
        to={`/project/${item.id}`}
        onClick={onNavigate}
        onMouseDown={(e) => e.preventDefault()}
        className={cn(
          "flex cursor-pointer items-center gap-3 px-3 py-2 transition-colors no-underline text-inherit",
          isHighlighted ? "bg-accent text-accent-foreground" : "text-foreground hover:bg-muted"
        )}
        onMouseEnter={onHighlight}
      >
        <img
          src={imageUrl}
          alt=""
          className="h-12 w-12 shrink-0 rounded object-cover"
          loading="lazy"
        />
        <div className="min-w-0 flex-1">
          <div className="truncate font-medium text-foreground">{item.title}</div>
          <div className="text-xs text-muted-foreground">
            {item.creators.map((c) => c.name).join(", ")} · {percent}% funded · {item.daysLeft} дн.
          </div>
        </div>
      </Link>
    </li>
  )
}

export const SearchAutocomplete = forwardRef<SearchAutocompleteHandle, SearchAutocompleteProps>(
  function SearchAutocomplete(
    {
      className,
      placeholder = "Поиск проектов",
      large = false,
      size: sizeProp,
      variant = "default",
      inputRef: inputRefProp,
      onCollapseRequest,
      openUpward = false,
      debugName = "desktop",
    },
    ref
  ) {
  const navigate = useNavigate()
  const [query, setQuery] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const [highlightIndex, setHighlightIndex] = useState(0)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const internalInputRef = useRef<HTMLInputElement>(null)
  const inputRef = inputRefProp ?? internalInputRef
  const collapseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const closingRef = useRef(false)
  const size = sizeProp ?? (large ? "large" : "default")

  const projects = useMemo(() => getProjectsWithCreators(), [])
  const hits = getMatchingProjects(query, projects)
  const showPanel = isOpen && (query.length > 0 || hits.length > 0)
  const panelVisible = showPanel
  const panelOpen = !!(openUpward && showPanel)

  const isOpenRef = useRef(isOpen)
  const showPanelRef = useRef(showPanel)
  const panelOpenRef = useRef(panelOpen)
  const queryRef = useRef(query)
  isOpenRef.current = isOpen
  showPanelRef.current = showPanel
  panelOpenRef.current = panelOpen
  queryRef.current = query

  if (import.meta.env.DEV) {
    console.log(`[SEARCH:${debugName}] render`, { query, isOpen, showPanel, panelOpen, openUpward })
  }

  /** Для openUpward: позиция портала над поиском, чтобы список не уходил под верхнюю шапку */
  const TOP_BAR_HEIGHT_PX = 36
  const [portalRect, setPortalRect] = useState<{ left: number; width: number; bottom: number; maxHeight: number } | null>(null)

  useLayoutEffect(() => {
    if (import.meta.env.DEV) {
      console.log(`[SEARCH:${debugName}] useLayoutEffect portalRect`, { openUpward, panelOpen, active: !!(openUpward && panelOpen && wrapperRef.current) })
    }
    const active = openUpward && panelOpen && wrapperRef.current
    if (!active) {
      setPortalRect(null)
      return
    }
    const update = () => {
      if (!wrapperRef.current) return
      const rect = wrapperRef.current.getBoundingClientRect()
      const maxHeight = Math.max(100, rect.top - TOP_BAR_HEIGHT_PX - 8)
      setPortalRect({
        left: rect.left,
        width: rect.width,
        bottom: window.innerHeight - rect.top,
        maxHeight,
      })
    }
    update()
    window.addEventListener("resize", update)
    window.addEventListener("scroll", update, true)
    return () => {
      window.removeEventListener("resize", update)
      window.removeEventListener("scroll", update, true)
    }
  }, [openUpward, panelOpen])

  const closeRef = useRef<(() => void) | null>(null)

  const close = useCallback(() => {
    if (import.meta.env.DEV) {
      console.log(`[SEARCH:${debugName}] close() called`, {
        query: queryRef.current,
        isOpenBefore: isOpenRef.current,
        showPanelBefore: showPanelRef.current,
      })
    }
    closingRef.current = true
    // Снять фокус сразу — иначе после pointerdown браузер может оставить фокус на input и не вызвать blur,
    // или что-то потом вызовет focus() и onFocus снова откроет панель.
    inputRef.current?.blur()
    if (collapseTimeoutRef.current) {
      clearTimeout(collapseTimeoutRef.current)
      collapseTimeoutRef.current = null
    }
    setIsOpen(false)
    setHighlightIndex(0)
    onCollapseRequest?.()
    setTimeout(() => {
      closingRef.current = false
    }, 0)
  }, [onCollapseRequest, debugName])

  closeRef.current = close

  useImperativeHandle(ref, () => ({ close }), [close])

  const dropdownRef = useRef<HTMLDivElement | null>(null)
  /** Только видимая область поля (рамка/инпут), не весь root — иначе клик "снаружи" попадает в wrapper */
  const triggerRef = useRef<HTMLDivElement | null>(null)

  const handleInputBlur = useCallback(() => {
    // Не инициируем close из blur — только document pointerdown/Escape/выбор результата
  }, [])

  useEffect(() => {
    if (!showPanel) inputRef.current?.blur()
  }, [showPanel])

  useEffect(() => {
    if (import.meta.env.DEV) console.log(`[SEARCH:${debugName}] mounted`)
    return () => {
      if (import.meta.env.DEV) console.log(`[SEARCH:${debugName}] unmounted`)
      if (collapseTimeoutRef.current) clearTimeout(collapseTimeoutRef.current)
    }
  }, [debugName])

  /** Сброс поиска и закрытие панели после перехода (клик по Link или Enter). */
  const handleResultNavigate = useCallback(() => {
    setQuery("")
    close()
    if (collapseTimeoutRef.current) {
      clearTimeout(collapseTimeoutRef.current)
      collapseTimeoutRef.current = null
    }
  }, [close])

  /** Выбор по клавише Enter: навигация + сброс UI. */
  const selectProject = useCallback(
    (project: ProjectWithCreators) => {
      navigate(`/project/${project.id}`)
      handleResultNavigate()
    },
    [navigate, handleResultNavigate]
  )

  // Постоянный document listener: не зависеть от effect при panelOpen — читаем panelOpenRef
  useEffect(() => {
    const handlePointerDown = (e: PointerEvent) => {
      if (!panelOpenRef.current) return
      const target = e.target
      const insideTrigger = target instanceof Element && !!target.closest("[data-search-trigger]")
      const insideDropdown = target instanceof Element && !!target.closest("[data-search-dropdown]")
      if (import.meta.env.DEV) {
        console.log(`[SEARCH:${debugName}] document pointerdown`, {
          target: target instanceof Element ? target.tagName + (target.className ? "." + String(target.className).slice(0, 40) : "") : target,
          insideTrigger,
          insideDropdown,
          panelOpen: panelOpenRef.current,
        })
      }
      if (!(target instanceof Element)) return
      if (insideTrigger) return
      if (insideDropdown) return
      if (import.meta.env.DEV) console.log(`[SEARCH:${debugName}] document pointerdown → close()`)
      closeRef.current?.()
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return
      if (!panelOpenRef.current) return
      if (import.meta.env.DEV) console.log(`[SEARCH:${debugName}] document keydown Escape → close()`)
      closeRef.current?.()
    }
    document.addEventListener("pointerdown", handlePointerDown, true)
    document.addEventListener("keydown", handleKeyDown, true)
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown, true)
      document.removeEventListener("keydown", handleKeyDown, true)
    }
  }, [debugName])

  useEffect(() => {
    setHighlightIndex(0)
  }, [query])

  // Только стрелки и Enter; Escape обрабатывается только на document.
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showPanel) return
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setHighlightIndex((i) => (i < hits.length - 1 ? i + 1 : 0))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setHighlightIndex((i) => (i > 0 ? i - 1 : hits.length - 1))
    } else if (e.key === "Enter" && hits[highlightIndex]) {
      e.preventDefault()
      selectProject(hits[highlightIndex])
    }
  }

  const radiusPx = size === "large" ? 28 : size === "header" ? 18 : 22
  const panelAttached = openUpward && panelVisible
  const isSoft = variant === "soft"
  const sizeClasses = {
    header: "h-9 px-2.5 gap-2 min-w-0",
    default: "h-11 px-3.5 gap-2",
    large: "h-14 px-4 gap-3",
  }
  const iconSizeClasses = { header: "h-4 w-4", default: "h-4 w-4", large: "h-5 w-5" }
  const inputSizeClasses = { header: "text-sm", default: "text-sm", large: "text-lg" }

  const handleWrapperClick = useCallback(() => {
    if (closingRef.current) {
      if (import.meta.env.DEV) console.log(`[SEARCH:${debugName}] handleWrapperClick ignored (closingRef=true)`)
      return
    }
    if (import.meta.env.DEV) console.log(`[SEARCH:${debugName}] handleWrapperClick (trigger click) → focus()`)
    inputRef.current?.focus()
  }, [debugName])

  return (
    <div
      ref={wrapperRef}
      role="search"
      className={cn("relative w-full min-w-0", isSoft ? undefined : "max-w-xl", className)}
    >
      {/* Клик только на видимое поле — иначе root (w-full/flex-1) ловит outside-клик и focus снова открывает панель */}
      <div
        ref={triggerRef}
        data-search-trigger
        onClick={handleWrapperClick}
        style={{
          borderTopLeftRadius: panelAttached ? 0 : radiusPx + 1,
          borderTopRightRadius: panelAttached ? 0 : radiusPx + 1,
          borderBottomLeftRadius: radiusPx + 1,
          borderBottomRightRadius: radiusPx + 1,
          background: "linear-gradient(90deg, #3b82f6 0%, #06b6d4 50%, #14b8a6 100%)",
          padding: panelAttached ? "0 1px 1px 1px" : 1,
          boxShadow: panelVisible && !panelAttached
            ? "0 0 16px rgba(59, 130, 246, 0.35), 0 0 28px rgba(6, 182, 212, 0.2)"
            : "none",
          overflow: "hidden",
        }}
        className="cursor-text transition-shadow duration-200"
      >
        <div
        style={{
          borderTopLeftRadius: panelAttached ? 0 : radiusPx,
          borderTopRightRadius: panelAttached ? 0 : radiusPx,
          borderBottomLeftRadius: radiusPx,
          borderBottomRightRadius: radiusPx,
          ...(panelAttached ? { borderTopWidth: 0, boxShadow: "none" } : {}),
        }}
        className={cn(
            "overflow-hidden bg-white dark:bg-card transition-[flex] duration-200 ease-out",
            panelVisible ? "flex flex-col items-stretch gap-0" : "flex items-center text-foreground",
            panelVisible && openUpward && "flex-col-reverse"
          )}
        >
          {/* Строка поиска: shrink-0 и z-10 — фиксирована сверху, список всегда под ней */}
          <div
            className={cn(
              "relative z-10 flex w-full shrink-0 items-center bg-white text-foreground dark:bg-card",
              sizeClasses[size]
            )}
          >
            <Search
              className={cn("shrink-0 text-muted-foreground", iconSizeClasses[size])}
            />
            <div className="relative min-w-0 flex-1 overflow-hidden">
              {!query && (
                <div
                  className={cn(
                    "pointer-events-none absolute inset-0 flex items-center transition-[justify-content] duration-200",
                    isFocused ? "justify-start pl-1" : "justify-center"
                  )}
                  aria-hidden
                >
                  <span
                    className={cn(
                      "block truncate text-muted-foreground whitespace-nowrap",
                      inputSizeClasses[size]
                    )}
                  >
                    {placeholder}
                  </span>
                </div>
              )}
              <input
                ref={inputRef}
                type="search"
                role="combobox"
                aria-expanded={showPanel}
                aria-autocomplete="list"
                aria-controls="search-results"
                aria-activedescendant={
                  showPanel && hits[highlightIndex]
                    ? `search-result-${highlightIndex}`
                    : undefined
                }
                id="search-input"
                value={query}
                onChange={(e) => {
                  if (import.meta.env.DEV) console.log(`[SEARCH:${debugName}] input onChange`, { value: e.target.value })
                  setQuery(e.target.value)
                }}
                onFocus={() => {
                  if (import.meta.env.DEV) console.log(`[SEARCH:${debugName}] input onFocus`, { closingRef: closingRef.current })
                  if (closingRef.current) {
                    if (import.meta.env.DEV) console.log(`[SEARCH:${debugName}] focus ignored because closingRef=true`)
                    return
                  }
                  setIsFocused(true)
                  setIsOpen(true)
                  if (collapseTimeoutRef.current) {
                    clearTimeout(collapseTimeoutRef.current)
                    collapseTimeoutRef.current = null
                  }
                }}
                onBlur={() => {
                  if (import.meta.env.DEV) console.log(`[SEARCH:${debugName}] input onBlur`)
                  setIsFocused(false)
                  handleInputBlur()
                }}
                onKeyDown={handleKeyDown}
                placeholder=""
                className={cn(
                  "relative z-10 w-full bg-transparent outline-none transition-[text-align] duration-200",
                  isFocused ? "text-left" : "text-center",
                  inputSizeClasses[size]
                )}
              />
            </div>
          </div>

          {/* Плавное сворачивание: при openUpward список рендерится в портале над поиском и не уходит под шапку */}
          {openUpward ? (
            portalRect &&
            createPortal(
              panelOpen ? (
                <>
                  <div
                    aria-hidden
                    onPointerDown={(e) => {
                      if (import.meta.env.DEV) console.log(`[SEARCH:${debugName}] overlay pointerdown → close()`)
                      e.preventDefault()
                      e.stopPropagation()
                      closeRef.current?.()
                    }}
                    style={{
                      position: "fixed",
                      inset: 0,
                      zIndex: 50,
                      pointerEvents: "auto",
                    }}
                    className="bg-transparent"
                  />
                  <motion.div
                    ref={dropdownRef}
                    initial={{ opacity: 0 }}
                    animate={{
                      opacity: 1,
                      transition: { duration: 0.2, ease: [0.25, 0.1, 0.25, 1] },
                    }}
                    data-search-dropdown
                    style={{
                      position: "fixed",
                      left: portalRect.left,
                      width: portalRect.width,
                      bottom: portalRect.bottom,
                      maxHeight: portalRect.maxHeight,
                      zIndex: 100,
                      background: "linear-gradient(90deg, #3b82f6 0%, #06b6d4 50%, #14b8a6 100%)",
                      padding: "1px 1px 0 1px",
                      borderTopLeftRadius: radiusPx + 1,
                      borderTopRightRadius: radiusPx + 1,
                      boxShadow: "0 0 16px rgba(59, 130, 246, 0.35), 0 0 28px rgba(6, 182, 212, 0.2)",
                    }}
                    className="overflow-hidden"
                  >
                    <ul
                      id="search-results"
                      role="listbox"
                      style={{
                        borderTopLeftRadius: radiusPx,
                        borderTopRightRadius: radiusPx,
                        borderBottomWidth: 0,
                        boxShadow: "none",
                      }}
                      className="h-full min-h-0 overflow-auto bg-white py-1 dark:bg-card"
                    >
                      {hits.length === 0 ? (
                        <li className="px-4 py-3 text-sm text-muted-foreground">
                          Ничего не найдено
                        </li>
                      ) : (
                        hits.map((item, index) => (
                          <SearchResultItem
                            key={item.id}
                            item={item}
                            index={index}
                            isHighlighted={index === highlightIndex}
                            onHighlight={() => setHighlightIndex(index)}
                            onNavigate={handleResultNavigate}
                          />
                        ))
                      )}
                    </ul>
                  </motion.div>
                </>
              ) : null,
              document.body
            )
          ) : (
            showPanel ? (
                <motion.ul
                  id="search-results"
                  role="listbox"
                  initial={{ opacity: 0 }}
                  animate={{
                    opacity: 1,
                    transition: { duration: 0.2, ease: [0.25, 0.1, 0.25, 1] },
                  }}
                  className={cn(
                    "relative z-0 min-h-0 shrink-0 overflow-auto bg-white py-1 dark:bg-card",
                    "max-h-[min(400px,70vh)]"
                  )}
                >
                  {hits.length === 0 ? (
                    <li className="px-4 py-3 text-sm text-muted-foreground">
                      Ничего не найдено
                    </li>
                  ) : (
                    hits.map((item, index) => (
                      <SearchResultItem
                        key={item.id}
                        item={item}
                        index={index}
                        isHighlighted={index === highlightIndex}
                        onHighlight={() => setHighlightIndex(index)}
                        onNavigate={handleResultNavigate}
                      />
                    ))
                  )}
                </motion.ul>
            ) : null
          )}
        </div>
      </div>
    </div>
  )
})
