import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import {
  DARK_THEME,
  isThemeId,
  LIGHT_THEME,
  type ThemeId,
} from "@/constants/theme"

export interface UseThemeSwitchReturn {
  /** Текущая тема после гидрации */
  theme: ThemeId | undefined
  /** true после монтирования (избегаем mismatch при SSR) */
  mounted: boolean
  /** Сейчас тёмная тема */
  isDark: boolean
  /** Сейчас светлая тема */
  isLight: boolean
  /** Установить тему */
  setTheme: (theme: ThemeId) => void
  /** Переключить светлая ↔ тёмная */
  toggle: () => void
}

/**
 * Единый хук переключения темы. Обёртка над next-themes с типизацией и флагами.
 */
export function useThemeSwitch(): UseThemeSwitchReturn {
  const { setTheme: setNextTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const theme = mounted && resolvedTheme && isThemeId(resolvedTheme) ? resolvedTheme : undefined
  const isDark = theme === DARK_THEME
  const isLight = theme === LIGHT_THEME

  const setTheme = (value: ThemeId) => {
    setNextTheme(value)
  }

  const toggle = () => {
    setNextTheme(theme === DARK_THEME ? LIGHT_THEME : DARK_THEME)
  }

  return {
    theme,
    mounted,
    isDark,
    isLight,
    setTheme,
    toggle,
  }
}
