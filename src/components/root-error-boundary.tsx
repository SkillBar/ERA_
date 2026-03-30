import { Component, type ErrorInfo, type ReactNode } from "react"

type Props = { children: ReactNode }

type State = { error: Error | null }

/**
 * Показывает текст ошибки вместо пустого экрана, если рендер падает (например из‑за бага в дереве).
 */
export class RootErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[ERA] UI error:", error, info.componentStack)
  }

  render() {
    if (this.state.error) {
      return (
        <div
          style={{
            minHeight: "100vh",
            padding: 24,
            fontFamily: "system-ui, sans-serif",
            background: "#0a0a0a",
            color: "#f1f5f9",
            boxSizing: "border-box",
          }}
        >
          <h1 style={{ fontSize: "1.25rem", marginBottom: 12 }}>Не удалось отобразить интерфейс</h1>
          <pre
            style={{
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              fontSize: 13,
              opacity: 0.9,
            }}
          >
            {this.state.error.message}
          </pre>
          <p style={{ marginTop: 16, fontSize: 14, opacity: 0.75 }}>
            Обновите страницу. Если ошибка повторяется, откройте консоль браузера (F12) и пришлите текст
            ошибки.
          </p>
        </div>
      )
    }
    return this.props.children
  }
}
