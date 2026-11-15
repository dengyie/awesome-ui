import React from "react";

export interface VoiceSession {
  id: string;
  title: string;
  date?: string;
  duration?: string;
  status?: "completed" | "failed" | "in-progress";
}

export interface VoiceSessionHistoryProps {
  title?: string;
  sessions?: VoiceSession[];
  emptyLabel?: string;
  className?: string;
  onSelect?: (session: VoiceSession) => void;
  onPlay?: (session: VoiceSession) => void;
}

/**
 * VoiceSessionHistory - ElevenLabs Voice "History" sidebar: session rows with
 * title, date/duration metadata, status badge and a replay button.
 */
export default function VoiceSessionHistory({
  title = "History",
  sessions = [],
  emptyLabel = "No sessions yet.",
  className = "",
  onSelect,
  onPlay,
}: VoiceSessionHistoryProps) {
  const active = sessions.filter((s) => s.status !== "failed").length;
  return (
    <div
      data-voice-history
      className={`w-full rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 ${className}`}
    >
      <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-3 dark:border-zinc-800">
        <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
          {title}{" "}
          <span data-voice-history-count className="ml-1 rounded-full bg-zinc-100 px-1.5 py-0.5 text-[10px] font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
            {active}
          </span>
        </h4>
      </div>
      <div data-voice-history-list className="divide-y divide-zinc-100 dark:divide-zinc-800">
        {sessions.length === 0 ? (
          <p data-voice-history-empty className="px-4 py-6 text-center text-xs text-zinc-400 dark:text-zinc-500">
            {emptyLabel}
          </p>
        ) : (
          sessions.map((s) => {
            const failed = s.status === "failed";
            const running = s.status === "in-progress";
            return (
              <div key={s.id} data-voice-session={s.id} className="flex items-center gap-3 px-4 py-2.5">
                <div className="min-w-0 flex-1">
                  <p data-voice-session-title className="truncate text-xs font-medium text-zinc-900 dark:text-zinc-50">
                    {s.title}
                  </p>
                  <p data-voice-session-meta className="mt-0.5 truncate text-[11px] text-zinc-400 dark:text-zinc-500">
                    {[s.date, s.duration].filter(Boolean).join(" · ")}
                  </p>
                </div>
                <span
                  data-voice-session-status
                  className={`shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-medium ${
                    failed
                      ? "bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400"
                      : running
                        ? "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400"
                        : "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400"
                  }`}
                >
                  {failed ? "Failed" : running ? "Running" : "Completed"}
                </span>
                <button
                  type="button"
                  data-voice-session-play
                  aria-label={`Play ${s.title}`}
                  onClick={() => onPlay?.(s)}
                  className="shrink-0 rounded p-1 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
                >
                  ▶
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
