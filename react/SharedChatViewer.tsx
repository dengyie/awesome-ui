import React from "react";

export interface SharedChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
}

export interface SharedChatViewerProps {
  appName?: string;
  title?: string;
  meta?: string;
  messages: SharedChatMessage[];
  ctaText?: string;
  ctaNote?: string;
  onCta?: () => void;
  className?: string;
}

/**
 * SharedChatViewer - Public read-only page for a shared AI conversation:
 * brand header, user/assistant bubbles and a bottom "try it yourself" CTA bar.
 */
export default function SharedChatViewer({
  appName = "ChatApp",
  title = "Shared conversation",
  meta,
  messages,
  ctaText = "Try it yourself",
  ctaNote,
  onCta,
  className = "",
}: SharedChatViewerProps) {
  return (
    <div data-shared-chat className={`overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 ${className}`}>
      <div data-shared-header className="flex items-center gap-3 border-b border-zinc-100 px-4 py-3 dark:border-zinc-800">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-xs font-bold text-white" aria-hidden="true">{appName.slice(0, 1)}</span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-50">{title}</p>
          {meta && (
            <p data-shared-meta className="text-xs text-zinc-500 dark:text-zinc-400">
              {appName} · {meta}
            </p>
          )}
        </div>
      </div>
      <div className="space-y-3 px-4 py-4">
        {messages.map((msg) => (
          <div key={msg.id} data-shared-msg={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <p
              data-shared-role={msg.role}
              className={`max-w-[80%] whitespace-pre-wrap rounded-2xl px-3.5 py-2 text-sm leading-relaxed ${
                msg.role === "user"
                  ? "rounded-br-sm bg-indigo-600 text-white"
                  : "rounded-bl-sm bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-100"
              }`}
            >
              {msg.text}
            </p>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between gap-3 border-t border-zinc-100 bg-zinc-50 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-800/60">
        {ctaNote ? (
          <p className="text-xs text-zinc-500 dark:text-zinc-400">{ctaNote}</p>
        ) : (
          <p className="text-xs text-zinc-500 dark:text-zinc-400">This conversation is read-only.</p>
        )}
        <button
          type="button"
          data-shared-cta
          onClick={() => onCta?.()}
          className="shrink-0 rounded-md bg-zinc-900 px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          {ctaText}
        </button>
      </div>
    </div>
  );
}
