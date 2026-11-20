import React, { useState } from "react";

export interface SurveyQuestion {
  id: string;
  label: string;
  description?: string;
  options: { id: string; label: string }[];
  multi?: boolean;
  placeholder?: string;
}

export interface WorkspaceSurveyCardProps {
  title?: string;
  stepLabel?: string;
  questions: SurveyQuestion[];
  answers?: Record<string, string | string[]>;
  nextLabel?: string;
  className?: string;
  onAnswer?: (questionId: string, optionId: string) => void;
  onText?: (questionId: string, text: string) => void;
  onNext?: () => void;
}

/**
 * WorkspaceSurveyCard - Hex/AirOps onboarding survey: one card per question
 * group with option pills (single-select) or chips (multi-select), an optional
 * free-text line, a progress-dot strip and a gated Continue button.
 */
export const WorkspaceSurveyCard: React.FC<WorkspaceSurveyCardProps> = ({
  title = "Tell us about your workspace",
  stepLabel,
  questions,
  answers = {},
  nextLabel = "Continue",
  className = "",
  onAnswer,
  onText,
  onNext,
}) => {
  const [texts, setTexts] = useState<Record<string, string>>({});

  const answeredCount = questions.filter((q) => {
    const a = answers[q.id];
    return Array.isArray(a) ? a.length > 0 : typeof a === "string" && a.length > 0;
  }).length;
  const allAnswered = answeredCount === questions.length && questions.length > 0;

  return (
    <div
      data-workspace-survey
      className={`rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 ${className}`}
    >
      <div className="border-b border-zinc-100 dark:border-zinc-800 px-5 py-4">
        <h4 data-workspace-survey-title className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
          {title}
        </h4>
        {stepLabel && (
          <p data-workspace-survey-step className="mt-0.5 text-[11px] text-zinc-500 dark:text-zinc-400">
            {stepLabel}
          </p>
        )}
        <div data-workspace-survey-dots className="mt-3 flex items-center gap-1.5">
          {questions.map((q) => {
            const a = answers[q.id];
            const filled = Array.isArray(a) ? a.length > 0 : typeof a === "string" && a.length > 0;
            return (
              <span
                key={q.id}
                title={q.label}
                className={`h-1.5 w-6 rounded-full transition-colors ${filled ? "bg-indigo-600" : "bg-zinc-200 dark:bg-zinc-700"}`}
              />
            );
          })}
          <span className="ml-1 text-[11px] tabular-nums text-zinc-400 dark:text-zinc-500">
            {answeredCount}/{questions.length}
          </span>
        </div>
      </div>

      <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
        {questions.map((q) => {
          const answer = answers[q.id];
          const selected = Array.isArray(answer) ? answer : typeof answer === "string" ? [answer] : [];
          return (
            <div key={q.id} data-workspace-survey-question={q.id} className="px-5 py-4">
              <div className="text-xs font-medium text-zinc-800 dark:text-zinc-200">{q.label}</div>
              {q.description && (
                <p className="mt-0.5 text-[11px] text-zinc-500 dark:text-zinc-400">{q.description}</p>
              )}
              <div
                data-workspace-survey-options={q.id}
                role={q.multi ? "group" : "radiogroup"}
                aria-label={q.label}
                className="mt-2.5 flex flex-wrap gap-1.5"
              >
                {q.options.map((opt) => {
                  const active = selected.includes(opt.id);
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      data-workspace-survey-option={opt.id}
                      aria-pressed={q.multi ? active : undefined}
                      aria-checked={q.multi ? undefined : active}
                      onClick={() => onAnswer?.(q.id, opt.id)}
                      className={`rounded-full border px-3 py-1 text-[11px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                        active
                          ? "border-indigo-600 bg-indigo-600 text-white"
                          : "border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
              {q.placeholder && (
                <input
                  type="text"
                  data-workspace-survey-input={q.id}
                  value={texts[q.id] ?? ""}
                  placeholder={q.placeholder}
                  onChange={(e) => {
                    const text = e.target.value;
                    setTexts((prev) => ({ ...prev, [q.id]: text }));
                    onText?.(q.id, text);
                  }}
                  className="mt-2.5 w-full rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-xs text-zinc-900 placeholder-zinc-400 focus:border-indigo-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder-zinc-500"
                />
              )}
            </div>
          );
        })}
      </div>

      <div className="border-t border-zinc-100 dark:border-zinc-800 px-5 py-3">
        <button
          type="button"
          data-workspace-survey-next
          disabled={!allAnswered}
          onClick={() => onNext?.()}
          className={`w-full rounded-md px-3 py-2 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
            allAnswered
              ? "bg-indigo-600 text-white hover:bg-indigo-500"
              : "cursor-not-allowed bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500"
          }`}
        >
          {nextLabel}
        </button>
        {!allAnswered && (
          <p className="mt-1.5 text-center text-[11px] text-zinc-400 dark:text-zinc-500">
            Answer all {questions.length} questions to continue.
          </p>
        )}
      </div>
    </div>
  );
};

export default WorkspaceSurveyCard;
