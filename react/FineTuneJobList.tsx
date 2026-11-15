import React from "react";

export interface FineTuneJob {
  id: string;
  model: string;
  status: "queued" | "training" | "completed" | "failed";
  progress?: number;
  cost?: string;
  eta?: string;
  baseModel?: string;
}

export interface FineTuneJobListProps {
  title?: string;
  jobs: FineTuneJob[];
  newText?: string;
  onNew?: () => void;
  onCancel?: (job: FineTuneJob) => void;
  className?: string;
}

const STATUS_STYLE: Record<string, { chip: string; label: string }> = {
  queued: { chip: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300", label: "Queued" },
  training: { chip: "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300", label: "Training" },
  completed: { chip: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300", label: "Completed" },
  failed: { chip: "bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-300", label: "Failed" },
};

/**
 * FineTuneJobList - OpenAI-style fine-tuning job list: model rows with status
 * chips, progress bars, cost/ETA metadata and per-job cancel for active jobs.
 */
export default function FineTuneJobList({
  title = "Fine-tuning jobs",
  jobs,
  newText = "New fine-tune",
  onNew,
  onCancel,
  className = "",
}: FineTuneJobListProps) {
  return (
    <div data-finetune-list className={`rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 ${className}`}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{title}</p>
        <button
          type="button"
          data-finetune-new
          onClick={() => onNew?.()}
          className="rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-indigo-500"
        >
          {newText}
        </button>
      </div>
      <div className="mt-3 space-y-2">
        {jobs.map((job) => {
          const style = STATUS_STYLE[job.status] || STATUS_STYLE.queued;
          const active = job.status === "queued" || job.status === "training";
          return (
            <div
              key={job.id}
              data-finetune-job={job.id}
              className="rounded-lg border border-zinc-200 px-3 py-2.5 transition-colors hover:border-zinc-300 dark:border-zinc-800 dark:hover:border-zinc-700"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="flex min-w-0 items-center gap-2">
                  <code data-finetune-model className="truncate font-mono text-sm font-semibold text-zinc-900 dark:text-zinc-50">{job.model}</code>
                  {job.baseModel && <span className="truncate text-[11px] text-zinc-400 dark:text-zinc-500">from {job.baseModel}</span>}
                </p>
                <span data-finetune-status={job.status} className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${style.chip}`}>{style.label}</span>
              </div>
              {(job.cost || job.eta) && (
                <p className="mt-1 flex items-center gap-2 text-[11px] text-zinc-500 dark:text-zinc-400">
                  {job.cost && <span data-finetune-cost>{job.cost}</span>}
                  {job.cost && job.eta && <span aria-hidden="true">·</span>}
                  {job.eta && <span data-finetune-eta>ETA {job.eta}</span>}
                </p>
              )}
              {job.status === "training" && (
                <div className="mt-2 flex items-center gap-2">
                  <div data-finetune-progress className="h-1.5 flex-1 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                    <div className="h-full rounded-full bg-indigo-600 transition-all" style={{ width: `${job.progress ?? 0}%` }}></div>
                  </div>
                  <span className="w-8 text-right font-mono text-[10px] text-zinc-500 dark:text-zinc-400">{job.progress ?? 0}%</span>
                </div>
              )}
              {active && (
                <div className="mt-2 flex justify-end">
                  <button
                    type="button"
                    data-finetune-cancel
                    onClick={() => onCancel?.(job)}
                    className="text-[11px] font-semibold text-red-600 hover:underline dark:text-red-400"
                  >
                    Cancel job
                  </button>
                </div>
              )}
            </div>
          );
        })}
        {jobs.length === 0 && (
          <div data-finetune-empty className="rounded-lg border border-dashed border-zinc-300 px-3 py-6 text-center text-xs text-zinc-400 dark:border-zinc-700">
            No fine-tuning jobs yet.
          </div>
        )}
      </div>
    </div>
  );
}
