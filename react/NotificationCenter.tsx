import React, { useMemo, useState } from "react";
import { UiIcon, type UiIconName } from "./UiIcon";

export interface NotificationItem {
  id: string | number;
  title: string;
  description?: string;
  /** Pre-formatted relative time, e.g. "2m ago". */
  time?: string;
  icon?: UiIconName;
  unread?: boolean;
  type?: "info" | "success" | "warning" | "error";
}

export interface NotificationCenterProps {
  isOpen: boolean;
  notifications?: NotificationItem[];
  title?: string;
  emptyText?: string;
  /** Show the All / Unread filter row. */
  showFilter?: boolean;
  /** Render a gear button that emits onOpenPreferences. */
  showPrefsButton?: boolean;
  onSelect?: (notification: NotificationItem) => void;
  onMarkRead?: (ids: Array<string | number>) => void;
  onMarkAllRead?: () => void;
  onOpenPreferences?: () => void;
  onClose?: () => void;
  className?: string;
}

const TYPE_META = {
  info: { chip: "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400", icon: "info" as UiIconName },
  success: { chip: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400", icon: "check-circle" as UiIconName },
  warning: { chip: "bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400", icon: "alert-triangle" as UiIconName },
  error: { chip: "bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400", icon: "circle-x" as UiIconName },
};

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  isOpen,
  notifications = [],
  title = "Notifications",
  emptyText = "You're all caught up",
  showFilter = true,
  showPrefsButton = false,
  onSelect,
  onMarkRead,
  onMarkAllRead,
  onOpenPreferences,
  onClose,
  className = "",
}) => {
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const unreadIds = useMemo(
    () => notifications.filter((item) => item.unread).map((item) => item.id),
    [notifications]
  );
  const visible = filter === "unread" ? notifications.filter((item) => item.unread) : notifications;

  if (!isOpen) return null;

  return (
    <div
      className={`w-full max-w-sm overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-lg ${className}`}
      role="region"
      aria-label={title}
    >
      <div className="flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800 px-3 py-2.5">
        <UiIcon name="bell" size={14} className="shrink-0 text-zinc-400" />
        <h3 className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">{title}</h3>
        {unreadIds.length > 0 && (
          <span className="rounded-full bg-indigo-100 px-1.5 py-0.5 text-[10px] font-medium tabular-nums text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
            {unreadIds.length} new
          </span>
        )}
        {showPrefsButton ? (
          <button
            type="button"
            onClick={() => onOpenPreferences?.()}
            aria-label="Notification preferences"
            className="rounded-md p-1 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
          >
            <UiIcon name={"settings" as UiIconName} size={12} />
          </button>
        ) : null}
        <button
          type="button"
          onClick={() => onMarkAllRead?.()}
          disabled={unreadIds.length === 0}
          className="ml-auto text-[11px] font-medium text-indigo-600 transition-colors hover:text-indigo-500 disabled:cursor-not-allowed disabled:text-zinc-300 dark:text-indigo-400 dark:disabled:text-zinc-600"
        >
          Mark all read
        </button>
        <button
          type="button"
          onClick={() => onClose?.()}
          aria-label="Close notifications"
          className="rounded-md p-1 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
        >
          <UiIcon name="x" size={12} />
        </button>
      </div>

      {showFilter && (
        <div className="flex gap-1 border-b border-zinc-100 dark:border-zinc-800 px-3 py-1.5">
          {(["all", "unread"] as const).map((key) => (
            <button
              key={key}
              type="button"
              aria-pressed={filter === key}
              onClick={() => setFilter(key)}
              className={`rounded-md px-2 py-1 text-[11px] font-medium capitalize transition-colors ${
                filter === key
                  ? "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-100"
                  : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
              }`}
            >
              {key}
              <span className="ml-1 tabular-nums text-zinc-400">
                {key === "all" ? notifications.length : unreadIds.length}
              </span>
            </button>
          ))}
        </div>
      )}

      <div className="max-h-72 overflow-y-auto">
        {visible.length === 0 ? (
          <div className="px-3 py-8 text-center">
            <UiIcon name="check-circle" size={20} className="mx-auto mb-1.5 text-emerald-500" />
            <p className="text-[11px] text-zinc-400">{emptyText}</p>
          </div>
        ) : (
          <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {visible.map((item) => {
              const meta = TYPE_META[item.type || "info"];
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => {
                      if (item.unread) onMarkRead?.([item.id]);
                      onSelect?.(item);
                    }}
                    className="flex w-full items-start gap-2.5 px-3 py-2.5 text-left transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                  >
                    <span className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${meta.chip}`}>
                      <UiIcon name={item.icon || meta.icon} size={13} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-1.5">
                        <span className="truncate text-[11px] font-medium text-zinc-800 dark:text-zinc-100">{item.title}</span>
                        {item.unread && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-500" aria-label="Unread" />}
                      </span>
                      {item.description && (
                        <span className="mt-0.5 line-clamp-2 block text-[11px] leading-snug text-zinc-500 dark:text-zinc-400">
                          {item.description}
                        </span>
                      )}
                      {item.time && <span className="mt-0.5 block text-[10px] text-zinc-400">{item.time}</span>}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};

export default NotificationCenter;
