import {
  memo,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type MouseEvent,
  type TransitionEvent,
  type PointerEventHandler,
} from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react"
import {
  Book01Icon,
  HierarchyIcon,
  Megaphone01Icon,
  MoneyBag01Icon,
  Package01Icon,
  StrategyIcon,
} from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

const STORAGE_KEY = "era:project-sidebar-collapsed"
const HOVER_LEAVE_MS = 190

/* ─── Этап A: тайминг «полёта» (короче + чуть упругий ease-out) ─── */
const SIDEBAR_TRANSITION_MS = 130
/** Лёгкий «перелёт»: быстрый разгон, мягкая посадка без сильного overshoot (меньше дёрганья скролла). */
const SIDEBAR_EASE_WIDTH = "cubic-bezier(0.22, 1, 0.32, 1)"
/** Подписи только на GPU-слоях: opacity + transform. */
const SIDEBAR_EASE_LAYER = "cubic-bezier(0.32, 0.72, 0, 1)"
const LABEL_TRANSITION_MS = 115
/** При раскрытии подписи чуть опаздывают за шириной — ощущение глубины. */
const LABEL_DELAY_EXPAND_MS = 28
const RAIL_PX = 52
const EXPANDED_PX = 224

export type ProjectPageNavItem = {
  id: string
  label: string
  children?: { id: string; label: string }[]
}

const NAV_ICONS: Record<string, IconSvgElement> = {
  "section-about": Book01Icon,
  "section-marketing": Megaphone01Icon,
  "section-org": HierarchyIcon,
  "section-products": Package01Icon,
  "section-strategy": StrategyIcon,
  "section-financials": MoneyBag01Icon,
}

function readCollapsedFromStorage(): boolean {
  try {
    if (typeof window === "undefined") return true
    return window.localStorage.getItem(STORAGE_KEY) !== "0"
  } catch {
    return true
  }
}

function writeCollapsedToStorage(collapsed: boolean) {
  try {
    window.localStorage.setItem(STORAGE_KEY, collapsed ? "1" : "0")
  } catch {
    /* private mode */
  }
}

function useFinePointerHover(): boolean {
  const [matches, setMatches] = useState(() =>
    typeof window !== "undefined"
      ? window.matchMedia("(hover: hover) and (pointer: fine)").matches
      : false
  )

  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)")
    const onChange = () => setMatches(mq.matches)
    mq.addEventListener("change", onChange)
    return () => mq.removeEventListener("change", onChange)
  }, [])

  return matches
}

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia("(prefers-reduced-motion: reduce)").matches : false
  )

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    const onChange = () => setReduced(mq.matches)
    mq.addEventListener("change", onChange)
    return () => mq.removeEventListener("change", onChange)
  }, [])

  return reduced
}

export type ProjectPageSidebarProps = {
  items: ProjectPageNavItem[]
  activeSection: string
  onNavigate: (sectionId: string) => void
}

export const ProjectPageSidebar = memo(function ProjectPageSidebar({
  items,
  activeSection,
  onNavigate,
}: ProjectPageSidebarProps) {
  const navId = useId()
  const leaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const canHoverExpand = useFinePointerHover()
  const prefersReducedMotion = usePrefersReducedMotion()

  const [persistedCollapsed, setPersistedCollapsed] = useState(() => readCollapsedFromStorage())
  const [hoverOpen, setHoverOpen] = useState(false)

  /* ─── Этап B: will-change только пока крутится width (меньше постоянной нагрузки на композитор) ─── */
  const [widthAnimating, setWidthAnimating] = useState(false)

  useEffect(() => {
    writeCollapsedToStorage(persistedCollapsed)
  }, [persistedCollapsed])

  useEffect(() => {
    if (!persistedCollapsed) setHoverOpen(false)
  }, [persistedCollapsed])

  useEffect(() => {
    return () => {
      if (leaveTimerRef.current != null) clearTimeout(leaveTimerRef.current)
    }
  }, [])

  const visuallyExpanded = !persistedCollapsed || (persistedCollapsed && hoverOpen && canHoverExpand)

  const transitionMs = prefersReducedMotion ? 0 : SIDEBAR_TRANSITION_MS
  const labelMs = prefersReducedMotion ? 0 : LABEL_TRANSITION_MS

  const onWidthTransitionStart = useCallback((e: TransitionEvent<HTMLElement>) => {
    if (prefersReducedMotion) return
    if (e.propertyName === "width") setWidthAnimating(true)
  }, [prefersReducedMotion])

  const onWidthTransitionEnd = useCallback((e: TransitionEvent<HTMLElement>) => {
    if (e.propertyName === "width") setWidthAnimating(false)
  }, [])

  const clearLeaveTimer = useCallback(() => {
    if (leaveTimerRef.current != null) {
      clearTimeout(leaveTimerRef.current)
      leaveTimerRef.current = null
    }
  }, [])

  const handlePointerEnter = useCallback<PointerEventHandler<HTMLElement>>(() => {
    clearLeaveTimer()
    if (persistedCollapsed && canHoverExpand) setHoverOpen(true)
  }, [canHoverExpand, clearLeaveTimer, persistedCollapsed])

  const handlePointerLeave = useCallback<PointerEventHandler<HTMLElement>>(() => {
    if (!persistedCollapsed || !canHoverExpand) return
    clearLeaveTimer()
    leaveTimerRef.current = setTimeout(() => {
      setHoverOpen(false)
      leaveTimerRef.current = null
    }, HOVER_LEAVE_MS)
  }, [canHoverExpand, clearLeaveTimer, persistedCollapsed])

  const togglePinned = useCallback(() => {
    clearLeaveTimer()
    setHoverOpen(false)
    setPersistedCollapsed((c) => !c)
  }, [clearLeaveTimer])

  const handleNavClick = useCallback(
    (e: MouseEvent<HTMLAnchorElement>, id: string) => {
      e.preventDefault()
      onNavigate(id)
    },
    [onNavigate]
  )

  const asideWidth = visuallyExpanded ? EXPANDED_PX : RAIL_PX

  return (
    <aside
      className={cn(
        "sticky top-3 z-10 shrink-0 self-start overflow-visible [contain:inline-size]",
        widthAnimating && !prefersReducedMotion && "will-change-[width]"
      )}
      style={{
        width: asideWidth,
        transitionProperty: prefersReducedMotion ? "none" : "width",
        transitionDuration: `${transitionMs}ms`,
        transitionTimingFunction: SIDEBAR_EASE_WIDTH,
      }}
      onTransitionStart={onWidthTransitionStart}
      onTransitionEnd={onWidthTransitionEnd}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
    >
      {/* ─── Этап C: отдельный композитный слой карточки (translateZ + изоляция) ─── */}
      <div
        className={cn(
          "flex h-[calc(100vh-7rem)] min-h-0 flex-col overflow-hidden rounded-card border border-border bg-card text-card-foreground shadow-sm",
          "[transform:translate3d(0,0,0)] [backface-visibility:hidden]"
        )}
      >
        <div
          className={cn(
            "flex shrink-0 border-b border-border/60",
            visuallyExpanded ? "justify-end px-1.5 py-1" : "justify-center p-1"
          )}
        >
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0 rounded-md"
            aria-expanded={visuallyExpanded}
            aria-controls={navId}
            aria-label={
              persistedCollapsed
                ? "Закрепить меню разделов открытым"
                : "Свернуть меню (остаются значки; на десктопе можно навести для превью)"
            }
            title={
              persistedCollapsed
                ? "Развернуть и закрепить"
                : "Свернуть (наведите на полоску — временно развернётся)"
            }
            onClick={togglePinned}
          >
            {persistedCollapsed ? (
              <ChevronRight className="size-4" aria-hidden />
            ) : (
              <ChevronLeft className="size-4" aria-hidden />
            )}
          </Button>
        </div>
        <ScrollArea className="min-h-0 flex-1">
          <nav
            id={navId}
            className="flex flex-col gap-0.5 p-2"
            aria-label="Разделы страницы проекта"
          >
            {items.map((item, itemIndex) => {
              const isActive =
                activeSection === item.id || item.children?.some((c) => c.id === activeSection)
              const icon = NAV_ICONS[item.id]
              const stagger = prefersReducedMotion ? 0 : Math.min(itemIndex, 6) * 8

              return (
                <div key={item.id} className="space-y-0.5">
                  <a
                    href={`#${item.id}`}
                    onClick={(e) => handleNavClick(e, item.id)}
                    aria-current={isActive ? "location" : undefined}
                    aria-label={!visuallyExpanded ? item.label : undefined}
                    title={!visuallyExpanded ? item.label : undefined}
                    className={cn(
                      "relative flex min-w-0 items-center overflow-hidden rounded-md py-2 text-sm font-medium",
                      visuallyExpanded ? "gap-2.5 px-3" : "justify-center px-2",
                      isActive
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    )}
                    style={{
                      transitionProperty: prefersReducedMotion ? "background-color, color" : "padding, background-color, color",
                      transitionDuration: `${transitionMs}ms`,
                      transitionTimingFunction: SIDEBAR_EASE_LAYER,
                    }}
                  >
                    {icon != null && (
                      <HugeiconsIcon
                        icon={icon}
                        size={18}
                        color="currentColor"
                        strokeWidth={1.5}
                        className="relative z-[1] shrink-0 opacity-90"
                        aria-hidden
                      />
                    )}
                    <span
                      aria-hidden={!visuallyExpanded}
                      className={cn(
                        "min-w-0 overflow-hidden whitespace-nowrap",
                        visuallyExpanded
                          ? "relative max-w-[min(12.5rem,50vw)] translate-x-0 opacity-100"
                          : "pointer-events-none absolute h-px w-px -translate-x-2 opacity-0"
                      )}
                      style={{
                        transitionProperty: prefersReducedMotion ? "none" : "opacity, transform",
                        transitionDuration: `${labelMs}ms`,
                        transitionTimingFunction: SIDEBAR_EASE_LAYER,
                        transitionDelay: prefersReducedMotion
                          ? "0ms"
                          : visuallyExpanded
                            ? `${LABEL_DELAY_EXPAND_MS + stagger}ms`
                            : `${Math.max(0, stagger / 2)}ms`,
                      }}
                    >
                      {item.label}
                    </span>
                  </a>
                  {visuallyExpanded && item.children && item.children.length > 0 && (
                    <div className="sidebar-subnav-enter relative ml-3 border-l border-border pl-3">
                      {item.children.map((child) => (
                        <a
                          key={child.id}
                          href={`#${child.id}`}
                          onClick={(e) => handleNavClick(e, child.id)}
                          aria-current={activeSection === child.id ? "location" : undefined}
                          className={cn(
                            "flex items-center rounded-md py-1.5 text-xs transition-colors hover:text-foreground md:text-[13px]",
                            activeSection === child.id
                              ? "font-medium text-primary"
                              : "text-muted-foreground"
                          )}
                        >
                          {child.label}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </nav>
        </ScrollArea>
      </div>
    </aside>
  )
}, areSidebarPropsEqual)

function areSidebarPropsEqual(
  prev: ProjectPageSidebarProps,
  next: ProjectPageSidebarProps
): boolean {
  if (prev.activeSection !== next.activeSection) return false
  if (prev.onNavigate !== next.onNavigate) return false
  if (prev.items.length !== next.items.length) return false
  for (let i = 0; i < prev.items.length; i++) {
    const a = prev.items[i]
    const b = next.items[i]
    if (a.id !== b.id || a.label !== b.label) return false
    const ac = a.children?.length ?? 0
    const bc = b.children?.length ?? 0
    if (ac !== bc) return false
    if (a.children && b.children) {
      for (let j = 0; j < ac; j++) {
        if (a.children[j].id !== b.children[j].id || a.children[j].label !== b.children[j].label) {
          return false
        }
      }
    }
  }
  return true
}
