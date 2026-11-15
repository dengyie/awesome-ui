import React from "react";

export interface TokenCostSegment {
  id: string;
  label: string;
  amountUsd: number;
  color?: string;
}

export interface TokenUsageRow {
  id: string;
  label: string;
  tokens: number;
  percent: number;
  barColor?: string;
}

export interface TokenCostBreakdownProps {
  segments: TokenCostSegment[];
  usageRows?: TokenUsageRow[];
  title?: string;
  spendUsed?: number;
  spendTotal?: number;
  className?: string;
  onSegmentSelect?: (segment: TokenCostSegment) => void;
}

const defaultColors = ["bg-zinc-500", "bg-emerald-500", "bg-amber-500", "bg-sky-500", "bg-violet-500", "bg-rose-500"];

const segColor = (segment: TokenCostSegment, index: number) =>
  segment.color ?? defaultColors[index % defaultColors.length];

const fmtUsd = (usd: number) =>
  usd >= 100 ? `$${usd.toFixed(0)}` : usd >= 1 ? `$${usd.toFixed(2)}` : `$${usd.toFixed(3)}`;

const fmtTokens = (tokens: number) => tokens.toLocaleString("en-US");

/**
 * TokenCostBreakdown - stacked spend bar with per-segment legend and
 * token usage rows (Cofounder spend / OpenAI usage pattern).
 */
export default function TokenCostBreakdown({
  segments,
  usageRows = [],
  title = "Spend breakdown",
  spendUsed,
  spendTotal,
  className = "",
  onSegmentSelect,
}: TokenCostBreakdownProps) {
  const totalUsd = segments.reduce((sum, s) => sum + s.amountUsd, 0);
  const used = typeof spendUsed === "number" ? spendUsed : totalUsd;
  const percent = spendTotal && spendTotal > 0 ? Math.min((used / spendTotal) * 100, 100) : 100;

  return (
    <div
      data-token-cost
      className={`w-full rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 ${className}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-200">{title}</span>
        <span className="text-[11px] tabular-nums text-zinc-400 dark:text-zinc-500">
          {spendTotal ? `${fmtUsd(used)} of ${fmtUsd(spendTotal)}` : fmtUsd(totalUsd)}
        </span>
      </div>

      <div data-token-cost-bar className="mt-3 flex h-2.5 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
        {segments.map((segment, index) => {
          const width = totalUsd > 0 ? (segment.amountUsd / totalUsd) * percent : 0;
          return (
            <span
              key={segment.id}
              data-token-cost-segment={segment.id}
              onClick={() => onSegmentSelect?.(segment)}
              className={`h-full ${segColor(segment, index)} ${onSegmentSelect ? "cursor-pointer" : ""}`}
              style={{ width: `${width}%` }}
            />
          );
        })}
      </div>

      <div data-token-cost-legend className="mt-3 space-y-1.5">
        {segments.map((segment, index) => (
          <div
            key={segment.id}
            className="flex items-center gap-2 text-xs"
          >
            <span className={`h-2 w-2 shrink-0 rounded-sm ${segColor(segment, index)}`} />
            <span className="min-w-0 flex-1 truncate text-zinc-700 dark:text-zinc-200">{segment.label}</span>
            <span className="tabular-nums font-medium text-zinc-800 dark:text-zinc-100">{fmtUsd(segment.amountUsd)}</span>
            <span className="w-12 text-right tabular-nums text-zinc-400 dark:text-zinc-500">
              {totalUsd > 0 ? `${Math.round((segment.amountUsd / totalUsd) * 100)}%` : "—"}
            </span>
          </div>
        ))}
      </div>

      {usageRows.length > 0 && (
        <div data-token-usage className="mt-4 space-y-2.5 border-t border-zinc-100 pt-3 dark:border-zinc-800">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
            Token usage
          </p>
          {usageRows.map((row) => (
            <div key={row.id} data-token-usage-row={row.id}>
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-700 dark:text-zinc-200">{row.label}</span>
                <span className="tabular-nums text-zinc-500 dark:text-zinc-400">
                  {fmtTokens(row.tokens)} ({row.percent}%)
                </span>
              </div>
              <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                <div
                  data-token-usage-bar
                  className={`h-full rounded-full ${row.barColor ?? "bg-sky-500"}`}
                  style={{ width: `${Math.min(Math.max(row.percent, 0), 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
