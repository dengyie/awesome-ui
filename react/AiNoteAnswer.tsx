import React from "react";

export interface AiNoteAnswerProps {
  question?: string;
  answer?: string;
  sources?: string[];
  waveform?: number[];
  className?: string;
  onPlay?: () => void;
  onCopy?: () => void;
  onSourceClick?: (source: string) => void;
}

/**
 * AiNoteAnswer - Voicenotes "Ask AI" answer card: a waveform question row,
 * the answer paragraph, an "Other sources" link list and a Copy pill.
 */
export default function AiNoteAnswer({
  question = "What improvements should I prioritize for Homepage?",
  answer = "",
  sources = [],
  waveform = [],
  className = "",
  onPlay,
  onCopy,
  onSourceClick,
}: AiNoteAnswerProps) {
  const bars = waveform.length
    ? waveform
    : Array.from({ length: 48 }, (_, i) => 30 + Math.round(Math.abs(Math.sin(i * 1.7)) * 70));
  return (
    <div
      data-note-answer-card
      className={`w-full rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 ${className}`}
    >
      <div
        data-note-answer-question
        className="flex items-center gap-3 rounded-lg bg-zinc-50 px-3 py-2.5 dark:bg-zinc-800/60"
      >
        <button
          type="button"
          data-note-answer-play
          aria-label="Play question audio"
          onClick={() => onPlay?.()}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-[10px] text-white dark:bg-zinc-100 dark:text-zinc-900"
        >
          ▶
        </button>
        <div data-note-answer-waveform className="flex h-6 min-w-0 flex-1 items-center gap-[2px]" aria-hidden="true">
          {bars.map((h, i) => (
            <span
              key={i}
              className="w-[3px] shrink-0 rounded-full bg-zinc-300 dark:bg-zinc-600"
              style={{ height: `${Math.max(15, Math.min(100, h))}%` }}
            />
          ))}
        </div>
      </div>
      <p data-note-answer-question-text className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
        {question}
      </p>
      <p data-note-answer-text className="mt-3 text-[13px] leading-relaxed text-zinc-800 dark:text-zinc-200">
        {answer}
      </p>
      {sources.length > 0 && (
        <div data-note-answer-sources className="mt-4">
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-medium text-zinc-400 dark:text-zinc-500">Other sources</span>
            <span className="h-px flex-1 bg-zinc-100 dark:bg-zinc-800" />
          </div>
          {sources.map((source) => (
            <button
              key={source}
              type="button"
              data-note-answer-source
              onClick={() => onSourceClick?.(source)}
              className="mt-2 flex w-full items-center gap-1.5 truncate text-left text-xs text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
            >
              <span aria-hidden="true" className="shrink-0">↗</span>
              <span className="truncate">{source}</span>
            </button>
          ))}
        </div>
      )}
      <div className="mt-4">
        <button
          type="button"
          data-note-answer-copy
          onClick={() => onCopy?.()}
          className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          <span aria-hidden="true">⧉</span>
          Copy
        </button>
      </div>
    </div>
  );
}
