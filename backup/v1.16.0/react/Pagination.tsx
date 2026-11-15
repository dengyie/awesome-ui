import React from "react";
import { UiIcon } from "./UiIcon";

export interface PaginationProps {
  /** Current page, 1-based. */
  page: number;
  pageCount: number;
  onChange?: (page: number) => void;
  /** How many page numbers to show on each side of the current page. Defaults to 1. */
  siblingCount?: number;
  /** Show first/last page jump buttons. Defaults to true. */
  showEdges?: boolean;
  ariaLabel?: string;
  className?: string;
}

export type PaginationSlot = number | "gap";

export const paginationSlots = (page: number, pageCount: number, siblingCount = 1): PaginationSlot[] => {
  if (pageCount <= 0) return [];
  const seen = new Set<number>([1, pageCount, page]);
  for (let offset = 1; offset <= siblingCount; offset += 1) {
    seen.add(page - offset);
    seen.add(page + offset);
  }
  const sorted = Array.from(seen)
    .filter((entry) => entry >= 1 && entry <= pageCount)
    .sort((a, b) => a - b);
  const slots: PaginationSlot[] = [];
  let previous = 0;
  for (const entry of sorted) {
    if (previous > 0 && entry - previous > 1) slots.push("gap");
    slots.push(entry);
    previous = entry;
  }
  return slots;
};

const BASE =
  "inline-flex h-7 min-w-7 items-center justify-center rounded-md px-1.5 text-[11px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-40";

export const Pagination: React.FC<PaginationProps> = ({
  page,
  pageCount,
  onChange,
  siblingCount = 1,
  showEdges = true,
  ariaLabel = "Pagination",
  className = "",
}) => {
  const slots = paginationSlots(page, pageCount, siblingCount);
  const go = (next: number) => {
    if (next < 1 || next > pageCount || next === page) return;
    onChange?.(next);
  };

  const edge = (target: number, label: string, icon: "chevron-left" | "chevron-right") => (
    <button
      type="button"
      aria-label={label}
      disabled={target < 1 || target > pageCount}
      onClick={() => go(target)}
      className={`${BASE} text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100`}
    >
      <UiIcon name={icon} size={13} />
    </button>
  );

  return (
    <nav aria-label={ariaLabel} className={`flex items-center gap-1 ${className}`}>
      {showEdges && edge(1, "First page", "chevron-left")}
      {edge(page - 1, "Previous page", "chevron-left")}
      {slots.map((slot, index) =>
        slot === "gap" ? (
          <span key={`gap-${index}`} aria-hidden="true" className="px-1 text-[11px] text-zinc-400">
            …
          </span>
        ) : (
          <button
            key={slot}
            type="button"
            aria-label={`Page ${slot}`}
            aria-current={slot === page ? "page" : undefined}
            onClick={() => go(slot)}
            className={`${BASE} tabular-nums ${
              slot === page
                ? "bg-indigo-600 text-white"
                : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
            }`}
          >
            {slot}
          </button>
        )
      )}
      {edge(page + 1, "Next page", "chevron-right")}
      {showEdges && edge(pageCount, "Last page", "chevron-right")}
    </nav>
  );
};

export default Pagination;
