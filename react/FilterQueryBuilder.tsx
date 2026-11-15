import React from "react";

export interface QueryFilterField {
  name: string;
  label: string;
  operators?: string[];
}

export interface QueryFilterRow {
  id: string;
  conjunction: "where" | "and" | "or";
  field: string;
  operator: string;
  value: string;
}

export interface FilterQueryBuilderProps {
  fields?: QueryFilterField[];
  rows?: QueryFilterRow[];
  addLabel?: string;
  clearLabel?: string;
  maxRows?: number;
  onChange?: (rows: QueryFilterRow[]) => void;
  onApply?: (rows: QueryFilterRow[]) => void;
  onClear?: () => void;
}

const OPERATORS = ["equals", "not-equals", "greater", "less", "contains", "gte", "lte"];
const OPERATOR_GLYPH: Record<string, string> = {
  equals: "=",
  "not-equals": "<>",
  greater: ">",
  less: "<",
  contains: "~",
  gte: ">=",
  lte: "<=",
};

/**
 * FilterQueryBuilder - compositional field/operator/value filter rows with conjunction chips.
 */
export default function FilterQueryBuilder({
  fields = [],
  rows = [],
  addLabel = "+ Add filter",
  clearLabel = "Clear filters",
  maxRows = 8,
  onChange,
  onApply,
  onClear,
}: FilterQueryBuilderProps) {
  const fieldFor = (name: string) => fields.find((field) => field.name === name);
  const operatorsFor = (name: string) => fieldFor(name)?.operators || OPERATORS;

  const update = (next: QueryFilterRow[]) => {
    onChange?.(next);
    onApply?.(next);
  };

  return (
    <div data-filter-query-builder className="w-full rounded-lg border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="space-y-2">
        {rows.map((row, index) => (
          <div key={row.id} data-filter-row={row.id} className="flex flex-wrap items-center gap-1.5">
            <span className={`rounded px-2 py-1 text-xs font-medium ${index === 0 ? "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400" : "bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-300"}`}>
              {row.conjunction}
            </span>
            <select
              data-filter-field
              value={row.field}
              onChange={(event) => update(rows.map((item) => (item.id === row.id ? { ...item, field: event.target.value, operator: "equals" } : item)))}
              className="rounded-md border border-zinc-200 bg-zinc-50 px-2 py-1 text-xs font-medium text-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
            >
              {fields.map((field) => (
                <option key={field.name} value={field.name}>{field.label}</option>
              ))}
            </select>
            <select
              data-filter-operator
              value={row.operator}
              onChange={(event) => update(rows.map((item) => (item.id === row.id ? { ...item, operator: event.target.value } : item)))}
              className="rounded-md border border-zinc-200 bg-zinc-50 px-2 py-1 font-mono text-xs text-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
            >
              {operatorsFor(row.field).map((op) => (
                <option key={op} value={op}>{OPERATOR_GLYPH[op] || op}</option>
              ))}
            </select>
            <input
              type="text"
              data-filter-value
              value={row.value}
              placeholder="Value"
              onChange={(event) => update(rows.map((item) => (item.id === row.id ? { ...item, value: event.target.value } : item)))}
              className="min-w-[100px] flex-1 rounded-md border border-transparent bg-zinc-50 px-2 py-1 text-xs text-zinc-800 placeholder:text-zinc-400 focus-visible:border-indigo-400 focus-visible:outline-none dark:bg-zinc-800 dark:text-zinc-100"
            />
            <button
              type="button"
              data-filter-remove
              aria-label="Remove filter"
              onClick={() => update(rows.filter((item) => item.id !== row.id))}
              className="h-5 w-5 shrink-0 rounded-full text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 focus-visible:outline-none dark:hover:bg-zinc-800"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mx-auto h-3 w-3"><path d="M18 6 6 18M6 6l12 12" /></svg>
            </button>
          </div>
        ))}
        {rows.length === 0 ? <p data-filter-empty className="py-1 text-xs text-zinc-400 dark:text-zinc-500">No filters applied.</p> : null}
      </div>
      <div className="mt-3 flex items-center justify-between">
        <button
          type="button"
          data-filter-add
          disabled={rows.length >= maxRows}
          onClick={() =>
            update([
              ...rows,
              { id: `f${Date.now()}`, conjunction: rows.length === 0 ? "where" : "and", field: fields[0]?.name || "", operator: "equals", value: "" },
            ])
          }
          className="rounded-md px-2 py-1 text-xs font-semibold text-indigo-600 transition-colors hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:text-indigo-400 dark:hover:bg-indigo-950/40"
        >
          {addLabel}
        </button>
        {rows.length ? (
          <button type="button" data-filter-clear onClick={() => { onChange?.([]); onClear?.(); }} className="text-xs font-medium text-zinc-500 underline-offset-2 transition-colors hover:text-zinc-700 hover:underline dark:text-zinc-400">
            {clearLabel}
          </button>
        ) : null}
      </div>
    </div>
  );
}
