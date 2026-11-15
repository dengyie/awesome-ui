import React from "react";

export interface ColumnDef {
  id: string;
  label: string;
  locked?: boolean;
  hidden?: boolean;
}

export interface ColumnVisibilityMenuProps {
  columns: ColumnDef[];
  visibleIds?: string[];
  showReorderHandles?: boolean;
  applyMode?: "instant" | "apply-button";
  resetLabel?: string;
  applyLabel?: string;
  onToggle?: (id: string, visible: boolean) => void;
  onReorder?: (from: number, to: number) => void;
  onReset?: () => void;
  onApply?: (visibleIds: string[]) => void;
}

/**
 * ColumnVisibilityMenu - column show/hide popover with locked columns, reorder handles and a "Showing X of Y" header.
 */
export default function ColumnVisibilityMenu({
  columns,
  visibleIds,
  showReorderHandles = true,
  applyMode = "instant",
  resetLabel = "Reset to default",
  applyLabel = "Apply",
  onToggle,
  onReorder,
  onReset,
  onApply,
}: ColumnVisibilityMenuProps) {
  const isHidden = (column: ColumnDef) =>
    visibleIds ? !visibleIds.includes(column.id) : Boolean(column.hidden);

  const [draft, setDraft] = React.useState<Set<string>>(() => {
    const initial = visibleIds || columns.filter((c) => !c.hidden).map((c) => c.id);
    return new Set(initial);
  });

  React.useEffect(() => {
    if (visibleIds) setDraft(new Set(visibleIds));
  }, [visibleIds]);

  const current = applyMode === "apply-button" ? draft : new Set(visibleIds ?? columns.filter((c) => !isHidden(c)).map((c) => c.id));
  const visibleCount = columns.filter((c) => !c.locked && current.has(c.id)).length + columns.filter((c) => c.locked).length;
  const totalCount = columns.length;

  const toggle = (column: ColumnDef) => {
    if (column.locked) return;
    if (applyMode === "instant") {
      const next = new Set(current);
      if (next.has(column.id)) next.delete(column.id);
      else next.add(column.id);
      onToggle?.(column.id, next.has(column.id));
      onApply?.([...next]);
    } else {
      setDraft((prev) => {
        const next = new Set(prev);
        if (next.has(column.id)) next.delete(column.id);
        else next.add(column.id);
        return next;
      });
      onToggle?.(column.id, !current.has(column.id));
    }
  };

  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= columns.length) return;
    onReorder?.(index, target);
  };

  return (
    <div data-column-visibility-menu className="w-64 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-center justify-between border-b border-zinc-100 px-3 py-2.5 dark:border-zinc-800">
        <p data-column-count className="text-sm text-zinc-500 dark:text-zinc-400">
          Showing <span className="font-semibold text-zinc-800 dark:text-zinc-100">{visibleCount}</span> of {totalCount}
        </p>
        <button type="button" data-column-reset onClick={() => onReset?.()} className="text-xs font-medium text-indigo-600 hover:underline dark:text-indigo-400">
          {resetLabel}
        </button>
      </div>
      <ul className="max-h-72 overflow-y-auto py-1">
        {columns.map((column, index) => {
          const visible = column.locked || current.has(column.id);
          return (
            <li key={column.id} data-column-row={column.id} data-column-visible={visible ? "true" : "false"}>
              <div className={`flex items-center gap-2 px-3 py-1.5 ${column.locked ? "opacity-60" : ""}`}>
                {showReorderHandles && !column.locked ? (
                  <span className="flex shrink-0 flex-col text-zinc-300 dark:text-zinc-600" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="h-3 w-3"><circle cx="9" cy="6" r="1.5" /><circle cx="15" cy="6" r="1.5" /><circle cx="9" cy="12" r="1.5" /><circle cx="15" cy="12" r="1.5" /><circle cx="9" cy="18" r="1.5" /><circle cx="15" cy="18" r="1.5" /></svg>
                  </span>
                ) : null}
                {column.locked ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5 shrink-0 text-zinc-400"><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></svg>
                ) : null}
                <span className="min-w-0 flex-1 truncate text-xs font-medium text-zinc-700 dark:text-zinc-200">{column.label}</span>
                <button
                  type="button"
                  data-column-toggle
                  aria-label={`${visible ? "Hide" : "Show"} ${column.label}`}
                  disabled={column.locked}
                  onClick={() => toggle(column)}
                  className={`shrink-0 rounded p-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                    visible ? "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800" : "text-zinc-300 hover:bg-zinc-50 dark:text-zinc-600"
                  }`}
                >
                  {visible ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5"><path d="M2 12s3.5-7 10-7c2 0 3.7.6 5.1 1.5M22 12s-3.5 7-10 7c-2 0-3.7-.6-5.1-1.5" /><path d="m4 4 16 16" /></svg>
                  )}
                </button>
                {showReorderHandles && !column.locked ? (
                  <span className="flex shrink-0 flex-col">
                    <button type="button" data-column-up aria-label={`Move ${column.label} up`} onClick={() => move(index, -1)} className="rounded p-0.5 text-zinc-300 hover:bg-zinc-100 hover:text-zinc-500 focus-visible:outline-none dark:hover:bg-zinc-800">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-2.5 w-2.5"><path d="m18 15-6-6-6 6" /></svg>
                    </button>
                    <button type="button" data-column-down aria-label={`Move ${column.label} down`} onClick={() => move(index, 1)} className="rounded p-0.5 text-zinc-300 hover:bg-zinc-100 hover:text-zinc-500 focus-visible:outline-none dark:hover:bg-zinc-800">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-2.5 w-2.5"><path d="m6 9 6 6 6-6" /></svg>
                    </button>
                  </span>
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>
      {applyMode === "apply-button" ? (
        <div className="border-t border-zinc-100 p-2 dark:border-zinc-800">
          <button type="button" data-column-apply onClick={() => onApply?.([...draft])} className="w-full rounded-lg bg-zinc-900 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-white">
            {applyLabel}
          </button>
        </div>
      ) : null}
    </div>
  );
}
