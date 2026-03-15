import { BrowserRouter, Routes, Route } from "react-router-dom"
import { Header } from "@/components/Header"
import { ScrollToTop } from "@/components/ScrollToTop"
import { Home } from "@/pages/Home"
import { ProjectPage } from "@/pages/ProjectPage"

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <div className="min-h-screen bg-background text-foreground">
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/project/:projectId" element={<ProjectPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App
