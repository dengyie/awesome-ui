/**
 * ProjectGanttTimeline - Project gantt timeline: month tick header with
 * week sub-ticks and a Today pill, project rows with emoji/status/count
 * badges and horizontal duration bars spanning start..end month positions,
 * current-date marker line and a bottom scrollbar hint
 * (Linear projects timeline pattern).
 */
import React from "react";

export interface GanttMonth {
  label: string;
  weeks: number;
}

export interface GanttProject {
  id: string;
  emoji: string;
  name: string;
  status: string;
  points: number;
  start: number;
  end: number;
  tone?: "sky" | "violet" | "emerald" | "amber";
}

export interface ProjectGanttTimelineProps {
  months?: GanttMonth[];
  projects?: GanttProject[];
  todayMonth?: number;
  todayFraction?: number;
  className?: string;
  onProjectClick?: (project: GanttProject) => void;
}

const TONE_STYLES: Record<string, string> = {
  sky: "bg-sky-200 dark:bg-sky-900/70",
  violet: "bg-violet-200 dark:bg-violet-900/70",
  emerald: "bg-emerald-200 dark:bg-emerald-900/70",
  amber: "bg-amber-200 dark:bg-amber-900/70",
};

const STATUS_STYLES: Record<string, string> = {
  "In Progress": "bg-sky-100 text-sky-700 dark:bg-sky-950/70 dark:text-sky-300",
  Planning: "bg-violet-100 text-violet-700 dark:bg-violet-950/70 dark:text-violet-300",
  Review: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300",
  Done: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300",
};

export default function ProjectGanttTimeline({
  months = [
    { label: "AUG", weeks: 4 },
    { label: "SEP", weeks: 5 },
    { label: "OCT", weeks: 4 },
    { label: "NOV", weeks: 4 },
    { label: "DEC", weeks: 5 },
    { label: "JAN 2026", weeks: 4 },
    { label: "FEB", weeks: 4 },
    { label: "MAR", weeks: 4 },
    { label: "APR", weeks: 4 },
    { label: "MAY", weeks: 5 },
    { label: "JUN", weeks: 4 },
    { label: "JUL", weeks: 4 },
  ],
  projects = [
    { id: "p1", emoji: "🎧", name: "AI UX Research Assistant", status: "Planning", points: 34, start: 8, end: 9.5, tone: "violet" },
    { id: "p2", emoji: "📊", name: "User Insight & Behavior Analytics Dashboard", status: "In Progress", points: 68, start: 8.5, end: 12, tone: "sky" },
    { id: "p3", emoji: "🧩", name: "Design System Expansion", status: "In Progress", points: 65, start: 6, end: 11, tone: "sky" },
    { id: "p4", emoji: "🚀", name: "E-commerce Platform Launch", status: "Review", points: 90, start: 4, end: 9, tone: "emerald" },
  ],
  todayMonth = 8,
  todayFraction = 0.25,
  className = "",
  onProjectClick,
}: ProjectGanttTimelineProps) {
  const totalWeeks = months.reduce((sum, m) => sum + m.weeks, 0);

  // cumulative week offset for each month index
  const offsets: number[] = [];
  let acc = 0;
  for (const m of months) {
    offsets.push(acc);
    acc += m.weeks;
  }

  const todayLeft = ((offsets[todayMonth] ?? 0) + (months[todayMonth]?.weeks ?? 1) * todayFraction) / totalWeeks * 100;

  // month header cells proportional to weeks
  const headerCells = months.map((m, i) => ({ ...m, i, left: offsets[i] / totalWeeks * 100, width: m.weeks / totalWeeks * 100 }));

  return (
    <div data-gantt className={`w-full overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900 ${className}`}>
      {/* month header */}
      <div data-gantt-header className="relative flex border-b border-zinc-100 dark:border-zinc-800">
        {headerCells.map((m) => (
          <div key={m.i} className="shrink-0 border-r border-zinc-100 px-2 py-2 dark:border-zinc-800" style={{ width: `${m.width}%` }}>
            <p className="text-[11px] font-bold tracking-wide text-zinc-500 dark:text-zinc-400">{m.label}</p>
            <div className="mt-1 flex gap-1">
              {Array.from({ length: m.weeks }, (_, w) => (
                <span key={w} className="h-1 flex-1 rounded-full bg-zinc-100 dark:bg-zinc-800"></span>
              ))}
            </div>
          </div>
        ))}
        <span data-gantt-today-pill className="absolute -top-0.5 z-10 rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white" style={{ left: `calc(${todayLeft}% - 24px)` }}>
          Today
        </span>
      </div>

      {/* rows */}
      <div data-gantt-rows className="relative">
        {/* today marker */}
        <div data-gantt-today-line className="pointer-events-none absolute bottom-0 top-0 z-10 w-px bg-red-400/70" style={{ left: `${todayLeft}%` }}></div>
        {projects.map((project) => {
          const left = (offsets[project.start] ?? project.start / totalWeeks * totalWeeks) / totalWeeks * 100;
          const span = (project.end - project.start) / totalWeeks * 100;
          const barCls = TONE_STYLES[project.tone ?? "sky"] ?? TONE_STYLES.sky;
          const statusCls = STATUS_STYLES[project.status] ?? STATUS_STYLES["In Progress"];
          return (
            <button
              key={project.id}
              data-gantt-project={project.id}
              type="button"
              onClick={() => onProjectClick?.(project)}
              className="relative flex w-full items-center gap-3 border-b border-zinc-100 px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800/40"
            >
              <div data-gantt-label className="w-64 shrink-0">
                <p className="flex items-center gap-2 truncate text-sm font-semibold text-zinc-800 dark:text-zinc-100">
                  <span aria-hidden="true">{project.emoji}</span>
                  <span className="truncate">{project.name}</span>
                </p>
                <p className="mt-1 flex items-center gap-2 text-[11px]">
                  <span className={`rounded px-1.5 py-0.5 font-medium ${statusCls}`}>{project.status}</span>
                  <span className="text-zinc-400 dark:text-zinc-500">· {project.points} pts</span>
                </p>
              </div>
              <div data-gantt-bar className="relative h-9 flex-1">
                <div className={`absolute top-1/2 h-6 -translate-y-1/2 rounded-lg ${barCls}`} style={{ left: `${left}%`, width: `${Math.max(span, 2)}%` }}></div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
