/**
 * NoResultsState - Search no-results empty state: illustration slot, the
 * original query in quotes, suggestion chips that re-run the search and a
 * clear-filters ghost action (search zero-results pattern).
 */
import React from "react";

export interface NoResultsStateProps {
  query?: string;
  suggestions?: string[];
  clearLabel?: string;
  didYouMeanLabel?: string;
  children?: React.ReactNode;
  className?: string;
  onSuggestion?: (suggestion: string) => void;
  onClearFilters?: () => void;
}

export const NoResultsState: React.FC<NoResultsStateProps> = ({
  query = "",
  suggestions = [],
  clearLabel = "Clear all filters",
  didYouMeanLabel = "Did you mean",
  children,
  className = "",
  onSuggestion,
  onClearFilters,
}) => {
  const list = Array.isArray(suggestions) ? suggestions : [];

  return (
    <div data-noresults-state className={`flex w-full flex-col items-center justify-center gap-4 rounded-xl border border-zinc-200 bg-white px-6 py-14 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900 ${className}`}>
      {children || (
        <div data-noresults-illustration aria-hidden="true" className="flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-100 text-3xl dark:bg-zinc-800">🔍</div>
      )}
      <div className="space-y-1.5">
        <p data-noresults-title className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
          No results for {query ? <span data-noresults-query className="font-mono text-zinc-700 dark:text-zinc-200">“{query}”</span> : null}
        </p>
        <p data-noresults-description className="mx-auto max-w-md text-sm leading-5 text-zinc-500 dark:text-zinc-400">Try a different keyword or remove some filters to widen your search.</p>
      </div>
      {list.length ? (
        <div data-noresults-suggestions className="flex flex-wrap items-center justify-center gap-2">
          <span className="text-xs text-zinc-400 dark:text-zinc-500">{didYouMeanLabel}</span>
          {list.map((s) => (
            <button
              key={s}
              type="button"
              data-noresults-suggestion={s}
              onClick={() => onSuggestion?.(s)}
              className="rounded-full border border-zinc-200 px-3 py-1 text-xs font-medium text-zinc-600 transition-colors hover:border-violet-300 hover:text-violet-600 dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-violet-700 dark:hover:text-violet-400"
            >
              {s}
            </button>
          ))}
        </div>
      ) : null}
      <button type="button" data-noresults-clear onClick={() => onClearFilters?.()} className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800">{clearLabel}</button>
    </div>
  );
};

export default NoResultsState;
