import React, { useEffect, useRef, useState } from "react";
import { UiIcon } from "./UiIcon";

export interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

export interface FilterDefinition {
  id: string;
  label: string;
  options: FilterOption[];
}

export interface FilterBarProps {
  filters: FilterDefinition[];
  /** Controlled selection map: filter id -> selected option values. */
  selected?: Record<string, string[]>;
  onChange?: (selected: Record<string, string[]>) => void;
  onClear?: () => void;
  className?: string;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  selected,
  onChange,
  onClear,
  className = "",
}) => {
  const [internal, setInternal] = useState<Record<string, string[]>>({});
  const [openId, setOpenId] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const current = selected ?? internal;

  useEffect(() => {
    if (!openId) return;
    const onPointerDown = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) setOpenId(null);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpenId(null);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [openId]);

  const commit = (next: Record<string, string[]>) => {
    if (selected === undefined) setInternal(next);
    onChange?.(next);
  };

  const toggleOption = (filterId: string, value: string) => {
    const values = current[filterId] ?? [];
    const nextValues = values.includes(value)
      ? values.filter((entry) => entry !== value)
      : [...values, value];
    const next = { ...current };
    if (nextValues.length > 0) next[filterId] = nextValues;
    else delete next[filterId];
    commit(next);
  };

  const clearAll = () => {
    commit({});
    onClear?.();
  };

  const activeCount = Object.values(current).reduce((total, values) => total + values.length, 0);

  return (
    <div ref={rootRef} className={`flex flex-wrap items-center gap-1.5 ${className}`}>
      {filters.map((filter) => {
        const values = current[filter.id] ?? [];
        const active = values.length > 0;
        const open = openId === filter.id;
        return (
          <div key={filter.id} className="relative">
            <button
              type="button"
              aria-expanded={open}
              aria-haspopup="true"
              onClick={() => setOpenId(open ? null : filter.id)}
              className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                active
                  ? "border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-900 dark:bg-indigo-950/40 dark:text-indigo-300"
                  : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-zinc-600"
              }`}
            >
              <span>{filter.label}</span>
              {active && (
                <span className="rounded-full bg-indigo-600 px-1 text-[9px] tabular-nums text-white">
                  {values.length}
                </span>
              )}
              <UiIcon name="chevron-down" size={11} className={open ? "rotate-180 transition-transform" : "transition-transform"} />
            </button>

            {open && (
              <div className="absolute left-0 top-full z-20 mt-1 w-48 rounded-lg border border-zinc-200 bg-white p-1 shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
                {filter.options.map((option) => {
                  const checked = values.includes(option.value);
                  return (
                    <button
                      key={option.value}
                      type="button"
                      aria-pressed={checked}
                      onClick={() => toggleOption(filter.id, option.value)}
                      className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-[11px] text-zinc-600 transition-colors hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:text-zinc-300 dark:hover:bg-zinc-800"
                    >
                      <span
                        className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded border ${
                          checked
                            ? "border-indigo-600 bg-indigo-600 text-white"
                            : "border-zinc-300 dark:border-zinc-600"
                        }`}
                      >
                        {checked && <UiIcon name="check" size={9} strokeWidth={3} />}
                      </span>
                      <span className="min-w-0 flex-1 truncate">{option.label}</span>
                      {option.count !== undefined && (
                        <span className="shrink-0 tabular-nums text-[10px] text-zinc-400">
                          {option.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}

      {activeCount > 0 && (
        <button
          type="button"
          onClick={clearAll}
          className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-medium text-zinc-500 transition-colors hover:text-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:text-zinc-400 dark:hover:text-zinc-100"
        >
          <UiIcon name="x" size={11} />
          Clear all
        </button>
      )}
    </div>
  );
};

export default FilterBar;
