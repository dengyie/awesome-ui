/**
 * NotificationPrefsMatrix - Notification preference matrix: rows are event
 * types, columns are channels (In-app / Email / Push) rendered as
 * checkboxes, with per-row channel quick toggles (notification settings
 * pattern).
 */
import React from "react";

export interface NotificationPrefEvent {
  id: string;
  label: string;
  channels: { inapp?: boolean; email?: boolean; push?: boolean } & Record<string, boolean | undefined>;
}

export interface NotificationPrefColumn {
  key: string;
  label: string;
}

export interface NotificationPrefsMatrixProps {
  title?: string;
  description?: string;
  events?: NotificationPrefEvent[];
  columns?: NotificationPrefColumn[];
  className?: string;
  onChange?: (event: NotificationPrefEvent, channel: string, enabled: boolean) => void;
}

const DEFAULT_COLUMNS: NotificationPrefColumn[] = [
  { key: "inapp", label: "In-app" },
  { key: "email", label: "Email" },
  { key: "push", label: "Push" },
];

const DEFAULT_EVENTS: NotificationPrefEvent[] = [
  { id: "mentions", label: "Mentions & replies", channels: { inapp: true, email: true, push: false } },
  { id: "assigns", label: "Assigned to me", channels: { inapp: true, email: false, push: true } },
  { id: "comments", label: "Thread comments", channels: { inapp: true, email: true, push: false } },
  { id: "digest", label: "Weekly digest", channels: { inapp: false, email: true, push: false } },
];

export const NotificationPrefsMatrix: React.FC<NotificationPrefsMatrixProps> = ({
  title = "Notification preferences",
  description = "Choose which events reach you and through which channels.",
  events = DEFAULT_EVENTS,
  columns = DEFAULT_COLUMNS,
  className = "",
  onChange,
}) => {
  const list = Array.isArray(events) ? events : [];
  const cols = Array.isArray(columns) ? columns : [];

  return (
    <div data-pref-matrix className={`w-full rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900 ${className}`}>
      <div data-pref-header className="border-b border-zinc-100 px-5 py-4 dark:border-zinc-800">
        <p data-pref-title className="text-base font-semibold text-zinc-900 dark:text-zinc-50">{title}</p>
        <p data-pref-description className="mt-1 text-sm leading-5 text-zinc-500 dark:text-zinc-400">{description}</p>
      </div>
      <table data-pref-table-body className="w-full text-left text-xs">
        <thead>
          <tr className="border-b border-zinc-100 text-[11px] font-semibold uppercase tracking-wide text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
            <th className="px-5 py-2.5 font-semibold">Event</th>
            {cols.map((col) => (
              <th key={col.key} data-pref-col={col.key} className="w-20 px-2 py-2.5 text-center font-semibold">{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {list.map((ev) => (
            <tr key={ev.id} data-pref-row={ev.id} className="border-b border-zinc-50 transition-colors last:border-b-0 hover:bg-zinc-50 dark:border-zinc-800/60 dark:hover:bg-zinc-800/60">
              <td data-pref-label={ev.label} className="px-5 py-3 text-sm font-medium text-zinc-800 dark:text-zinc-100">{ev.label}</td>
              {cols.map((col) => (
                <td key={col.key} data-pref-cell-state={`${ev.id}|${col.key}`} className="px-2 py-3 text-center">
                  <input
                    type="checkbox"
                    data-pref-cell={`${ev.id}|${col.key}`}
                    checked={Boolean(ev.channels && ev.channels[col.key])}
                    onChange={(e) => onChange?.(ev, col.key, e.target.checked)}
                    className="h-4 w-4 accent-violet-600"
                    aria-label={`${ev.label} via ${col.label}`}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default NotificationPrefsMatrix;
