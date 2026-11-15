import React from "react";

export interface ClarifyQuestionCardProps {
  question: string;
  title?: string;
  value?: string;
  placeholder?: string;
  index?: number;
  total?: number;
  answered?: boolean;
  stepLabel?: string;
  onAnswer?: (value: string) => void;
  onPrev?: () => void;
  onNext?: () => void;
}

/**
 * ClarifyQuestionCard - human-in-the-loop clarification question with paging and answer input.
 */
export default function ClarifyQuestionCard({
  question,
  title,
  value = "",
  placeholder = "Type your answer…",
  index = 1,
  total = 1,
  answered = false,
  stepLabel = "Used ask user question",
  onAnswer,
  onPrev,
  onNext,
}: ClarifyQuestionCardProps) {
  return (
    <div data-clarify-card className="w-full rounded-lg border border-indigo-300 bg-white p-3 dark:border-indigo-500/60 dark:bg-zinc-900">
      <div className="flex items-start gap-2.5">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-xs font-bold text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-300">?</span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-zinc-900 dark:text-zinc-50">{title || question}</p>
          {title ? <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">{question}</p> : null}
        </div>
        {total > 1 ? (
          <span data-clarify-paging className="flex shrink-0 items-center gap-1 text-[11px] font-medium text-indigo-500 dark:text-indigo-400">
            <button type="button" data-clarify-prev aria-label="Previous question" onClick={() => onPrev?.()} className="rounded px-1 transition-colors hover:bg-indigo-50 dark:hover:bg-indigo-950/60">
              ‹
            </button>
            {index} of {total}
            <button type="button" data-clarify-next aria-label="Next question" onClick={() => onNext?.()} className="rounded px-1 transition-colors hover:bg-indigo-50 dark:hover:bg-indigo-950/60">
              ›
            </button>
          </span>
        ) : null}
      </div>

      {answered ? (
        <p data-clarify-value className="mt-2.5 rounded-md bg-zinc-100 px-3 py-2 text-xs text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
          {value || "—"}
        </p>
      ) : (
        <input
          type="text"
          defaultValue={value}
          placeholder={placeholder}
          data-clarify-input
          onKeyDown={(event) => {
            if (event.key === "Enter") onAnswer?.((event.target as HTMLInputElement).value);
          }}
          className="mt-2.5 w-full rounded-md bg-zinc-100 px-3 py-2 text-xs text-zinc-900 placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:bg-zinc-800 dark:text-zinc-50"
        />
      )}

      <p data-clarify-step className="mt-2 flex items-center gap-1.5 text-[11px] text-zinc-400 dark:text-zinc-500">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3 w-3 text-emerald-500">
          <path d="m5 12 4 4L19 6" />
        </svg>
        {stepLabel}
      </p>
    </div>
  );
}
