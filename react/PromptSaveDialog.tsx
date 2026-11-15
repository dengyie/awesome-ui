import React from "react";

export interface PromptSaveDialogProps {
  open?: boolean;
  title?: string;
  folder?: string;
  description?: string;
  prompt?: string;
  variables?: string[];
  onSave?: (value: { title: string; prompt: string; variables: string[] }) => void;
  onCancel?: () => void;
  onClose?: () => void;
  className?: string;
}

/**
 * PromptSaveDialog - Langdock style "save prompt" modal: folder picker row,
 * title + prompt body, inline variable chips, and Cancel / Save actions.
 */
export default function PromptSaveDialog({
  open = true,
  title = "ASMobbin Onboarding Ratings",
  folder = "ASMobbin",
  description = "Other users with access to the folder will be able to see and use this prompt.",
  prompt = "Create a Google Sheet report that rates the onboarding experience of {{company}}.\nOverview:",
  variables = ["company"],
  onSave,
  onCancel,
  onClose,
  className = "",
}: PromptSaveDialogProps) {
  if (!open) return null;
  return (
    <div
      data-prompt-save
      role="dialog"
      aria-modal="true"
      className={`w-full max-w-lg rounded-xl border border-zinc-200 bg-white p-4 shadow-xl dark:border-zinc-800 dark:bg-zinc-900 ${className}`}
    >
      <div className="flex items-start justify-between">
        <button
          type="button"
          data-prompt-save-folder
          className="flex items-center gap-1.5 rounded-md border border-zinc-200 px-2.5 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
        >
          <span aria-hidden="true">📁</span>
          {folder}
          <span className="text-zinc-400" aria-hidden="true">▾</span>
        </button>
        <button
          type="button"
          data-prompt-save-close
          aria-label="Close"
          onClick={onClose}
          className="rounded p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
        >
          ✕
        </button>
      </div>
      <input
        data-prompt-save-title
        type="text"
        defaultValue={title}
        aria-label="Prompt title"
        className="mt-3 w-full rounded-md border border-transparent bg-transparent px-1 py-1 text-base font-semibold text-zinc-900 outline-none transition-colors focus:border-zinc-300 focus:bg-white dark:text-zinc-50 dark:focus:border-zinc-600 dark:focus:bg-zinc-900"
      />
      <textarea
        data-prompt-save-body
        rows={6}
        defaultValue={prompt}
        aria-label="Prompt body"
        className="mt-2 w-full resize-y rounded-md border border-zinc-200 px-3 py-2 text-xs leading-relaxed text-zinc-700 outline-none transition-colors focus:border-indigo-400 dark:border-zinc-700 dark:text-zinc-200 dark:focus:border-indigo-500"
      />
      <div className="mt-2 flex items-center justify-between">
        <button
          type="button"
          data-prompt-save-add-var
          className="rounded-md border border-dashed border-zinc-300 px-2.5 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          + Add variable
        </button>
        <button
          type="button"
          data-prompt-save-expand
          aria-label="Expand editor"
          className="rounded-md border border-zinc-200 p-1.5 text-zinc-500 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          ⤢
        </button>
      </div>
      {variables.length > 0 && (
        <div data-prompt-save-vars className="mt-2 flex flex-wrap gap-1.5">
          {variables.map((v) => (
            <span
              key={v}
              data-prompt-save-var
              className="rounded-md bg-indigo-50 px-2 py-0.5 font-mono text-[11px] font-medium text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300"
            >
              {`{{${v}}}`}
            </span>
          ))}
        </div>
      )}
      <div className="mt-3 flex items-center justify-between gap-3 border-t border-zinc-200 pt-3 dark:border-zinc-800">
        <p className="min-w-0 flex-1 text-[11px] leading-snug text-zinc-500 dark:text-zinc-400">{description}</p>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            data-prompt-save-cancel
            onClick={onCancel}
            className="rounded-md px-3 py-1.5 text-xs font-semibold text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Cancel
          </button>
          <button
            type="button"
            data-prompt-save-submit
            onClick={() => onSave?.({ title, prompt, variables })}
            className="rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-indigo-500"
          >
            Save prompt
          </button>
        </div>
      </div>
    </div>
  );
}
