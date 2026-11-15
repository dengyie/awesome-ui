import React from "react";

export interface QuoteCard {
  quote: string;
  name: string;
  role?: string;
  company?: string;
  /** Shows a decorative quote mark above the text when true (default true). */
  marked?: boolean;
}

export interface QuoteMasonryProps {
  quotes: QuoteCard[];
  columns?: 2 | 3 | 4;
  className?: string;
}

export const QuoteMasonry: React.FC<QuoteMasonryProps> = ({ quotes, columns = 3, className = "" }) => {
  if (!quotes.length) return null;
  const columnClass = { 2: "sm:columns-2", 3: "sm:columns-2 lg:columns-3", 4: "sm:columns-2 lg:columns-4" }[columns];
  return (
    <div
      data-quote-masonry
      className={`gap-4 ${columnClass} columns-1 [column-fill:balance] ${className}`}
    >
      {quotes.map((card, index) => (
        <figure
          key={`${card.name}-${index}`}
          data-quote-index={index}
          className="mb-4 break-inside-avoid rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900"
        >
          {card.marked !== false ? (
            <span aria-hidden="true" className="block text-3xl font-black leading-none text-zinc-200 dark:text-zinc-700">
              &ldquo;
            </span>
          ) : null}
          <blockquote
            className={`text-sm leading-relaxed text-zinc-700 dark:text-zinc-200 ${card.marked !== false ? "-mt-2" : ""}`}
          >
            {card.quote}
          </blockquote>
          <figcaption className="mt-4 flex items-end justify-between gap-3 border-t border-zinc-100 pt-3 dark:border-zinc-800">
            <span className="min-w-0">
              <span className="block truncate text-xs font-semibold uppercase tracking-wide text-zinc-900 dark:text-zinc-50">
                {card.name}
              </span>
              {card.role || card.company ? (
                <span className="mt-0.5 block truncate text-[11px] text-zinc-400">
                  {[card.role, card.company].filter(Boolean).join(" · ")}
                </span>
              ) : null}
            </span>
            {card.company ? (
              <span className="shrink-0 rounded-md bg-zinc-100 px-2 py-1 font-mono text-[10px] font-bold uppercase text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                {card.company}
              </span>
            ) : null}
          </figcaption>
        </figure>
      ))}
    </div>
  );
};

export default QuoteMasonry;
