/**
 * MonitorRunList - LLM monitor run history: filter + time-range pills over a
 * mini request histogram, then run rows with success icon, timestamp, name
 * and latency (Adaline Monitor pattern).
 */
import React from "react";

export interface RunRow {
  id: string;
  name: string;
  startedAt: string;
  latencyMs: number;
  ok?: boolean;
}

export interface HistogramBar {
  label: string;
  value: number;
}

export interface MonitorRunListProps {
  runs?: RunRow[];
  histogram?: HistogramBar[];
  ranges?: string[];
  activeRange?: string;
  className?: string;
  onRunClick?: (run: RunRow) => void;
  onRangeChange?: (range: string) => void;
}

export const formatLatency = (ms: number) => {
  if (ms < 1000) return `${ms} ms`;
  const s = Math.floor(ms / 1000);
  const rem = ms % 1000;
  return rem === 0 ? `${s} s` : `${s} s ${rem} ms`;
};

const DEFAULT_RUNS: RunRow[] = [
  { id: "r1", name: "Product Performance Metrics", startedAt: "Oct 14, 1:00 AM", latencyMs: 7000, ok: true },
  { id: "r2", name: "Q2 Financial Overview", startedAt: "Oct 14, 12:59 AM", latencyMs: 6688, ok: true },
  { id: "r3", name: "Customer Retention Strategy", startedAt: "Oct 14, 12:37 AM", latencyMs: 1819, ok: true },
  { id: "r4", name: "Employee Satisfaction Survey 2025", startedAt: "Oct 13, 10:44 PM", latencyMs: 903, ok: true },
];

const DEFAULT_HISTOGRAM: HistogramBar[] = [
  { label: "13:00", value: 40 },
  { label: "15:00", value: 25 },
  { label: "17:00", value: 55 },
  { label: "19:00", value: 30 },
  { label: "21:00", value: 70 },
  { label: "23:00", value: 45 },
  { label: "01:00", value: 60 },
  { label: "03:00", value: 35 },
  { label: "05:00", value: 80 },
  { label: "07:00", value: 50 },
  { label: "09:00", value: 65 },
  { label: "11:00", value: 20 },
];

export default function MonitorRunList({
  runs = DEFAULT_RUNS,
  histogram = DEFAULT_HISTOGRAM,
  ranges = ["24 hrs", "7 days", "30 days", "6 months"],
  activeRange = "24 hrs",
  className = "",
  onRunClick,
  onRangeChange,
}: MonitorRunListProps) {
  const max = Math.max(1, ...histogram.map((b) => b.value));
  return (
    <div data-monitor-run-list className={`w-full rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900 ${className}`}>
      <div data-monitor-toolbar className="flex items-center justify-between gap-2 border-b border-zinc-100 px-4 py-2.5 dark:border-zinc-800">
        <button
          type="button"
          data-monitor-filter
          className="inline-flex items-center gap-1.5 rounded-md border border-zinc-200 px-2.5 py-1 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          <span aria-hidden="true">⏳</span> Filter
        </button>
        <div data-monitor-ranges className="inline-flex items-center gap-1">
          {ranges.map((range) => (
            <button
              key={range}
              type="button"
              data-monitor-range={range}
              aria-pressed={range === activeRange}
              className={`rounded-md px-2 py-1 text-xs font-medium transition-colors ${
                range === activeRange
                  ? "bg-emerald-600 text-white"
                  : "text-zinc-500 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-800"
              }`}
              onClick={() => onRangeChange?.(range)}
            >
              {range}
            </button>
          ))}
        </div>
      </div>
      <div data-monitor-histogram className="flex h-20 items-end gap-1 border-b border-zinc-100 px-4 pt-3 dark:border-zinc-800">
        {histogram.map((bar) => (
          <div key={bar.label} data-monitor-bar={bar.label} className="flex min-w-0 flex-1 flex-col items-center gap-1">
            <div
              className="w-full rounded-sm bg-emerald-600/85 transition-colors hover:bg-emerald-500"
              style={{ height: `${Math.max(4, (bar.value / max) * 56)}px` }}
              title={`${bar.label} · ${bar.value}`}
            />
            <span className="w-full truncate text-center text-[9px] text-zinc-400 dark:text-zinc-500">{bar.label}</span>
          </div>
        ))}
      </div>
      <table data-monitor-runs className="w-full">
        <thead>
          <tr className="border-b border-zinc-100 text-left text-[11px] font-medium text-zinc-400 dark:border-zinc-800 dark:text-zinc-500">
            <th className="px-4 py-2 font-medium">Started At</th>
            <th className="px-2 py-2 font-medium">Name</th>
            <th className="px-4 py-2 text-right font-medium">Latency</th>
          </tr>
        </thead>
        <tbody>
          {runs.map((run) => (
            <tr
              key={run.id}
              data-monitor-run={run.id}
              tabIndex={0}
              onClick={() => onRunClick?.(run)}
              onKeyDown={(e) => { if (e.key === "Enter") onRunClick?.(run); }}
              className="cursor-pointer border-b border-zinc-50 text-xs transition-colors last:border-b-0 hover:bg-zinc-50 dark:border-zinc-800/60 dark:hover:bg-zinc-800/60"
            >
              <td data-monitor-run-time className="whitespace-nowrap px-4 py-2.5 text-zinc-400 dark:text-zinc-500">
                <span className="mr-1.5 inline-flex items-center" aria-hidden="true">
                  {run.ok !== false ? "✅" : "⚠️"}
                </span>
                {run.startedAt}
              </td>
              <td data-monitor-run-name className="max-w-0 truncate px-2 py-2.5 font-medium text-zinc-800 dark:text-zinc-100">{run.name}</td>
              <td data-monitor-run-latency className="whitespace-nowrap px-4 py-2.5 text-right text-zinc-500 dark:text-zinc-400">
                {formatLatency(run.latencyMs)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
