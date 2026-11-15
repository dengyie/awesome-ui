import React from "react";

export interface AudioNotePlayerProps {
  title?: string;
  duration?: string;
  playing?: boolean;
  waveform?: number[];
  className?: string;
  onTogglePlay?: () => void;
}

/**
 * AudioNotePlayer - Voicenotes audio note player card: a play/pause button,
 * a waveform bar strip and the note title / duration metadata row.
 */
export default function AudioNotePlayer({
  title = "Homepage walkthrough notes",
  duration = "00:47",
  playing = false,
  waveform = [],
  className = "",
  onTogglePlay,
}: AudioNotePlayerProps) {
  const bars = waveform.length
    ? waveform
    : Array.from({ length: 64 }, (_, i) => 25 + Math.round(Math.abs(Math.sin(i * 1.3)) * 75));
  return (
    <div
      data-audio-note-player
      className={`w-full rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 ${className}`}
    >
      <div className="flex items-center gap-3">
        <button
          type="button"
          data-audio-note-toggle
          aria-label={playing ? "Pause note" : "Play note"}
          onClick={() => onTogglePlay?.()}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-xs text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          {playing ? "❚❚" : "▶"}
        </button>
        <div data-audio-note-waveform className="flex h-8 min-w-0 flex-1 items-center gap-[2px]" aria-hidden="true">
          {bars.map((h, i) => (
            <span
              key={i}
              className={`w-[3px] shrink-0 rounded-full ${playing && i < bars.length / 2 ? "bg-emerald-500" : "bg-zinc-300 dark:bg-zinc-600"}`}
              style={{ height: `${Math.max(15, Math.min(100, h))}%` }}
            />
          ))}
        </div>
        <span data-audio-note-duration className="shrink-0 font-mono text-[11px] text-zinc-400 dark:text-zinc-500">
          {duration}
        </span>
      </div>
      <p data-audio-note-title className="mt-3 truncate text-xs font-medium text-zinc-900 dark:text-zinc-50">
        {title}
      </p>
    </div>
  );
}
