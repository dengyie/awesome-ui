import React from "react";
import { UiIcon } from "./UiIcon";

export interface InboxMessage {
  id: string | number;
  sender: string;
  /** Number appended after the sender, e.g. thread count. */
  count?: number;
  subject: string;
  /** Preview text after the subject. */
  snippet?: string;
  /** Date label, e.g. "Aug 26". */
  dateLabel: string;
  unread?: boolean;
  /** Optional tag pill, e.g. "pitch" or "Draft". */
  tag?: string;
  tagTone?: "rose" | "emerald" | "indigo";
}

export interface InboxListProps {
  messages: InboxMessage[];
  activeId?: string | number | null;
  onSelect?: (message: InboxMessage) => void;
  /** Group boundary labels rendered between rows when the value changes. */
  emptyText?: string;
  className?: string;
}

const TAG_TONE: Record<string, string> = {
  rose: "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300",
  emerald: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300",
  indigo: "bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300",
};

export const InboxList: React.FC<InboxListProps> = ({
  messages = [],
  activeId = null,
  onSelect,
  emptyText = "Inbox zero — enjoy your day",
  className = "",
}) => {
  if (messages.length === 0) {
    return (
      <div className={`rounded-xl border border-zinc-200 bg-white px-4 py-8 text-center text-xs text-zinc-400 dark:border-zinc-800 dark:bg-zinc-900 ${className}`}>
        {emptyText}
      </div>
    );
  }

  return (
    <div
      className={`divide-y divide-zinc-100 overflow-hidden rounded-xl border border-zinc-200 bg-white dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-900 ${className}`}
    >
      {messages.map((message) => {
        const active = String(message.id) === String(activeId);
        return (
          <div
            key={message.id}
            role="button"
            tabIndex={0}
            aria-current={active ? "true" : undefined}
            onClick={() => onSelect?.(message)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onSelect?.(message);
              }
            }}
            className={`flex cursor-pointer items-start gap-3 px-4 py-2.5 transition-colors ${
              active
                ? "bg-indigo-50/70 dark:bg-indigo-950/40"
                : "hover:bg-zinc-50 dark:hover:bg-zinc-800/60"
            }`}
          >
            {/* Unread dot column */}
            <span className="flex w-2 shrink-0 pt-1.5">
              {message.unread && (
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" aria-label="Unread" />
              )}
            </span>

            <span className="w-36 shrink-0 truncate text-xs font-semibold text-zinc-800 dark:text-zinc-200">
              {message.sender}
              {message.count ? <span className="ml-1 font-normal text-zinc-400">{message.count}</span> : null}
            </span>

            <span className="min-w-0 flex-1 truncate text-xs text-zinc-600 dark:text-zinc-300">
              {message.tag && (
                <span
                  className={`mr-1.5 inline-block rounded px-1.5 py-px align-middle font-mono text-[9.5px] font-medium ${
                    TAG_TONE[message.tagTone || "rose"]
                  }`}
                >
                  {message.tag}
                </span>
              )}
              <span className={`font-medium text-zinc-800 dark:text-zinc-200 ${message.unread ? "" : "font-normal"}`}>
                {message.subject}
              </span>
              {message.snippet && <span className="text-zinc-400"> — {message.snippet}</span>}
            </span>

            <span className="shrink-0 pt-px font-mono text-[10px] uppercase text-zinc-400">{message.dateLabel}</span>
          </div>
        );
      })}
    </div>
  );
};
export default InboxList;
