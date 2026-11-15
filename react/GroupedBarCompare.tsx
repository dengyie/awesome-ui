import React from "react";

export interface GroupedBarRow {
  name: string;
  estimated: number;
  actual: number;
  unit?: string;
}

export interface GroupedBarCompareProps {
  rows: GroupedBarRow[];
  title?: string;
  legendEstimated?: string;
  legendActual?: string;
  unit?: string;
  className?: string;
}

export const GroupedBarCompare: React.FC<GroupedBarCompareProps> = ({
  rows,
  title = "Estimated vs actual",
  legendEstimated = "Estimated",
  legendActual = "Actual",
  unit = "h",
  className = "",
}) => {
  const max = Math.max(...rows.flatMap((row) => [row.estimated, row.actual]), 0.0001);
  return (
    <div
      data-grouped-bar-compare
      role="table"
      className={`rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 ${className}`}
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">{title}</p>
        <div className="flex items-center gap-3 text-[10px] text-zinc-400">
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-sm bg-violet-400" />
            {legendEstimated}
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-sm bg-lime-400" />
            {legendActual}
          </span>
        </div>
      </div>
      <div className="mt-4 flex items-end justify-between gap-3" aria-label="Grouped bar chart">
        {rows.map((row, index) => {
          const estimatedHeight = Math.max(4, Math.round((row.estimated / max) * 100));
          const actualHeight = Math.max(4, Math.round((row.actual / max) * 100));
          return (
            <div key={`${row.name}-${index}`} data-bar-row={index} role="row" className="flex min-w-0 flex-1 flex-col items-center gap-1.5">
              <div className="flex h-28 w-full items-end justify-center gap-1">
                <div className="flex h-full w-1/3 flex-col items-center justify-end">
                  <span className="mb-0.5 text-[9px] font-semibold tabular-nums text-zinc-600 dark:text-zinc-300">
                    {row.estimated}
                    {row.unit ?? unit}
                  </span>
                  <div
                    className="w-full rounded-t-md bg-violet-400 transition-all duration-300"
                    style={{ height: `${estimatedHeight}%` }}
                    title={`${legendEstimated}: ${row.estimated}${row.unit ?? unit}`}
                  />
                </div>
                <div className="flex h-full w-1/3 flex-col items-center justify-end">
                  <span className="mb-0.5 text-[9px] font-semibold tabular-nums text-zinc-600 dark:text-zinc-300">
                    {row.actual}
                    {row.unit ?? unit}
                  </span>
                  <div
                    className="w-full rounded-t-md bg-lime-400 transition-all duration-300"
                    style={{ height: `${actualHeight}%` }}
                    title={`${legendActual}: ${row.actual}${row.unit ?? unit}`}
                  />
                </div>
              </div>
              <span className="w-full truncate text-center text-[10px] text-zinc-500 dark:text-zinc-400">{row.name}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default GroupedBarCompare;
