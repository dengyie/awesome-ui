import React, { useEffect, useMemo, useState } from "react";
import { UiIcon } from "./UiIcon";

export interface ShortcutItem {
  /** Individual keycaps, e.g. ["⌘", "K"] or ["↑", "↓"]. */
  keys: string[];
  label: string;
  /** Optional grouping override; falls back to the parent group. */
  group?: string;
}

export interface ShortcutGroup {
  id: string;
  label: string;
  items: ShortcutItem[];
}

export interface ShortcutsOverlayProps {
  isOpen: boolean;
  /** Either grouped shortcuts, or a flat list that is bucketed by item.group. */
  groups?: ShortcutGroup[];
  shortcuts?: ShortcutItem[];
  title?: string;
  placeholder?: string;
  onClose?: () => void;
  className?: string;
}

const Kbd: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <kbd className="inline-flex min-w-[1.4rem] items-center justify-center rounded border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 px-1 py-0.5 font-mono text-[10px] text-zinc-600 dark:text-zinc-300">
    {children}
  </kbd>
);

export const ShortcutsOverlay: React.FC<ShortcutsOverlayProps> = ({
  isOpen,
  groups = [],
  shortcuts = [],
  title = "Keyboard shortcuts",
  placeholder = "Search shortcuts...",
  onClose,
  className = "",
}) => {
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (isOpen) setQuery("");
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose?.();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  // Normalize: flat list → groups by item.group (or "General").
  const normalized = useMemo<ShortcutGroup[]>(() => {
    if (groups.length > 0) return groups;
    const buckets: ShortcutGroup[] = [];
    shortcuts.forEach((item) => {
      const label = item.group || "General";
      const bucket = buckets.find((g) => g.label === label);
      if (bucket) bucket.items.push(item);
      else buckets.push({ id: label.toLowerCase().replace(/\s+/g, "-"), label, items: [item] });
    });
    return buckets;
  }, [groups, shortcuts]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return normalized;
    return normalized
      .map((group) => ({
        ...group,
        items: group.items.filter(
          (item) => item.label.toLowerCase().includes(q) || item.keys.join("").toLowerCase().includes(q)
        ),
      }))
      .filter((group) => group.items.length > 0);
  }, [normalized, query]);

  const total = useMemo(() => normalized.reduce((sum, group) => sum + group.items.length, 0), [normalized]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-4 pt-[10vh] backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={onClose}
    >
      <div
        className={`flex max-h-[75vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-2xl ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2.5 border-b border-zinc-100 dark:border-zinc-800 px-4 py-3">
          <UiIcon name="terminal" size={16} className="shrink-0 text-zinc-400" />
          <h2 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">{title}</h2>
          <span className="text-[11px] font-mono text-zinc-400">{total}</span>
          <button
            type="button"
            onClick={() => onClose?.()}
            aria-label="Close"
            className="ml-auto rounded-md p-1 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
          >
            <UiIcon name="x" size={14} />
          </button>
        </div>

        <div className="border-b border-zinc-100 dark:border-zinc-800 px-4 py-2.5">
          <div className="flex items-center gap-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 px-2.5 py-1.5">
            <UiIcon name="search" size={13} className="shrink-0 text-zinc-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={placeholder}
              autoFocus
              className="w-full border-none bg-transparent text-xs text-zinc-800 dark:text-zinc-200 placeholder-zinc-400 focus:outline-none"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-xs text-zinc-400">No shortcuts match “{query}”</div>
          ) : (
            <div className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
              {filtered.map((group) => (
                <section key={group.id}>
                  <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">{group.label}</h3>
                  <ul className="space-y-1.5">
                    {group.items.map((item, idx) => (
                      <li key={`${group.id}-${idx}`} className="flex items-center gap-2 text-xs">
                        <span className="min-w-0 flex-1 truncate text-zinc-600 dark:text-zinc-300">{item.label}</span>
                        <span className="flex shrink-0 items-center gap-0.5">
                          {item.keys.map((key, i) => (
                            <Kbd key={`${key}-${i}`}>{key}</Kbd>
                          ))}
                        </span>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-800/30 px-4 py-2 text-[10px] text-zinc-400">
          <span className="flex items-center gap-1">
            <Kbd>esc</Kbd>
            <span>Close</span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default ShortcutsOverlay;
