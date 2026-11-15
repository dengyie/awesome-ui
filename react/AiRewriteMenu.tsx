import React from "react";

export interface RewriteAction {
  id: string;
  label: string;
  badge?: string;
}

export interface AiRewriteMenuProps {
  open?: boolean;
  triggerLabel?: string;
  actions?: RewriteAction[];
  className?: string;
  onSelect?: (action: RewriteAction) => void;
  onToggle?: () => void;
}

/**
 * AiRewriteMenu - Intercom composer AI rewrite menu: a trigger button that
 * opens a popover of writing-assistant actions (Expand, Rephrase, tone
 * variants, Fix grammar, Translate) with optional feature badges.
 */
export default function AiRewriteMenu({
  open = false,
  triggerLabel = "Rewrite",
  actions = [],
  className = "",
  onSelect,
  onToggle,
}: AiRewriteMenuProps) {
  return (
    <div data-rewrite-menu-root className={`relative inline-block ${className}`}>
      <button
        type="button"
        data-rewrite-trigger
        aria-expanded={open}
        onClick={() => onToggle?.()}
        className="flex items-center gap-1.5 rounded-md border border-zinc-200 bg-white px-2.5 py-1.5 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
      >
        <span aria-hidden="true" className="text-indigo-500">✦</span>
        {triggerLabel}
        <span aria-hidden="true" className="text-zinc-400">▾</span>
      </button>
      {open && actions.length > 0 && (
        <div
          data-rewrite-menu
          className="absolute bottom-full left-0 z-10 mb-2 w-60 overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-lg dark:border-zinc-700 dark:bg-zinc-900"
        >
          {actions.map((action) => (
            <button
              key={action.id}
              type="button"
              data-rewrite-item={action.id}
              onClick={() => onSelect?.(action)}
              className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-xs text-zinc-700 transition-colors hover:bg-zinc-50 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              <span data-rewrite-item-label>{action.label}</span>
              {action.badge && (
                <span
                  data-rewrite-item-badge
                  className="inline-flex shrink-0 items-center gap-1 rounded-full bg-indigo-50 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-300"
                >
                  <span aria-hidden="true">↑</span>
                  {action.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
