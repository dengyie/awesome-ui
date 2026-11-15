import React from "react";

export interface ImageMenuAction {
  id: string;
  label: string;
  icon?: string;
  danger?: boolean;
}

export interface ImageActionMenuProps {
  open?: boolean;
  actions?: ImageMenuAction[];
  className?: string;
  onAction?: (action: ImageMenuAction) => void;
  onClose?: () => void;
}

/**
 * ImageActionMenu - Krea generated-image context menu: Fullscreen / Vary /
 * Edit / Upscale & enhance / Make video / Download actions anchored to an
 * image card, with optional danger styling and per-action icons.
 */
export default function ImageActionMenu({
  open = true,
  actions = [],
  className = "",
  onAction,
  onClose,
}: ImageActionMenuProps) {
  if (!open) return null;
  const iconFor = (action: ImageMenuAction) =>
    action.icon ?? { Fullscreen: "⛶", Vary: "↻", Edit: "✎", "Make video": "▶", Download: "↓" }[action.label] ?? "•";
  return (
    <div
      data-image-action-menu
      className={`w-56 overflow-hidden rounded-lg border border-zinc-200 bg-white py-1 shadow-lg dark:border-zinc-700 dark:bg-zinc-900 ${className}`}
    >
      {actions.length === 0 ? (
        <p data-image-action-empty className="px-3 py-3 text-center text-xs text-zinc-400 dark:text-zinc-500">
          No actions available.
        </p>
      ) : (
        actions.map((action, i) => (
          <React.Fragment key={action.id}>
            {i > 0 && action.id === "download" && (
              <div className="my-1 h-px bg-zinc-100 dark:bg-zinc-800" />
            )}
            <button
              type="button"
              data-image-action={action.id}
              onClick={() => onAction?.(action)}
              className={`flex w-full items-center gap-2.5 px-3 py-2 text-left text-xs transition-colors ${
                action.danger
                  ? "text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40"
                  : "text-zinc-700 hover:bg-zinc-50 dark:text-zinc-200 dark:hover:bg-zinc-800"
              }`}
            >
              <span aria-hidden="true" className="w-4 shrink-0 text-center text-zinc-400 dark:text-zinc-500">
                {iconFor(action)}
              </span>
              <span data-image-action-label>{action.label}</span>
            </button>
          </React.Fragment>
        ))
      )}
    </div>
  );
}
