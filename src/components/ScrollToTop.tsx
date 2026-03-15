import { useEffect } from "react"
import { useLocation } from "react-router-dom"

/**
 * При смене маршрута прокручивает окно вверх.
 * Иначе при переходе на страницу проекта (или другую) позиция скролла сохранялась бы.
 */
export function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}
