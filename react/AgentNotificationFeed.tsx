import React from "react";

export interface AgentNotificationItem {
  id: string;
  /** Notification kind controls the status dot color */
  kind: "started" | "completed" | "failed" | "info";
  /** Main title, e.g. the task/question being run */
  title: string;
  /** Highlighted tail appended to the title in the kind's tone color */
  statusText?: string;
  /** Secondary caption line, e.g. "From your manual entry" */
  caption?: string;
  /** Relative time label, e.g. "30 minutes ago" */
  time: string;
  /** Unread marker */
  unread?: boolean;
}

export interface AgentNotificationFeedProps {
  title?: string;
  items: AgentNotificationItem[];
  onOpen?: (item: AgentNotificationItem) => void;
  className?: string;
}

const KIND_DOT: Record<string, string> = {
  started: "bg-sky-500",
  completed: "bg-emerald-500",
  failed: "bg-rose-500",
  info: "bg-zinc-400",
};

const KIND_TEXT: Record<string, string> = {
  started: "text-sky-600 dark:text-sky-400",
  completed: "text-emerald-600 dark:text-emerald-400",
  failed: "text-rose-600 dark:text-rose-400",
  info: "text-zinc-500 dark:text-zinc-400",
};

/**
 * AgentNotificationFeed - agent run/training notification feed: status-dot
 * rows with title + highlighted status text, caption line, relative time and
 * unread markers, in the Delphi/Jira notifications style.
 */
export default function AgentNotificationFeed({
  title = "Notifications",
  items,
  onOpen,
  className = "",
}: AgentNotificationFeedProps) {
  const [read, setRead] = React.useState<Record<string, boolean>>({});
  const isUnread = (item: AgentNotificationItem) => !!item.unread && !read[item.id];
  const unreadCount = items.filter(isUnread).length;

  return (
    <div data-agent-feed className={`overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 ${className}`}>
      <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-3 dark:border-zinc-800">
        <p data-agent-feed-title className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{title}</p>
        {unreadCount > 0 && (
          <span data-agent-feed-count className="rounded-full bg-indigo-50 px-2 py-0.5 text-[11px] font-semibold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
            {unreadCount} new
          </span>
        )}
      </div>
      <div data-agent-feed-list className="divide-y divide-zinc-100 dark:divide-zinc-800">
        {items.map((item) => {
          const unread = isUnread(item);
          return (
            <button
              key={item.id}
              type="button"
              data-agent-feed-item={item.id}
              data-unread={unread ? "true" : "false"}
              onClick={() => { setRead((r) => ({ ...r, [item.id]: true })); onOpen?.(item); }}
              className="flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
            >
              <span aria-hidden="true" className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${unread ? KIND_DOT[item.kind] || KIND_DOT.info : "bg-zinc-300 dark:bg-zinc-600"}`}></span>
              <span className="min-w-0 flex-1">
                <span className="block text-xs font-medium text-zinc-900 dark:text-zinc-50">
                  {item.title}
                  {item.statusText && <span className={`font-semibold ${KIND_TEXT[item.kind] || KIND_TEXT.info}`}> {item.statusText}</span>}
                </span>
                {item.caption && <span className="mt-0.5 block text-[11px] text-zinc-500 dark:text-zinc-400">{item.caption}</span>}
              </span>
              <span className="shrink-0 text-[11px] text-zinc-400 dark:text-zinc-500">{item.time}</span>
            </button>
          );
        })}
        {items.length === 0 && (
          <p data-agent-feed-empty className="px-4 py-6 text-center text-xs text-zinc-400 dark:text-zinc-500">No notifications yet</p>
        )}
      </div>
    </div>
  );
}
