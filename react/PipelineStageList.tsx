import React from "react";

export interface PipelineStage {
  id: string;
  label: string;
  status: "pending" | "running" | "success" | "failed";
  durationMs?: number;
}

export interface PipelineGroup {
  id: string;
  title: string;
  currentStep?: string;
  stages: PipelineStage[];
}

export interface PipelineStageListProps {
  groups: PipelineGroup[];
  defaultExpanded?: string[];
  showDuration?: boolean;
  collapsible?: boolean;
  onStageClick?: (stage: PipelineStage) => void;
}

const STAGE_STATUS: Record<string, { text: string; tone: string }> = {
  pending: { text: "Pending", tone: "text-zinc-400" },
  running: { text: "Running", tone: "text-sky-600 dark:text-sky-400" },
  success: { text: "Completed", tone: "text-emerald-600 dark:text-emerald-400" },
  failed: { text: "Failed", tone: "text-rose-600 dark:text-rose-400" },
};

const durationLabel = (ms?: number) => {
  if (ms == null) return "";
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(ms % 1000 === 0 ? 0 : 1)}s`;
  return `${Math.floor(ms / 60000)}m ${Math.round((ms % 60000) / 1000)}s`;
};

/**
 * PipelineStageList - grouped CI pipeline accordion with per-stage status, durations and chevron expansion.
 */
export default function PipelineStageList({ groups, defaultExpanded = [], showDuration = true, collapsible = true, onStageClick }: PipelineStageListProps) {
  const [expanded, setExpanded] = React.useState<Set<string>>(() => new Set(defaultExpanded));
  const toggle = (id: string) => {
    if (!collapsible) return;
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div data-pipeline-list className="w-full divide-y divide-zinc-200 rounded-lg border border-zinc-200 bg-white dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-900">
      {groups.map((group) => {
        const open = expanded.has(group.id);
        const running = group.stages.some((stage) => stage.status === "running");
        return (
          <div key={group.id} data-pipeline-group={group.id}>
            <button
              type="button"
              data-pipeline-group-header
              onClick={() => toggle(group.id)}
              className="flex w-full items-center gap-2.5 px-4 py-3 text-left transition-colors hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:hover:bg-zinc-800/60"
            >
              {running ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4 shrink-0 animate-spin text-sky-500"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
              ) : (
                <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-dashed border-zinc-400" />
              )}
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-bold text-zinc-900 dark:text-zinc-50">{group.title}</span>
                {group.currentStep ? <span className="block truncate text-xs text-zinc-500 dark:text-zinc-400">{group.currentStep}</span> : null}
              </span>
              {showDuration ? (
                <span className="shrink-0 font-mono text-xs text-zinc-500 dark:text-zinc-400">
                  {durationLabel(group.stages.reduce((sum, stage) => sum + (stage.durationMs || 0), 0) || undefined)}
                </span>
              ) : null}
              {collapsible ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`h-3.5 w-3.5 shrink-0 text-zinc-400 transition-transform ${open ? "rotate-90" : ""}`}>
                  <path d="m9 18 6-6-6-6" />
                </svg>
              ) : null}
            </button>
            {open ? (
              <div className="mx-3 mb-3 rounded-md bg-zinc-50 px-3 py-1.5 dark:bg-zinc-800/60">
                {group.stages.map((stage) => {
                  const tone = STAGE_STATUS[stage.status] || STAGE_STATUS.pending;
                  return (
                    <button
                      key={stage.id}
                      type="button"
                      data-pipeline-stage={stage.id}
                      data-stage-status={stage.status}
                      onClick={() => onStageClick?.(stage)}
                      className="flex w-full items-center justify-between gap-2 border-b border-zinc-200 py-2 text-left last:border-b-0 focus-visible:outline-none dark:border-zinc-700/60"
                    >
                      <span className="truncate text-xs font-medium text-zinc-800 dark:text-zinc-100">{stage.label}</span>
                      <span className="flex shrink-0 items-center gap-2 font-mono text-[11px]">
                        {showDuration && stage.durationMs != null ? <span className="text-zinc-400">{durationLabel(stage.durationMs)}</span> : null}
                        <span className={tone.tone}>{tone.text}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
