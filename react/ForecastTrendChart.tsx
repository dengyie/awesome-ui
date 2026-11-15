import React from "react";
import { UiIcon } from "./UiIcon";

export interface ForecastPoint {
  label: string;
  value: number;
  /** true renders the dashed/striped forecast column instead of the solid actual bar. */
  forecast?: boolean;
}

export interface ForecastTrendChartProps {
  headline: string | number;
  deltaLabel?: string;
  deltaTone?: "emerald" | "rose" | "zinc";
  note?: string;
  points: ForecastPoint[];
  unit?: string;
  className?: string;
}

const TONE_TEXT: Record<NonNullable<ForecastTrendChartProps["deltaTone"]>, string> = {
  emerald: "text-emerald-600",
  rose: "text-rose-600",
  zinc: "text-zinc-400",
};

export const ForecastTrendChart: React.FC<ForecastTrendChartProps> = ({
  headline,
  deltaLabel,
  deltaTone = "emerald",
  note,
  points,
  unit,
  className = "",
}) => {
  const max = Math.max(...points.map((point) => point.value), 0.0001);
  const deltaIcon = deltaTone === "emerald" ? "trending-up" : deltaTone === "rose" ? "trending-down" : "minus";
  return (
    <div
      data-forecast-trend
      className={`rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 ${className}`}
    >
      <div className="flex flex-wrap items-baseline gap-2">
        <p className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          {headline}
          {unit ? <span className="ml-1 text-sm font-medium text-zinc-400">{unit}</span> : null}
        </p>
        {deltaLabel ? (
          <span className={`flex items-center gap-0.5 text-xs font-semibold ${TONE_TEXT[deltaTone]}`}>
            <UiIcon name={deltaIcon} size={12} />
            {deltaLabel}
          </span>
        ) : null}
      </div>
      {note ? <p className="mt-0.5 text-xs text-zinc-400">{note}</p> : null}
      <div className="mt-4 flex h-28 items-end gap-1" role="img" aria-label="Trend with forecast">
        {points.map((point, index) => {
          const height = Math.max(4, Math.round((point.value / max) * 100));
          return (
            <div key={`${point.label}-${index}`} data-point-index={index} className="flex min-w-0 flex-1 flex-col items-center gap-1">
              <div className="relative flex h-full w-full items-end justify-center">
                {point.forecast ? (
                  <div
                    className="w-full max-w-6 rounded-md border-2 border-dashed border-sky-400 bg-sky-100/50 dark:border-sky-500 dark:bg-sky-900/40"
                    style={{ height: `${height}%` }}
                    title={`${point.label}: ${point.value}${unit ?? ""} (forecast)`}
                  />
                ) : (
                  <div
                    className="w-full max-w-6 rounded-md bg-sky-500 transition-all duration-300 dark:bg-sky-400"
                    style={{ height: `${height}%` }}
                    title={`${point.label}: ${point.value}${unit ?? ""}`}
                  />
                )}
              </div>
              <span className="truncate text-[9px] text-zinc-400">{point.label}</span>
            </div>
          );
        })}
      </div>
      <div className="mt-3 flex items-center gap-4 border-t border-zinc-100 pt-3 text-[10px] text-zinc-400 dark:border-zinc-800">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-sky-500" /> Actual
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm border border-dashed border-sky-400 bg-sky-100/50" /> Forecast
        </span>
      </div>
    </div>
  );
};

export default ForecastTrendChart;
