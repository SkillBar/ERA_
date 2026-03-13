import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Search } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"
import { useNavigate } from "react-router-dom"
import { getProjectsWithCreators } from "@/data/database"
import type { ProjectWithCreators } from "@/types/project"
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

export function SearchAutocomplete({
  className,
  placeholder = "Поиск проектов",
  large = false,
  size: sizeProp,
  variant = "default",
  inputRef: inputRefProp,
  onCollapseRequest,
}: SearchAutocompleteProps) {
  const navigate = useNavigate()
  const [query, setQuery] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const [isExiting, setIsExiting] = useState(false)
  const [highlightIndex, setHighlightIndex] = useState(0)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const internalInputRef = useRef<HTMLInputElement>(null)
  const inputRef = inputRefProp ?? internalInputRef
  const collapseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const size = sizeProp ?? (large ? "large" : "default")

  const projects = useMemo(() => getProjectsWithCreators(), [])
  const hits = getMatchingProjects(query, projects)
  const showPanel = isOpen && (query.length > 0 || hits.length > 0)
  const panelVisible = showPanel || isExiting

  const close = useCallback(() => {
    if (showPanel) setIsExiting(true)
    setIsOpen(false)
    setHighlightIndex(0)
  }, [showPanel])

  const scheduleCollapse = useCallback(() => {
    if (!onCollapseRequest) return
    collapseTimeoutRef.current = window.setTimeout(() => {
      collapseTimeoutRef.current = null
      onCollapseRequest()
    }, 280)
  }, [onCollapseRequest])

  const handleInputBlur = useCallback(() => {
    if (showPanel) return
    scheduleCollapse()
  }, [showPanel, scheduleCollapse])

  useEffect(() => {
    return () => {
      if (collapseTimeoutRef.current) clearTimeout(collapseTimeoutRef.current)
    }
  }, [])

  const selectProject = useCallback(
    (project: ProjectWithCreators) => {
      setQuery(project.title)
      close()
      if (collapseTimeoutRef.current) {
        clearTimeout(collapseTimeoutRef.current)
        collapseTimeoutRef.current = null
      }
      onCollapseRequest?.()
      navigate(`/project/${project.id}`)
    },
    [close, navigate, onCollapseRequest]
  )

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        close()
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [close])

  useEffect(() => {
    setHighlightIndex(0)
  }, [query])

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

  const radiusPx = size === "large" ? 28 : size === "header" ? 18 : 22
  const isSoft = variant === "soft"
  const sizeClasses = {
    header: "h-9 px-2.5 gap-2 min-w-0",
    default: "h-11 px-3.5 gap-2",
    large: "h-14 px-4 gap-3",
  }
  const iconSizeClasses = { header: "h-4 w-4", default: "h-4 w-4", large: "h-5 w-5" }
  const inputSizeClasses = { header: "text-sm", default: "text-sm", large: "text-lg" }

  const handleWrapperClick = useCallback(() => {
    inputRef.current?.focus()
  }, [])

  return (
    <div
      ref={wrapperRef}
      role="search"
      className={cn("relative w-full min-w-0 cursor-text", isSoft ? undefined : "max-w-xl", className)}
      onClick={handleWrapperClick}
    >
      {/* Единая градиентная обводка вокруг поиска и выпадающего списка (без полоски между ними) */}
      <div
        style={{
          borderRadius: radiusPx + 1,
          background: "linear-gradient(90deg, #3b82f6 0%, #06b6d4 50%, #14b8a6 100%)",
          padding: 1,
          boxShadow: panelVisible
            ? "0 0 16px rgba(59, 130, 246, 0.35), 0 0 28px rgba(6, 182, 212, 0.2)"
            : "none",
        }}
        className="transition-shadow duration-200"
      >
        <div
          style={{ borderRadius: radiusPx }}
          className={cn(
            "overflow-hidden bg-white dark:bg-card transition-[flex] duration-200 ease-out",
            panelVisible ? "flex flex-col gap-0" : "flex items-center text-foreground"
          )}
        >
          {/* Строка поиска: лупа всегда на одном месте (слева); без фокуса — текст по центру, с фокусом — влево */}
          <div
            className={cn(
              "flex w-full shrink-0 items-center text-foreground transition-colors",
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
                placeholder=""
                className={cn(
                  "relative z-10 w-full bg-transparent outline-none transition-[text-align] duration-200",
                  isFocused ? "text-left" : "text-center",
                  inputSizeClasses[size]
                )}
              />
            </div>
          </div>

          {/* Плавное сворачивание: layout не меняется до конца exit (isExiting), список только плавно исчезает */}
          <AnimatePresence onExitComplete={() => setIsExiting(false)}>
            {showPanel && (
              <motion.ul
                id="search-results"
                role="listbox"
                initial={{ opacity: 0, y: -4 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.2, ease: [0.25, 0.1, 0.25, 1] },
                }}
                exit={{
                  opacity: 0,
                  transition: { duration: 0.18, ease: [0.4, 0, 1, 1] },
                }}
                className={cn(
                  "overflow-auto bg-white py-1 dark:bg-card",
                  "max-h-[min(400px,70vh)]"
                )}
              >
                {hits.length === 0 ? (
                  <li className="px-4 py-3 text-sm text-muted-foreground">
                    Ничего не найдено
                  </li>
                ) : (
                  hits.map((item, index) => {
                    const percent = Math.round((item.raised / item.goal) * 100)
                    return (
                      <li
                        key={item.id}
                        id={`search-result-${index}`}
                        role="option"
                        aria-selected={index === highlightIndex}
                        className={cn(
                          "flex cursor-pointer items-center gap-3 px-3 py-2 transition-colors",
                          index === highlightIndex
                            ? "bg-accent text-accent-foreground"
                            : "text-foreground hover:bg-muted"
                        )}
                        onMouseEnter={() => setHighlightIndex(index)}
                        onMouseDown={(e) => {
                          e.preventDefault()
                          selectProject(item)
                        }}
                      >
                        <img
                          src={item.imageUrl}
                          alt=""
                          className="h-12 w-12 shrink-0 rounded object-cover"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="truncate font-medium text-foreground">
                            {item.title}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {item.creators.map((c) => c.name).join(", ")} · {percent}%
                            funded · {item.daysLeft} дн.
                          </div>
                        </div>
                      </li>
                    )
                  })
                )}
              </motion.ul>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
