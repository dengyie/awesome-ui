/**
 * TableSavedViews - Data-table saved views bar: view tabs (default +
 * user-saved), active-view filter chips, and Save view / Share actions
 * (Attio / Rows table views pattern).
 */
import React, { useState } from "react";

export interface SavedView {
  id: string;
  label: string;
  filters?: string[];
}

export interface TableSavedViewsProps {
  views?: SavedView[];
  active?: string;
  saveLabel?: string;
  shareLabel?: string;
  className?: string;
  onViewChange?: (view: SavedView) => void;
  onSaveView?: (id: string) => void;
  onShareView?: (id: string) => void;
}

const DEFAULT_VIEWS: SavedView[] = [
  { id: "all", label: "All records", filters: [] },
  { id: "mine", label: "Assigned to me", filters: ["assignee: me"] },
  { id: "stale", label: "Stale 30d+", filters: ["updated < 30d", "status: open"] },
];

export const TableSavedViews: React.FC<TableSavedViewsProps> = ({
  views = DEFAULT_VIEWS,
  active: activeProp,
  saveLabel = "Save view",
  shareLabel = "Share",
  className = "",
  onViewChange,
  onSaveView,
  onShareView,
}) => {
  const list = Array.isArray(views) ? views : [];
  const [activeId, setActiveId] = useState(activeProp || list[0]?.id || "all");
  const activeIdResolved = activeProp ?? activeId;
  const active = list.find((v) => v.id === activeIdResolved) ?? list[0] ?? { id: "all", label: "All records", filters: [] };

  return (
    <div data-savedviews-bar className={`w-full rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900 ${className}`}>
      <div data-savedviews-tabs className="flex items-center gap-1 border-b border-zinc-100 px-3 dark:border-zinc-800">
        {list.map((view) => {
          const isActive = view.id === active.id;
          return (
            <button
              key={view.id}
              type="button"
              data-savedview-tab={view.id}
              onClick={() => { setActiveId(view.id); onViewChange?.(view); }}
              className={`whitespace-nowrap px-3 py-2 text-sm transition-colors ${
                isActive
                  ? "border-b-2 border-violet-600 font-semibold text-violet-700 dark:border-violet-500 dark:text-violet-300"
                  : "border-b-2 border-transparent font-medium text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
              }`}
            >
              {view.label}
            </button>
          );
        })}
      </div>
      <div data-savedviews-body className="flex flex-wrap items-center gap-2 px-5 py-3">
        <span data-savedview-filters className="inline-flex flex-wrap items-center gap-2">
          {(active.filters || []).length ? (
            (active.filters || []).map((f) => (
              <span key={f} data-savedview-filter={f} className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">{f}</span>
            ))
          ) : (
            <span data-savedview-nofilters className="text-xs text-zinc-400 dark:text-zinc-500">No filters</span>
          )}
        </span>
        <span className="flex-1"></span>
        <button type="button" data-savedview-share onClick={() => onShareView?.(active.id)} className="rounded-md border border-zinc-200 px-2.5 py-1 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800">{shareLabel}</button>
        <button type="button" data-savedview-save onClick={() => onSaveView?.(active.id)} className="rounded-md bg-violet-600 px-2.5 py-1 text-xs font-semibold text-white transition-colors hover:bg-violet-500">{saveLabel}</button>
      </div>
    </div>
  );
};

export default TableSavedViews;
