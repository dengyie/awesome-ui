/**
 * IterationActionBar - Generation iteration action bar: Show More / Brainstorm
 * / Reply pills, an overflow slot and prev/next page arrows (Luma).
 */
import React from "react";

export interface IterationActionBarProps {
  page?: number;
  totalPages?: number;
  className?: string;
  onAction?: (action: string) => void;
  onPageChange?: (page: number) => void;
}

export default function IterationActionBar({
  page = 1,
  totalPages = 4,
  className = "",
  onAction,
  onPageChange,
}: IterationActionBarProps) {
  const pill =
    "rounded-full px-3 py-1.5 text-xs font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500";
  return (
    <div data-iteration-action-bar className={`flex flex-wrap items-center gap-2 ${className}`}>
      <button
        type="button"
        data-iteration-action="show-more"
        onClick={() => onAction?.("show-more")}
        className={`${pill} border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800`}
      >
        ↻ Show More
      </button>
      <button
        type="button"
        data-iteration-action="brainstorm"
        onClick={() => onAction?.("brainstorm")}
        className={`${pill} border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800`}
      >
        ✦ Brainstorm
      </button>
      <button
        type="button"
        data-iteration-action="reply"
        onClick={() => onAction?.("reply")}
        className={`${pill} border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800`}
      >
        ❝ Reply
      </button>
      <button
        type="button"
        data-iteration-action="more"
        aria-label="More actions"
        onClick={() => onAction?.("more")}
        className={`${pill} border border-zinc-200 bg-white px-2 text-zinc-500 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800`}
      >
        ···
      </button>
      <span data-iteration-pager className="ml-1 inline-flex items-center gap-1">
        <button
          type="button"
          data-iteration-prev
          aria-label="Previous page"
          disabled={page <= 1}
          onClick={() => onPageChange?.(page - 1)}
          className="rounded-full border border-zinc-200 bg-white px-2.5 py-1.5 text-xs text-zinc-600 transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          ‹
        </button>
        <button
          type="button"
          data-iteration-next
          aria-label="Next page"
          disabled={page >= totalPages}
          onClick={() => onPageChange?.(page + 1)}
          className="rounded-full border border-zinc-200 bg-white px-2.5 py-1.5 text-xs text-zinc-600 transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          ›
        </button>
        <span data-iteration-page-label className="ml-1 text-[11px] font-medium text-zinc-400 dark:text-zinc-500">
          {page}/{totalPages}
        </span>
      </span>
    </div>
  );
}
