import React from "react";

export type QaRating = "good" | "acceptable" | "poor";

export interface QaTestRow {
  id: string;
  question: string;
  answered?: boolean;
  rating?: QaRating;
}

export interface QaTestTableProps {
  rows: QaTestRow[];
  title?: string;
  className?: string;
  onRowCheck?: (row: QaTestRow, checked: boolean) => void;
  onRowSelect?: (row: QaTestRow) => void;
}

const RATING_CHIP: Record<QaRating, string> = {
  good: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300",
  acceptable: "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300",
  poor: "bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300",
};

const RATING_LABEL: Record<QaRating, string> = {
  good: "Good",
  acceptable: "Acceptable",
  poor: "Poor",
};

/**
 * QaTestTable - AI answer QA test table (Intercom Fin "Test" pattern):
 * checkbox + question + answer status icon + tone-colored rating chip.
 */
export default function QaTestTable({
  rows,
  title = "QA tests",
  className = "",
  onRowCheck,
  onRowSelect,
}: QaTestTableProps) {
  const [checked, setChecked] = React.useState<Record<string, boolean>>({});

  const toggle = (row: QaTestRow) => {
    const next = !checked[row.id];
    setChecked((c) => ({ ...c, [row.id]: next }));
    onRowCheck?.(row, next);
  };

  const answeredCount = rows.filter((r) => r.answered !== false).length;

  return (
    <div
      data-qa-test-table
      className={`w-full overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 ${className}`}
    >
      <div className="flex items-center gap-2 border-b border-zinc-100 px-4 py-2.5 dark:border-zinc-800">
        <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-200">{title}</span>
        <span className="ml-auto text-[11px] tabular-nums text-zinc-400 dark:text-zinc-500">
          {rows.length} questions
        </span>
        <span className="text-[11px] tabular-nums text-emerald-600 dark:text-emerald-400">
          {answeredCount} answered
        </span>
      </div>
      <table data-qa-rows className="w-full text-left">
        <thead>
          <tr className="border-b border-zinc-100 text-[10px] uppercase tracking-wider text-zinc-400 dark:border-zinc-800 dark:text-zinc-500">
            <th className="w-10 py-2 pl-4 font-medium"></th>
            <th className="py-2 pr-3 font-medium">Question</th>
            <th className="py-2 pr-3 text-center font-medium">Answer status</th>
            <th className="py-2 pr-4 font-medium">Answer rating</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.id}
              data-qa-row={row.id}
              onClick={() => onRowSelect?.(row)}
              className={`border-b border-zinc-50 text-xs transition-colors dark:border-zinc-800/60 ${
                onRowSelect ? "cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/60" : ""
              }`}
            >
              <td className="py-2.5 pl-4">
                <input
                  type="checkbox"
                  data-qa-check
                  aria-label={`Select ${row.question}`}
                  checked={!!checked[row.id]}
                  onClick={(e) => e.stopPropagation()}
                  onChange={() => toggle(row)}
                  className="h-3.5 w-3.5 cursor-pointer accent-emerald-600"
                />
              </td>
              <td data-qa-question className="max-w-72 truncate py-2.5 pr-3 text-zinc-800 dark:text-zinc-100">
                {row.question}
              </td>
              <td className="py-2.5 pr-3 text-center">
                {row.answered !== false ? (
                  <span data-qa-status className="text-emerald-500">✓</span>
                ) : (
                  <span data-qa-status className="text-zinc-300 dark:text-zinc-600">—</span>
                )}
              </td>
              <td className="py-2.5 pr-4">
                {row.rating && (
                  <span
                    data-qa-rating={row.rating}
                    className={`inline rounded-full px-2 py-0.5 text-[10px] font-semibold ${RATING_CHIP[row.rating]}`}
                  >
                    {RATING_LABEL[row.rating]}
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
