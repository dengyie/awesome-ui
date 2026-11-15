import React from "react";

export interface HealthDonutSlice {
  label: string;
  value: number;
  tone: "indigo" | "amber" | "zinc" | "emerald" | "rose";
}

export interface HealthDonutStatsProps {
  cards: {
    title: string;
    caption?: string;
    slices: HealthDonutSlice[];
    action?: { label: string; onClick?: () => void };
  }[];
  className?: string;
}

const TONE_SLICE: Record<NonNullable<HealthDonutSlice["tone"]>, string> = {
  indigo: "bg-indigo-500",
  amber: "bg-amber-400",
  zinc: "bg-zinc-300 dark:bg-zinc-700",
  emerald: "bg-emerald-500",
  rose: "bg-rose-500",
};

const TONE_DOT: Record<NonNullable<HealthDonutSlice["tone"]>, string> = {
  indigo: "bg-indigo-500",
  amber: "bg-amber-400",
  zinc: "bg-zinc-300 dark:bg-zinc-700",
  emerald: "bg-emerald-500",
  rose: "bg-rose-500",
};

const donutStyle = (slices: HealthDonutSlice[]): React.CSSProperties => {
  const total = slices.reduce((sum, slice) => sum + Math.max(0, slice.value), 0) || 1;
  let cursor = 0;
  const stops: string[] = [];
  slices.forEach((slice) => {
    const start = (cursor / total) * 360;
    cursor += Math.max(0, slice.value);
    const end = (cursor / total) * 360;
    stops.push(`${TONE_SLICE[slice.tone].split(" ")[0]} ${start}deg ${end}deg`);
  });
  return { background: `conic-gradient(${stops.join(", ")})` };
};

export const HealthDonutStats: React.FC<HealthDonutStatsProps> = ({ cards, className = "" }) => {
  if (!cards.length) return null;
  return (
    <div
      data-health-donut-stats
      className={`grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 ${className}`}
    >
      {cards.map((card, index) => {
        const total = card.slices.reduce((sum, slice) => sum + Math.max(0, slice.value), 0);
        const primary = card.slices.reduce(
          (best, slice) => (slice.value > best.value ? slice : best),
          card.slices[0] || { label: "", value: 0, tone: "indigo" as const },
        );
        const percent = total ? Math.round((primary.value / total) * 100) : 0;
        return (
          <div
            key={`${card.title}-${index}`}
            data-donut-card={index}
            className="flex flex-col gap-4 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
          >
            <div className="flex items-center gap-4">
              <div className="relative h-16 w-16 shrink-0">
                <div className="h-16 w-16 rounded-full" style={donutStyle(card.slices)} />
                <div className="absolute inset-[10px] flex items-center justify-center rounded-full bg-white dark:bg-zinc-900">
                  <span className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-50" data-donut-center>
                    {percent}%
                  </span>
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-zinc-800 dark:text-zinc-200">{card.title}</p>
                {card.caption ? <p className="mt-0.5 text-[10px] text-zinc-400">{card.caption}</p> : null}
                <ul className="mt-2 space-y-1">
                  {card.slices.map((slice, sliceIndex) => {
                    const share = total ? Math.round((slice.value / total) * 100) : 0;
                    return (
                      <li key={`${slice.label}-${sliceIndex}`} className="flex items-center gap-1.5 text-[11px] text-zinc-600 dark:text-zinc-300">
                        <span className={`h-2 w-2 shrink-0 rounded-full ${TONE_DOT[slice.tone]}`} />
                        <span className="min-w-0 flex-1 truncate">{slice.label}</span>
                        <span className="shrink-0 font-medium tabular-nums">{share}%</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
            {card.action ? (
              <button
                type="button"
                data-donut-action
                onClick={card.action.onClick}
                className="w-full rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
              >
                {card.action.label}
              </button>
            ) : null}
          </div>
        );
      })}
    </div>
  );
};

export default HealthDonutStats;
