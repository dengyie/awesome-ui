import React from "react";
import { UiIcon, UiIconName } from "./UiIcon";

export interface AgentStep {
  id: string | number;
  title: string;
  description?: string;
  status: "pending" | "running" | "done" | "error";
  duration?: string;
}

export interface AgentStepTimelineProps {
  steps: AgentStep[];
  className?: string;
}

const STATUS_META: Record<AgentStep["status"], { icon: UiIconName; cls: string; pulse?: boolean }> = {
  pending: { icon: "clock", cls: "text-zinc-300 dark:text-zinc-600 bg-zinc-100 dark:bg-zinc-800" },
  running: { icon: "loader", cls: "text-indigo-500 bg-indigo-100 dark:bg-indigo-950/60", pulse: true },
  done: { icon: "check-circle", cls: "text-emerald-500 bg-emerald-100 dark:bg-emerald-950/60" },
  error: { icon: "circle-x", cls: "text-rose-500 bg-rose-100 dark:bg-rose-950/60" },
};

export const AgentStepTimeline: React.FC<AgentStepTimelineProps> = ({ steps = [], className = "" }) => {
  if (steps.length === 0) return null;
  return (
    <ol className={`relative space-y-4 ${className}`}>
      {steps.map((step, i) => {
        const meta = STATUS_META[step.status] || STATUS_META.pending;
        const isLast = i === steps.length - 1;
        return (
          <li key={step.id} className="relative flex gap-3">
            {!isLast && (
              <span
                aria-hidden="true"
                className={`absolute left-[13px] top-7 bottom-[-16px] w-px ${
                  step.status === "done" ? "bg-emerald-300 dark:bg-emerald-800" : "bg-zinc-200 dark:bg-zinc-700"
                }`}
              />
            )}
            <span className={`relative z-10 flex items-center justify-center w-7 h-7 rounded-full shrink-0 ${meta.cls}`}>
              <UiIcon name={meta.icon} size={15} className={meta.pulse ? "animate-spin" : ""} />
            </span>
            <div className="flex-1 min-w-0 pb-1">
              <div className="flex items-center gap-2">
                <span
                  className={`text-sm font-medium ${
                    step.status === "pending" ? "text-zinc-400 dark:text-zinc-500" : "text-zinc-800 dark:text-zinc-200"
                  }`}
                >
                  {step.title}
                </span>
                {step.duration && <span className="text-[10px] font-mono text-zinc-400">{step.duration}</span>}
              </div>
              {step.description && (
                <div className="mt-0.5 text-xs text-zinc-400 dark:text-zinc-500">{step.description}</div>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
};
export default AgentStepTimeline;
