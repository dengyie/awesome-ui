import React from "react";
import { UiIcon } from "./UiIcon";

export interface ChangelogEntry {
  id: string | number;
  /** Pill text, e.g. "new". */
  badge?: string;
  /** Pill tone. */
  badgeTone?: "rose" | "emerald" | "indigo" | "amber";
  title: string;
  /** Body copy under the title. */
  detail?: string;
}

export interface ChangelogFeedProps {
  title?: string;
  entries: ChangelogEntry[];
  onSelect?: (entry: ChangelogEntry) => void;
  /** Link label pinned at the bottom, e.g. "See all updates". */
  footerLink?: string;
  onFooterClick?: () => void;
  emptyText?: string;
  className?: string;
}

const TONE: Record<string, string> = {
  rose: "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300",
  emerald: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300",
  indigo: "bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300",
  amber: "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300",
};

export const ChangelogFeed: React.FC<ChangelogFeedProps> = ({
  title = "Latest updates",
  entries = [],
  onSelect,
  footerLink,
  onFooterClick,
  emptyText = "No updates yet",
  className = "",
}) => (
  <aside
    className={`flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 ${className}`}
  >
    <header className="flex items-center justify-between border-b border-zinc-100 px-4 py-3 dark:border-zinc-800">
      <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{title}</h3>
      <UiIcon name="sparkles" size={14} className="text-amber-500" />
    </header>

    {entries.length === 0 ? (
      <p className="px-4 py-6 text-center text-xs text-zinc-400">{emptyText}</p>
    ) : (
      <ol className="flex-1 space-y-3 divide-y divide-zinc-50 overflow-y-auto px-4 py-3 dark:divide-zinc-800/60">
        {entries.map((entry) => (
          <li key={entry.id}>
            <div
              role={onSelect ? "button" : undefined}
              tabIndex={onSelect ? 0 : undefined}
              onClick={() => onSelect?.(entry)}
              className={onSelect ? "cursor-pointer text-left" : "text-left"}
            >
              <h4 className="text-xs font-semibold leading-snug text-zinc-800 dark:text-zinc-200">
                {entry.badge && (
                  <span
                    className={`mr-1.5 inline-block rounded-full px-1.5 py-px align-middle font-medium text-[9.5px] ${
                      TONE[entry.badgeTone || "rose"]
                    }`}
                  >
                    {entry.badge}
                  </span>
                )}
                {entry.title}
              </h4>
              {entry.detail && (
                <p className="mt-1 text-[11px] leading-relaxed text-zinc-500 dark:text-zinc-400">{entry.detail}</p>
              )}
            </div>
          </li>
        ))}
      </ol>
    )}

    {footerLink && (
      <footer className="border-t border-zinc-100 text-center dark:border-zinc-800">
        <button
          type="button"
          onClick={onFooterClick}
          className="w-full px-4 py-2.5 text-[11px] font-medium text-indigo-600 transition-colors hover:bg-indigo-50 hover:underline dark:text-indigo-400 dark:hover:bg-indigo-950/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-500"
        >
          {footerLink}
        </button>
      </footer>
    )}
  </aside>
);
export default ChangelogFeed;
