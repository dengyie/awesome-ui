import React, { useState } from "react";

export interface SpendPoint {
  /** x label, e.g. a date like 2026-03-13 */
  label: string;
  value: number;
}

export interface SpendTrendChartProps {
  headline?: string;
  unit?: string;
  granularities?: string[];
  defaultGranularity?: string;
  /** data points per granularity; key must match one of granularities */
  points?: Record<string, SpendPoint[]>;
  /** deterministic max, otherwise derived from data */
  maxY?: number;
  yTicks?: number;
  onGranularityChange?: (granularity: string) => void;
  className?: string;
}

const PALETTE = { bar: "#14b8a6", grid: "#3f3f46", text: "#a1a1aa" };

export default function SpendTrendChart({
  headline = "Spend",
  unit = "$",
  granularities = ["Daily", "Weekly"],
  defaultGranularity,
  points = {},
  maxY,
  yTicks = 4,
  onGranularityChange,
  className = "",
}: SpendTrendChartProps) {
  const granularitiesList = granularities.length ? granularities : ["Daily"];
  const [granularity, setGranularity] = useState(
    defaultGranularity && granularitiesList.includes(defaultGranularity) ? defaultGranularity : granularitiesList[0],
  );

  const data = points[granularity] ?? [];
  const total = data.reduce((acc, p) => acc + p.value, 0);
  const max = maxY ?? Math.max(...data.map((p) => p.value), 1);

  const height = 180;
  const padLeft = 34;
  const padBottom = 26;
  const plotW = 100; // normalized; bars spread via percentage

  const ticks = Array.from({ length: yTicks + 1 }, (_, i) => (max / yTicks) * (yTicks - i));

  const switchGranularity = (next: string) => {
    if (next === granularity || !granularitiesList.includes(next)) return;
    setGranularity(next);
    onGranularityChange?.(next);
  };

  return (
    <div
      data-spend-trend-chart
      className={`rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 ${className}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p data-spend-trend-title className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{headline}</p>
        <div
          data-spend-trend-granularity
          role="tablist"
          aria-label="Granularity"
          className="flex items-center rounded-md border border-zinc-200 bg-zinc-50 p-0.5 dark:border-zinc-700 dark:bg-zinc-800"
        >
          {granularitiesList.map((g) => (
            <button
              key={g}
              type="button"
              role="tab"
              aria-selected={g === granularity}
              data-spend-trend-granularity-option={g}
              onClick={() => switchGranularity(g)}
              className={`rounded px-2.5 py-1 text-[11px] font-medium transition-colors ${
                g === granularity
                  ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-900 dark:text-zinc-50"
                  : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      <p data-spend-trend-total className="mt-1 font-mono text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
        {unit}
        {total.toFixed(2)}
        <span className="ml-1.5 font-sans text-xs font-normal text-zinc-400 dark:text-zinc-500">{granularity}</span>
      </p>

      <div className="relative mt-3" style={{ height }}>
        <svg
          data-spend-trend-svg
          width="100%"
          height={height}
          viewBox={`0 0 ${padLeft + plotW} ${height}`}
          preserveAspectRatio="none"
          role="img"
          aria-label={`${headline} ${granularity} bar chart`}
        >
          {/* y axis grid */}
          {ticks.map((t, i) => {
            const y = 8 + ((height - padBottom - 16) * i) / yTicks;
            return (
              <line
                key={i}
                x1={padLeft}
                x2={padLeft + plotW}
                y1={y}
                y2={y}
                stroke={PALETTE.grid}
                strokeOpacity={0.35}
                strokeDasharray="3 4"
                vectorEffect="non-scaling-stroke"
              />
            );
          })}

          {/* bars */}
          {data.map((p, i) => {
            const n = data.length;
            const slot = plotW / n;
            const bw = Math.min(slot * 0.45, 8);
            const x = padLeft + slot * i + (slot - bw) / 2;
            const h = Math.max((p.value / max) * (height - padBottom - 16), p.value > 0 ? 3 : 0);
            const y = height - padBottom - h;
            return (
              <rect
                key={p.label + i}
                data-spend-trend-bar={p.label}
                x={x}
                y={y}
                width={bw}
                height={h}
                rx={2}
                fill={PALETTE.bar}
                opacity={p.value > 0 ? 0.9 : 0.25}
              />
            );
          })}
          {data.length === 0 ? (
            <text x={padLeft + plotW / 2} y={height / 2} textAnchor="middle" fontSize="10" fill={PALETTE.text}>
              No spend recorded
            </text>
          ) : null}
        </svg>

        {/* y tick labels as HTML overlay so preserveAspectRatio never stretches text */}
        <div className="pointer-events-none absolute inset-0">
          {ticks.map((t, i) => {
            const y = 8 + ((height - padBottom - 16) * i) / yTicks;
            return (
              <span
                key={`label-${i}`}
                className="absolute -translate-y-1/2 text-[9px] leading-none text-zinc-400 dark:text-zinc-500"
                style={{ top: `${(y / height) * 100}%`, right: `${((padLeft + plotW - padLeft + 6) / (padLeft + plotW)) * 100}%` }}
              >
                {Math.round(t)}
              </span>
            );
          })}
          {data.map((p, i) => {
            const n = data.length;
            const showLabel = n <= 14 || i % Math.ceil(n / 8) === 0;
            if (!showLabel) return null;
            const slot = plotW / n;
            const bw = Math.min(slot * 0.45, 8);
            const midX = padLeft + slot * i + bw / 2;
            return (
              <span
                key={`x-${p.label}-${i}`}
                className="absolute -translate-x-1/2 text-[9px] leading-none text-zinc-400 dark:text-zinc-500"
                style={{
                  top: `${((height - padBottom + 10) / height) * 100}%`,
                  left: `${(midX / (padLeft + plotW)) * 100}%`,
                }}
              >
                {p.label.slice(5)}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
