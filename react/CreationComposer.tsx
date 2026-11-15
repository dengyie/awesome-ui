import React from "react";

export interface CreationComposerProps {
  open?: boolean;
  placeholder?: string;
  imageAssist?: boolean;
  resolution?: string;
  count?: number;
  resolutions?: string[];
  counts?: number[];
  onImageAssistChange?: (enabled: boolean) => void;
  onResolutionChange?: (resolution: string) => void;
  onCountChange?: (count: number) => void;
  onSubmit?: (value: { prompt: string; imageAssist: boolean; resolution: string; count: number }) => void;
  className?: string;
}

/**
 * CreationComposer - Bloom style floating creation bar: Image Assist toggle,
 * prompt textarea, resolution / count selects and a Create CTA.
 */
export default function CreationComposer({
  open = true,
  placeholder = "Ad creative, product shot, social post…",
  imageAssist = false,
  resolution = "2K",
  count = 1,
  resolutions = ["1K", "2K", "4K"],
  counts = [1, 2, 4],
  onImageAssistChange,
  onResolutionChange,
  onCountChange,
  onSubmit,
  className = "",
}: CreationComposerProps) {
  if (!open) return null;
  return (
    <div
      data-creation-composer
      className={`w-full max-w-xl rounded-2xl border border-zinc-200 bg-white p-3 shadow-xl dark:border-zinc-800 dark:bg-zinc-900 ${className}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            data-creation-image
            aria-label="Attach image"
            className="rounded-md border border-zinc-200 p-1.5 text-zinc-500 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            🖼
          </button>
          <button
            type="button"
            data-creation-assist-toggle
            role="switch"
            aria-checked={imageAssist}
            onClick={() => onImageAssistChange?.(!imageAssist)}
            className={`flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
              imageAssist
                ? "bg-indigo-600 text-white"
                : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
            }`}
          >
            Image Assist
            <span
              aria-hidden="true"
              className={`inline-block h-3.5 w-6 rounded-full transition-colors ${
                imageAssist ? "bg-white/80" : "bg-zinc-300 dark:bg-zinc-600"
              }`}
            >
              <span
                className={`block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform dark:bg-zinc-200 ${
                  imageAssist ? "translate-x-2.5 bg-indigo-600" : "translate-x-0"
                }`}
              />
            </span>
          </button>
        </div>
        <button
          type="button"
          data-creation-idea
          aria-label="Prompt ideas"
          className="rounded-md border border-zinc-200 p-1.5 text-zinc-500 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          💡
        </button>
      </div>
      <textarea
        data-creation-input
        rows={3}
        placeholder={placeholder}
        aria-label="Creation prompt"
        className="mt-2 w-full resize-none rounded-lg border border-zinc-200 px-3 py-2 text-xs leading-relaxed text-zinc-700 outline-none transition-colors placeholder:text-zinc-400 focus:border-indigo-400 dark:border-zinc-700 dark:text-zinc-200 dark:placeholder:text-zinc-500 dark:focus:border-indigo-500"
      />
      <div className="mt-2 flex items-center justify-end gap-2">
        <label className="sr-only" htmlFor="creation-resolution">Resolution</label>
        <select
          id="creation-resolution"
          data-creation-resolution
          value={resolution}
          onChange={(e) => onResolutionChange?.(e.target.value)}
          className="rounded-md border border-zinc-200 bg-white px-2 py-1.5 text-xs font-medium text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
        >
          {resolutions.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
        <label className="sr-only" htmlFor="creation-count">Count</label>
        <select
          id="creation-count"
          data-creation-count
          value={count}
          onChange={(e) => onCountChange?.(Number(e.target.value))}
          className="rounded-md border border-zinc-200 bg-white px-2 py-1.5 text-xs font-medium text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
        >
          {counts.map((c) => (
            <option key={c} value={c}>{c}×</option>
          ))}
        </select>
        <button
          type="button"
          data-creation-submit
          onClick={() => {
            const input = (document.querySelector('[data-creation-input]') as HTMLTextAreaElement | null)?.value ?? "";
            onSubmit?.({ prompt: input, imageAssist, resolution, count });
          }}
          className="rounded-md bg-violet-600 px-4 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-violet-500"
        >
          Create
        </button>
      </div>
    </div>
  );
}
