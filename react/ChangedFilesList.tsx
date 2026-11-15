import React from "react";

export interface ChangedFile {
  path: string;
  additions: number;
  deletions: number;
  status?: "new" | "modified" | "generated" | "deleted";
}

export interface ChangedFilesListProps {
  title?: string;
  files: ChangedFile[];
  grouped?: boolean;
  showDiffstat?: boolean;
  defaultExpanded?: boolean;
  onFileClick?: (file: ChangedFile) => void;
}

const STATUS_TAG: Record<string, string> = {
  new: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300",
  generated: "bg-violet-50 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300",
  deleted: "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300",
  modified: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300",
};

const parentOf = (path: string) => {
  const parts = path.split("/");
  return parts.length > 1 ? parts.slice(0, -1).join("/") : "";
};

const nameOf = (path: string) => path.split("/").pop() || path;

/**
 * ChangedFilesList - PR changed-file list with per-file diffstats and status tags, flat or grouped by folder.
 */
export default function ChangedFilesList({ title = "Files changed", files, grouped = false, showDiffstat = true, defaultExpanded = true, onFileClick }: ChangedFilesListProps) {
  const [open, setOpen] = React.useState(defaultExpanded);
  const groups = React.useMemo(() => {
    if (!grouped) return [{ folder: "", files }];
    const map = new Map<string, ChangedFile[]>();
    files.forEach((file) => {
      const folder = parentOf(file.path) || "/";
      if (!map.has(folder)) map.set(folder, []);
      map.get(folder)!.push(file);
    });
    return [...map.entries()].map(([folder, list]) => ({ folder, files: list }));
  }, [files, grouped]);

  const totals = files.reduce(
    (acc, file) => ({ additions: acc.additions + file.additions, deletions: acc.deletions + file.deletions }),
    { additions: 0, deletions: 0 },
  );

  return (
    <div data-changed-files className="w-full rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <button
        type="button"
        data-changed-files-toggle
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-2 px-4 py-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`h-3.5 w-3.5 shrink-0 text-zinc-400 transition-transform ${open ? "rotate-90" : ""}`}>
          <path d="m9 18 6-6-6-6" />
        </svg>
        <span className="min-w-0 flex-1 text-sm font-bold text-zinc-900 dark:text-zinc-50">{title}</span>
        {showDiffstat ? (
          <span className="shrink-0 font-mono text-xs">
            <span className="text-emerald-600 dark:text-emerald-400">+{totals.additions}</span>{" "}
            <span className="text-rose-600 dark:text-rose-400">−{totals.deletions}</span>
          </span>
        ) : null}
      </button>
      {open ? (
        <div className="px-2 pb-2">
          {groups.map((group, groupIndex) => (
            <div key={group.folder || groupIndex} data-files-group={group.folder || undefined}>
              {grouped && group.folder ? (
                <p className="px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">{group.folder}/</p>
              ) : null}
              {group.files.map((file) => (
                <button
                  key={file.path}
                  type="button"
                  data-changed-file={file.path}
                  onClick={() => onFileClick?.(file)}
                  className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left transition-colors hover:bg-zinc-50 focus-visible:outline-none dark:hover:bg-zinc-800/60"
                >
                  <span className="shrink-0 rounded border border-zinc-200 px-1 font-mono text-[10px] font-bold text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">{nameOf(file.path).split(".").pop()}</span>
                  <span className="min-w-0 flex-1 truncate font-mono text-xs text-zinc-800 dark:text-zinc-100">{grouped ? nameOf(file.path) : file.path}</span>
                  {file.status && STATUS_TAG[file.status] ? (
                    <span className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold ${STATUS_TAG[file.status]}`}>{file.status}</span>
                  ) : null}
                  {showDiffstat ? (
                    <span className="shrink-0 font-mono text-[11px]">
                      <span className="text-emerald-600 dark:text-emerald-400">+{file.additions}</span>{" "}
                      <span className="text-rose-600 dark:text-rose-400">−{file.deletions}</span>
                    </span>
                  ) : null}
                </button>
              ))}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
