/**
 * PromptTunerResult - Prompt tuner output: an "optimized prompt" dark code
 * panel with a copy action, a completion selector and the completion text
 * viewer (Cohere Prompt Tuner pattern).
 */
import React from "react";

export interface PromptCompletion {
  id: string;
  label: string;
  text: string;
}

export interface PromptTunerResultProps {
  optimizedPrompt?: string;
  completions?: PromptCompletion[];
  activeCompletionId?: string;
  className?: string;
  onCopyPrompt?: () => void;
  onCompletionChange?: (completion: PromptCompletion) => void;
}

const DEFAULT_COMPLETIONS: PromptCompletion[] = [
  {
    id: "c1",
    label: "Completion #1",
    text: "I have reviewed the comments left by John's colleagues and can report that his performance has been very well received by his team. Overall, John is regarded as a great team player, who is both knowledgeable and a strong communicator, particularly when it comes to offering advice and guidance to more junior members of the team.",
  },
  {
    id: "c2",
    label: "Completion #2",
    text: "John's colleagues describe him as a knowledgeable, communicative engineer who consistently supports newer team members. The main improvement area flagged across reviews is proactive outreach — teammates note that projects move faster when John initiates status updates himself.",
  },
];

export default function PromptTunerResult({
  optimizedPrompt = "Your optimized prompt will appear here.",
  completions = DEFAULT_COMPLETIONS,
  activeCompletionId = "c1",
  className = "",
  onCopyPrompt,
  onCompletionChange,
}: PromptTunerResultProps) {
  const active = completions.find((c) => c.id === activeCompletionId) ?? completions[0];
  return (
    <div data-prompt-tuner className={`w-full space-y-3 ${className}`}>
      <div data-tuner-prompt-panel className="overflow-hidden rounded-xl bg-zinc-900 shadow-sm dark:bg-zinc-950 dark:ring-1 dark:ring-zinc-800">
        <div className="flex items-center justify-between gap-2 px-4 pb-2 pt-3">
          <p data-tuner-prompt-label className="font-mono text-[11px] font-semibold tracking-wider text-zinc-400">OPTIMIZED PROMPT</p>
          <button
            type="button"
            data-tuner-copy
            onClick={() => onCopyPrompt?.()}
            className="inline-flex items-center gap-1 rounded-md border border-zinc-700 px-2 py-1 text-[11px] font-medium text-zinc-300 transition-colors hover:bg-zinc-800"
          >
            <span aria-hidden="true">⧉</span> Copy
          </button>
        </div>
        <pre data-tuner-prompt-text className="max-h-48 overflow-y-auto px-4 pb-4 font-mono text-xs leading-relaxed text-zinc-100">{optimizedPrompt}</pre>
      </div>
      <div data-tuner-completions className="rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div data-tuner-completions-header className="flex items-center justify-between gap-2 border-b border-zinc-100 px-4 py-2.5 dark:border-zinc-800">
          <p data-tuner-completions-label className="font-mono text-[11px] font-semibold tracking-wider text-zinc-500 dark:text-zinc-400">COMPLETIONS</p>
          <select
            data-tuner-completion-select
            value={active?.id}
            onChange={(event) => {
              const picked = completions.find((c) => c.id === event.target.value);
              if (picked) onCompletionChange?.(picked);
            }}
            className="rounded-md border border-zinc-200 bg-white px-2 py-1 text-xs font-medium text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
          >
            {completions.map((completion) => (
              <option key={completion.id} value={completion.id}>{completion.label}</option>
            ))}
          </select>
        </div>
        <p data-tuner-completion-text className="whitespace-pre-wrap px-4 py-3 text-xs leading-relaxed text-zinc-600 dark:text-zinc-300">{active?.text}</p>
      </div>
    </div>
  );
}
