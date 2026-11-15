import React, { useMemo, useState } from "react";
import { UiIcon, UiIconName } from "./UiIcon";

export interface DataTableColumn {
  key: string;
  label: string;
  align?: "left" | "center" | "right";
  width?: string;
}

export type DataTableRow = Record<string, string | number | boolean | null | undefined>;

export interface DataTableAction {
  label: string;
  icon?: UiIconName;
  onClick: (row: DataTableRow) => void;
}

export interface DataTableProps {
  columns: DataTableColumn[];
  rows: DataTableRow[];
  selectable?: boolean;
  onSort?: (key: string, direction: "asc" | "desc") => void;
  actions?: DataTableAction[];
  emptyText?: string;
  className?: string;
}

const alignClass = (align?: DataTableColumn["align"]) =>
  align === "right" ? "text-right" : align === "center" ? "text-center" : "text-left";

export const DataTable: React.FC<DataTableProps> = ({
  columns,
  rows,
  selectable = false,
  onSort,
  actions = [],
  emptyText = "No results",
  className = "",
}) => {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [selected, setSelected] = useState<Set<number>>(new Set());

  const sortedRows = useMemo(() => {
    if (onSort || !sortKey) return rows;
    return [...rows].sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (av === bv) return 0;
      const result = String(av ?? "") > String(bv ?? "") ? 1 : -1;
      return sortDir === "asc" ? result : -result;
    });
  }, [rows, sortKey, sortDir, onSort]);

  const toggleSort = (key: string) => {
    const nextDir = sortKey === key && sortDir === "asc" ? "desc" : "asc";
    setSortKey(key);
    setSortDir(nextDir);
    onSort?.(key, nextDir);
  };

  const allSelected = sortedRows.length > 0 && selected.size === sortedRows.length;
  const toggleAll = () => {
    setSelected(allSelected ? new Set() : new Set(sortedRows.map((_, index) => index)));
  };
  const toggleRow = (index: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(index) ? next.delete(index) : next.add(index);
      return next;
    });
  };

  return (
    <div className={`relative ${className}`}>
      <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
        <table className="w-full text-xs">
          <thead className="bg-zinc-50 dark:bg-zinc-900/60">
            <tr>
              {selectable && (
                <th className="w-10 px-3 py-2">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleAll}
                    aria-label="Select all rows"
                    className="h-3.5 w-3.5 rounded border-zinc-300 dark:border-zinc-600 accent-indigo-600"
                  />
                </th>
              )}
              {columns.map((column) => (
                <th
                  key={column.key}
                  style={column.width ? { width: column.width } : undefined}
                  className={`px-3 py-2 font-medium text-zinc-500 dark:text-zinc-400 ${alignClass(column.align)}`}
                >
                  <button
                    type="button"
                    onClick={() => toggleSort(column.key)}
                    className="inline-flex items-center gap-1 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors"
                  >
                    {column.label}
                    <span className="text-zinc-300 dark:text-zinc-600">
                      <UiIcon
                        name={sortKey === column.key ? (sortDir === "asc" ? "arrow-up" : "arrow-down") : "chevron-down"}
                        size={11}
                      />
                    </span>
                  </button>
                </th>
              ))}
              {actions.length > 0 && <th className="w-20 px-3 py-2" />}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {sortedRows.length === 0 && (
              <tr>
                <td
                  colSpan={columns.length + (selectable ? 1 : 0) + (actions.length ? 1 : 0)}
                  className="px-3 py-10 text-center text-zinc-400 dark:text-zinc-500"
                >
                  {emptyText}
                </td>
              </tr>
            )}
            {sortedRows.map((row, index) => (
              <tr
                key={index}
                className="group hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
              >
                {selectable && (
                  <td className="px-3 py-2">
                    <input
                      type="checkbox"
                      checked={selected.has(index)}
                      onChange={() => toggleRow(index)}
                      aria-label={`Select row ${index + 1}`}
                      className="h-3.5 w-3.5 rounded border-zinc-300 dark:border-zinc-600 accent-indigo-600"
                    />
                  </td>
                )}
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={`px-3 py-2 text-zinc-700 dark:text-zinc-200 ${alignClass(column.align)} ${
                      column.align === "right" ? "tabular-nums" : ""
                    }`}
                  >
                    {String(row[column.key] ?? "—")}
                  </td>
                ))}
                {actions.length > 0 && (
                  <td className="px-3 py-2">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {actions.map((action) => (
                        <button
                          key={action.label}
                          type="button"
                          onClick={() => action.onClick(row)}
                          aria-label={action.label}
                          title={action.label}
                          className="rounded p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-700 dark:hover:text-zinc-200 transition-colors"
                        >
                          <UiIcon name={action.icon || "more-horizontal"} size={14} />
                        </button>
                      ))}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectable && selected.size > 0 && (
        <div className="fixed bottom-6 left-1/2 z-20 flex -translate-x-1/2 items-center gap-3 rounded-full border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-2 shadow-lg">
          <span className="text-xs font-medium text-zinc-700 dark:text-zinc-200">{selected.size} selected</span>
          <div className="flex items-center gap-1">
            {actions.map((action) => (
              <button
                key={action.label}
                type="button"
                onClick={() => {
                  selected.forEach((index) => action.onClick(sortedRows[index]));
                  setSelected(new Set());
                }}
                className="rounded-full px-2.5 py-1 text-xs text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-700 transition-colors"
              >
                {action.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setSelected(new Set())}
            aria-label="Clear selection"
            className="rounded-full p-1 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700"
          >
            <UiIcon name="x" size={13} />
          </button>
        </div>
      )}
    </div>
  );
};

export default DataTable;
