import React, { useState } from "react";

export type FallbackHealth = "healthy" | "degraded" | "down";

export interface FallbackEntry {
  id: string;
  model: string;
  /** provider label, e.g. "Anthropic" */
  provider?: string;
  health?: FallbackHealth;
  /** when this fallback takes over, e.g. "on rate limit" or "on error 5xx" */
  condition?: string;
  latency?: string;
}

export interface AgentModelFallbackListProps {
  title?: string;
  description?: string;
  entries?: FallbackEntry[];
  /** id of the currently primary entry */
  primaryId?: string;
  onReorder?: (ids: string[]) => void;
  className?: string;
}

const HEALTH_DOT: Record<FallbackHealth, string> = {
  healthy: "bg-emerald-500",
  degraded: "bg-amber-500",
  down: "bg-rose-500",
};

const HEALTH_TEXT: Record<FallbackHealth, string> = {
  healthy: "Healthy",
  degraded: "Degraded",
  down: "Down",
};

export default function AgentModelFallbackList({
  title = "Model fallback chain",
  description = "Requests try the primary model first, then walk down the chain when a fallback condition triggers.",
  entries = [],
  primaryId,
  onReorder,
  className = "",
}: AgentModelFallbackListProps) {
  const [ids, setIds] = useState<string[]>(entries.map((e) => e.id));
  const [moveFlash, setMoveFlash] = useState<string | null>(null);

  const ordered = ids
    .map((id) => entries.find((e) => e.id === id))
    .filter((e): e is FallbackEntry => Boolean(e));
  const activePrimary = primaryId ?? ordered[0]?.id;

  const move = (id: string, dir: -1 | 1) => {
    const idx = ids.indexOf(id);
    const next = idx + dir;
    if (idx < 0 || next < 0 || next >= ids.length) return;
    const list = [...ids];
    list.splice(idx, 1);
    list.splice(next, 0, id);
    setIds(list);
    setMoveFlash(id);
    window.setTimeout(() => setMoveFlash(null), 1200);
    onReorder?.(list);
  };

  return (
    <div data-fallback-list className={`rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 ${className}`}>
      <p data-fallback-title className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{title}</p>
      <p data-fallback-description className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{description}</p>

      <div data-fallback-rows className="mt-3 space-y-2">
        {ordered.map((entry, i) => {
          const isPrimary = entry.id === activePrimary;
          const health = entry.health ?? "healthy";
          return (
            <div
              key={entry.id}
              data-fallback-row={entry.id}
              className={`flex items-center gap-2.5 rounded-lg border px-3 py-2 ${
                isPrimary
                  ? "border-indigo-200 bg-indigo-50/60 dark:border-indigo-500/30 dark:bg-indigo-500/10"
                  : "border-zinc-200 dark:border-zinc-700"
              }`}
            >
              <span data-fallback-rank className="w-4 text-center font-mono text-[11px] text-zinc-400 dark:text-zinc-500">
                {i + 1}
              </span>
              <span className={`h-2 w-2 shrink-0 rounded-full ${HEALTH_DOT[health]}`} title={HEALTH_TEXT[health]} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span data-fallback-model className="truncate text-xs font-semibold text-zinc-800 dark:text-zinc-100">{entry.model}</span>
                  {isPrimary ? (
                    <span data-fallback-primary className="rounded-full bg-indigo-600 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-white">
                      Primary
                    </span>
                  ) : null}
                  {moveFlash === entry.id ? (
                    <span data-fallback-moved className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400">order updated</span>
                  ) : null}
                </div>
                <p className="mt-0.5 truncate text-[11px] text-zinc-500 dark:text-zinc-400">
                  {entry.provider ? `${entry.provider} · ` : ""}
                  {entry.condition ?? "fallback"}
                  {entry.latency ? ` · ${entry.latency}` : ""}
                </p>
              </div>
              <div className="flex shrink-0 flex-col gap-0.5">
                <button
                  type="button"
                  data-fallback-up
                  title="Promote"
                  aria-label={`Promote ${entry.model}`}
                  disabled={i === 0}
                  onClick={() => move(entry.id, -1)}
                  className="rounded border border-zinc-200 px-1.5 text-[10px] leading-4 text-zinc-500 disabled:opacity-30 hover:border-zinc-300 hover:text-zinc-700 dark:border-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
                >
                  ↑
                </button>
                <button
                  type="button"
                  data-fallback-down
                  title="Demote"
                  aria-label={`Demote ${entry.model}`}
                  disabled={i === ordered.length - 1}
                  onClick={() => move(entry.id, 1)}
                  className="rounded border border-zinc-200 px-1.5 text-[10px] leading-4 text-zinc-500 disabled:opacity-30 hover:border-zinc-300 hover:text-zinc-700 dark:border-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
                >
                  ↓
                </button>
              </div>
            </div>
          );
        })}
        {ordered.length === 0 ? (
          <p data-fallback-empty className="rounded-lg border border-dashed border-zinc-200 px-3 py-4 text-center text-xs text-zinc-400 dark:border-zinc-700 dark:text-zinc-500">
            No models in the fallback chain
          </p>
        ) : null}
      </div>
    </div>
  );
}
