import React from "react";

export interface SystemPromptEditorProps {
  title?: string;
  value?: string;
  placeholder?: string;
  version?: string;
  savedValue?: string;
  variables?: string[];
  temperature?: number;
  onSave?: (text: string) => void;
  onReset?: () => void;
  onTemperatureChange?: (value: number) => void;
  className?: string;
}

const TOKENS_PER_CHAR = 0.25;

/**
 * SystemPromptEditor - Agent studio prompt editor: textarea with live token
 * estimate, {{variable}} chips, temperature slider and save/reset actions.
 */
export default function SystemPromptEditor({
  title = "System prompt",
  value: valueProp = "",
  placeholder = "You are a helpful assistant that…",
  version = "v3",
  savedValue,
  variables = [],
  temperature,
  onSave,
  onReset,
  onTemperatureChange,
  className = "",
}: SystemPromptEditorProps) {
  const [draft, setDraft] = React.useState(valueProp);
  const dirty = savedValue !== undefined ? draft !== savedValue : draft !== valueProp;
  const tokens = Math.max(1, Math.round(draft.length * TOKENS_PER_CHAR));

  return (
    <div data-prompt-editor className={`rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 ${className}`}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
          {title}
          <span data-editor-version className="ml-2 rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">{version}</span>
        </p>
        <span data-editor-state className={`text-[11px] font-semibold ${dirty ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400"}`}>
          {dirty ? "Unsaved changes" : "Saved"}
        </span>
      </div>
      <textarea
        data-editor-textarea
        value={draft}
        placeholder={placeholder}
        rows={6}
        onChange={(e) => setDraft(e.target.value)}
        className="mt-3 w-full resize-y rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 font-mono text-xs leading-relaxed text-zinc-800 outline-none focus:border-indigo-400 placeholder:text-zinc-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
      />
      <div className="mt-2 flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400">
        <span data-editor-tokens>~{tokens} tokens · {draft.length} chars</span>
        {variables.length > 0 && (
          <span data-editor-variables className="flex flex-wrap items-center gap-1">
            {variables.map((v) => (
              <code key={v} className="rounded bg-indigo-50 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">{`{{${v}}}`}</code>
            ))}
          </span>
        )}
      </div>
      {typeof temperature === "number" && (
        <div className="mt-3 flex items-center gap-3">
          <label className="text-xs font-medium text-zinc-600 dark:text-zinc-300" htmlFor="prompt-editor-temp">Temperature</label>
          <input
            id="prompt-editor-temp"
            data-editor-temperature
            type="range"
            min={0}
            max={2}
            step={0.1}
            value={temperature}
            onChange={(e) => onTemperatureChange?.(Number(e.target.value))}
            className="h-1 flex-1 cursor-pointer appearance-none rounded bg-zinc-200 accent-indigo-600 dark:bg-zinc-700"
          />
          <span data-editor-temp-value className="w-8 text-right font-mono text-xs text-zinc-700 dark:text-zinc-200">{temperature.toFixed(1)}</span>
        </div>
      )}
      <div className="mt-3 flex items-center justify-end gap-2">
        <button
          type="button"
          data-editor-reset
          onClick={() => {
            setDraft(savedValue ?? valueProp);
            onReset?.();
          }}
          className="rounded-md border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-600 hover:border-zinc-400 dark:border-zinc-700 dark:text-zinc-300"
        >
          Reset
        </button>
        <button
          type="button"
          data-editor-save
          disabled={!dirty}
          onClick={() => onSave?.(draft)}
          className="rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Save prompt
        </button>
      </div>
    </div>
  );
}
