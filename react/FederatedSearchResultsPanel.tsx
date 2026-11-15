import React from "react";

export interface FederatedResult {
  id: string;
  title: string;
  icon?: string;
  subtitle?: string;
  snippet: string;
  source?: string;
}

export interface FederatedSearchResultsPanelProps {
  query?: string;
  results: FederatedResult[];
  sourceFilters?: { id: string; label: string }[];
  selectedSources?: string[];
  searchPlaceholder?: string;
  showKeyboardLegend?: boolean;
  askAiLabel?: string;
  onQueryChange?: (query: string) => void;
  onSourceChange?: (ids: string[]) => void;
  onResultSelect?: (result: FederatedResult) => void;
}

const LEGEND = "↑↓ Navigate · ⏎ Select · ESC Close · ⇧⏎ Open in new tab";

/**
 * FederatedSearchResultsPanel - full-text search overlay with source filter chips, snippet results and a keyboard legend.
 */
export default function FederatedSearchResultsPanel({
  query = "",
  results,
  sourceFilters = [],
  selectedSources = [],
  searchPlaceholder = "Search everything…",
  showKeyboardLegend = true,
  askAiLabel = "Press Tab to Ask AI",
  onQueryChange,
  onSourceChange,
  onResultSelect,
}: FederatedSearchResultsPanelProps) {
  const [term, setTerm] = React.useState(query);
  const [scopes, setScopes] = React.useState<Set<string>>(() => new Set(selectedSources));

  React.useEffect(() => setTerm(query), [query]);

  const highlight = (snippet: string) => {
    if (!term.trim()) return snippet;
    const parts = snippet.split(new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi"));
    return parts.map((part, index) =>
      part.toLowerCase() === term.toLowerCase() ? (
        <mark key={index} className="rounded-sm bg-yellow-200 px-0.5 font-medium text-zinc-900 dark:bg-yellow-400/70">{part}</mark>
      ) : (
        <React.Fragment key={index}>{part}</React.Fragment>
      ),
    );
  };

  const toggleSource = (id: string) => {
    setScopes((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      onSourceChange?.([...next]);
      return next;
    });
  };

  const filtered = scopes.size
    ? results.filter((result) => !result.source || scopes.has(result.source))
    : results;

  return (
    <div data-federated-search className="w-full overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
      <div className="border-b border-zinc-100 p-3 dark:border-zinc-800">
        <div className="relative">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400">
            <circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" />
          </svg>
          <input
            type="text"
            value={term}
            data-federated-input
            placeholder={searchPlaceholder}
            onChange={(event) => { setTerm(event.target.value); onQueryChange?.(event.target.value); }}
            className="w-full rounded-lg border border-zinc-200 bg-zinc-50 py-2 pl-9 pr-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
          />
        </div>
        {sourceFilters.length ? (
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            {sourceFilters.map((filter) => {
              const active = scopes.has(filter.id);
              return (
                <button
                  key={filter.id}
                  type="button"
                  data-source-chip={filter.id}
                  aria-pressed={active}
                  onClick={() => toggleSource(filter.id)}
                  className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                    active
                      ? "border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300"
                      : "border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
                  }`}
                >
                  {filter.label}
                </button>
              );
            })}
          </div>
        ) : null}
      </div>
      <ul className="max-h-80 overflow-y-auto p-2">
        {filtered.length === 0 ? (
          <li data-federated-empty className="px-3 py-6 text-center text-xs text-zinc-400 dark:text-zinc-500">No results match your filters.</li>
        ) : (
          filtered.map((result) => (
            <li key={result.id}>
              <button
                type="button"
                data-federated-result={result.id}
                onClick={() => onResultSelect?.(result)}
                className="w-full rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:hover:bg-zinc-800/60"
              >
                <span className="flex items-center gap-2">
                  {result.icon ? <span aria-hidden="true">{result.icon}</span> : null}
                  <span className="min-w-0 flex-1 truncate text-sm font-semibold text-zinc-900 dark:text-zinc-50">{result.title}</span>
                  {result.source ? <span className="shrink-0 rounded bg-zinc-100 px-1.5 py-0.5 text-[10px] font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">{result.source}</span> : null}
                </span>
                {result.subtitle ? <span className="mt-0.5 block text-[11px] text-zinc-400 dark:text-zinc-500">{result.subtitle}</span> : null}
                <span className="mt-1 block text-xs leading-5 text-zinc-600 dark:text-zinc-300">{highlight(result.snippet)}</span>
              </button>
            </li>
          ))
        )}
      </ul>
      {showKeyboardLegend ? (
        <div className="flex items-center justify-between border-t border-zinc-100 bg-zinc-50 px-3 py-2 dark:border-zinc-800 dark:bg-zinc-800/60">
          <p data-federated-legend className="text-[11px] text-zinc-500 dark:text-zinc-400">{LEGEND}</p>
          {askAiLabel ? (
            <span className="rounded-full bg-zinc-900 px-2.5 py-1 text-[11px] font-semibold text-white dark:bg-zinc-100 dark:text-zinc-900">{askAiLabel}</span>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
