import React from "react";

export interface BrandPromptRow {
  id: string;
  prompt: string;
  topic?: string;
  visibility: number;
  sentiment: number;
  position: number;
  mentions?: number;
}

export interface BrandPromptTableProps {
  title?: string;
  rows?: BrandPromptRow[];
  quotaUsed?: number;
  quotaTotal?: number;
  onAddPrompt?: () => void;
  onRowClick?: (row: BrandPromptRow) => void;
  className?: string;
}

const sentimentColor = (score: number) =>
  score >= 70 ? "text-emerald-600 dark:text-emerald-400" : score >= 50 ? "text-amber-600 dark:text-amber-400" : "text-red-600 dark:text-red-400";

/**
 * BrandPromptTable - Peec AI / Profound style AI-brand-visibility prompt
 * table: prompt text, visibility %, sentiment score and rank position, with a
 * quota counter and Add Prompt action in the header.
 */
export default function BrandPromptTable({
  title = "Prompts",
  rows = [],
  quotaUsed,
  quotaTotal,
  onAddPrompt,
  onRowClick,
  className = "",
}: BrandPromptTableProps) {
  return (
    <div data-brand-prompt-table className={`overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 ${className}`}>
      <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{title}</h3>
          {typeof quotaUsed === "number" && typeof quotaTotal === "number" && (
            <span data-brand-quota className="rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
              {quotaUsed} / {quotaTotal} prompts
            </span>
          )}
        </div>
        <button
          type="button"
          data-brand-add
          onClick={onAddPrompt}
          className="rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-indigo-500"
        >
          + Add Prompt
        </button>
      </div>
      {rows.length === 0 ? (
        <p data-brand-empty className="px-4 py-8 text-center text-xs text-zinc-500 dark:text-zinc-400">
          No prompts tracked yet — add your first brand prompt.
        </p>
      ) : (
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-zinc-200 text-[11px] uppercase tracking-wide text-zinc-400 dark:border-zinc-800 dark:text-zinc-500">
              <th className="px-4 py-2 font-semibold">Prompt</th>
              <th className="px-3 py-2 font-semibold">Visibility</th>
              <th className="px-3 py-2 font-semibold">Sentiment</th>
              <th className="px-3 py-2 font-semibold">Position</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.id}
                data-brand-row={row.id}
                onClick={() => onRowClick?.(row)}
                className={`border-b border-zinc-100 transition-colors last:border-0 hover:bg-zinc-50 dark:border-zinc-800/60 dark:hover:bg-zinc-800/40 ${onRowClick ? "cursor-pointer" : ""}`}
              >
                <td className="max-w-xs truncate px-4 py-2.5 font-medium text-zinc-800 dark:text-zinc-100">{row.prompt}</td>
                <td data-brand-visibility className="px-3 py-2.5 text-zinc-600 dark:text-zinc-300">{row.visibility}%</td>
                <td data-brand-sentiment className={`px-3 py-2.5 font-semibold ${sentimentColor(row.sentiment)}`}>{row.sentiment}</td>
                <td data-brand-position className="px-3 py-2.5 text-zinc-600 dark:text-zinc-300">#{row.position}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
