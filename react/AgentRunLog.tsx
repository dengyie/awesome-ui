import React, { useState } from "react";
import { UiIcon } from "./UiIcon";

export type AgentRunStatus = "pending" | "running" | "done" | "error";

export interface AgentRunStep {
  id: string;
  label: string;
  status: AgentRunStatus;
  detail?: string;
  durationMs?: number;
}

export interface AgentRunLogProps {
  steps: AgentRunStep[];
  title?: string;
  autoExpandRunning?: boolean;
  className?: string;
}

const statusIcon = (status: AgentRunStatus) => {
  switch (status) {
    case "running":
      return <UiIcon name="loader" size={14} className="animate-spin text-indigo-500" />;
    case "done":
      return <UiIcon name="check-circle" size={14} className="text-emerald-500" />;
    case "error":
      return <UiIcon name="circle-x" size={14} className="text-red-500" />;
    default:
      return <UiIcon name="clock" size={14} className="text-zinc-400 dark:text-zinc-500" />;
  }
};

const formatDuration = (ms?: number) => {
  if (typeof ms !== "number") return "";
  return ms >= 1000 ? `${(ms / 1000).toFixed(1)}s` : `${ms}ms`;
};

export const AgentRunLog: React.FC<AgentRunLogProps> = ({
  steps,
  title = "Execution log",
  autoExpandRunning = true,
  className = "",
}) => {
  const [expanded, setExpanded] = useState<Set<string>>(
    () => new Set(autoExpandRunning ? steps.filter((s) => s.status === "running" && s.detail).map((s) => s.id) : [])
  );

  const toggle = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <div className={`rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 ${className}`}>
      <div className="flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800 px-4 py-2.5">
        <UiIcon name="terminal" size={14} className="text-zinc-400 dark:text-zinc-500" />
        <span className="text-xs font-medium text-zinc-700 dark:text-zinc-200">{title}</span>
        <span className="ml-auto text-[11px] text-zinc-400 dark:text-zinc-500">
          {steps.filter((s) => s.status === "done").length}/{steps.length}
        </span>
      </div>

      <ol className="px-4 py-3">
        {steps.map((step, index) => {
          const isLast = index === steps.length - 1;
          const isOpen = expanded.has(step.id);
          return (
            <li key={step.id} className="relative pl-6">
              {!isLast && (
                <span
                  aria-hidden="true"
                  className="absolute left-[6px] top-5 bottom-0 w-px bg-zinc-200 dark:bg-zinc-700"
                />
              )}
              <span className="absolute left-0 top-1">{statusIcon(step.status)}</span>

              <div className="pb-3">
                <button
                  type="button"
                  onClick={() => step.detail && toggle(step.id)}
                  aria-expanded={step.detail ? isOpen : undefined}
                  className={`flex w-full items-center gap-2 text-left ${
                    step.detail ? "cursor-pointer" : "cursor-default"
                  }`}
                >
                  <span
                    className={`text-xs ${
                      step.status === "pending"
                        ? "text-zinc-400 dark:text-zinc-500"
                        : "text-zinc-700 dark:text-zinc-200"
                    }`}
                  >
                    {step.label}
                  </span>
                  {step.durationMs !== undefined && (
                    <span className="text-[11px] tabular-nums text-zinc-400 dark:text-zinc-500">
                      {formatDuration(step.durationMs)}
                    </span>
                  )}
                  {step.detail && (
                    <span className="ml-auto text-zinc-400 dark:text-zinc-500">
                      <UiIcon name={isOpen ? "chevron-up" : "chevron-down"} size={12} />
                    </span>
                  )}
                </button>

                {step.detail && isOpen && (
                  <pre className="mt-2 max-h-48 overflow-auto rounded-lg bg-zinc-950 px-3 py-2 font-mono text-[11px] leading-relaxed text-zinc-300">
                    {step.detail}
                  </pre>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
};

export default AgentRunLog;
