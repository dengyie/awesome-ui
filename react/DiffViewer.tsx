import React, { useMemo, useState } from "react";
import { UiIcon } from "./UiIcon";

export interface DiffLine {
  type: "add" | "remove" | "context";
  content: string;
}

export interface DiffFile {
  filename: string;
  language?: string;
  lines: DiffLine[];
}

export interface DiffViewerProps {
  /** Legacy single-diff API (kept for backward compatibility). */
  lines?: DiffLine[];
  filename?: string;
  language?: string;
  /** Multi-file API: renders a tab bar when 1+ files are provided. */
  files?: DiffFile[];
  /** Context lines kept visible around each collapsed gap (default 3). */
  contextSize?: number;
  showLineNumbers?: boolean;
  className?: string;
}

const LINE_STYLE: Record<DiffLine["type"], { row: string; gutter: string; sign: string }> = {
  add: { row: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300", gutter: "text-emerald-500", sign: "+" },
  remove: { row: "bg-rose-500/10 text-rose-700 dark:text-rose-300", gutter: "text-rose-500", sign: "-" },
  context: { row: "text-zinc-600 dark:text-zinc-400", gutter: "text-zinc-300 dark:text-zinc-600", sign: " " },
};

interface HiddenLine {
  line: DiffLine;
  oldNo: number;
  newNo: number;
}

interface RenderRow {
  kind: "line" | "collapsed";
  line?: DiffLine;
  oldNo?: number | "";
  newNo?: number | "";
  /** For "collapsed": number of hidden context lines. */
  count?: number;
  /** For "collapsed": the hidden context lines, revealed on expand. */
  hidden?: HiddenLine[];
  /** Stable key so expanding one gap doesn't open its neighbours. */
  key: string;
}

/**
 * Walks the diff once and produces render rows. Long runs of context lines
 * (> contextSize*2) become a collapsible gap that keeps `contextSize` lines
 * visible on each side; the hidden middle travels with the row so expanding
 * needs no second pass over the source.
 */
const buildRows = (lines: DiffLine[], contextSize: number): RenderRow[] => {
  const rows: RenderRow[] = [];
  let oldNo = 0;
  let newNo = 0;
  let contextRun: HiddenLine[] = [];

  const flushContext = (isTail: boolean) => {
    if (contextRun.length <= contextSize * 2) {
      contextRun.forEach((entry) => rows.push({ kind: "line", line: entry.line, oldNo: entry.oldNo, newNo: entry.newNo, key: `l-${entry.oldNo}-${entry.newNo}` }));
    } else {
      const head = contextRun.slice(0, contextSize);
      const hiddenStart = isTail ? contextSize : contextSize;
      const hiddenEnd = isTail ? contextRun.length : contextRun.length - contextSize;
      const hidden = contextRun.slice(hiddenStart, hiddenEnd);
      head.forEach((entry) => rows.push({ kind: "line", line: entry.line, oldNo: entry.oldNo, newNo: entry.newNo, key: `l-${entry.oldNo}-${entry.newNo}` }));
      rows.push({ kind: "collapsed", count: hidden.length, hidden, key: `gap-${rows.length}-${hidden.length}` });
      if (!isTail) {
        contextRun.slice(contextRun.length - contextSize).forEach((entry) =>
          rows.push({ kind: "line", line: entry.line, oldNo: entry.oldNo, newNo: entry.newNo, key: `l-${entry.oldNo}-${entry.newNo}` })
        );
      }
    }
    contextRun = [];
  };

  lines.forEach((line) => {
    if (line.type !== "add") oldNo += 1;
    if (line.type !== "remove") newNo += 1;

    if (line.type === "context") {
      contextRun.push({ line, oldNo, newNo });
      return;
    }
    flushContext(false);
    rows.push({ kind: "line", line, oldNo: line.type !== "add" ? oldNo : "", newNo: line.type !== "remove" ? newNo : "", key: `c-${rows.length}` });
  });

  flushContext(true);
  return rows;
};

export const DiffViewer: React.FC<DiffViewerProps> = ({
  lines = [],
  filename,
  language,
  files = [],
  contextSize = 3,
  showLineNumbers = true,
  className = "",
}) => {
  const multiFile = files.length > 0;
  const [activeFileIdx, setActiveFileIdx] = useState(0);
  const [expandedGaps, setExpandedGaps] = useState<Set<string>>(() => new Set());

  const safeIdx = multiFile ? Math.min(activeFileIdx, files.length - 1) : 0;
  const active = multiFile ? files[safeIdx] : null;
  const activeLines = active ? active.lines : lines;
  const activeFilename = active ? active.filename : filename;
  const activeLanguage = active ? active.language : language;

  const rows = useMemo(() => buildRows(activeLines, contextSize), [activeLines, contextSize]);

  const added = activeLines.filter((l) => l.type === "add").length;
  const removed = activeLines.filter((l) => l.type === "remove").length;

  const toggleGap = (key: string) => {
    setExpandedGaps((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  return (
    <div className={`rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 overflow-hidden ${className}`}>
      {/* Multi-file tab bar */}
      {multiFile && (
        <div role="tablist" className="flex gap-1 overflow-x-auto border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-1.5 pt-1.5">
          {files.map((file, idx) => {
            const isActive = idx === safeIdx;
            const fileAdded = file.lines.filter((l) => l.type === "add").length;
            const fileRemoved = file.lines.filter((l) => l.type === "remove").length;
            return (
              <button
                key={file.filename}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveFileIdx(idx)}
                className={`flex shrink-0 items-center gap-1.5 rounded-t-lg px-3 py-1.5 font-mono text-[11px] transition-colors ${
                  isActive
                    ? "border border-b-0 border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200"
                    : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                }`}
              >
                <span className="max-w-[10rem] truncate">{file.filename}</span>
                <span className="text-emerald-600 dark:text-emerald-400">+{fileAdded}</span>
                <span className="text-rose-600 dark:text-rose-400">-{fileRemoved}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Active file header */}
      <div className="flex items-center gap-2 px-3.5 py-2 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/60 text-xs">
        <UiIcon name="git-branch" size={14} className="text-zinc-400 shrink-0" />
        {activeFilename && <span className="font-mono font-medium text-zinc-700 dark:text-zinc-300 truncate">{activeFilename}</span>}
        {activeLanguage && (
          <span className="px-1.5 py-0.5 rounded bg-zinc-200/70 dark:bg-zinc-700/70 text-[10px] font-mono text-zinc-500 dark:text-zinc-400">
            {activeLanguage}
          </span>
        )}
        <span className="ml-auto flex items-center gap-2 font-mono text-[11px]">
          <span className="text-emerald-600 dark:text-emerald-400">+{added}</span>
          <span className="text-rose-600 dark:text-rose-400">-{removed}</span>
        </span>
      </div>

      <div className="overflow-x-auto text-[13px] font-mono leading-relaxed">
        {activeLines.length === 0 && <div className="p-4 text-center text-xs text-zinc-400">No changes</div>}

        {rows.map((row) => {
          if (row.kind === "collapsed") {
            const isExpanded = expandedGaps.has(row.key);
            if (!isExpanded) {
              return (
                <button
                  key={row.key}
                  type="button"
                  onClick={() => toggleGap(row.key)}
                  className="flex w-full items-center gap-2 bg-zinc-50 dark:bg-zinc-800/40 px-3 py-1 text-[11px] text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors select-none"
                >
                  <UiIcon name="chevron-down" size={12} />
                  <span className="font-mono">⋯ {row.count} unchanged lines</span>
                </button>
              );
            }
            return (
              <React.Fragment key={row.key}>
                {(row.hidden || []).map((entry, i) => (
                  <div key={`${row.key}-${i}`} className={`flex ${LINE_STYLE.context.row}`}>
                    {showLineNumbers && (
                      <span className="w-16 shrink-0 select-none px-2 text-right text-[11px] text-zinc-400 dark:text-zinc-600 tabular-nums">
                        {entry.oldNo} {entry.newNo}
                      </span>
                    )}
                    <span className="w-5 shrink-0 select-none text-center text-zinc-300 dark:text-zinc-600">{" "}</span>
                    <span className="flex-1 min-w-0 whitespace-pre-wrap break-words pr-3">{entry.line.content}</span>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => toggleGap(row.key)}
                  className="flex w-full items-center gap-2 bg-zinc-50 dark:bg-zinc-800/40 px-3 py-1 text-[11px] text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors select-none"
                >
                  <UiIcon name="minus" size={12} />
                  <span className="font-mono">Collapse unchanged lines</span>
                </button>
              </React.Fragment>
            );
          }

          const meta = LINE_STYLE[row.line!.type] || LINE_STYLE.context;
          return (
            <div key={row.key} className={`flex ${meta.row}`}>
              {showLineNumbers && (
                <span className="w-16 shrink-0 select-none px-2 text-right text-[11px] text-zinc-400 dark:text-zinc-600 tabular-nums">
                  {row.oldNo === "" ? "" : row.oldNo} {row.newNo === "" ? "" : row.newNo}
                </span>
              )}
              <span className={`w-5 shrink-0 select-none text-center ${meta.gutter}`}>{meta.sign}</span>
              <span className="flex-1 min-w-0 whitespace-pre-wrap break-words pr-3">{row.line!.content}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DiffViewer;
