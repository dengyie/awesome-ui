import React from "react";

export type TraceSpanKind = "llm" | "tool" | "retrieval";

export interface TraceSpan {
  id: string;
  name: string;
  startMs: number;
  durationMs: number;
  depth?: number;
  kind?: TraceSpanKind;
  costUsd?: number;
  tokens?: number;
}

export interface TraceSpanWaterfallProps {
  spans: TraceSpan[];
  title?: string;
  className?: string;
  onSpanSelect?: (span: TraceSpan) => void;
}

const kindColor = (kind?: TraceSpanKind) => {
  switch (kind) {
    case "tool":
      return "bg-emerald-500";
    case "retrieval":
      return "bg-amber-500";
    default:
      return "bg-indigo-500";
  }
};

const kindDot = (kind?: TraceSpanKind) => {
  switch (kind) {
    case "tool":
      return "bg-emerald-500";
    case "retrieval":
      return "bg-amber-500";
    default:
      return "bg-indigo-500";
  }
};

const formatDuration = (ms: number) =>
  ms >= 1000 ? `${(ms / 1000).toFixed(1)}s` : `${ms}ms`;

const formatCost = (usd?: number) =>
  typeof usd === "number" ? `$${usd.toFixed(3)}` : "";

/**
 * TraceSpanWaterfall - horizontal span timeline for an agent/LLM trace
 * (Braintrust / Adaline monitor waterfall pattern).
 */
export default function TraceSpanWaterfall({
  spans,
  title = "Trace waterfall",
  className = "",
  onSpanSelect,
}: TraceSpanWaterfallProps) {
  const total =
    spans.length > 0
      ? Math.max(...spans.map((s) => s.startMs + s.durationMs))
      : 0;

  return (
    <div
      data-trace-waterfall
      className={`w-full overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 ${className}`}
    >
      <div className="flex items-center gap-2 border-b border-zinc-100 px-4 py-2.5 dark:border-zinc-800">
        <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-200">{title}</span>
        <span className="ml-auto text-[11px] tabular-nums text-zinc-400 dark:text-zinc-500">
          {spans.length} spans · {formatDuration(total)}
        </span>
      </div>

      <div className="px-4 py-2">
        <div className="flex items-center gap-4 pb-2 text-[10px] text-zinc-400 dark:text-zinc-500">
          <span className="flex items-center gap-1.5">
            <span className={`h-1.5 w-1.5 rounded-full ${kindDot("llm")}`} /> LLM
          </span>
          <span className="flex items-center gap-1.5">
            <span className={`h-1.5 w-1.5 rounded-full ${kindDot("tool")}`} /> Tool
          </span>
          <span className="flex items-center gap-1.5">
            <span className={`h-1.5 w-1.5 rounded-full ${kindDot("retrieval")}`} /> Retrieval
          </span>
        </div>

        <div data-trace-rows className="space-y-1.5">
          {spans.map((span) => {
            const left = total > 0 ? (span.startMs / total) * 100 : 0;
            const width = total > 0 ? Math.max((span.durationMs / total) * 100, 2) : 0;
            const depth = span.depth ?? 0;
            return (
              <button
                type="button"
                key={span.id}
                data-trace-row={span.id}
                onClick={() => onSpanSelect?.(span)}
                className="flex w-full items-center gap-3 rounded-md px-1 py-1 text-left transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/60"
              >
                <span
                  className="flex min-w-0 shrink-0 items-center gap-2 text-xs text-zinc-700 dark:text-zinc-200"
                  style={{ width: `${Math.max(120 - depth * 14, 88)}px`, paddingLeft: `${depth * 14}px` }}
                >
                  <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${kindDot(span.kind)}`} />
                  <span data-trace-name className="min-w-0 truncate">{span.name}</span>
                </span>
                <span className="relative h-4 min-w-0 flex-1">
                  <span
                    data-trace-bar
                    className={`absolute top-0.5 h-3 rounded-full ${kindColor(span.kind)}`}
                    style={{ left: `${left}%`, width: `${width}%` }}
                  />
                  <span
                    className="absolute top-0.5 whitespace-nowrap text-[10px] tabular-nums text-zinc-500 dark:text-zinc-400"
                    style={{ left: `calc(${left + width}% + 6px)` }}
                  >
                    {formatDuration(span.durationMs)}
                    {formatCost(span.costUsd) ? ` · ${formatCost(span.costUsd)}` : ""}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
