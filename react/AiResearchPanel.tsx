import React from "react";

export interface ResearchTemplate {
  id: string;
  title: string;
  description: string;
}

export interface AiResearchPanelProps {
  open?: boolean;
  title?: string;
  templates?: ResearchTemplate[];
  runLabel?: string;
  className?: string;
  onRun?: (template: ResearchTemplate) => void;
  onRunCustom?: () => void;
  onClose?: () => void;
}

/**
 * AiResearchPanel - Apollo "Research with AI" slide-over: a stacked list of
 * research template cards with Try it CTAs and a "Run custom AI prompt"
 * footer action.
 */
export default function AiResearchPanel({
  open = true,
  title = "Research with AI",
  templates = [],
  runLabel = "Run custom AI prompt",
  className = "",
  onRun,
  onRunCustom,
  onClose,
}: AiResearchPanelProps) {
  if (!open) return null;
  return (
    <aside
      data-ai-research-panel
      className={`flex w-full max-w-sm flex-col rounded-xl border border-zinc-200 bg-white shadow-xl dark:border-zinc-800 dark:bg-zinc-900 ${className}`}
    >
      <header className="flex items-center justify-between border-b border-zinc-100 px-4 py-3 dark:border-zinc-800">
        <h4 data-ai-research-title className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
          {title}
        </h4>
        <button
          type="button"
          data-ai-research-close
          aria-label="Close research panel"
          onClick={() => onClose?.()}
          className="rounded p-1 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
        >
          ✕
        </button>
      </header>
      <div data-ai-research-list className="flex-1 space-y-2.5 overflow-y-auto px-4 py-3">
        {templates.length === 0 ? (
          <p data-ai-research-empty className="py-6 text-center text-xs text-zinc-400 dark:text-zinc-500">
            No research templates yet.
          </p>
        ) : (
          templates.map((t) => (
            <div
              key={t.id}
              data-research-card={t.id}
              className="rounded-lg border border-zinc-200 p-3 transition-colors hover:border-zinc-300 dark:border-zinc-700 dark:hover:border-zinc-600"
            >
              <p data-research-title className="text-xs font-semibold text-zinc-900 dark:text-zinc-50">
                {t.title}
              </p>
              <p data-research-desc className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-zinc-500 dark:text-zinc-400">
                {t.description}
              </p>
              <button
                type="button"
                data-research-run
                onClick={() => onRun?.(t)}
                className="mt-2.5 w-full rounded-md border border-zinc-200 px-2 py-1.5 text-[11px] font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
              >
                Try it
              </button>
            </div>
          ))
        )}
      </div>
      <footer className="border-t border-zinc-100 px-4 py-3 dark:border-zinc-800">
        <button
          type="button"
          data-ai-research-custom
          onClick={() => onRunCustom?.()}
          className="w-full rounded-md bg-zinc-900 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          {runLabel}
        </button>
      </footer>
    </aside>
  );
}
