import React from "react";
import { UiIcon } from "./UiIcon";

export interface ChatSessionItem {
  id: string | number;
  title: string;
  timeLabel?: string;
}

export interface ChatSessionListProps {
  sessions: ChatSessionItem[];
  activeId?: string | number | null;
  onSelect?: (session: ChatSessionItem) => void;
  onDelete?: (id: string | number) => void;
  title?: string;
  emptyText?: string;
  className?: string;
}

export const ChatSessionList: React.FC<ChatSessionListProps> = ({
  sessions = [],
  activeId = null,
  onSelect,
  onDelete,
  title = "Chats",
  emptyText = "No conversations yet",
  className = "",
}) => {
  return (
    <div className={`flex flex-col w-64 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden ${className}`}>
      <div className="flex items-center gap-2 px-4 py-3 border-b border-zinc-100 dark:border-zinc-800 text-sm font-semibold text-zinc-800 dark:text-zinc-200">
        <UiIcon name="sparkles" size={15} className="text-indigo-500" />
        {title}
        <span className="ml-auto text-[11px] font-mono font-normal text-zinc-400">{sessions.length}</span>
      </div>

      {sessions.length === 0 ? (
        <div className="p-6 text-center text-xs text-zinc-400">{emptyText}</div>
      ) : (
        <ul className="flex-1 overflow-y-auto p-1.5 space-y-0.5">
          {sessions.map((s) => {
            const isActive = String(s.id) === String(activeId);
            return (
              <li key={s.id}>
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => onSelect?.(s)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onSelect?.(s);
                    }
                  }}
                  className={`group w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-left text-sm cursor-pointer transition-colors ${
                    isActive
                      ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300"
                      : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/70"
                  }`}
                >
                  <span className="flex-1 min-w-0">
                    <span className="block truncate font-medium">{s.title}</span>
                    {s.timeLabel && <span className="block text-[11px] text-zinc-400">{s.timeLabel}</span>}
                  </span>
                  {onDelete && (
                    <button
                      type="button"
                      aria-label="Delete session"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(s.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 focus:opacity-100 p-1 rounded-md text-zinc-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all shrink-0"
                    >
                      <UiIcon name="x" size={13} />
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};
export default ChatSessionList;
