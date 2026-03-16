import { useCallback, useEffect, useRef, useState } from "react"
import { Link } from "react-router-dom"
import { Menu, Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { RaisedButton } from "@/components/ui/raised-button"
import type { SearchAutocompleteHandle } from "@/components/SearchAutocomplete"
import { SearchAutocomplete } from "@/components/SearchAutocomplete"
import { ThemeSwitcherToggle } from "@/components/theme-switcher-toggle"
import { useThemeSwitch } from "@/hooks/useThemeSwitch"
import { cn } from "@/lib/utils"

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchExpanded, setSearchExpanded] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const menuPanelRef = useRef<HTMLDivElement | null>(null)
  const menuButtonRef = useRef<HTMLButtonElement | null>(null)
  const desktopSearchRef = useRef<SearchAutocompleteHandle | null>(null)
  const mobileSearchRef = useRef<SearchAutocompleteHandle | null>(null)
  const { isLight } = useThemeSwitch()

  const closeMenu = useCallback(() => {
    if (import.meta.env.DEV) console.log("[HEADER] closeMenu called")
    setMobileMenuOpen(false)
  }, [])

  const closeAllSearch = useCallback(() => {
    if (import.meta.env.DEV) console.log("[HEADER] closeAllSearch called")
    desktopSearchRef.current?.close()
    mobileSearchRef.current?.close()
    if (import.meta.env.DEV) console.log("[HEADER] setSearchExpanded(false)")
    setSearchExpanded(false)
  }, [])

  useEffect(() => {
    if (import.meta.env.DEV) console.log("[HEADER] mounted")
    return () => {
      if (import.meta.env.DEV) console.log("[HEADER] unmounted")
    }
  }, [])

  useEffect(() => {
    if (searchExpanded) {
      if (import.meta.env.DEV) console.log("[HEADER] searchExpanded=true → focus mobile input")
      searchInputRef.current?.focus()
    }
  }, [searchExpanded])

  // Закрытие только по overlay и Escape; document pointerdown убран.
  useEffect(() => {
    if (!mobileMenuOpen) return
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeMenu()
    }
    document.addEventListener("keydown", handleKeyDown, true)
    return () => document.removeEventListener("keydown", handleKeyDown, true)
  }, [mobileMenuOpen, closeMenu])

  if (import.meta.env.DEV) {
    console.log("[HEADER] render", { mobileMenuOpen, searchExpanded })
  }

  return (
    <header
      className="fixed bottom-0 left-0 right-0 z-40 w-full border-t border-border bg-white dark:bg-background"
      onPointerDownCapture={(e) => {
        const target = e.target
        if (import.meta.env.DEV) {
          console.log("[HEADER] capture pointerdown", {
            target: target instanceof Element ? target.tagName + (target.getAttribute("data-mobile-menu-button") != null ? "[data-mobile-menu-button]" : "") : target,
            closestTrigger: target instanceof Element && !!target.closest("[data-search-trigger]"),
            closestDropdown: target instanceof Element && !!target.closest("[data-search-dropdown]"),
          })
        }
        if (!(target instanceof Element)) return
        if (target.closest("[data-search-trigger]")) return
        if (target.closest("[data-search-dropdown]")) return
        closeAllSearch()
      }}
    >
      <div className="container relative z-20 mx-auto flex h-16 md:h-20 items-center justify-between gap-2">
        {/* Logo: SVG Logotype_ERA; в светлой теме — синий, в тёмной — светлый */}
        <Link to="/" className="relative z-10 flex shrink-0 items-center gap-2" aria-label="ERA — Evolution of Reality">
          <img
            src="/Logotype_ERA.svg"
            alt="ERA"
            className={cn(
              "h-[3.1rem] w-auto max-w-[4.85rem] object-contain object-left",
              isLight
                ? "[filter:brightness(0)_saturate(100%)_invert(40%)_sepia(0.9)_saturate(2000%)_hue-rotate(217deg)]"
                : "mix-blend-lighten"
            )}
          />
          <span className="hidden text-xs text-muted-foreground sm:inline">Evolution of Reality</span>
        </Link>

        {/* Поиск: панель результатов раскрывается вверх (openUpward) */}
        <div className="absolute left-1/2 top-1/2 z-30 hidden h-full w-full max-w-xl -translate-x-1/2 -translate-y-1/2 items-center justify-center md:flex [padding-inline:30px]">
          <SearchAutocomplete ref={desktopSearchRef} placeholder="Поиск проектов" className="w-full" variant="soft" size="header" openUpward debugName="desktop" />
        </div>

        {/* Mobile/планшет: поиск в шапке (раскрывается по клику), высота как у свитчера (h-9) */}
        <div className="flex min-w-0 flex-1 items-center justify-end gap-1 md:hidden">
          {!searchExpanded ? (
            <>
              {import.meta.env.DEV && console.log("[HEADER] rendering search button (mobile search unmounted)")}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-9 w-9 shrink-0 rounded-full border border-border bg-muted/50 text-muted-foreground hover:bg-muted/80"
                aria-label="Открыть поиск"
                onClick={() => {
                  if (import.meta.env.DEV) console.log("[HEADER] setSearchExpanded(true) (search button click)")
                  setSearchExpanded(true)
                }}
              >
                <Search className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              {import.meta.env.DEV && console.log("[HEADER] rendering mobile search (searchExpanded=true)")}
              <div className="min-w-0 flex-1">
                <SearchAutocomplete
                  ref={mobileSearchRef}
                  placeholder="Поиск проектов"
                  variant="soft"
                  size="header"
                  inputRef={searchInputRef}
                  onCollapseRequest={() => {
                    if (import.meta.env.DEV) console.log("[HEADER] setSearchExpanded(false) (onCollapseRequest)")
                    setSearchExpanded(false)
                  }}
                  className="w-full"
                  openUpward
                  debugName="mobile"
                />
              </div>
            </>
          )}
          <ThemeSwitcherToggle className="shrink-0" />
          <Button
            ref={menuButtonRef}
            data-mobile-menu-button
            type="button"
            variant="ghost"
            size="icon"
            className="h-9 w-9 shrink-0 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            aria-label={mobileMenuOpen ? "Закрыть меню" : "Открыть меню"}
            aria-expanded={mobileMenuOpen}
            aria-haspopup="true"
            aria-controls="mobile-menu-panel"
            onClick={() => {
              if (import.meta.env.DEV) console.log("[HEADER] menu button click", { mobileMenuOpen })
              setMobileMenuOpen((o) => !o)
            }}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Desktop: свитчер темы + кнопки */}
        <div className="relative z-10 hidden items-center gap-2 md:flex">
          <ThemeSwitcherToggle className="shrink-0" />
          <RaisedButton size="sm" color="#3b82f6" className="text-white">
            Войти
          </RaisedButton>
        </div>
      </div>

      {/* Мобильное меню: overlay под шапкой (z-10), панель выше (z-30); клик по overlay или Escape закрывает */}
      {mobileMenuOpen && (
        <>
          <div
            aria-hidden
            onPointerDown={(e) => {
              e.preventDefault()
              closeMenu()
            }}
            className="fixed inset-0 z-[10] bg-transparent md:hidden"
          />
          <div
            id="mobile-menu-panel"
            ref={menuPanelRef}
            data-mobile-menu-panel
            role="menu"
            className="relative z-30 border-t border-border bg-card/95 py-4 md:hidden [padding-inline:30px]"
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
        </>
      )}
    </header>
  )
}
