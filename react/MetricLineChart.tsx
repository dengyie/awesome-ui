import React, { useState } from "react";

export interface MetricSeries {
  /** series name shown in the legend */
  name: string;
  /** line color (any CSS color) */
  color: string;
  /** one value per point, aligned with `labels` */
  values: number[];
}

export interface MetricLineChartProps {
  /** metric headline, e.g. "Active users" */
  headline?: string;
  /** current aggregate value shown big (mono) */
  value?: string;
  /** delta vs previous period, e.g. "+12.4%" */
  delta?: string;
  /** direction of the delta chip */
  deltaTone?: "up" | "down" | "flat";
  /** time-range pills, e.g. ["24h", "7d", "30d", "90d"] */
  ranges?: string[];
  /** default active range key */
  defaultRange?: string;
  /** x labels, one per data point */
  labels?: string[];
  /** one or more line series */
  series?: MetricSeries[];
  /** unit appended to tooltip values */
  unit?: string;
  onRangeChange?: (range: string) => void;
  className?: string;
}

const HEIGHT = 160;
const PAD_LEFT = 30;
const PAD_BOTTOM = 22;
const PLOT_W = 100;
const VIEW_W = PAD_LEFT + PLOT_W;

/** Catmull-Rom → cubic bezier path through points. */
function smoothPath(pts: Array<[number, number]>): string {
  if (pts.length === 0) return "";
  if (pts.length === 1) return `M ${pts[0][0]} ${pts[0][1]}`;
  let d = `M ${pts[0][0]} ${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(i - 1, 0)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(i + 2, pts.length - 1)];
    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ` C ${c1x.toFixed(2)} ${c1y.toFixed(2)}, ${c2x.toFixed(2)} ${c2y.toFixed(2)}, ${p2[0].toFixed(2)} ${p2[1].toFixed(2)}`;
  }
  return d;
}

export default function MetricLineChart({
  headline = "Active users",
  value = "0",
  delta,
  deltaTone = "flat",
  ranges = ["24h", "7d", "30d", "90d"],
  defaultRange,
  labels = [],
  series = [],
  unit = "",
  onRangeChange,
  className = "",
}: MetricLineChartProps) {
  const rangeList = ranges.length ? ranges : ["30d"];
  const [range, setRange] = useState(
    defaultRange && rangeList.includes(defaultRange) ? defaultRange : rangeList[0],
  );
  const [hover, setHover] = useState<number | null>(null);

  const n = labels.length;
  const max = Math.max(...series.flatMap((s) => s.values), 1);
  const plotH = HEIGHT - PAD_BOTTOM - 8;

  const xAt = (i: number) => PAD_LEFT + (n > 1 ? (PLOT_W * i) / (n - 1) : PLOT_W / 2);
  const yAt = (v: number) => 8 + plotH - (v / max) * plotH;

  const pickRange = (next: string) => {
    if (next === range || !rangeList.includes(next)) return;
    setRange(next);
    onRangeChange?.(next);
  };

  const deltaCls =
    deltaTone === "up"
      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
      : deltaTone === "down"
        ? "bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-300"
        : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300";
  const deltaArrow = deltaTone === "up" ? "▲" : deltaTone === "down" ? "▼" : "—";

  return (
    <div
      data-metric-line-chart
      className={`rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 ${className}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p data-metric-line-title className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{headline}</p>
          <p className="mt-0.5 flex items-center gap-2">
            <span data-metric-line-value className="font-mono text-2xl font-semibold text-zinc-900 dark:text-zinc-50">{value}</span>
            {delta ? (
              <span data-metric-line-delta className={`rounded-full px-1.5 py-0.5 text-[11px] font-medium ${deltaCls}`}>
                {deltaArrow} {delta}
              </span>
            ) : null}
          </p>
        </div>
        <div
          data-metric-line-ranges
          role="tablist"
          aria-label="Time range"
          className="flex items-center gap-0.5 rounded-md border border-zinc-200 bg-zinc-50 p-0.5 dark:border-zinc-700 dark:bg-zinc-800"
        >
          {rangeList.map((r) => (
            <button
              key={r}
              type="button"
              role="tab"
              aria-selected={r === range}
              data-metric-line-range-option={r}
              onClick={() => pickRange(r)}
              className={`rounded px-2 py-1 text-[11px] font-medium transition-colors ${
                r === range
                  ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-900 dark:text-zinc-50"
                  : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="relative mt-3" style={{ height: HEIGHT }}>
        <svg
          data-metric-line-svg
          width="100%"
          height={HEIGHT}
          viewBox={`0 0 ${VIEW_W} ${HEIGHT}`}
          preserveAspectRatio="none"
          role="img"
          aria-label={`${headline} line chart, ${range}`}
        >
          {[0.25, 0.5, 0.75].map((f) => {
            const y = 8 + plotH * f;
            return (
              <line
                key={f}
                x1={PAD_LEFT}
                x2={VIEW_W}
                y1={y}
                y2={y}
                stroke="#3f3f46"
                strokeOpacity={0.3}
                strokeDasharray="3 4"
                vectorEffect="non-scaling-stroke"
              />
            );
          })}

          {series.map((s) => {
            const pts: Array<[number, number]> = s.values.map((v, i) => [xAt(i), yAt(v)]);
            return (
              <path
                key={s.name}
                d={smoothPath(pts)}
                fill="none"
                stroke={s.color}
                strokeWidth={2}
                vectorEffect="non-scaling-stroke"
                strokeLinecap="round"
              />
            );
          })}

          {/* hover guides + markers (SVG shapes only; text stays in HTML overlay) */}
          {hover !== null && n > 0 ? (
            <g data-metric-line-hover-group>
              <line
                x1={xAt(hover)}
                x2={xAt(hover)}
                y1={8}
                y2={8 + plotH}
                stroke="#a1a1aa"
                strokeOpacity={0.6}
                strokeDasharray="2 3"
                vectorEffect="non-scaling-stroke"
              />
              {series.map((s) => (
                <circle
                  key={s.name}
                  cx={xAt(hover)}
                  cy={yAt(s.values[hover] ?? 0)}
                  r={3}
                  fill={s.color}
                  stroke="#fff"
                  strokeWidth={1.5}
                  vectorEffect="non-scaling-stroke"
                />
              ))}
            </g>
          ) : null}
        </svg>

        {/* hover column hit areas */}
        <div
          className="absolute inset-y-0"
          style={{ left: `${(PAD_LEFT / VIEW_W) * 100}%`, right: 0, display: "flex" }}
          onMouseLeave={() => setHover(null)}
        >
          {labels.map((label, i) => (
            <div
              key={label + i}
              data-metric-line-col={label}
              className="flex-1 cursor-crosshair"
              onMouseEnter={() => setHover(i)}
            />
          ))}
        </div>

        {/* text labels as HTML overlay so preserveAspectRatio never stretches them */}
        <div className="pointer-events-none absolute inset-0">
          {[0, 0.5, 1].map((f) => {
            const y = 8 + plotH * f;
            const t = Math.round(max * (1 - f));
            return (
              <span
                key={f}
                className="absolute -translate-y-1/2 text-[9px] leading-none text-zinc-400 dark:text-zinc-500"
                style={{ top: `${(y / HEIGHT) * 100}%`, right: `${((PLOT_W + 6) / VIEW_W) * 100}%` }}
              >
                {t}
              </span>
            );
          })}
          {labels.map((label, i) => {
            const every = Math.ceil(n / 7);
            if (!(n <= 7 || i % every === 0 || i === n - 1)) return null;
            return (
              <span
                key={`x-${label}-${i}`}
                className="absolute -translate-x-1/2 text-[9px] leading-none text-zinc-400 dark:text-zinc-500"
                style={{ top: `${((HEIGHT - PAD_BOTTOM + 8) / HEIGHT) * 100}%`, left: `${(xAt(i) / VIEW_W) * 100}%` }}
              >
                {label}
              </span>
            );
          })}

          {/* hover tooltip */}
          {hover !== null && n > 0 ? (
            <div
              data-metric-line-tooltip
              className="absolute z-10 -translate-x-1/2 rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 shadow-md dark:border-zinc-700 dark:bg-zinc-800"
              style={{
                top: 0,
                left: `${(xAt(hover) / VIEW_W) * 100}%`,
                transform: `translateX(${hover > n / 2 ? "-90%" : "-10%"})`,
              }}
            >
              <p className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400">{labels[hover]}</p>
              {series.map((s) => (
                <p key={s.name} className="mt-0.5 flex items-center gap-1.5 whitespace-nowrap text-[11px]">
                  <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: s.color }} />
                  <span className="text-zinc-500 dark:text-zinc-400">{s.name}</span>
                  <span className="ml-auto font-mono font-medium text-zinc-900 dark:text-zinc-50">
                    {s.values[hover] ?? 0}{unit}
                  </span>
                </p>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      {/* legend */}
      {series.length > 1 ? (
        <div data-metric-line-legend className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
          {series.map((s) => (
            <span key={s.name} className="flex items-center gap-1.5 text-[11px] text-zinc-500 dark:text-zinc-400">
              <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: s.color }} />
              {s.name}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}
