import React, { useState } from "react";
import { UiIcon } from "./UiIcon";

export interface ChatSessionItem {
  id: string | number;
  title: string;
  timeLabel?: string;
  /** Optional group label (e.g. "Today", "Previous 7 days"); sessions without one go to "Recent". */
  group?: string;
}

export interface ChatSessionUser {
  name: string;
  email?: string;
  /** Initials or single letter rendered in the avatar when no avatarUrl is given. */
  avatarUrl?: string;
}

export interface ChatSessionListProps {
  sessions: ChatSessionItem[];
  activeId?: string | number | null;
  onSelect?: (session: ChatSessionItem) => void;
  onDelete?: (id: string | number) => void;
  onUserClick?: () => void;
  user?: ChatSessionUser;
  title?: string;
  emptyText?: string;
  className?: string;
}

export const ChatSessionList: React.FC<ChatSessionListProps> = ({
  sessions = [],
  activeId = null,
  onSelect,
  onDelete,
  onUserClick,
  user,
  title = "Chats",
  emptyText = "No conversations yet",
  className = "",
}) => {
  // Groups with all sessions collapsed keep their header but hide the rows.
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(() => new Set());
  const toggleGroup = (group: string) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(group)) next.delete(group);
      else next.add(group);
      return next;
    });
  };

  // Preserve the sessions' original order; group headers appear on first occurrence.
  const groups: { label: string; items: ChatSessionItem[] }[] = [];
  sessions.forEach((s) => {
    const label = s.group || "Recent";
    const existing = groups.find((g) => g.label === label);
    if (existing) existing.items.push(s);
    else groups.push({ label, items: [s] });
  });

  const initials = user ? (user.name || "?").trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase() : "";

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
        <div className="flex-1 overflow-y-auto p-1.5">
          {groups.map((group) => {
            const isCollapsed = collapsedGroups.has(group.label);
            return (
              <div key={group.label} className="mb-1 last:mb-0">
                {group.label !== "Recent" && (
                  <button
                    type="button"
                    aria-expanded={!isCollapsed}
                    onClick={() => toggleGroup(group.label)}
                    className="flex w-full items-center gap-1 px-2.5 pt-2 pb-1 text-[10px] uppercase font-semibold tracking-wider text-zinc-400 hover:text-zinc-500 dark:hover:text-zinc-300 transition-colors select-none"
                  >
                    <UiIcon
                      name="chevron-down"
                      size={11}
                      className={`transition-transform duration-150 ${isCollapsed ? "-rotate-90" : ""}`}
                    />
                    <span className="flex-1 text-left">{group.label}</span>
                    <span className="font-mono font-normal">{group.items.length}</span>
                  </button>
                )}
                {!isCollapsed && (
                  <ul className="space-y-0.5">
                    {group.items.map((s) => {
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
          })}
        </div>
      )}

      {/* Bottom user card */}
      {user && (
        <button
          type="button"
          onClick={onUserClick}
          className="flex items-center gap-2.5 px-3.5 py-3 border-t border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors text-left"
        >
          {user.avatarUrl ? (
            <img src={user.avatarUrl} alt="" className="h-7 w-7 rounded-full object-cover shrink-0" />
          ) : (
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 shrink-0">
              {initials}
            </span>
          )}
          <span className="flex-1 min-w-0">
            <span className="block truncate text-xs font-medium text-zinc-800 dark:text-zinc-200">{user.name}</span>
            {user.email && <span className="block truncate text-[11px] text-zinc-400">{user.email}</span>}
          </span>
          <UiIcon name="settings" size={14} className="text-zinc-400 shrink-0" />
        </button>
      )}
    </div>
  );
};
export default ChatSessionList;
