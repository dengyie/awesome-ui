import React from "react";
import { UiIcon } from "./UiIcon";

export interface GanttTask {
  label: string;
  start: number;
  span: number;
  progress?: number;
  tone?: "indigo" | "emerald" | "amber" | "sky";
  depth?: number;
}

export interface GanttTimelineProps {
  tasks: GanttTask[];
  columns?: number;
  today?: number;
  columnLabel?: string;
  rowLabel?: string;
  emptyText?: string;
  onTaskClick?: (task: GanttTask, index: number) => void;
  className?: string;
}

const TONE_CLASS: Record<string, string> = {
  indigo: "bg-indigo-500",
  emerald: "bg-emerald-500",
  amber: "bg-amber-400",
  sky: "bg-sky-500",
};

export const GanttTimeline: React.FC<GanttTimelineProps> = ({
  tasks,
  columns = 10,
  today,
  columnLabel = "Timeline",
  rowLabel = "Name",
  emptyText = "No tasks scheduled",
  onTaskClick,
  className = "",
}) => {
  const cells = Array.from({ length: columns }, (_, index) => index);

  return (
    <div
      data-gantt-timeline
      role="table"
      aria-label={columnLabel}
      aria-rowcount={tasks.length}
      className={`overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 ${className}`}
    >
      <div
        role="row"
        className="flex items-center border-b border-zinc-100 bg-zinc-50/60 dark:border-zinc-800 dark:bg-zinc-800/40"
      >
        <span
          role="columnheader"
          className="w-44 shrink-0 px-4 py-2 text-[10px] font-semibold uppercase tracking-wide text-zinc-400"
        >
          {rowLabel}
        </span>
        <div className="relative flex min-w-0 flex-1">
          {cells.map((cell) => (
            <span
              key={cell}
              role="columnheader"
              className="min-w-0 flex-1 border-l border-zinc-100 px-1 py-2 text-center text-[10px] font-medium text-zinc-400 dark:border-zinc-800"
            >
              {cell + 1}
            </span>
          ))}
        </div>
      </div>
      {tasks.length === 0 ? (
        <p className="px-4 py-6 text-center text-xs text-zinc-400">{emptyText}</p>
      ) : (
        tasks.map((task, index) => {
          const tone = TONE_CLASS[task.tone || "indigo"];
          const offset = Math.min(Math.max(task.start, 0), columns) / columns;
          const width = Math.min(Math.max(task.span, 0), columns - Math.min(Math.max(task.start, 0), columns)) / columns;
          return (
            <div
              key={`${task.label}-${index}`}
              role="row"
              data-task-index={index}
              onClick={() => onTaskClick?.(task, index)}
              className={`flex items-stretch border-b border-zinc-50 last:border-b-0 dark:border-zinc-800/60 ${
                onTaskClick ? "cursor-pointer transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/40" : ""
              }`}
            >
              <span
                role="cell"
                className="flex w-44 shrink-0 items-center px-4 py-2 text-xs font-medium text-zinc-700 dark:text-zinc-200"
                style={{ paddingLeft: `${1 + (task.depth || 0) * 1.25}rem` }}
              >
                <span className="truncate">{task.label}</span>
              </span>
              <div role="cell" className="relative min-w-0 flex-1 border-l border-zinc-100 dark:border-zinc-800">
                {cells.map((cell) => (
                  <span
                    key={cell}
                    aria-hidden="true"
                    className="absolute inset-y-0 border-l border-zinc-50 dark:border-zinc-800/60"
                    style={{ left: `${(cell / columns) * 100}%` }}
                  />
                ))}
                {today !== undefined ? (
                  <span
                    aria-hidden="true"
                    className="absolute inset-y-0 w-px bg-rose-400"
                    style={{ left: `${(Math.min(Math.max(today, 0), columns) / columns) * 100}%` }}
                  />
                ) : null}
                <div
                  data-task-bar
                  className="absolute top-1/2 flex h-4 -translate-y-1/2 items-center overflow-hidden rounded"
                  style={{
                    left: `${offset * 100}%`,
                    width: `calc(${width * 100}% - 4px)`,
                  }}
                >
                  <div className={`relative h-full ${tone}`}>
                    {task.progress !== undefined ? (
                      <span
                        className="absolute inset-y-0 left-0 bg-white/30"
                        style={{ width: `${Math.min(Math.max(task.progress, 0), 100)}%` }}
                      />
                    ) : null}
                  </div>
                  <span className="absolute inset-0 flex items-center px-1.5 text-[10px] font-medium text-white">
                    {task.progress !== undefined ? `${task.progress}%` : ""}
                  </span>
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default GanttTimeline;
