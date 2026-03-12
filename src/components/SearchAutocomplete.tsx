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
  placeholder = "Поиск проектов, создателей и категорий",
  large = false,
  size: sizeProp,
  variant = "default",
  inputRef: inputRefProp,
  onCollapseRequest,
}: SearchAutocompleteProps) {
  const navigate = useNavigate()
  const [query, setQuery] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [highlightIndex, setHighlightIndex] = useState(0)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const internalInputRef = useRef<HTMLInputElement>(null)
  const inputRef = inputRefProp ?? internalInputRef
  const collapseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const size = sizeProp ?? (large ? "large" : "default")

  const projects = useMemo(() => getProjectsWithCreators(), [])
  const hits = getMatchingProjects(query, projects)
  const showPanel = isOpen && (query.length > 0 || hits.length > 0)

  const close = useCallback(() => {
    setIsOpen(false)
    setHighlightIndex(0)
  }, [])

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

  return (
    <div ref={wrapperRef} className={cn("relative w-full min-w-0", isSoft ? undefined : "max-w-xl", className)}>
      <div
        style={{
          borderTopLeftRadius: radiusPx,
          borderTopRightRadius: radiusPx,
          ...(showPanel
            ? { borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }
            : { borderBottomLeftRadius: radiusPx, borderBottomRightRadius: radiusPx }),
        }}
        className={cn(
          "flex items-center text-foreground transition-colors",
          isSoft
            ? "bg-white border border-border/80 dark:bg-card dark:text-foreground focus-within:border-primary/40 dark:focus-within:border-primary/50"
            : "bg-muted/80 dark:bg-card border-border focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20 dark:focus-within:border-primary/50 dark:focus-within:ring-primary/20",
          showPanel && !isSoft && "border-0 border-b-0 ring-2 ring-primary/20 ring-offset-0 dark:ring-indigo-500/20",
          showPanel && isSoft && "border-primary/40 dark:border-primary/50",
          sizeClasses[size]
        )}
      >
        <Search
          className={cn("shrink-0 text-muted-foreground", iconSizeClasses[size])}
        />
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
            setIsOpen(true)
            if (collapseTimeoutRef.current) {
              clearTimeout(collapseTimeoutRef.current)
              collapseTimeoutRef.current = null
            }
          }}
          onBlur={handleInputBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={cn(
            "min-w-0 flex-1 bg-transparent outline-none placeholder:text-muted-foreground",
            inputSizeClasses[size]
          )}
        />
      </div>

      {/* Список: absolute, ровно под поисковиком (top: 100%), не двигает контент; анимация — спуск вниз */}
      <AnimatePresence>
        {showPanel && (
          <motion.ul
            id="search-results"
            role="listbox"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
            className={cn(
              "absolute left-0 right-0 top-full z-50 mt-0 max-h-[min(400px,70vh)] overflow-auto rounded-t-none border border-t-0 border-border bg-card py-1 shadow-xl dark:backdrop-blur-md",
              showPanel && "ring-2 ring-primary/20 ring-offset-0 border-primary/50 dark:border-primary/50",
              size === "large" ? "rounded-b-[28px]" : size === "header" ? "rounded-b-[18px]" : "rounded-b-[22px]"
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
  )
}
