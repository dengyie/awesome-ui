/**
 * AiSuggestionCard - Proactive AI suggestion card: sparkle avatar, message
 * paragraph, follow-up action chips and a dismiss close button (Mindtrip).
 */
import React from "react";

export interface AiSuggestionCardProps {
  message?: string;
  chips?: string[];
  className?: string;
  onChipClick?: (chip: string) => void;
  onClose?: () => void;
}

export default function AiSuggestionCard({
  message = "Looking ahead to tomorrow in Tokyo. Want a quick rundown of the plan and a weather check?",
  chips = ["Weather for tomorrow", "Summarize tomorrow", "View Senso-ji details"],
  className = "",
  onChipClick,
  onClose,
}: AiSuggestionCardProps) {
  return (
    <div data-ai-suggestion-card className={`w-full rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 ${className}`}>
      <div className="flex items-start gap-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-sm text-zinc-50 dark:bg-zinc-50 dark:text-zinc-900">
          ✦
        </span>
        <p data-ai-suggestion-message className="flex-1 text-sm font-medium leading-relaxed text-zinc-900 dark:text-zinc-50">
          {message}
        </p>
        <button
          type="button"
          data-ai-suggestion-close
          aria-label="Dismiss suggestion"
          onClick={() => onClose?.()}
          className="-mr-1 -mt-1 rounded-md p-1 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
        >
          ✕
        </button>
      </div>
      {chips.length ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {chips.map((chip) => (
            <button
              key={chip}
              type="button"
              data-ai-suggestion-chip
              onClick={() => onChipClick?.(chip)}
              className="rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800/60 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              {chip}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
