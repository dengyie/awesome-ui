import React from "react";

export interface ShortcutEntry {
  id: string;
  icon?: React.ReactNode;
  label: string;
  hint?: string;
  keys: string[];
  section?: string;
}

export interface ShortcutCheatSheetProps {
  shortcuts: ShortcutEntry[];
  columns?: 1 | 2;
  title?: string;
  searchable?: boolean;
  className?: string;
}

const KbdChip: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <kbd className="inline-flex min-w-[24px] items-center justify-center rounded-md border border-zinc-300 bg-zinc-50 px-1.5 py-0.5 text-[11px] font-medium text-zinc-600 shadow-[0_1px_0_0_rgba(0,0,0,0.06)] dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
    {children}
  </kbd>
);

/**
 * ShortcutCheatSheet - two-column editor shortcut list with icons, markdown hints and keycap chips.
 */
export default function ShortcutCheatSheet({
  shortcuts,
  columns = 2,
  title = "Shortcuts",
  searchable = false,
  className = "",
}: ShortcutCheatSheetProps) {
  const [query, setQuery] = React.useState("");
  const needle = query.trim().toLowerCase();

  const sections = React.useMemo(() => {
    const filtered = needle
      ? shortcuts.filter((entry) => `${entry.label} ${entry.hint || ""} ${entry.keys.join(" ")}`.toLowerCase().includes(needle))
      : shortcuts;
    const map = new Map<string, ShortcutEntry[]>();
    for (const entry of filtered) {
      const key = entry.section || "";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(entry);
    }
    return Array.from(map.entries());
  }, [shortcuts, needle]);

  return (
    <div data-shortcut-sheet className={`w-full max-w-md rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 ${className}`}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{title}</p>
        {searchable ? (
          <input
            data-shortcut-search
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search…"
            className="w-32 rounded-md border border-zinc-200 bg-white px-2 py-1 text-xs text-zinc-700 placeholder:text-zinc-400 focus:border-indigo-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
          />
        ) : null}
      </div>
      <div className={`mt-2 grid gap-x-6 ${columns === 2 ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1"}`}>
        {sections.map(([section, entries]) => (
          <div key={section || "default"} data-shortcut-section={section || undefined} className={columns === 2 ? "sm:col-span-1" : ""}>
            {section ? <p className="mt-2 text-[11px] font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">{section}</p> : null}
            <ul className="mt-1 space-y-0.5">
              {entries.map((entry) => (
                <li
                  key={entry.id}
                  data-shortcut-row={entry.id}
                  className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                >
                  {entry.icon ? <span className="shrink-0 text-zinc-400 [&>svg]:h-4 [&>svg]:w-4">{entry.icon}</span> : null}
                  <span className="min-w-0 flex-1 text-xs text-zinc-700 dark:text-zinc-200">
                    {entry.label}
                    {entry.hint ? <code className="ml-1 rounded bg-indigo-50 px-1 font-mono text-[10px] text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-300">{entry.hint}</code> : null}
                  </span>
                  <span className="flex shrink-0 items-center gap-1">
                    {entry.keys.map((key, i) => (
                      <KbdChip key={`${entry.id}-${i}`}>{key}</KbdChip>
                    ))}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      {!sections.length ? <p data-shortcut-empty className="py-6 text-center text-xs text-zinc-400">No shortcuts match “{query}”.</p> : null}
    </div>
  );
}

export { KbdChip };
