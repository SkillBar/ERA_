/**
 * Константы темы. Единая точка правды для переключения светлая/тёмная.
 */

export const THEME_STORAGE_KEY = "theme"

export type ThemeId = "light" | "dark"

export const LIGHT_THEME: ThemeId = "light"
export const DARK_THEME: ThemeId = "dark"

export const THEME_IDS: readonly ThemeId[] = [LIGHT_THEME, DARK_THEME] as const

export function isThemeId(value: string): value is ThemeId {
  return value === LIGHT_THEME || value === DARK_THEME
}
