import React from "react";

export interface StatusCountTab {
  id: string;
  label: string;
  count?: number;
  disabled?: boolean;
}

export interface StatusCountTabsProps {
  tabs: StatusCountTab[];
  value: string;
  size?: "sm" | "md";
  fullWidth?: boolean;
  onChange?: (id: string) => void;
}

/**
 * StatusCountTabs - segmented tab strip with live counts that docks flush onto a table card.
 */
export default function StatusCountTabs({ tabs, value, size = "md", fullWidth = false, onChange }: StatusCountTabsProps) {
  return (
    <div
      data-status-count-tabs
      role="tablist"
      className={`flex items-stretch overflow-hidden rounded-t-lg border border-b-0 border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-800/60 ${fullWidth ? "w-full" : "inline-flex max-w-full"}`}
    >
      {tabs.map((tab) => {
        const active = tab.id === value;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={active}
            data-status-tab={tab.id}
            disabled={tab.disabled}
            onClick={() => onChange?.(tab.id)}
            className={`flex items-center gap-1 whitespace-nowrap border-r border-zinc-200 font-semibold transition-colors last:border-r-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-700 ${
              size === "sm" ? "px-3 py-1.5 text-xs" : "px-4 py-2.5 text-sm"
            } ${
              active
                ? "bg-white text-zinc-900 shadow-[inset_0_-2px_0_0_#18181b] dark:bg-zinc-900 dark:text-zinc-50 dark:shadow-[inset_0_-2px_0_0_#fafafa]"
                : "bg-zinc-50 text-sky-600 hover:bg-zinc-100 dark:bg-zinc-800/60 dark:text-sky-400 dark:hover:bg-zinc-800"
            }`}
          >
            {tab.label}
            {tab.count != null ? (
              <span className={`font-normal ${active ? "text-zinc-400 dark:text-zinc-500" : "text-zinc-400/80"}`}>({tab.count})</span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
