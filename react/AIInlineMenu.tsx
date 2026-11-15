import React from "react";

export interface AIAction {
  id: string;
  label: string;
  options?: string[];
}

export interface AIInlineMenuProps {
  actions?: AIAction[];
  loading?: boolean;
  error?: string;
  tone?: "neutral" | "brand";
  onAction?: (id: string, option?: string) => void;
  onDismiss?: () => void;
  className?: string;
}

const SPARKLE_SVG = (
  <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5" aria-hidden="true">
    <path d="M10 2.5l1.4 4.1L15.5 8l-4.1 1.4L10 13.5 8.6 9.4 4.5 8l4.1-1.4L10 2.5Z" />
    <path d="M15.8 12.6l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7.7-2Z" opacity="0.7" />
  </svg>
);

const CARET_SVG = (
  <svg viewBox="0 0 20 20" fill="none" className="h-3.5 w-3.5" aria-hidden="true">
    <path d="m6 8 4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const CLOSE_SVG = (
  <svg viewBox="0 0 20 20" fill="none" className="h-3 w-3" aria-hidden="true">
    <path d="m5 5 10 10M15 5 5 15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

/**
 * AIInlineMenu - selection-anchored floating AI action pill with badge chip, dropdown actions and loading state.
 */
export default function AIInlineMenu({
  actions = [
    { id: "edit", label: "Edit" },
    { id: "tone", label: "Change tone", options: ["Professional", "Friendly", "Concise"] },
  ],
  loading = false,
  error,
  tone = "neutral",
  onAction,
  onDismiss,
  className = "",
}: AIInlineMenuProps) {
  const [openId, setOpenId] = React.useState<string | null>(null);
  const [lastRun, setLastRun] = React.useState<string | null>(null);

  const run = (action: AIAction, option?: string) => {
    if (loading) return;
    setOpenId(null);
    setLastRun(`${action.id}${option ? `:${option}` : ""}`);
    onAction?.(action.id, option);
  };

  const brand = tone === "brand";

  return (
    <div
      data-ai-inline-menu
      className={`inline-flex max-w-full items-center gap-1 rounded-full border bg-white py-1 pl-1.5 pr-1 shadow-lg dark:bg-zinc-900 ${
        error ? "border-red-300 dark:border-red-900" : "border-zinc-200 dark:border-zinc-700"
      } ${className}`}
    >
      <span
        className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
          brand
            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
            : "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-300"
        }`}
      >
        <span className={loading ? "animate-pulse" : ""}>{SPARKLE_SVG}</span>
        AI
      </span>
      <span className="mx-0.5 h-4 w-px bg-zinc-200 dark:bg-zinc-700" />
      {actions.map((action) => (
        <div key={action.id} className="relative">
          <button
            type="button"
            data-ai-action={action.id}
            disabled={loading}
            onClick={() => {
              if (action.options?.length) setOpenId(openId === action.id ? null : action.id);
              else run(action);
            }}
            className="inline-flex items-center gap-0.5 rounded-md px-1.5 py-1 text-xs font-medium text-indigo-600 transition-colors hover:bg-indigo-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 dark:text-indigo-300 dark:hover:bg-indigo-950/60"
          >
            {action.label}
            {action.options?.length ? CARET_SVG : null}
          </button>
          {openId === action.id ? (
            <div data-ai-menu className="absolute bottom-full left-0 z-10 mb-1 w-40 rounded-lg border border-zinc-200 bg-white py-1 shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
              {action.options!.map((option) => (
                <button
                  key={option}
                  type="button"
                  data-ai-option={option}
                  onClick={() => run(action, option)}
                  className="block w-full px-3 py-1.5 text-left text-xs text-zinc-700 hover:bg-indigo-50 hover:text-indigo-700 dark:text-zinc-200 dark:hover:bg-indigo-950/60 dark:hover:text-indigo-300"
                >
                  {option}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      ))}
      {lastRun && !loading && !error ? (
        <span data-ai-status className="max-w-[160px] truncate px-1 text-[10px] text-zinc-400" title={lastRun}>
          {lastRun}
        </span>
      ) : null}
      {loading ? <span data-ai-loading className="px-1 text-[10px] text-indigo-500">Working…</span> : null}
      {error ? <span data-ai-error className="px-1 text-[10px] text-red-600 dark:text-red-400">{error}</span> : null}
      <button
        type="button"
        data-ai-dismiss
        title="Dismiss"
        onClick={() => {
          setOpenId(null);
          onDismiss?.();
        }}
        className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:hover:bg-zinc-800"
      >
        {CLOSE_SVG}
      </button>
    </div>
  );
}
