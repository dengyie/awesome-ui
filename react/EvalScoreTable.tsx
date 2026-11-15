import React from "react";

export type EvalScoreTone = "pass" | "warn" | "fail";

export interface EvalRun {
  id: string;
  name: string;
  score: number;
  grader?: string;
  tone?: EvalScoreTone;
}

export interface EvalCriteria {
  id: string;
  title: string;
  description: string;
}

export interface EvalScoreTableProps {
  runs: EvalRun[];
  criteria?: EvalCriteria[];
  title?: string;
  className?: string;
  onRunSelect?: (run: EvalRun) => void;
  onAddCriteria?: () => void;
}

const toneClasses = (tone?: EvalScoreTone) => {
  switch (tone) {
    case "warn":
      return "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300";
    case "fail":
      return "bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300";
    default:
      return "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300";
  }
};

const toneBar = (tone?: EvalScoreTone) => {
  switch (tone) {
    case "warn":
      return "bg-amber-500";
    case "fail":
      return "bg-red-500";
    default:
      return "bg-emerald-500";
  }
};

/**
 * EvalScoreTable - evaluation runs report with score bars and test criteria
 * cards (OpenAI Evals / Braintrust experiments pattern).
 */
export default function EvalScoreTable({
  runs,
  criteria = [],
  title = "Evaluation report",
  className = "",
  onRunSelect,
  onAddCriteria,
}: EvalScoreTableProps) {
  return (
    <div
      data-eval-score-table
      className={`w-full overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 ${className}`}
    >
      <div className="flex items-center gap-2 border-b border-zinc-100 px-4 py-2.5 dark:border-zinc-800">
        <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-200">{title}</span>
        <span className="ml-auto text-[11px] text-zinc-400 dark:text-zinc-500">
          {runs.length} runs
        </span>
      </div>

      <div className="px-4 py-3">
        <table data-eval-runs className="w-full text-left">
          <thead>
            <tr className="border-b border-zinc-100 text-[10px] uppercase tracking-wider text-zinc-400 dark:border-zinc-800 dark:text-zinc-500">
              <th className="py-1.5 pr-3 font-medium">Run</th>
              <th className="py-1.5 pr-3 font-medium">Score</th>
              <th className="py-1.5 font-medium">Grader</th>
            </tr>
          </thead>
          <tbody>
            {runs.map((run) => (
              <tr
                key={run.id}
                data-eval-run={run.id}
                onClick={() => onRunSelect?.(run)}
                className={`border-b border-zinc-50 text-xs transition-colors dark:border-zinc-800/60 ${
                  onRunSelect ? "cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/60" : ""
                }`}
              >
                <td className="py-2 pr-3 font-medium text-zinc-800 dark:text-zinc-100">{run.name}</td>
                <td className="py-2 pr-3">
                  <span className="flex items-center gap-2">
                    <span data-eval-score className={`rounded-md px-2 py-0.5 text-[11px] font-semibold tabular-nums ${toneClasses(run.tone)}`}>
                      {run.score}%
                    </span>
                    <span className="h-1.5 w-20 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                      <span
                        data-eval-score-bar
                        className={`block h-full rounded-full ${toneBar(run.tone)}`}
                        style={{ width: `${Math.min(Math.max(run.score, 0), 100)}%` }}
                      />
                    </span>
                  </span>
                </td>
                <td className="py-2 text-zinc-500 dark:text-zinc-400">{run.grader ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {criteria.length > 0 && (
          <div data-eval-criteria className="mt-4 grid gap-3 sm:grid-cols-2">
            {criteria.map((c) => (
              <div
                key={c.id}
                data-eval-criterion={c.id}
                className="rounded-lg border border-zinc-200 p-3 dark:border-zinc-700"
              >
                <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-100">{c.title}</p>
                <p className="mt-1 text-[11px] leading-relaxed text-zinc-500 dark:text-zinc-400">
                  {c.description}
                </p>
              </div>
            ))}
          </div>
        )}

        {onAddCriteria && (
          <button
            type="button"
            data-eval-add-criteria
            onClick={() => onAddCriteria()}
            className="mt-3 flex w-full flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed border-zinc-300 py-3 text-xs font-medium text-zinc-500 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800/60"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-100 text-sm dark:bg-zinc-800">+</span>
            Add criteria
          </button>
        )}
      </div>
    </div>
  );
}
