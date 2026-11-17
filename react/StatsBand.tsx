/**
 * StatsBand - Marketing metrics band: 3-4 column big-number stats with
 * labels and optional trend footnotes in a single band section
 * (landing page social proof numbers pattern).
 */
import React from "react";

export interface StatItem {
  value: string;
  label: string;
  note?: string;
}

export interface StatsBandProps {
  stats?: StatItem[];
  className?: string;
}

const DEFAULT_STATS: StatItem[] = [
  { value: "221+", label: "Production components", note: "React / Vue / Vanilla" },
  { value: "732", label: "Regression tests", note: "jsdom + SSR + compile" },
  { value: "664", label: "Source files", note: "Single-file, copy-paste" },
  { value: "3.5k", label: "Reference screens", note: "Mobbin-curated patterns" },
];

const columnsFor = (count: number) => {
  if (count >= 4) return "sm:grid-cols-4";
  if (count === 3) return "sm:grid-cols-3";
  if (count === 2) return "sm:grid-cols-2";
  return "";
};

export const StatsBand: React.FC<StatsBandProps> = ({
  stats = DEFAULT_STATS,
  className = "",
}) => {
  const list = Array.isArray(stats) ? stats : [];

  return (
    <div data-stats-band className={`w-full rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900 ${className}`}>
      <div data-stats-grid className={`grid grid-cols-1 divide-y divide-zinc-100 dark:divide-zinc-800 ${columnsFor(list.length)} sm:divide-x sm:divide-y-0`}>
        {list.map((stat, index) => (
          <div key={index} data-stats-cell={index} className="flex flex-col items-center gap-1 px-4 py-3 text-center">
            <span data-stats-value={stat.value} className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">{stat.value}</span>
            <span data-stats-label={stat.label} className="text-sm font-medium text-zinc-600 dark:text-zinc-300">{stat.label}</span>
            {stat.note ? <p data-stats-note={index} className="mt-1 text-[11px] font-medium text-zinc-400 dark:text-zinc-500">{stat.note}</p> : null}
          </div>
        ))}
      </div>
    </div>
  );
};

export default StatsBand;
