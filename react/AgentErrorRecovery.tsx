import React from "react";

export interface AgentErrorRecoveryProps {
  /** Error headline, e.g. "Oops! Something went wrong" */
  title?: string;
  /** Explanation of what failed */
  description?: string;
  /** Optional run/step identifier shown in a mono chip */
  runId?: string;
  /** Primary retry label */
  retryLabel?: string;
  /** Secondary reset label; hidden when falsy */
  resetLabel?: string;
  /** Support contact line; hidden when falsy */
  supportText?: string;
  onRetry?: () => void;
  onReset?: () => void;
  className?: string;
}

/**
 * AgentErrorRecovery - agent run failure recovery state: error headline with
 * an optional run id chip, Retry / Start-over actions and a support line,
 * in the Typeform/Rive error-state style.
 */
export default function AgentErrorRecovery({
  title = "Oops! Something went wrong",
  description = "The agent run failed unexpectedly. Please try again.",
  runId,
  retryLabel = "Retry",
  resetLabel = "Start over",
  supportText,
  onRetry,
  onReset,
  className = "",
}: AgentErrorRecoveryProps) {
  return (
    <div
      data-agent-error
      role="alert"
      className={`flex flex-col items-center justify-center rounded-xl border border-zinc-200 bg-white px-6 py-10 text-center dark:border-zinc-800 dark:bg-zinc-900 ${className}`}
    >
      <div aria-hidden="true" className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 dark:bg-rose-950/60">
        <svg className="h-6 w-6 text-rose-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      </div>
      <p data-agent-error-title className="mt-4 text-base font-semibold text-zinc-900 dark:text-zinc-50">{title}</p>
      {runId && (
        <code data-agent-error-run className="mt-1.5 rounded bg-zinc-100 px-2 py-0.5 font-mono text-[11px] text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">{runId}</code>
      )}
      <p data-agent-error-description className="mt-2 max-w-sm text-xs text-zinc-500 dark:text-zinc-400">{description}</p>
      <div data-agent-error-actions className="mt-5 flex items-center gap-2">
        <button
          type="button"
          data-agent-error-retry
          onClick={() => onRetry?.()}
          className="rounded-lg bg-zinc-900 px-4 py-2 text-xs font-semibold text-zinc-50 transition-colors hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          {retryLabel}
        </button>
        {resetLabel && (
          <button
            type="button"
            data-agent-error-reset
            onClick={() => onReset?.()}
            className="rounded-lg bg-zinc-100 px-4 py-2 text-xs font-semibold text-zinc-600 transition-colors hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
          >
            {resetLabel}
          </button>
        )}
      </div>
      {supportText && (
        <p data-agent-error-support className="mt-4 text-[11px] text-zinc-400 dark:text-zinc-500">{supportText}</p>
      )}
    </div>
  );
}
