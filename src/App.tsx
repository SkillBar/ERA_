import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom"
import { Header } from "@/components/Header"
import { ScrollToTop } from "@/components/ScrollToTop"
import { StatusIndicator } from "@/components/ui/status-indicator"
import { Ticker } from "@/components/Ticker"
import { Home } from "@/pages/Home"
import { ProjectPage } from "@/pages/ProjectPage"
import { useEffect, useState } from "react"

function AppContent() {
  const location = useLocation()
  const [isLiveBarHidden, setIsLiveBarHidden] = useState(false)

  useEffect(() => {
    const isProjectPage = location.pathname.startsWith("/project/")
    if (!isProjectPage) {
      setIsLiveBarHidden(false)
      return
    }

    const updateLiveBarVisibility = () => {
      const summarySection = document.getElementById("section-summary")
      if (!summarySection) {
        setIsLiveBarHidden(window.scrollY > 120)
        return
      }
      setIsLiveBarHidden(summarySection.getBoundingClientRect().top <= 36)
    }

    updateLiveBarVisibility()
    window.addEventListener("scroll", updateLiveBarVisibility, { passive: true })
    window.addEventListener("resize", updateLiveBarVisibility)
    return () => {
      window.removeEventListener("scroll", updateLiveBarVisibility)
      window.removeEventListener("resize", updateLiveBarVisibility)
    }
  }, [location.pathname])

  return (
    <>
      <ScrollToTop />
      <div className="min-h-screen bg-background text-foreground">
        {/* Полоска Лайв + бегущая строка — сверху */}
        <div
          className={`fixed top-0 left-0 right-0 z-50 flex items-center border-b border-border/60 bg-muted transition-all duration-300 ${
            isLiveBarHidden ? "pointer-events-none -translate-y-full opacity-0" : "translate-y-0 opacity-100"
          }`}
        >
          <div className="container mx-auto flex h-9 w-full items-center px-4">
            <div className="flex shrink-0 items-center gap-2 border-r border-border/60 pr-4">
              <StatusIndicator state="active" size="sm" />
              <span className="text-sm font-medium text-foreground">Лайв</span>
            </div>
            <div className="min-w-0 flex-1 overflow-hidden">
              <Ticker speed={36} pauseOnHover className="border-t-0">
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
                <span className="italic">«Нужно ускорять технологии, которые помогают защищать мир, а не просто ускорять всё подряд» — Виталик Бутерин</span>
                <span className="text-border">·</span>
              </Ticker>
            </div>
          </div>
        </div>
        <main className="pt-9 pb-28 md:pb-32">
          <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/project/:projectId" element={<ProjectPage />} />
          </Routes>
        </main>
        <Header />
      </div>
    </>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  )
}

export default App
