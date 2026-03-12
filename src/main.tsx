import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { ThemeProvider } from "next-themes"
import { DARK_THEME, THEME_STORAGE_KEY } from "@/constants/theme"
import App from "./App.tsx"
import "./index.css"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider
      attribute="class"
      defaultTheme={DARK_THEME}
      enableSystem={false}
      storageKey={THEME_STORAGE_KEY}
    >
      <App />
    </ThemeProvider>
  </StrictMode>,
)
