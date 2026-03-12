"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import type { ProjectStatus, ProjectWithCreators } from "@/types/project";

const rowCardBase =
  "rounded-card border bg-card text-card-foreground overflow-hidden p-4";
const rowCardBorder =
  "border-border [transition:border-color_0.2s_ease,box-shadow_0.2s_ease] hover:border-primary/30 hover:shadow-md";

const STATUS_LABELS: Record<ProjectStatus, string> = {
  live: "Уже работает",
  in_progress: "Только делается",
  closed: "Закрыт",
};

/** Градиент справа на карточке (inline, чтобы не вырезался сборкой) */
const STATUS_OVERLAY_GRADIENT: Record<ProjectStatus, string> = {
  live: "linear-gradient(to left, rgba(16,185,129,0.1) 0%, transparent 70%)",
  in_progress: "linear-gradient(to left, rgba(251,191,36,0.1) 0%, transparent 70%)",
  closed: "linear-gradient(to left, rgba(185,28,28,0.1) 0%, transparent 70%)",
};

const STATUS_BADGE_STYLES: Record<ProjectStatus, string> = {
  live: "bg-green-500/10 border-green-500/30 text-green-400",
  in_progress: "bg-yellow-500/10 border-yellow-500/30 text-yellow-400",
  closed: "bg-red-500/10 border-red-500/30 text-red-400",
};

function formatMoney(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return String(value);
}

/** Значок флага страны (пока только РФ) */
function CountryFlag({ country }: { country: string }) {
  if (country === "РФ" || country.toLowerCase() === "россия") {
    return (
      <span className="inline-flex shrink-0 w-6 h-4 rounded overflow-hidden border border-border/30" title="Россия">
        <span className="flex flex-col w-full h-full">
          <span className="flex-1 bg-white" />
          <span className="flex-1 bg-[#0039a6]" />
          <span className="flex-1 bg-[#d52b1e]" />
        </span>
      </span>
    );
  }
  return null;
}

export interface ProjectManagementTableProps {
  title?: string;
  projects: ProjectWithCreators[];
  className?: string;
}

export function ProjectManagementTable({
  title = "Проекты",
  projects,
  className = "",
}: ProjectManagementTableProps) {
  const [selectedProject, setSelectedProject] = useState<ProjectWithCreators | null>(null);

  const getStatusBadge = (status: ProjectStatus) => (
    <div
      className={`px-3 py-1.5 rounded-lg border flex items-center justify-center ${STATUS_BADGE_STYLES[status]}`}
    >
      <span className="text-sm font-medium">{STATUS_LABELS[status]}</span>
    </div>
  );

  const liveCount = projects.filter((p) => p.status === "live").length;
  const closedCount = projects.filter((p) => p.status === "closed").length;

  return (
    <div className={`w-full max-w-7xl mx-auto p-6 ${className}`}>
      <div className="relative border border-border/30 rounded-card p-6 bg-card">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <h1 className="text-xl font-medium text-foreground">{title}</h1>
            </div>
            <div className="text-sm text-muted-foreground">
              {liveCount} в работе • {closedCount} закрыто
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="space-y-2">
          {/* Headers */}
          <div className="grid grid-cols-12 gap-4 px-4 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            <div className="col-span-3">Проект</div>
            <div className="col-span-2">Создатели</div>
            <div className="col-span-2">Страна</div>
            <div className="col-span-1">Собрано</div>
            <div className="col-span-1">Дней</div>
            <div className="col-span-3">Статус</div>
          </div>

          {/* Project Rows — те же токены, что и у ProjectCard: без motion по рядам */}
          {projects.map((project) => {
            const creatorNames = project.creators.map((c) => c.name).join(", ");
            const country = project.country ?? "РФ";
            return (
              <div
                key={project.id}
                role="button"
                tabIndex={0}
                className={`relative cursor-pointer ${rowCardBase} ${rowCardBorder}`}
                onClick={() => setSelectedProject(project)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setSelectedProject(project);
                  }
                }}
              >
                <div
                  className="absolute inset-0 pointer-events-none rounded-card"
                  style={{
                    background: STATUS_OVERLAY_GRADIENT[project.status],
                    backgroundSize: "35% 100%",
                    backgroundPosition: "right",
                    backgroundRepeat: "no-repeat",
                  }}
                />

                <div className="relative grid grid-cols-12 gap-4 items-center">
                  <div className="col-span-3 flex items-center gap-3">
                    <div className="w-12 h-12 shrink-0 rounded-card overflow-hidden border border-border/50 bg-muted/40">
                      <img
                        src={project.iconUrl ?? project.imageUrl}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className="text-card-foreground font-medium line-clamp-2 min-w-0">
                      {project.title}
                    </span>
                  </div>

                  <div className="col-span-2">
                    <span className="text-card-foreground text-sm" title={creatorNames}>
                      {creatorNames || "—"}
                    </span>
                  </div>

                  <div className="col-span-2 flex items-center gap-2">
                    <CountryFlag country={country} />
                    <span className="text-card-foreground">{country}</span>
                  </div>

                  <div className="col-span-1">
                    <span className="text-card-foreground font-mono text-sm">
                      {formatMoney(project.raised)}
                    </span>
                  </div>

                  <div className="col-span-1">
                    <span className="text-card-foreground">{project.daysLeft}</span>
                  </div>

                  <div className="col-span-3">
                    {getStatusBadge(project.status)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Project detail overlay */}
        <AnimatePresence>
          {selectedProject && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 bg-background/60 backdrop-blur-sm flex flex-col rounded-card z-10 overflow-hidden"
            >
              <div className="relative bg-gradient-to-r from-muted/50 to-transparent p-4 border-b border-border/30 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 shrink-0 rounded-card overflow-hidden border border-border/30">
                    <img
                      src={selectedProject.imageUrl}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground">
                      {selectedProject.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedProject.creators.map((c) => c.name).join(", ") || "—"}
                    </p>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {selectedProject.country ?? "РФ"}
                    </p>
                  </div>
                </div>
                <motion.button
                  className="w-8 h-8 bg-background/80 hover:bg-background rounded-full flex items-center justify-center border border-border/50"
                  onClick={() => setSelectedProject(null)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <X className="w-4 h-4" />
                </motion.button>
              </div>

              <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="bg-muted/40 rounded-lg p-3 border border-border/30">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Собрано
                    </label>
                    <div className="text-sm font-mono font-medium mt-1">
                      {formatMoney(selectedProject.raised)} из {formatMoney(selectedProject.goal)}
                    </div>
                  </div>
                  <div className="bg-muted/40 rounded-lg p-3 border border-border/30">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Поддержали
                    </label>
                    <div className="text-sm font-medium mt-1">
                      {selectedProject.backers.toLocaleString()}
                    </div>
                  </div>
                  <div className="bg-muted/40 rounded-lg p-3 border border-border/30">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Статус
                    </label>
                    <div className="mt-1">{getStatusBadge(selectedProject.status)}</div>
                  </div>
                </div>
                <div className="bg-muted/40 rounded-lg p-3 border border-border/30">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">
                    Дней осталось
                  </label>
                  <div className="text-sm font-medium">{selectedProject.daysLeft}</div>
                </div>
                <div className="pt-2">
                  <button
                    type="button"
                    className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity"
                  >
                    Поддержать
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
