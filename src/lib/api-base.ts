/**
 * Базовый URL API. В dev Vite проксирует `/api` → `api` (см. vite.config.ts).
 * В проде: задать VITE_API_BASE_URL=https://api.example.com либо оставить пустым для same-origin /api.
 */
export function getApiBaseUrl(): string {
  const raw = import.meta.env.VITE_API_BASE_URL as string | undefined
  if (raw != null && raw.trim() !== "") {
    return raw.replace(/\/$/, "")
  }
  return ""
}

/** Префикс для fetch: '' → относительные пути `/api/v1/...`, иначе абсолютный origin. */
export function apiUrl(path: string): string {
  const base = getApiBaseUrl()
  const p = path.startsWith("/") ? path : `/${path}`
  if (base === "") return `/api${p}`
  return `${base}${p}`
}
