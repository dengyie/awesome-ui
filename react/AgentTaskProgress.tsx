import React from "react";

export interface ProgressStep {
  label: string;
  state: "done" | "active" | "pending";
  substeps?: string[];
}

export interface AgentTaskProgressProps {
  title?: string;
  contextLabel?: string;
  contextText?: string;
  hint?: string;
  steps?: ProgressStep[];
  refineLabel?: string;
  nextLabel?: string;
  feedbackLabel?: string;
  onRefine?: () => void;
  onNext?: () => void;
}

/**
 * AgentTaskProgress - long-running AI job card with stacked step states and substep rail.
 */
export default function AgentTaskProgress({
  title,
  contextLabel,
  contextText,
  hint = "This may take a few minutes, you can come back later.",
  steps = [],
  refineLabel = "Refine",
  nextLabel = "Next",
  feedbackLabel = "Send feedback",
  onRefine,
  onNext,
}: AgentTaskProgressProps) {
  const stepIcon = (state: ProgressStep["state"]) => {
    if (state === "done")
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5 shrink-0 text-zinc-900 dark:text-zinc-50">
          <path d="M8 5v14l11-7z" />
        </svg>
      );
    if (state === "active")
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5 shrink-0 animate-spin text-indigo-500">
          <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
      );
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5 shrink-0 text-zinc-400">
        <path d="m9 18 6-6-6-6" />
      </svg>
    );
  };

  return (
    <div data-agent-task-progress className="w-full rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      {title ? <p className="text-sm font-bold text-zinc-900 dark:text-zinc-50">{title}</p> : null}
      {contextText ? (
        <div className="mt-2 rounded-lg bg-zinc-100 px-3 py-2 dark:bg-zinc-800">
          {contextLabel ? <p className="text-[10px] font-medium uppercase tracking-wide text-zinc-400">{contextLabel}</p> : null}
          <p className="text-xs font-medium text-zinc-800 dark:text-zinc-100">{contextText}</p>
        </div>
      ) : null}
      {hint ? <p className="mt-2 text-[11px] text-zinc-500 dark:text-zinc-400">{hint}</p> : null}

      <ul className="mt-3 space-y-2">
        {steps.map((step, index) => (
          <li key={index} data-task-step={index} data-task-state={step.state} className="rounded-lg border border-zinc-200 p-3 dark:border-zinc-700">
            <div className="flex items-center gap-2 text-xs font-semibold text-zinc-800 dark:text-zinc-100">
              {stepIcon(step.state)}
              {step.label}
            </div>
            {step.state === "active" && step.substeps?.length ? (
              <ul className="mt-2 space-y-1 border-l-2 border-zinc-200 pl-3 dark:border-zinc-700" data-task-substeps>
                {step.substeps.map((substep) => (
                  <li key={substep} className="text-[11px] text-zinc-500 dark:text-zinc-400">
                    {substep}
                  </li>
                ))}
              </ul>
            ) : null}
          </li>
        ))}
      </ul>

      <div className="mt-4 flex items-center justify-between border-t border-zinc-200 pt-3 dark:border-zinc-800">
        <a href="#" data-task-feedback className="text-[11px] text-zinc-500 underline underline-offset-2 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200">
          {feedbackLabel}
        </a>
        <div className="flex items-center gap-2">
          <button type="button" data-task-refine onClick={() => onRefine?.()} className="rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-semibold text-zinc-600 transition-colors hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800">
            {refineLabel}
          </button>
          <button type="button" data-task-next onClick={() => onNext?.()} className="rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-white">
            {nextLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
