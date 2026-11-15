import React from "react";
export interface TourTooltipProps {
  step: number;
  totalSteps: number;
  title: string;
  body: string;
  theme?: "light" | "dark";
  caret?: "top" | "bottom" | "none";
  feedback?: boolean;
  onPrev?: () => void;
  onNext?: () => void;
  onDismiss?: () => void;
  onFeedback?: (helpful: boolean) => void;
}

/**
 * TourTooltip - anchored coach mark with step counter, prev/next flow and optional thumbs feedback.
 */
export default function TourTooltip({
  step,
  totalSteps,
  title,
  body,
  theme = "light",
  caret = "top",
  feedback = false,
  onPrev,
  onNext,
  onDismiss,
  onFeedback,
}: TourTooltipProps) {
  const dark = theme === "dark";
  const surface = dark
    ? "bg-zinc-900 text-zinc-50 border-zinc-700"
    : "bg-white text-zinc-900 border-zinc-200";
  const bodyTone = dark ? "text-zinc-300" : "text-zinc-500";
  const caretClass =
    caret === "top"
      ? "before:absolute before:-top-1.5 before:left-8 before:h-3 before:w-3 before:rotate-45 before:rounded-[2px] before:border-l before:border-t"
      : caret === "bottom"
        ? "after:absolute after:-bottom-1.5 after:left-8 after:h-3 after:w-3 after:rotate-45 after:rounded-[2px] after:border-r after:border-b"
        : "";
  const caretBorder = dark ? "before:border-zinc-700 after:border-zinc-700" : "before:border-zinc-200 after:border-zinc-200";
  const caretBg = dark ? "before:bg-zinc-900 after:bg-zinc-900" : "before:bg-white after:bg-white";

  return (
    <div
      data-tour-tooltip
      className={`relative w-80 rounded-xl border p-4 shadow-xl ${surface} ${caretClass} ${caretBorder} ${caretBg}`}
      role="dialog"
      aria-label={title}
    >
      <div className="flex items-start justify-between gap-3">
        <p className={`text-[11px] font-semibold uppercase tracking-wide ${dark ? "text-zinc-400" : "text-zinc-400"}`}>
          Step {step} of {totalSteps}
        </p>
        <button
          type="button"
          data-tour-dismiss
          aria-label="Dismiss"
          onClick={() => onDismiss?.()}
          className={`rounded-md p-0.5 transition-colors ${dark ? "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200" : "text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600"}`}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      </div>

      <p className="mt-2 text-sm font-bold leading-snug">{title}</p>
      <p className={`mt-1.5 text-xs leading-relaxed ${bodyTone}`}>{body}</p>

      <div className="mt-4 flex items-center justify-between border-t pt-3" style={{ borderColor: dark ? "rgb(63 63 70)" : "rgb(228 228 231)" }}>
        {feedback ? (
          <div className="flex items-center gap-1.5">
            <span className={`text-[11px] ${dark ? "text-zinc-400" : "text-zinc-500"}`}>Was this helpful?</span>
            <button
              type="button"
              data-tour-feedback-up
              aria-label="Yes"
              onClick={() => onFeedback?.(true)}
              className={`rounded-md border px-1.5 py-0.5 text-xs transition-colors ${dark ? "border-zinc-600 hover:bg-zinc-800" : "border-zinc-300 hover:bg-zinc-50"}`}
            >
              👍
            </button>
            <button
              type="button"
              data-tour-feedback-down
              aria-label="No"
              onClick={() => onFeedback?.(false)}
              className={`rounded-md border px-1.5 py-0.5 text-xs transition-colors ${dark ? "border-zinc-600 hover:bg-zinc-800" : "border-zinc-300 hover:bg-zinc-50"}`}
            >
              👎
            </button>
          </div>
        ) : (
          <span className={`text-[11px] ${dark ? "text-zinc-400" : "text-zinc-400"}`}>
            {step}/{totalSteps}
          </span>
        )}

        <div className="flex items-center gap-2">
          {step > 1 ? (
            <button
              type="button"
              data-tour-prev
              onClick={() => onPrev?.()}
              className={`text-xs font-medium transition-colors ${dark ? "text-zinc-300 hover:text-white" : "text-zinc-600 hover:text-zinc-900"}`}
            >
              Previous
            </button>
          ) : null}
          <button
            type="button"
            data-tour-next
            onClick={() => onNext?.()}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
              step >= totalSteps ? "bg-indigo-600 hover:bg-indigo-500" : "bg-zinc-900 hover:bg-zinc-700 dark:bg-indigo-600 dark:hover:bg-indigo-500"
            }`}
          >
            {step >= totalSteps ? "Finish tour" : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
}
