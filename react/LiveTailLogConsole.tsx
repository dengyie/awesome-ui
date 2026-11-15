import React from "react";

export interface TailLogLine {
  ts?: string;
  level: "info" | "warn" | "error" | "success";
  message: string;
  source?: string;
}

export interface LiveTailLogConsoleProps {
  lines: TailLogLine[];
  sources?: string[];
  liveTail?: boolean;
  searchPlaceholder?: string;
  timezone?: string;
  maxLines?: number;
  onSearch?: (query: string) => void;
  onLiveTailChange?: (enabled: boolean) => void;
}

const LEVEL_DOT: Record<string, string> = {
  info: "bg-sky-500",
  warn: "bg-amber-500",
  error: "bg-rose-500",
  success: "bg-emerald-500",
};

/**
 * LiveTailLogConsole - dark streaming log terminal with toolbar (source filter, search, live tail, timezone).
 */
export default function LiveTailLogConsole({
  lines,
  sources = [],
  liveTail = true,
  searchPlaceholder = "Search logs…",
  timezone = "GMT+7",
  maxLines = 200,
  onSearch,
  onLiveTailChange,
}: LiveTailLogConsoleProps) {
  const [query, setQuery] = React.useState("");
  const [follow, setFollow] = React.useState(liveTail);

  const filtered = React.useMemo(() => {
    const base = query
      ? lines.filter((line) => line.message.toLowerCase().includes(query.toLowerCase()) || (line.source || "").toLowerCase().includes(query.toLowerCase()))
      : lines;
    return maxLines > 0 ? base.slice(-maxLines) : base;
  }, [lines, query, maxLines]);

  return (
    <div data-live-tail-console className="w-full overflow-hidden rounded-lg bg-neutral-950 border border-neutral-800">
      <div className="flex items-center gap-2 border-b border-neutral-800 px-3 py-2">
        {sources.length ? (
          <select
            data-tail-source
            className="rounded-md border border-neutral-700 bg-neutral-900 px-2 py-1 text-xs text-neutral-200 focus-visible:outline-none"
            onChange={(event) => setQuery(event.target.value === "all" ? "" : event.target.value)}
          >
            <option value="all">All sources</option>
            {sources.map((source) => (
              <option key={source} value={source}>{source}</option>
            ))}
          </select>
        ) : null}
        <div className="relative min-w-0 flex-1">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-500">
            <circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" />
          </svg>
          <input
            type="text"
            value={query}
            placeholder={searchPlaceholder}
            data-tail-search
            onChange={(event) => { setQuery(event.target.value); onSearch?.(event.target.value); }}
            className="w-full rounded-md border border-neutral-700 bg-neutral-900 py-1 pl-7 pr-2 text-xs text-neutral-200 placeholder:text-neutral-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-500"
          />
        </div>
        <button
          type="button"
          data-tail-follow
          onClick={() => { setFollow(!follow); onLiveTailChange?.(!follow); }}
          className={`inline-flex shrink-0 items-center gap-1.5 rounded-md px-2 py-1 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-500 ${
            follow ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/40" : "border border-neutral-700 bg-neutral-900 text-neutral-300"
          }`}
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="h-3 w-3"><path d="M13 2 3 14h7l-1 8 10-12h-7l1-8z" /></svg>
          Live tail
        </button>
        {timezone ? <span className="shrink-0 rounded-md border border-neutral-700 px-1.5 py-0.5 font-mono text-[10px] text-neutral-400">{timezone}</span> : null}
      </div>
      <div data-tail-lines className="max-h-72 overflow-y-auto px-3 py-2 font-mono text-xs leading-5 text-neutral-300">
        {filtered.length === 0 ? (
          <p className="py-4 text-center text-neutral-500">No log lines match.</p>
        ) : (
          filtered.map((line, index) => (
            <div key={index} data-tail-line className="flex items-start gap-2 whitespace-pre-wrap break-all">
              {line.ts ? <span className="shrink-0 text-neutral-500">{line.ts}</span> : null}
              <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${LEVEL_DOT[line.level] || LEVEL_DOT.info}`} />
              <span className="min-w-0 flex-1 text-neutral-300">{line.message}</span>
              {line.source ? <span className="shrink-0 rounded bg-neutral-800 px-1 text-[10px] text-neutral-400">{line.source}</span> : null}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
