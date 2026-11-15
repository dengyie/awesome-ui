import React from "react";
import { UiIcon, type UiIconName } from "./UiIcon";

export interface FilterChip {
  label: string;
  value?: string;
  /** Value tone pill for highlighted filter values (e.g. "High" in rose). */
  valueTone?: "rose" | "emerald" | "amber" | "indigo";
  removable?: boolean;
}

export interface FilterToolbarProps {
  chips: FilterChip[];
  searchValue?: string;
  searchPlaceholder?: string;
  view?: "list" | "grid";
  viewOnChange?: (view: "list" | "grid") => void;
  actionLabel?: string;
  onChipRemove?: (index: number, chip: FilterChip) => void;
  onSearch?: (value: string) => void;
  onAction?: () => void;
  className?: string;
}

const VALUE_TONE: Record<NonNullable<FilterChip["valueTone"]>, string> = {
  rose: "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300",
  emerald: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300",
  amber: "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300",
  indigo: "bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300",
};

export const FilterToolbar: React.FC<FilterToolbarProps> = ({
  chips,
  searchValue,
  searchPlaceholder = "Search…",
  view = "list",
  viewOnChange,
  actionLabel,
  onChipRemove,
  onSearch,
  onAction,
  className = "",
}) => (
  <div
    data-filter-toolbar
    role="toolbar"
    aria-label="List filters"
    className={`flex flex-wrap items-center gap-2 rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900 ${className}`}
  >
    {chips.map((chip, index) => (
      <span
        key={`${chip.label}-${index}`}
        data-filter-chip={index}
        className="flex items-center gap-1.5 rounded-full border border-zinc-300 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
      >
        {chip.label}
        {chip.value ? (
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${VALUE_TONE[chip.valueTone || "indigo"]}`}>
            {chip.value}
          </span>
        ) : (
          <UiIcon name="chevron-down" size={12} className="text-zinc-400" />
        )}
        {chip.removable && chip.value ? (
          <button
            type="button"
            data-chip-remove={index}
            aria-label={`Remove ${chip.label} filter`}
            onClick={() => onChipRemove?.(index, chip)}
            className="ml-0.5 rounded-full p-0.5 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:hover:bg-zinc-800"
          >
            <UiIcon name="x" size={11} />
          </button>
        ) : null}
      </span>
    ))}
    <span className="relative ml-auto min-w-[140px] flex-1 sm:max-w-xs">
      <UiIcon name="search" size={13} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400" />
      <input
        type="search"
        data-toolbar-search
        value={searchValue}
        placeholder={searchPlaceholder}
        onChange={(event) => onSearch?.(event.target.value)}
        className="w-full rounded-lg border border-zinc-300 bg-white py-1.5 pl-8 pr-3 text-xs text-zinc-900 placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
      />
    </span>
    {viewOnChange ? (
      <span
        data-view-toggle
        role="group"
        aria-label="View mode"
        className="flex overflow-hidden rounded-lg border border-zinc-300 dark:border-zinc-700"
      >
        {(["list", "grid"] as const).map((mode) => (
          <button
            key={mode}
            type="button"
            data-view-mode={mode}
            aria-pressed={view === mode}
            onClick={() => viewOnChange?.(mode)}
            className={`flex h-7 w-8 items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-500 ${
              view === mode
                ? "bg-indigo-600 text-white"
                : "bg-white text-zinc-400 hover:bg-zinc-50 dark:bg-zinc-900 dark:hover:bg-zinc-800"
            }`}
          >
            <UiIcon name={mode === "list" ? "more-horizontal" : "square"} size={13} />
          </button>
        ))}
      </span>
    ) : null}
    {actionLabel ? (
      <button
        type="button"
        data-toolbar-action
        onClick={onAction}
        className="flex items-center gap-1.5 rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-white"
      >
        <UiIcon name="plus" size={12} />
        {actionLabel}
      </button>
    ) : null}
  </div>
);

export default FilterToolbar;
