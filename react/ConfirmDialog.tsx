import React, { useEffect, useState } from "react";
import { UiIcon } from "./UiIcon";

export interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  /** Visual + semantic weight of the action. */
  tone?: "danger" | "warning" | "default";
  /** When set, the user must type this exact text before confirming. */
  requireText?: string;
  loading?: boolean;
  onConfirm?: () => void;
  onCancel?: () => void;
  className?: string;
}

const TONE_META = {
  danger: {
    chip: "bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400",
    button:
      "bg-red-600 hover:bg-red-500 focus-visible:ring-red-500",
    icon: "alert-triangle" as const,
  },
  warning: {
    chip: "bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400",
    button:
      "bg-amber-500 hover:bg-amber-400 focus-visible:ring-amber-500",
    icon: "alert-triangle" as const,
  },
  default: {
    chip: "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400",
    button:
      "bg-indigo-600 hover:bg-indigo-500 focus-visible:ring-indigo-500",
    icon: "info" as const,
  },
};

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  tone = "default",
  requireText,
  loading = false,
  onConfirm,
  onCancel,
  className = "",
}) => {
  const [typed, setTyped] = useState("");

  // Reset the type-to-confirm input every time the dialog opens.
  useEffect(() => {
    if (isOpen) setTyped("");
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onCancel?.();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  const meta = TONE_META[tone] || TONE_META.default;
  const blocked = Boolean(requireText) && typed !== requireText;
  const canConfirm = !blocked && !loading;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={() => !loading && onCancel?.()}
    >
      <div
        className={`w-full max-w-sm rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-5 shadow-2xl ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3">
          <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${meta.chip}`}>
            <UiIcon name={meta.icon} size={18} />
          </span>
          <div className="min-w-0 pt-0.5">
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{title}</h2>
            {description && (
              <p className="mt-1 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">{description}</p>
            )}
          </div>
        </div>

        {requireText && (
          <div className="mt-4">
            <label className="mb-1.5 block text-[11px] text-zinc-500 dark:text-zinc-400">
              Type <span className="font-mono font-semibold text-zinc-700 dark:text-zinc-200">{requireText}</span> to confirm
            </label>
            <input
              type="text"
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              placeholder={requireText}
              autoFocus
              className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-2.5 py-1.5 font-mono text-xs text-zinc-800 dark:text-zinc-200 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        )}

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={() => onCancel?.()}
            disabled={loading}
            className="rounded-lg border border-zinc-200 dark:border-zinc-700 px-3 py-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-300 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={() => canConfirm && onConfirm?.()}
            disabled={!canConfirm}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-zinc-900 disabled:cursor-not-allowed disabled:opacity-50 ${meta.button}`}
          >
            {loading && <UiIcon name="loader" size={12} className="animate-spin" />}
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
