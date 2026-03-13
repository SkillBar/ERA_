import { useEffect, useRef, useState } from "react"
import { Menu, Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { RaisedButton } from "@/components/ui/raised-button"
import { SearchAutocomplete } from "@/components/SearchAutocomplete"
import { StatusIndicator } from "@/components/ui/status-indicator"
import { ThemeSwitcherToggle } from "@/components/theme-switcher-toggle"
import { Ticker } from "@/components/Ticker"
import { useThemeSwitch } from "@/hooks/useThemeSwitch"
import { cn } from "@/lib/utils"

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchExpanded, setSearchExpanded] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const { isLight } = useThemeSwitch()

  useEffect(() => {
    if (searchExpanded) {
      searchInputRef.current?.focus()
    }
  }, [searchExpanded])

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-white dark:bg-background">
      <div className="container relative z-20 mx-auto flex h-20 items-center justify-between gap-2 px-4">
        {/* Logo: SVG Logotype_ERA; в светлой теме — синий, в тёмной — светлый */}
        <a href="/" className="relative z-10 flex shrink-0 items-center gap-2" aria-label="ERA — Evolution of Reality">
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
        </a>

        {/* Поиск по центру шапки (только desktop); pt выравнивает поле по оси Y с логотипом и кнопками (h-20 − h-11) / 2 */}
        <div className="absolute left-1/2 top-0 z-30 hidden h-full w-full max-w-xl -translate-x-1/2 items-start justify-center px-4 pt-[18px] md:flex">
          <SearchAutocomplete placeholder="Поиск проектов" className="w-full" variant="soft" />
        </div>

        {/* Mobile/планшет: поиск в шапке (раскрывается по клику), высота как у свитчера (h-9) */}
        <div className="flex min-w-0 flex-1 items-center justify-end gap-1 md:hidden">
          {!searchExpanded ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-9 w-9 shrink-0 rounded-full border border-border bg-muted/50 text-muted-foreground hover:bg-muted/80"
              aria-label="Открыть поиск"
              onClick={() => setSearchExpanded(true)}
            >
              <Search className="h-4 w-4" />
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
              />
            </div>
          )}
          <ThemeSwitcherToggle className="shrink-0" />
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 shrink-0 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            aria-label={mobileMenuOpen ? "Закрыть меню" : "Открыть меню"}
            onClick={() => setMobileMenuOpen((o) => !o)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Desktop: свитчер темы + кнопки */}
        <div className="relative z-10 hidden items-center gap-2 md:flex">
          <ThemeSwitcherToggle className="shrink-0" />
          <RaisedButton size="default" color="#3b82f6" className="text-white">
            Войти
          </RaisedButton>
        </div>
      </div>

      {/* Под логотипом: та же линия, что и лого — [StatusIndicator] Лайв + бегущая строка */}
      {!mobileMenuOpen && (
        <div className="relative z-0 flex items-center border-t border-border/60 bg-muted/30">
          <div className="container mx-auto flex h-9 w-full items-center px-4">
            <div className="flex shrink-0 items-center gap-2 border-r border-border/60 pr-4">
              <StatusIndicator state="active" size="sm" />
              <span className="text-sm font-medium text-foreground">Лайв</span>
            </div>
            <div className="min-w-0 flex-1 overflow-hidden">
            <Ticker speed={48} pauseOnHover className="border-t-0">
              <span>ERA — проекты новой эры</span>
              <span className="text-border">·</span>
              <span>Технологии</span>
              <span className="text-border">·</span>
              <span>Образование</span>
              <span className="text-border">·</span>
              <span>Нейро</span>
              <span className="text-border">·</span>
              <span>Здоровье</span>
              <span className="text-border">·</span>
            </Ticker>
            </div>
          </div>
        </div>
      )}

      {/* Mobile dropdown menu */}
      {mobileMenuOpen && (
        <div className="border-t border-border bg-card/95 px-4 py-4 md:hidden">
          <div className="flex flex-col gap-2">
            <RaisedButton
              size="lg"
              color="#3b82f6"
              className="w-full justify-center text-white"
              onClick={() => setMobileMenuOpen(false)}
            >
              Войти
            </RaisedButton>
          </div>
        </div>
      )}
    </header>
  )
}
