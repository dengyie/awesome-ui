import React from "react";

export interface DeployCommit {
  sha: string;
  message?: string;
  branch?: string;
  author?: string;
}

export interface DeploymentCardProps {
  deployId: string;
  status: "queued" | "building" | "live" | "failed" | "canceled";
  commit: DeployCommit;
  createdAt: string;
  source?: string;
  url?: string;
  onCancel?: () => void;
  onVisit?: (url: string) => void;
}

const STATUS_TONE: Record<string, { pill: string; dot: string; label: string }> = {
  queued: { pill: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300", dot: "bg-zinc-400", label: "Queued" },
  building: { pill: "bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300", dot: "bg-sky-500 animate-pulse", label: "Building" },
  live: { pill: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300", dot: "bg-emerald-500", label: "Live" },
  failed: { pill: "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300", dot: "bg-rose-500", label: "Failed" },
  canceled: { pill: "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400", dot: "bg-zinc-400", label: "Canceled" },
};

/**
 * DeploymentCard - single deployment record with status pill, commit info and actions.
 */
export default function DeploymentCard({ deployId, status, commit, createdAt, source, url, onCancel, onVisit }: DeploymentCardProps) {
  const tone = STATUS_TONE[status] || STATUS_TONE.queued;
  const terminal = status === "live" || status === "failed" || status === "canceled";
  return (
    <div data-deployment-card className="w-full rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-50">{deployId}</p>
            <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium ${tone.pill}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${tone.dot}`} />
              {tone.label}
            </span>
          </div>
          <p className="mt-1 truncate font-mono text-xs text-zinc-500 dark:text-zinc-400">
            {commit.sha}
            {commit.message ? <span className="text-zinc-700 dark:text-zinc-200"> {commit.message}</span> : null}
          </p>
          <p className="mt-0.5 text-[11px] text-zinc-400 dark:text-zinc-500">
            {[source, createdAt].filter(Boolean).join(" · ")}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {!terminal && onCancel ? (
            <button type="button" data-deploy-cancel onClick={onCancel} className="rounded-lg border border-rose-300 px-3 py-1.5 text-xs font-semibold text-rose-600 transition-colors hover:bg-rose-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 dark:border-rose-500/60 dark:text-rose-400 dark:hover:bg-rose-950/40">
              Cancel deploy
            </button>
          ) : null}
          {terminal && url && onVisit ? (
            <button type="button" data-deploy-visit onClick={() => onVisit(url)} className="rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-white">
              Visit ↗
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
