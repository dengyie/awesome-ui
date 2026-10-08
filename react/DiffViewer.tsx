import React from "react";
import { UiIcon } from "./UiIcon";

export interface DiffLine {
  type: "add" | "remove" | "context";
  content: string;
}

export interface DiffViewerProps {
  lines: DiffLine[];
  filename?: string;
  language?: string;
  showLineNumbers?: boolean;
  className?: string;
}

const LINE_STYLE: Record<DiffLine["type"], { row: string; gutter: string; sign: string }> = {
  add: { row: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300", gutter: "text-emerald-500", sign: "+" },
  remove: { row: "bg-rose-500/10 text-rose-700 dark:text-rose-300", gutter: "text-rose-500", sign: "-" },
  context: { row: "text-zinc-600 dark:text-zinc-400", gutter: "text-zinc-300 dark:text-zinc-600", sign: " " },
};

export const DiffViewer: React.FC<DiffViewerProps> = ({
  lines = [],
  filename,
  language,
  showLineNumbers = true,
  className = "",
}) => {
  const added = lines.filter((l) => l.type === "add").length;
  const removed = lines.filter((l) => l.type === "remove").length;

  let oldLine = 0;
  let newLine = 0;

  return (
    <div className={`rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 overflow-hidden ${className}`}>
      <div className="flex items-center gap-2 px-3.5 py-2 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/60 text-xs">
        <UiIcon name="git-branch" size={14} className="text-zinc-400 shrink-0" />
        {filename && <span className="font-mono font-medium text-zinc-700 dark:text-zinc-300 truncate">{filename}</span>}
        {language && (
          <span className="px-1.5 py-0.5 rounded bg-zinc-200/70 dark:bg-zinc-700/70 text-[10px] font-mono text-zinc-500 dark:text-zinc-400">
            {language}
          </span>
        )}
        <span className="ml-auto flex items-center gap-2 font-mono text-[11px]">
          <span className="text-emerald-600 dark:text-emerald-400">+{added}</span>
          <span className="text-rose-600 dark:text-rose-400">-{removed}</span>
        </span>
      </div>

      <div className="overflow-x-auto text-[13px] font-mono leading-relaxed">
        {lines.map((line, i) => {
          const meta = LINE_STYLE[line.type] || LINE_STYLE.context;
          if (line.type !== "add") oldLine += 1;
          if (line.type !== "remove") newLine += 1;
          return (
            <div key={i} className={`flex ${meta.row}`}>
              {showLineNumbers && (
                <span className="w-16 shrink-0 select-none px-2 text-right text-[11px] text-zinc-400 dark:text-zinc-600 tabular-nums">
                  {line.type !== "add" ? oldLine : ""} {line.type !== "remove" ? newLine : ""}
                </span>
              )}
              <span className={`w-5 shrink-0 select-none text-center ${meta.gutter}`}>{meta.sign}</span>
              <span className="flex-1 min-w-0 whitespace-pre-wrap break-words pr-3">{line.content}</span>
            </div>
          );
        })}
        {lines.length === 0 && <div className="p-4 text-center text-xs text-zinc-400">No changes</div>}
      </div>
    </div>
  );
};
export default DiffViewer;
