import React from "react";

export type ContentReviewStatus = "valid" | "error";

export interface ContentReviewRow {
  id: string;
  text: string;
  tags?: string[];
  extraTags?: number;
  time?: string;
  status: ContentReviewStatus;
}

export interface ContentReviewTableProps {
  rows: ContentReviewRow[];
  title?: string;
  draftsLabel?: string;
  scheduleLabel?: string;
  className?: string;
  onRowSelect?: (row: ContentReviewRow) => void;
  onSaveDrafts?: () => void;
  onSchedule?: () => void;
}

/**
 * ContentReviewTable - pre-publish content review table (Buffer bulk-upload
 * pattern): numbered rows with validity icons, tag chips, and footer
 * draft/schedule actions.
 */
export default function ContentReviewTable({
  rows,
  title = "Review content",
  draftsLabel = "Save as Drafts",
  scheduleLabel = "Schedule Posts",
  className = "",
  onRowSelect,
  onSaveDrafts,
  onSchedule,
}: ContentReviewTableProps) {
  const errors = rows.filter((r) => r.status === "error").length;
  const valid = rows.length - errors;

  return (
    <div
      data-content-review
      className={`w-full overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 ${className}`}
    >
      <div className="flex flex-col items-center gap-1 border-b border-zinc-100 px-4 py-3 dark:border-zinc-800">
        <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">{title}</span>
        <span className="flex items-center gap-3 text-[11px] text-zinc-500 dark:text-zinc-400">
          <span data-review-valid-count className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
            ✓ {valid} valid
          </span>
          <span data-review-error-count className="flex items-center gap-1 text-red-500 dark:text-red-400">
            ⚠ {errors} {errors === 1 ? "error" : "errors"}
          </span>
        </span>
      </div>

      <table data-review-table className="w-full text-left">
        <thead>
          <tr className="border-b border-zinc-100 text-[10px] uppercase tracking-wider text-zinc-400 dark:border-zinc-800 dark:text-zinc-500">
            <th className="w-10 py-2 pl-4 font-medium">#</th>
            <th className="py-2 pr-3 font-medium">Text</th>
            <th className="py-2 pr-3 font-medium">Tags</th>
            <th className="py-2 pr-3 font-medium">Posting time</th>
            <th className="py-2 pr-4 font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr
              key={row.id}
              data-review-row={row.id}
              onClick={() => onRowSelect?.(row)}
              className={`border-b border-zinc-50 text-xs transition-colors dark:border-zinc-800/60 ${
                onRowSelect ? "cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/60" : ""
              }`}
            >
              <td className="py-2.5 pl-4 tabular-nums text-zinc-400 dark:text-zinc-500">{index + 1}</td>
              <td data-review-text className="max-w-48 truncate py-2.5 pr-3 text-zinc-800 dark:text-zinc-100">
                {row.text}
              </td>
              <td className="py-2.5 pr-3">
                <span className="flex items-center gap-1">
                  {(row.tags ?? []).slice(0, 1).map((tag) => (
                    <span
                      key={tag}
                      data-review-tag
                      className="inline rounded bg-sky-100 px-1.5 py-0.5 text-[10px] font-medium text-sky-700 dark:bg-sky-950/60 dark:text-sky-300"
                    >
                      {tag}
                    </span>
                  ))}
                  {typeof row.extraTags === "number" && row.extraTags > 0 && (
                    <span data-review-extra-tags className="text-[10px] text-zinc-400 dark:text-zinc-500">
                      +{row.extraTags}
                    </span>
                  )}
                </span>
              </td>
              <td className="py-2.5 pr-3 text-zinc-500 dark:text-zinc-400">{row.time ?? "Add to Queue"}</td>
              <td className="py-2.5 pr-4">
                <span aria-label={row.status}>
                  {row.status === "valid" ? (
                    <span data-review-status className="text-emerald-500">✓</span>
                  ) : (
                    <span data-review-status className="text-red-500">⚠</span>
                  )}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex items-center justify-end gap-2 border-t border-zinc-100 px-4 py-3 dark:border-zinc-800">
        <button
          type="button"
          data-review-drafts
          onClick={() => onSaveDrafts?.()}
          className="rounded-md border border-zinc-300 px-3 py-1.5 text-xs font-semibold text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-800"
        >
          {draftsLabel}
        </button>
        <button
          type="button"
          data-review-schedule
          onClick={() => onSchedule?.()}
          className="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-emerald-500"
        >
          {scheduleLabel}
        </button>
      </div>
    </div>
  );
}
