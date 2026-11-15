import React from "react";

export interface PromptPerformanceRow {
  id: string;
  prompt: string;
  visibility: string;
  sentiment: string;
  position: string;
  mentions: string;
  trend?: "up" | "down" | "flat";
}

export interface PromptPerformanceTableProps {
  title?: string;
  exportLabel?: string;
  rows?: PromptPerformanceRow[];
  className?: string;
  onExport?: () => void;
  onRowClick?: (row: PromptPerformanceRow) => void;
}

const trendIcon = (trend?: "up" | "down" | "flat") => {
  if (trend === "up") return <span aria-hidden="true" className="text-emerald-500">▲</span>;
  if (trend === "down") return <span aria-hidden="true" className="text-red-500">▼</span>;
  return <span aria-hidden="true" className="text-zinc-400">—</span>;
};

/**
 * PromptPerformanceTable - Peec AI prompt tracking table: rows of tracked
 * prompts with Visibility %, Sentiment score, Position # and Mentions
 * columns, plus an Export CTA in the header.
 */
export default function PromptPerformanceTable({
  title = "Prompt performance",
  exportLabel = "Export",
  rows = [],
  className = "",
  onExport,
  onRowClick,
}: PromptPerformanceTableProps) {
  return (
    <div
      data-prompt-performance-table
      className={`w-full overflow-hidden rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 ${className}`}
    >
      <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-3 dark:border-zinc-800">
        <h4 data-prompt-performance-title className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
          {title}
        </h4>
        <button
          type="button"
          data-prompt-performance-export
          onClick={() => onExport?.()}
          className="rounded border border-zinc-200 px-2 py-1 text-[11px] font-medium text-zinc-600 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          {exportLabel}
        </button>
      </div>
      {rows.length === 0 ? (
        <p data-prompt-performance-empty className="px-4 py-6 text-center text-xs text-zinc-400 dark:text-zinc-500">
          No tracked prompts yet.
        </p>
      ) : (
        <table data-prompt-performance-list className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-zinc-100 text-[10px] uppercase tracking-wide text-zinc-400 dark:border-zinc-800 dark:text-zinc-500">
              <th className="px-4 py-2 font-medium">Prompt</th>
              <th className="px-3 py-2 font-medium">Visibility</th>
              <th className="px-3 py-2 font-medium">Sentiment</th>
              <th className="px-3 py-2 font-medium">Position</th>
              <th className="px-4 py-2 text-right font-medium">Mentions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {rows.map((row) => (
              <tr
                key={row.id}
                data-prompt-row={row.id}
                onClick={() => onRowClick?.(row)}
                className="cursor-pointer transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/60"
              >
                <td data-prompt-row-prompt className="max-w-[220px] truncate px-4 py-2.5 font-medium text-zinc-900 dark:text-zinc-50">
                  {row.prompt}
                </td>
                <td data-prompt-row-visibility className="px-3 py-2.5 text-zinc-600 dark:text-zinc-300">
                  {row.visibility}
                </td>
                <td data-prompt-row-sentiment className="px-3 py-2.5 text-zinc-600 dark:text-zinc-300">
                  {row.sentiment} {trendIcon(row.trend)}
                </td>
                <td data-prompt-row-position className="px-3 py-2.5 text-zinc-600 dark:text-zinc-300">
                  {row.position}
                </td>
                <td data-prompt-row-mentions className="px-4 py-2.5 text-right text-zinc-600 dark:text-zinc-300">
                  {row.mentions}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
