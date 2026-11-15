import React from "react";

export interface ComparisonPlan {
  id: string;
  name: string;
  highlighted?: boolean;
}

export interface ComparisonValue {
  // true = check, false = empty, string = check with note (e.g. "G Suite + SAML")
  value: boolean | string;
}

export interface ComparisonSection {
  id: string;
  title: string;
  rows: { id: string; label: string; values: ComparisonValue[] }[];
}

export interface PlanComparisonTableProps {
  plans: ComparisonPlan[];
  sections: ComparisonSection[];
  onSelect?: (planId: string) => void;
  ctaText?: string;
  className?: string;
}

const CHECK_SVG = (
  <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden="true">
    <path d="M10 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16Zm-1.2-5.4 5-5-1.13-1.13L8.8 10.34 7.33 8.87 6.2 10l2.6 2.6Z" />
  </svg>
);

const MINUS_SVG = (
  <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 text-zinc-300 dark:text-zinc-700" aria-hidden="true">
    <path d="M10 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16ZM6.5 9.25h7v1.5h-7v-1.5Z" />
  </svg>
);

/**
 * PlanComparisonTable - Linear/Sprig style feature-comparison matrix with grouped
 * section headers and per-cell check / note values across plan columns.
 */
export default function PlanComparisonTable({
  plans,
  sections,
  onSelect,
  ctaText = "Choose plan",
  className = "",
}: PlanComparisonTableProps) {
  return (
    <div data-plan-comparison className={`overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800 ${className}`}>
      {/* header row */}
      <div className="grid" style={{ gridTemplateColumns: `minmax(180px, 1.4fr) repeat(${plans.length}, minmax(120px, 1fr))` }}>
        <div className="border-b border-zinc-200 px-4 py-3 text-sm font-semibold text-zinc-900 dark:border-zinc-800 dark:text-zinc-50" />
        {plans.map((plan) => (
          <div
            key={plan.id}
            data-comparison-plan={plan.id}
            className={`border-b border-zinc-200 px-4 py-3 dark:border-zinc-800 ${plan.highlighted ? "bg-indigo-50/60 dark:bg-indigo-950/40" : ""}`}
          >
            <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{plan.name}</span>
          </div>
        ))}
      </div>
      {sections.map((section) => (
        <div key={section.id}>
          <div
            data-comparison-section={section.id}
            className="bg-zinc-900 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-zinc-50 dark:bg-zinc-800"
          >
            {section.title}
          </div>
          {section.rows.map((row) => (
            <div
              key={row.id}
              data-comparison-row={row.id}
              className="grid border-b border-zinc-100 last:border-b-0 dark:border-zinc-800/60"
              style={{ gridTemplateColumns: `minmax(180px, 1.4fr) repeat(${plans.length}, minmax(120px, 1fr))` }}
            >
              <div className="px-4 py-2.5 text-sm text-zinc-700 dark:text-zinc-300">{row.label}</div>
              {plans.map((plan) => {
                const cell = row.values[plans.indexOf(plan)] || { value: false };
                const idx = plans.findIndex((p) => p.id === plan.id);
                const v = row.values[idx]?.value ?? false;
                return (
                  <div
                    key={plan.id}
                    className={`flex items-center gap-2 px-4 py-2.5 ${plan.highlighted ? "bg-indigo-50/60 dark:bg-indigo-950/40" : ""}`}
                  >
                    {v === true ? (
                      <span data-comparison-check className="text-indigo-600 dark:text-indigo-400">{CHECK_SVG}</span>
                    ) : v === false ? (
                      <span data-comparison-empty>{MINUS_SVG}</span>
                    ) : (
                      <>
                        <span data-comparison-check className="text-indigo-600 dark:text-indigo-400">{CHECK_SVG}</span>
                        <span data-comparison-note className="text-xs text-zinc-600 dark:text-zinc-400">{v}</span>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      ))}
      {/* footer CTA row */}
      <div className="grid border-t border-zinc-200 dark:border-zinc-800" style={{ gridTemplateColumns: `minmax(180px, 1.4fr) repeat(${plans.length}, minmax(120px, 1fr))` }}>
        <div className="px-4 py-3" />
        {plans.map((plan) => (
          <div key={plan.id} className={`px-4 py-3 ${plan.highlighted ? "bg-indigo-50/60 dark:bg-indigo-950/40" : ""}`}>
            <button
              type="button"
              data-comparison-cta={plan.id}
              onClick={() => onSelect?.(plan.id)}
              className={`w-full rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
                plan.highlighted
                  ? "bg-indigo-600 text-white hover:bg-indigo-500"
                  : "border border-zinc-300 text-zinc-700 hover:border-zinc-400 dark:border-zinc-700 dark:text-zinc-200 dark:hover:border-zinc-600"
              }`}
            >
              {ctaText}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
