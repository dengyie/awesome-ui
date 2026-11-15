import React from "react";
import { UiIcon } from "./UiIcon";

export interface SegmentBreakdownItem {
  label: string;
  value: number;
  unit?: string;
  delta?: number;
  deltaUnit?: string;
  tone?: "indigo" | "emerald" | "amber" | "sky" | "rose";
}

export interface SegmentBreakdownBarsProps {
  headline: string | number;
  headlineUnit?: string;
  caption?: string;
  items: SegmentBreakdownItem[];
  unit?: string;
  className?: string;
}

const TONE_BAR: Record<NonNullable<SegmentBreakdownItem["tone"]>, string> = {
  indigo: "bg-indigo-500",
  emerald: "bg-emerald-500",
  amber: "bg-amber-400",
  sky: "bg-sky-500",
  rose: "bg-rose-500",
};

export const SegmentBreakdownBars: React.FC<SegmentBreakdownBarsProps> = ({
  headline,
  headlineUnit = "%",
  caption,
  items,
  unit,
  className = "",
}) => {
  const total = Math.round(items.reduce((sum, item) => sum + Math.max(0, item.value), 0) * 100) / 100 || 1;
  const max = Math.max(...items.map((item) => Math.max(0, item.value)), 0.0001);
  return (
    <div
      data-segment-breakdown
      role="table"
      className={`rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 ${className}`}
    >
      <p className="border-l-2 border-zinc-900 pl-2 text-2xl font-semibold tracking-tight text-zinc-900 dark:border-zinc-50 dark:text-zinc-50">
        {headline}
        <span className="ml-1 text-sm font-medium text-zinc-400">{headlineUnit}</span>
      </p>
      {caption ? <p className="mt-1 pl-3 text-xs text-zinc-400">{caption}</p> : null}
      <div className="mt-4 space-y-3">
        {items.map((item, index) => {
          const share = Math.max(0, item.value);
          const width = Math.min(100, Math.round((share / max) * 100));
          const tone = TONE_BAR[item.tone || "indigo"];
          return (
            <div key={`${item.label}-${index}`} role="row" data-segment-index={index} className="flex items-center gap-3">
              <span className="w-28 shrink-0 truncate text-xs font-medium text-zinc-600 dark:text-zinc-300">{item.label}</span>
              <span className="relative h-2.5 min-w-0 flex-1 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                <span
                  data-segment-bar
                  className={`absolute inset-y-0 left-0 rounded-full transition-all duration-300 ${tone}`}
                  style={{ width: `${width}%` }}
                />
              </span>
              <span className="w-14 shrink-0 text-right text-xs font-semibold tabular-nums text-zinc-900 dark:text-zinc-50">
                {share}
                {item.unit ?? unit ?? ""}
              </span>
              {item.delta !== undefined ? (
                <span
                  className={`w-16 shrink-0 text-right text-xs font-medium tabular-nums ${
                    item.delta > 0 ? "text-emerald-600" : item.delta < 0 ? "text-rose-600" : "text-zinc-400"
                  }`}
                >
                  {item.delta > 0 ? "+" : ""}
                  {item.delta}
                  {item.deltaUnit ?? "pp"}
                </span>
              ) : (
                <span className="w-16 shrink-0" />
              )}
            </div>
          );
        })}
      </div>
      <p className="mt-4 border-t border-zinc-100 pt-3 text-[10px] text-zinc-400 dark:border-zinc-800">
        Share of {total}
        {unit ?? ""} across {items.length} segments
      </p>
    </div>
  );
};

export default SegmentBreakdownBars;
