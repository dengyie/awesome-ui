/**
 * SearchResultsPage - Knowledge-base search results page: filter bar with
 * dropdown selects, "Related searches" chip grid, result entries with icon,
 * title, breadcrumb meta and summary snippet, sticky top search header
 * (Confluence search pattern).
 */
import React from "react";

export interface SearchResultEntry {
  id: string;
  title: string;
  space: string;
  type: string;
  author: string;
  updated: string;
  snippet: string;
}

export interface SearchResultsPageProps {
  query?: string;
  filterSelects?: { id: string; label: string; options?: string[] }[];
  relatedSearches?: string[];
  results?: SearchResultEntry[];
  className?: string;
  onSearchSubmit?: (query: string) => void;
  onFilterChange?: (id: string, value: string) => void;
  onRelatedClick?: (term: string) => void;
  onResultClick?: (entry: SearchResultEntry) => void;
}

export default function SearchResultsPage({
  query = "brainstorming",
  filterSelects = [
    { id: "updated", label: "Last updated", options: ["Last updated", "Created", "Relevance"] },
    { id: "type", label: "Type", options: ["Type", "Page", "Blog", "File"] },
    { id: "contributor", label: "Contributor", options: ["Contributor", "Anyone", "Me"] },
  ],
  relatedSearches = ["brainstorming techniques", "brainstorming ideas", "brainstorming strategies", "brainstorming sessions", "brainstorming methods", "brainstorming activities"],
  results = [
    {
      id: "s1",
      title: "Design",
      space: "Confluence",
      type: "Page",
      author: "Design",
      updated: "Updated 8 days ago",
      snippet: "…Welcome to your design team space! You're in the space overview. It's what visitors first see, like a landing page for your space · Click ✏️ Edit to customize your overview · A space contains pages. Create…",
    },
    {
      id: "s2",
      title: "Sam Design Guideline Document",
      space: "Confluence",
      type: "Page",
      author: "Sam Lee",
      updated: "Updated 21 hours ago",
      snippet: "…Purpose · This document ensures visual consistency, usability, and brand alignment across all NimbusTech products and platforms. · Typography · Primary Font: Inter · Headings: Bold, sentence case · Body Text:…",
    },
    {
      id: "s3",
      title: "Template - How-to guide",
      space: "Confluence",
      type: "Page",
      author: "Sam Lee",
      updated: "Updated 23 hours ago",
      snippet: "…Instructions · Highlight important information in a panel like this one. To edit this panel's color or style, select one of the options in the menu. · Related articles…",
    },
    {
      id: "s4",
      title: "Template - Design Systems",
      space: "Confluence",
      type: "Page",
      author: "Design",
      updated: "Updated 8 days ago",
      snippet: "…This template is brought to you by InVision, a digital product design platform. · Design · Getting started · Design principles · Principle one · Principle two · Principle three · Visual language · Color…",
    },
    {
      id: "s5",
      title: "Overview",
      space: "Confluence",
      type: "Page",
      author: "John Smith",
      updated: "Updated 8 days ago",
      snippet: "…Use this overview to onboard new teammates: mission, current projects, rituals and links to the most-used templates and guidelines…",
    },
  ],
  className = "",
  onSearchSubmit,
  onFilterChange,
  onRelatedClick,
  onResultClick,
}: SearchResultsPageProps) {
  const [term, setTerm] = React.useState(query);
  const [picked, setPicked] = React.useState<Record<string, string>>(() => Object.fromEntries(filterSelects.map((f) => [f.id, f.label])));

  return (
    <div data-srchres className={`w-full rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 ${className}`}>
      {/* top search bar */}
      <div data-srchres-topbar className="flex items-center gap-3 border-b border-zinc-200 px-5 py-3 dark:border-zinc-800">
        <div className="flex flex-1 items-center gap-2 rounded-lg border border-zinc-300 px-3 py-1.5 focus-within:ring-2 focus-within:ring-blue-500/40 dark:border-zinc-600">
          <span aria-hidden="true" className="text-zinc-400">⌕</span>
          <input
            data-srchres-input
            type="text"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") onSearchSubmit?.(term);
            }}
            className="w-full bg-transparent text-sm text-zinc-800 outline-none dark:text-zinc-100"
            aria-label="Search"
          />
        </div>
        <button
          data-srchres-submit
          type="button"
          onClick={() => onSearchSubmit?.(term)}
          className="rounded-lg bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-blue-700"
        >
          Search
        </button>
      </div>

      {/* filter selects */}
      <div data-srchres-filters className="flex flex-wrap items-center gap-2 border-b border-zinc-200 px-5 py-3 dark:border-zinc-800">
        {filterSelects.map((f) => (
          <select
            key={f.id}
            data-srchres-filter={f.id}
            value={picked[f.id] ?? f.label}
            onChange={(e) => {
              setPicked((p) => ({ ...p, [f.id]: e.target.value }));
              onFilterChange?.(f.id, e.target.value);
            }}
            className="rounded-lg border border-zinc-300 bg-white px-2.5 py-1.5 text-xs font-medium text-zinc-600 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
          >
            {(f.options ?? [f.label]).map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        ))}
        <span className="ml-auto text-xs text-zinc-400 dark:text-zinc-500">{results.length} results</span>
      </div>

      <div className="px-5 py-4">
        {/* related searches chips */}
        <p data-srchres-related-heading className="text-sm font-bold text-zinc-900 dark:text-zinc-50">Related searches</p>
        <div data-srchres-related className="mt-3 grid gap-2 sm:grid-cols-2">
          {relatedSearches.map((rs) => (
            <button
              key={rs}
              data-srchres-related-chip={rs}
              type="button"
              onClick={() => onRelatedClick?.(rs)}
              className="flex items-center gap-2 rounded-full bg-zinc-100 px-4 py-2 text-left text-sm text-zinc-700 transition-colors hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
            >
              <span aria-hidden="true" className="text-zinc-400">⌕</span>
              <span className="truncate">{rs}</span>
            </button>
          ))}
        </div>

        {/* results */}
        <div data-srchres-results className="mt-6 space-y-6">
          {results.map((r) => (
            <article key={r.id} data-srchres-result={r.id} className="group">
              <button type="button" onClick={() => onResultClick?.(r)} className="block w-full text-left">
                <h3 data-srchres-result-title={r.id} className="text-base font-semibold text-blue-600 group-hover:underline dark:text-blue-400">
                  {r.title}
                </h3>
              </button>
              <p className="mt-1 flex flex-wrap items-center gap-x-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                <span data-srchres-result-space={r.id} className="font-medium">{r.space}</span>
                <span aria-hidden="true">•</span>
                <span>{r.type}</span>
                <span aria-hidden="true">•</span>
                <span>{r.author}</span>
                <span aria-hidden="true">•</span>
                <span>{r.updated}</span>
              </p>
              <p className="mt-1.5 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">{r.snippet}</p>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
