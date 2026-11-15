import React from "react";

export type CompareStatus = "done" | "streaming" | "error";

export interface ModelComparePaneProps {
  prompt?: string;
  modelA?: string;
  modelB?: string;
  outputA?: string;
  outputB?: string;
  statusA?: CompareStatus;
  statusB?: CompareStatus;
  voteLabelA?: string;
  voteLabelB?: string;
  voteLabelTie?: string;
  onVote?: (choice: "A" | "B" | "tie") => void;
  className?: string;
}

const ERROR_TEXT = "Generation failed — try again.";

/**
 * ModelComparePane - LMArena style side-by-side model comparison: one shared
 * prompt, two anonymous model outputs and a vote bar (A / Tie / B).
 */
export default function ModelComparePane({
  prompt = "",
  modelA = "Model A",
  modelB = "Model B",
  outputA = "",
  outputB = "",
  statusA = "done",
  statusB = "done",
  voteLabelA = "A is better",
  voteLabelB = "B is better",
  voteLabelTie = "Tie",
  onVote,
  className = "",
}: ModelComparePaneProps) {
  const column = (side: "a" | "b") => {
    const model = side === "a" ? modelA : modelB;
    const output = side === "a" ? outputA : outputB;
    const status = side === "a" ? statusA : statusB;
    return (
      <div
        data-compare-col={side}
        className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-800/60"
      >
        <div className="flex items-center justify-between">
          <span data-compare-model={side} className="rounded-full bg-zinc-900 px-2 py-0.5 text-[11px] font-semibold text-white dark:bg-white dark:text-zinc-900">{model}</span>
          {status === "streaming" && (
            <span data-compare-status={side} className="flex items-center gap-1 text-[11px] font-medium text-indigo-600 dark:text-indigo-400">
              streaming
              <span className="flex gap-0.5" aria-hidden="true">
                <span className="h-1 w-1 animate-bounce rounded-full bg-indigo-500 [animation-delay:0ms]" />
                <span className="h-1 w-1 animate-bounce rounded-full bg-indigo-500 [animation-delay:150ms]" />
                <span className="h-1 w-1 animate-bounce rounded-full bg-indigo-500 [animation-delay:300ms]" />
              </span>
            </span>
          )}
          {status === "error" && <span data-compare-status={side} className="text-[11px] font-medium text-red-600 dark:text-red-400">error</span>}
        </div>
        <p
          data-compare-output={side}
          className={`mt-2 min-h-16 whitespace-pre-wrap text-sm leading-relaxed ${
            status === "error" ? "text-red-600 dark:text-red-400" : "text-zinc-800 dark:text-zinc-100"
          }`}
        >
          {status === "error" ? ERROR_TEXT : output}
        </p>
      </div>
    );
  };

  return (
    <div data-model-compare className={`rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 ${className}`}>
      {prompt && (
        <p data-compare-prompt className="mb-3 rounded-lg bg-indigo-50 px-3 py-2 text-sm text-zinc-800 dark:bg-indigo-950/40 dark:text-zinc-100">
          <span className="mr-1.5 font-semibold text-indigo-700 dark:text-indigo-300">Prompt</span>
          {prompt}
        </p>
      )}
      <div className="grid gap-3 md:grid-cols-2">
        {column("a")}
        {column("b")}
      </div>
      <div data-compare-votebar className="mt-3 grid grid-cols-3 gap-2">
        <button type="button" data-compare-vote="A" onClick={() => onVote?.("A")} className="rounded-md border border-zinc-200 py-2 text-xs font-semibold text-zinc-700 transition-colors hover:border-indigo-400 hover:text-indigo-600 dark:border-zinc-700 dark:text-zinc-200">
          👈 {voteLabelA}
        </button>
        <button type="button" data-compare-vote="tie" onClick={() => onVote?.("tie")} className="rounded-md border border-zinc-200 py-2 text-xs font-semibold text-zinc-700 transition-colors hover:border-zinc-400 dark:border-zinc-700 dark:text-zinc-200">
          🤝 {voteLabelTie}
        </button>
        <button type="button" data-compare-vote="B" onClick={() => onVote?.("B")} className="rounded-md border border-zinc-200 py-2 text-xs font-semibold text-zinc-700 transition-colors hover:border-indigo-400 hover:text-indigo-600 dark:border-zinc-700 dark:text-zinc-200">
          👉 {voteLabelB}
        </button>
      </div>
    </div>
  );
}
