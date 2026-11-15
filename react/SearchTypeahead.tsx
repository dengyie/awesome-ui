import React from "react";
export interface TypeaheadSuggestion {
  label: string;
  type?: string;
  meta?: string;
  icon?: string;
}

export interface TypeaheadResult {
  title: string;
  badge?: string;
}

export interface SearchTypeaheadProps {
  query?: string;
  placeholder?: string;
  suggestions?: TypeaheadSuggestion[];
  results?: TypeaheadResult[];
  resultsHeading?: string;
  footerHint?: string;
  highlight?: string;
  onSelect?: (label: string) => void;
  onSubmit?: (query: string) => void;
}

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * SearchTypeahead - page-level search with match highlighting, type badges and grouped results.
 */
export default function SearchTypeahead({
  query = "",
  placeholder = "Search…",
  suggestions = [],
  results = [],
  resultsHeading = "Top results",
  footerHint,
  highlight = "",
  onSelect,
  onSubmit,
}: SearchTypeaheadProps) {
  const markMatches = (label: string) => {
    if (!highlight.trim()) return label;
    const parts = label.split(new RegExp(`(${escapeRegExp(highlight.trim())})`, "ig"));
    return parts.map((part, i) =>
      part.toLowerCase() === highlight.trim().toLowerCase() ? (
        <mark key={i} className="rounded-sm bg-yellow-200 px-0.5 text-zinc-900 dark:bg-yellow-400/70">
          {part}
        </mark>
      ) : (
        part
      ),
    );
  };

  return (
    <div className="w-full" data-search-typeahead>
      <div className="flex items-center gap-3 border-b border-zinc-200 pb-3 dark:border-zinc-700">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5 shrink-0 text-zinc-400">
          <circle cx="11" cy="11" r="7" />
          <path d="m21 21-4-4" />
        </svg>
        <input
          type="text"
          value={query}
          placeholder={placeholder}
          data-typeahead-input
          onChange={(event) => onSubmit?.(event.target.value)}
          className="w-full bg-transparent text-2xl font-semibold text-zinc-900 placeholder:text-zinc-300 focus-visible:outline-none dark:text-zinc-50 dark:placeholder:text-zinc-600"
        />
        {query ? (
          <button type="button" data-typeahead-clear aria-label="Clear search" onClick={() => onSubmit?.("")} className="rounded-md p-1 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        ) : null}
      </div>

      {suggestions.length ? (
        <ul className="mt-3 space-y-1" data-typeahead-suggestions>
          {suggestions.map((suggestion, index) => (
            <li key={index}>
              <button
                type="button"
                data-typeahead-suggestion={index}
                onClick={() => onSelect?.(suggestion.label)}
                className="flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left text-sm text-zinc-700 transition-colors hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:text-zinc-200 dark:hover:bg-zinc-800"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5 shrink-0 text-zinc-400">
                  <circle cx="11" cy="11" r="7" />
                  <path d="m21 21-4-4" />
                </svg>
                <span className="min-w-0 truncate">{markMatches(suggestion.label)}</span>
                {suggestion.type ? (
                  <span className="ml-auto shrink-0 rounded-md border border-zinc-300 px-1.5 py-0.5 font-mono text-[10px] font-medium text-zinc-500 dark:border-zinc-600 dark:text-zinc-400">
                    {suggestion.type}
                  </span>
                ) : null}
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      {results.length ? (
        <div className="mt-5" data-typeahead-results>
          <p className="text-sm font-bold text-zinc-900 dark:text-zinc-50">{resultsHeading}</p>
          <ul className="mt-2 divide-y divide-zinc-100 dark:divide-zinc-800">
            {results.map((result, index) => (
              <li key={index} className="flex items-center gap-3 py-2.5">
                <button
                  type="button"
                  data-typeahead-result={index}
                  onClick={() => onSelect?.(result.title)}
                  className="min-w-0 flex-1 truncate text-left text-sm font-medium text-zinc-800 transition-colors hover:text-indigo-600 focus-visible:outline-none dark:text-zinc-100 dark:hover:text-indigo-400"
                >
                  {markMatches(result.title)}
                </button>
                {result.badge ? (
                  <span className="shrink-0 rounded-md border border-zinc-300 px-1.5 py-0.5 font-mono text-[10px] font-medium text-zinc-500 dark:border-zinc-600 dark:text-zinc-400">
                    {result.badge}
                  </span>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {footerHint ? (
        <div className="mt-4 flex items-center justify-between border-t border-zinc-200 pt-3 text-xs text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
          <span>{footerHint}</span>
          <a href="#" className="font-medium text-indigo-600 hover:underline dark:text-indigo-400" data-typeahead-help>
            Help Center
          </a>
        </div>
      ) : null}
    </div>
  );
}
