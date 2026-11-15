import React from "react";

export interface PickerOption {
  id: string;
  label: string;
  avatar?: string;
  initials?: string;
  system?: boolean;
}

export interface EntityMultiSelectPickerProps {
  options: PickerOption[];
  selected?: string[];
  searchable?: boolean;
  emptyMessage?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onSelect?: (ids: string[]) => void;
  onSearch?: (query: string) => void;
  onDismiss?: () => void;
}

const AVATAR_TONES = [
  "bg-violet-500",
  "bg-sky-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-indigo-500",
];

const initialsOf = (label: string) =>
  label
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => (part[0] || "").toUpperCase())
    .join("");

/**
 * EntityMultiSelectPicker - searchable checkbox list with avatar rows for multi-picking people/entities.
 */
export default function EntityMultiSelectPicker({
  options,
  selected = [],
  searchable = true,
  emptyMessage = "No matches found.",
  confirmLabel = "Insert results",
  cancelLabel = "Cancel",
  onSelect,
  onSearch,
  onDismiss,
}: EntityMultiSelectPickerProps) {
  const [query, setQuery] = React.useState("");
  const [picked, setPicked] = React.useState<Set<string>>(() => new Set(selected));

  React.useEffect(() => {
    setPicked(new Set(selected));
  }, [selected]);

  const filtered = query
    ? options.filter((option) => option.label.toLowerCase().includes(query.toLowerCase()))
    : options;

  const toggle = (id: string) => {
    setPicked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div data-entity-picker className="w-full overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
      {searchable ? (
        <div className="border-b border-zinc-100 p-2.5 dark:border-zinc-800">
          <div className="relative">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400">
              <circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" />
            </svg>
            <input
              type="text"
              value={query}
              data-picker-search
              placeholder="Search people…"
              onChange={(event) => { setQuery(event.target.value); onSearch?.(event.target.value); }}
              className="w-full rounded-lg border border-zinc-300 py-1.5 pl-8 pr-2 text-xs text-zinc-800 placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            />
          </div>
        </div>
      ) : null}
      <ul className="max-h-64 overflow-y-auto p-1.5">
        {filtered.length === 0 ? (
          <li data-picker-empty className="px-3 py-4 text-center text-xs text-zinc-400 dark:text-zinc-500">{emptyMessage}</li>
        ) : (
          filtered.map((option, index) => {
            const checked = picked.has(option.id);
            return (
              <li key={option.id}>
                <button
                  type="button"
                  data-picker-option={option.id}
                  aria-pressed={checked}
                  onClick={() => toggle(option.id)}
                  className={`flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                    checked ? "bg-blue-50 dark:bg-blue-950/40" : "hover:bg-zinc-50 dark:hover:bg-zinc-800/60"
                  }`}
                >
                  <span
                    data-picker-checkbox
                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${
                      checked ? "border-indigo-600 bg-indigo-600 text-white" : "border-zinc-300 bg-white dark:border-zinc-600 dark:bg-zinc-800"
                    }`}
                  >
                    {checked ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="h-2.5 w-2.5"><path d="m5 12 4 4L19 6" /></svg> : null}
                  </span>
                  {option.avatar ? (
                    <img src={option.avatar} alt="" className="h-6 w-6 shrink-0 rounded-full" />
                  ) : option.system ? (
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-200 dark:bg-zinc-700">
                      <span className="h-2.5 w-2.5 rounded-full bg-sky-500" />
                    </span>
                  ) : (
                    <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white ${AVATAR_TONES[index % AVATAR_TONES.length]}`}>
                      {option.initials || initialsOf(option.label)}
                    </span>
                  )}
                  <span className="min-w-0 flex-1 truncate text-xs font-medium text-zinc-800 dark:text-zinc-100">{option.label}</span>
                </button>
              </li>
            );
          })
        )}
      </ul>
      <div className="flex items-center justify-end gap-2 border-t border-zinc-100 px-3 py-2.5 dark:border-zinc-800">
        <button type="button" data-picker-cancel onClick={() => onDismiss?.()} className="rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-semibold text-zinc-600 transition-colors hover:bg-zinc-50 focus-visible:outline-none dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800">
          {cancelLabel}
        </button>
        <button type="button" data-picker-confirm onClick={() => onSelect?.([...picked])} className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-indigo-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500">
          {confirmLabel}
        </button>
      </div>
    </div>
  );
}
