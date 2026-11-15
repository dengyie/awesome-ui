/**
 * FalRunCard - fal generate-run info card: task type badge, model count and
 * relative time header, prompt paragraph, aspect ratio / total cost metadata
 * rows and a bottom action icon row (duplicate / rerun / delete / share).
 */
import React from "react";

export interface FalRunCardProps {
  type?: string;
  models?: number;
  time?: string;
  prompt?: string;
  aspect?: string;
  cost?: string;
  costTone?: "green" | "zinc";
  className?: string;
  onDuplicate?: () => void;
  onRerun?: () => void;
  onDelete?: () => void;
}

export default function FalRunCard({
  type = "Text To Image",
  models = 4,
  time = "22 minutes ago",
  prompt = "a calm, morning, beach scenery",
  aspect = "1:1",
  cost = "$0.241",
  costTone = "green",
  className = "",
  onDuplicate,
  onRerun,
  onDelete,
}: FalRunCardProps) {
  const costClass = costTone === "green" ? "text-emerald-500" : "text-zinc-600 dark:text-zinc-300";
  return (
    <div data-fal-run-card className={`w-full rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 ${className}`}>
      <div className="flex items-center justify-between gap-2">
        <span data-fal-run-type className="inline-flex items-center gap-1.5 rounded-md border border-purple-200 bg-purple-50 px-2 py-1 text-[11px] font-medium text-purple-600 dark:border-purple-800 dark:bg-purple-950/40 dark:text-purple-300">
          <span aria-hidden="true">⌨</span>
          {type}
          <span aria-hidden="true" className="text-purple-300 dark:text-purple-700">▸</span>
        </span>
        <button type="button" data-fal-run-bookmark aria-label="Bookmark run" className="text-zinc-400 transition-colors hover:text-zinc-600 dark:hover:text-zinc-200">
          ⚑
        </button>
      </div>
      <p data-fal-run-meta className="mt-2 text-[11px] text-zinc-500 dark:text-zinc-400">
        <span data-fal-run-models>{models} models</span>
        <span className="mx-1.5">·</span>
        <span data-fal-run-time>{time}</span>
      </p>
      <div className="mt-3">
        <p className="text-[11px] font-medium text-zinc-400 dark:text-zinc-500">Prompt</p>
        <p data-fal-run-prompt className="mt-1 text-sm leading-relaxed text-zinc-800 dark:text-zinc-200">{prompt}</p>
      </div>
      <div data-fal-run-rows className="mt-3 space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-zinc-500 dark:text-zinc-400">Aspect Ratio:</span>
          <span data-fal-run-aspect className="rounded border border-zinc-200 px-1.5 py-0.5 font-mono text-[10px] text-zinc-600 dark:border-zinc-700 dark:text-zinc-300">{aspect}</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-zinc-500 dark:text-zinc-400">Total Cost:</span>
          <span data-fal-run-cost className={`font-mono text-[11px] font-medium ${costClass}`}>{cost}</span>
        </div>
      </div>
      <div data-fal-run-actions className="mt-4 flex items-center justify-between border-t border-zinc-100 pt-3 dark:border-zinc-800">
        <div className="flex items-center gap-1">
          <button type="button" data-fal-run-duplicate aria-label="Duplicate run" onClick={() => onDuplicate?.()} className="flex h-8 w-8 items-center justify-center rounded-md text-sm text-zinc-400 transition-colors hover:bg-zinc-50 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-200">⧉</button>
          <button type="button" data-fal-run-rerun aria-label="Rerun run" onClick={() => onRerun?.()} className="flex h-8 w-8 items-center justify-center rounded-md text-sm text-zinc-400 transition-colors hover:bg-zinc-50 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-200">↻</button>
          <button type="button" data-fal-run-delete aria-label="Delete run" onClick={() => onDelete?.()} className="flex h-8 w-8 items-center justify-center rounded-md text-sm text-zinc-400 transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/40">🗑</button>
        </div>
        <button type="button" data-fal-run-share aria-label="Share run" className="flex h-8 w-8 items-center justify-center rounded-md text-sm text-zinc-400 transition-colors hover:bg-zinc-50 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-200">⇗</button>
      </div>
    </div>
  );
}
