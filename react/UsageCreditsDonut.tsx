import React, { useState } from "react";

export interface CreditSlice {
  id: string;
  label: string;
  value: number;
  color?: string;
}

export interface UsageCreditsDonutProps {
  title?: string;
  unit?: string;
  /** summary line under the title, e.g. "3.54 credits" */
  total?: number;
  slices?: CreditSlice[];
  /** dropdown options like Last 7 days / Last 30 days */
  ranges?: string[];
  defaultRange?: string;
  /** render a flat legend list instead of inline labels */
  className?: string;
}

const PALETTE = ["#6366f1", "#22c55e", "#f59e0b", "#ec4899", "#06b6d4", "#a855f7"];

const polar = (cx: number, cy: number, r: number, deg: number) => {
  const rad = ((deg - 90) * Math.PI) / 180;
  return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)];
};

const donutArc = (cx: number, cy: number, rOuter: number, rInner: number, startDeg: number, endDeg: number) => {
  const [x1, y1] = polar(cx, cy, rOuter, startDeg);
  const [x2, y2] = polar(cx, cy, rOuter, endDeg);
  const [x3, y3] = polar(cx, cy, rInner, endDeg);
  const [x4, y4] = polar(cx, cy, rInner, startDeg);
  const large = endDeg - startDeg > 180 ? 1 : 0;
  return [
    `M ${x1} ${y1}`,
    `A ${rOuter} ${rOuter} 0 ${large} 1 ${x2} ${y2}`,
    `L ${x3} ${y3}`,
    `A ${rInner} ${rInner} 0 ${large} 0 ${x4} ${y4}`,
    "Z",
  ].join(" ");
};

export default function UsageCreditsDonut({
  title = "Usage by Type",
  unit = "credits",
  total,
  slices = [],
  ranges = ["Last 7 days", "Last 30 days"],
  defaultRange,
  className = "",
}: UsageCreditsDonutProps) {
  const [range, setRange] = useState(defaultRange ?? ranges[0] ?? "");
  const [active, setActive] = useState<string | null>(null);

  const sum = total ?? slices.reduce((acc, s) => acc + s.value, 0);
  const colored = slices.map((s, i) => ({ ...s, color: s.color ?? PALETTE[i % PALETTE.length] }));
  const size = 160;
  const cx = size / 2;
  const cy = size / 2;
  const rOuter = 70;
  const rInner = 44;

  let angle = 0;
  const arcs = colored.map((s) => {
    const sweep = sum > 0 ? (s.value / sum) * 360 : 0;
    const start = angle;
    const end = angle + sweep;
    angle = end;
    return { ...s, path: donutArc(cx, cy, rOuter, rInner, start, Math.max(end - 0.6, start + 0.1)) };
  });

  return (
    <div data-usage-donut className={`rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p data-usage-donut-title className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{title}</p>
        {ranges.length > 0 ? (
          <select
            data-usage-donut-range
            value={range}
            onChange={(e) => setRange(e.target.value)}
            className="rounded-md border border-zinc-200 bg-white px-2 py-1 text-[11px] text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
          >
            {ranges.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        ) : null}
      </div>
      <p data-usage-donut-total className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
        {sum.toFixed(2)} {unit}
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-4">
        <svg data-usage-donut-chart width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={`${title} donut chart`}>
          {arcs.map((a) => (
            <path
              key={a.id}
              d={a.path}
              fill={a.color}
              opacity={active && active !== a.id ? 0.35 : 1}
              onMouseEnter={() => setActive(a.id)}
              onMouseLeave={() => setActive(null)}
            />
          ))}
          {sum <= 0 ? (
            <circle cx={cx} cy={cy} r={(rOuter + rInner) / 2} fill="none" stroke="#e4e4e7" strokeWidth={rOuter - rInner} className="dark:opacity-20" />
          ) : null}
          <text x={cx} y={cy - 2} textAnchor="middle" className="fill-zinc-900 text-sm font-semibold dark:fill-zinc-50">
            {active ? colored.find((s) => s.id === active)?.label : `${((arcs[0]?.value ?? 0) / (sum || 1) * 100).toFixed(0)}%`}
          </text>
          <text x={cx} y={cy + 14} textAnchor="middle" className="fill-zinc-400 text-[10px]">
            {active ? `${colored.find((s) => s.id === active)?.value} ${unit}` : unit}
          </text>
        </svg>

        <ul data-usage-donut-legend className="min-w-0 flex-1 space-y-1.5">
          {colored.map((s) => (
            <li
              key={s.id}
              data-usage-donut-slice={s.id}
              onMouseEnter={() => setActive(s.id)}
              onMouseLeave={() => setActive(null)}
              className="flex items-center gap-2 text-xs"
            >
              <span className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ backgroundColor: s.color }} />
              <span className="min-w-0 flex-1 truncate text-zinc-600 dark:text-zinc-300">{s.label}</span>
              <span className="font-mono text-[11px] text-zinc-500 dark:text-zinc-400">{s.value}</span>
              <span className="w-10 text-right text-[10px] text-zinc-400 dark:text-zinc-500">
                {sum > 0 ? `${((s.value / sum) * 100).toFixed(0)}%` : "—"}
              </span>
            </li>
          ))}
          {colored.length === 0 ? (
            <li data-usage-donut-empty className="text-xs text-zinc-400 dark:text-zinc-500">No usage recorded</li>
          ) : null}
        </ul>
      </div>
    </div>
  );
}
