/**
 * ChangelogTimeline - Product changelog: left date rail with category tag,
 * rich entry body, reaction/view/share meta row, search box and filters
 * control (Canny Changelog pattern).
 */
import React from "react";

export type ChangelogTagTone = "sky" | "emerald" | "amber" | "violet";

export interface ChangelogEntry {
  id: string;
  date: string;
  tag: string;
  tone?: ChangelogTagTone;
  title: string;
  body: string;
  likes?: number;
  views?: number;
}

export interface ChangelogTimelineProps {
  title?: string;
  subtitle?: string;
  searchPlaceholder?: string;
  filterLabel?: string;
  entries?: ChangelogEntry[];
  className?: string;
  onEntryClick?: (entry: ChangelogEntry) => void;
}

const TONE_STYLES: Record<ChangelogTagTone, string> = {
  sky: "bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300",
  emerald: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300",
  amber: "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300",
  violet: "bg-violet-50 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300",
};

const DEFAULT_ENTRIES: ChangelogEntry[] = [
  {
    id: "c1",
    date: "Nov 15, 2026",
    tag: "Improved",
    tone: "sky",
    title: "Dashboard widgets now reflow smoothly on every screen size",
    body:
      "The home grid previously felt cramped on narrower viewports. We shipped a layout pass that makes widget reads 40% faster and keeps the most important metric pinned in view — no more unnecessary scrolling. Thanks to everyone who sent feedback!",
    likes: 24,
    views: 1832,
  },
  {
    id: "c2",
    date: "Nov 12, 2026",
    tag: "New",
    tone: "emerald",
    title: "Skip the onboarding tour when you return",
    body:
      "Most of you already know your way around, and returning on a new device shouldn't mean retaking the product tour. The first-run checklist now collapses into a single card and can be reopened any time from Help.",
    likes: 61,
    views: 2914,
  },
  {
    id: "c3",
    date: "Nov 8, 2026",
    tag: "Fixed",
    tone: "amber",
    title: "CSV export no longer drops trailing rows",
    body:
      "Exports with exactly 1000 rows were truncated by an off-by-one pagination guard. Full rows now land in the file, and the download toast confirms the row count.",
    likes: 12,
    views: 764,
  },
];

export default function ChangelogTimeline({
  title = "Changelog",
  subtitle = "Follow up on the latest improvements and updates.",
  searchPlaceholder = "Search entries...",
  filterLabel = "Filters",
  entries = DEFAULT_ENTRIES,
  className = "",
  onEntryClick,
}: ChangelogTimelineProps) {
  return (
    <div data-changelog className={`w-full rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900 ${className}`}>
      <div data-changelog-header className="px-5 pb-3 pt-5">
        <p data-changelog-title className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">{title}</p>
        <p data-changelog-subtitle className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{subtitle}</p>
      </div>
      <div data-changelog-controls className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-100 px-5 pb-3 dark:border-zinc-800">
        <label data-changelog-search className="flex w-full max-w-sm items-center gap-2 rounded-lg border border-zinc-200 px-3 py-1.5 text-sm text-zinc-400 transition-colors focus-within:border-zinc-400 dark:border-zinc-700 dark:focus-within:border-zinc-500">
          <span aria-hidden="true">⌕</span>
          <input type="text" placeholder={searchPlaceholder} className="w-full bg-transparent text-zinc-800 outline-none placeholder:text-zinc-400 dark:text-zinc-100 dark:placeholder:text-zinc-500" />
        </label>
        <button data-changelog-filter type="button" className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800">
          <span aria-hidden="true">⚙</span> {filterLabel} <span className="text-zinc-400" aria-hidden="true">▾</span>
        </button>
      </div>
      <ol data-changelog-list className="flex flex-col px-5">
        {entries.map((entry, i) => (
          <li
            key={entry.id}
            data-changelog-entry={entry.id}
            tabIndex={0}
            onClick={() => onEntryClick?.(entry)}
            className={`grid cursor-pointer grid-cols-[7rem_1fr] gap-4 py-4 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/40 ${i < entries.length - 1 ? "border-b border-zinc-100 dark:border-zinc-800" : ""}`}
          >
            <div className="text-xs text-zinc-500 dark:text-zinc-400">
              <time data-changelog-date>{entry.date}</time>
            </div>
            <article>
              <span data-changelog-tag={entry.tag} className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-medium ${TONE_STYLES[entry.tone ?? "sky"]}`}>
                {entry.tag}
              </span>
              <h3 data-changelog-entry-title className="mt-1.5 text-base font-semibold text-zinc-900 dark:text-zinc-50">{entry.title}</h3>
              <p data-changelog-entry-body className="mt-1 text-sm leading-6 text-zinc-600 dark:text-zinc-300">{entry.body}</p>
              <div data-changelog-meta className="mt-2 flex items-center gap-3 text-xs text-zinc-400 dark:text-zinc-500">
                <span data-changelog-likes={entry.likes ?? 0} className="inline-flex items-center gap-1">♡ {entry.likes ?? 0}</span>
                <span data-changelog-views={entry.views ?? 0} className="inline-flex items-center gap-1">👁 {entry.views ?? 0}</span>
                <span className="inline-flex items-center gap-1" aria-hidden="true">🔗 Share</span>
              </div>
            </article>
          </li>
        ))}
      </ol>
    </div>
  );
}
