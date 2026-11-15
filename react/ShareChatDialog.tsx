import React from "react";

export interface ShareChatDialogProps {
  open?: boolean;
  title?: string;
  description?: string;
  link?: string;
  shared?: boolean;
  onCreateLink?: () => void;
  onCopyLink?: () => void;
  onToggleShared?: (shared: boolean) => void;
  onClose?: () => void;
  className?: string;
}

/**
 * ShareChatDialog - Claude / Langdock / Mistral style share-conversation
 * dialog: a private-vs-public-link choice with an inline link row and copy
 * action once the link exists.
 */
export default function ShareChatDialog({
  open = true,
  title = "Share chat",
  description = "Anyone with the link can view this conversation. Future messages aren't included.",
  link = "",
  shared = false,
  onCreateLink,
  onCopyLink,
  onToggleShared,
  onClose,
  className = "",
}: ShareChatDialogProps) {
  if (!open) return null;
  return (
    <div
      data-share-chat
      role="dialog"
      aria-modal="true"
      className={`w-full max-w-md rounded-xl border border-zinc-200 bg-white p-4 shadow-xl dark:border-zinc-800 dark:bg-zinc-900 ${className}`}
    >
      <div className="flex items-start justify-between">
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{title}</h3>
        <button
          type="button"
          data-share-close
          aria-label="Close"
          onClick={onClose}
          className="rounded p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
        >
          ✕
        </button>
      </div>
      <p className="mt-1 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">{description}</p>

      <div className="mt-3 space-y-1 rounded-lg border border-zinc-200 p-1 dark:border-zinc-800">
        <button
          type="button"
          data-share-private
          onClick={() => onToggleShared?.(false)}
          className={`flex w-full items-center gap-3 rounded-md px-2.5 py-2 text-left transition-colors ${
            !shared ? "bg-zinc-100 dark:bg-zinc-800" : "hover:bg-zinc-50 dark:hover:bg-zinc-800/60"
          }`}
        >
          <span aria-hidden="true">🔒</span>
          <span className="min-w-0 flex-1">
            <span className="block text-xs font-semibold text-zinc-800 dark:text-zinc-100">Keep private</span>
            <span className="block text-[11px] text-zinc-500 dark:text-zinc-400">Only you have access</span>
          </span>
          {!shared && <span className="text-indigo-600 dark:text-indigo-400" aria-hidden="true">✓</span>}
        </button>
        <button
          type="button"
          data-share-public
          onClick={() => onToggleShared?.(true)}
          className={`flex w-full items-center gap-3 rounded-md px-2.5 py-2 text-left transition-colors ${
            shared ? "bg-zinc-100 dark:bg-zinc-800" : "hover:bg-zinc-50 dark:hover:bg-zinc-800/60"
          }`}
        >
          <span aria-hidden="true">🌐</span>
          <span className="min-w-0 flex-1">
            <span className="block text-xs font-semibold text-zinc-800 dark:text-zinc-100">Create public link</span>
            <span className="block text-[11px] text-zinc-500 dark:text-zinc-400">Anyone with the link can view</span>
          </span>
          {shared && <span className="text-indigo-600 dark:text-indigo-400" aria-hidden="true">✓</span>}
        </button>
      </div>

      {shared && (
        <div className="mt-3 flex items-center gap-2">
          {link ? (
            <>
              <code
                data-share-link
                className="min-w-0 flex-1 truncate rounded-md bg-zinc-100 px-2.5 py-2 font-mono text-[11px] text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
              >
                {link}
              </code>
              <button
                type="button"
                data-share-copy
                onClick={onCopyLink}
                className="shrink-0 rounded-md bg-zinc-900 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                Copy link
              </button>
            </>
          ) : (
            <button
              type="button"
              data-share-create
              onClick={onCreateLink}
              className="w-full rounded-md bg-indigo-600 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-indigo-500"
            >
              Create link
            </button>
          )}
        </div>
      )}
    </div>
  );
}
