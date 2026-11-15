import React from "react";
import { UiIcon, type UiIconName } from "./UiIcon";

export interface MetricStripItem {
  label: string;
  value: string | number;
  delta?: number;
  deltaLabel?: string;
  icon?: UiIconName;
}

export interface MetricStripProps {
  metrics: MetricStripItem[];
  activeIndex?: number;
  onMetricClick?: (index: number, metric: MetricStripItem) => void;
  className?: string;
}

const toneOf = (delta: number | undefined) => {
  if (delta === undefined) return "text-zinc-400";
  return delta > 0 ? "text-emerald-600" : delta < 0 ? "text-rose-600" : "text-zinc-400";
};

export const MetricStrip: React.FC<MetricStripProps> = ({
  metrics,
  activeIndex,
  onMetricClick,
  className = "",
}) => {
  if (!metrics.length) return null;
  return (
    <div
      role="group"
      data-metric-strip
      className={`flex flex-wrap items-stretch divide-x divide-zinc-100 overflow-hidden rounded-xl border border-zinc-200 bg-white dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-900 ${className}`}
    >
      {metrics.map((metric, index) => {
        const active = index === activeIndex;
        const deltaTone = toneOf(metric.delta);
        const deltaIcon = metric.delta === undefined ? null : metric.delta > 0 ? "trending-up" : metric.delta < 0 ? "trending-down" : "minus";
        return (
          <div
            key={`${metric.label}-${index}`}
            role="button"
            tabIndex={0}
            data-metric-index={index}
            aria-current={active ? "true" : undefined}
            onClick={() => onMetricClick?.(index, metric)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onMetricClick?.(index, metric);
              }
            }}
            className={`group flex min-w-[140px] flex-1 cursor-pointer flex-col gap-0.5 px-4 py-3 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-500 ${
              active ? "bg-zinc-50 dark:bg-zinc-800/60" : "hover:bg-zinc-50 dark:hover:bg-zinc-800/40"
            }`}
          >
            <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              {metric.icon ? <UiIcon name={metric.icon} size={12} className="text-zinc-400" /> : null}
              {metric.label}
            </span>
            <span className="flex items-baseline gap-2">
              <span className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">{metric.value}</span>
              {metric.delta !== undefined ? (
                <span className={`flex items-center gap-0.5 text-[10px] font-medium ${deltaTone}`}>
                  {deltaIcon ? <UiIcon name={deltaIcon} size={11} /> : null}
                  {metric.delta > 0 ? "+" : ""}
                  {metric.delta}
                  {metric.deltaLabel ? ` ${metric.deltaLabel}` : "%"}
                </span>
              ) : metric.deltaLabel ? (
                <span className="text-[10px] font-medium text-zinc-400">{metric.deltaLabel}</span>
              ) : null}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default MetricStrip;
