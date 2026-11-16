/**
 * SessionDeviceTable - Login sessions / devices list: header with helper
 * text and a "log out all" action, six-column sessions table (OS /
 * application / location / IP / last active / status) with Current and
 * Logged-out badges, pager and rows-per-page control
 * (Airwallex Login Sessions pattern).
 */
import React from "react";

export type SessionStatus = "current" | "active" | "logged-out";

export interface SessionDevice {
  id: string;
  os: string;
  application: string;
  location: string;
  ip: string;
  lastActive: string;
  status: SessionStatus;
}

export interface SessionDeviceTableProps {
  title?: string;
  description?: string;
  learnMoreLabel?: string;
  logoutAllLabel?: string;
  pageLabel?: string;
  page?: number;
  rowsPerPageLabel?: string;
  rowsPerPage?: number;
  sessions?: SessionDevice[];
  className?: string;
  onSessionClick?: (session: SessionDevice) => void;
  onLogoutAll?: () => void;
}

const STATUS_STYLES: Record<SessionStatus, { label: string; cls: string }> = {
  current: { label: "Current", cls: "bg-violet-100 text-violet-700 dark:bg-violet-950/70 dark:text-violet-300" },
  active: { label: "Active", cls: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400" },
  "logged-out": { label: "Logged out", cls: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400" },
};

const OS_ICON: Record<string, string> = { mac: "🖥", windows: "🪟", linux: "🐧", mobile: "📱" };
const iconFor = (os: string) => {
  const key = Object.keys(OS_ICON).find((k) => os.toLowerCase().includes(k));
  return key ? OS_ICON[key] : "🖥";
};

const DEFAULT_SESSIONS: SessionDevice[] = [
  { id: "s1", os: "Mac OS X", application: "Chrome 141", location: "Singapore, Singapore", ip: "116.14.152.165", lastActive: "4 minutes ago", status: "current" },
  { id: "s2", os: "Mac OS X", application: "Chrome 141", location: "Singapore, Singapore", ip: "103.224.164.31", lastActive: "6 days ago", status: "logged-out" },
  { id: "s3", os: "Windows 11", application: "Edge 140", location: "Tokyo, Japan", ip: "203.0.113.42", lastActive: "2 days ago", status: "active" },
  { id: "s4", os: "iOS 18", application: "Airwallex iOS", location: "Singapore, Singapore", ip: "116.14.152.198", lastActive: "10 days ago", status: "logged-out" },
];

export default function SessionDeviceTable({
  title = "Login sessions",
  description = "View your login sessions from the past 28 days. If you notice any suspicious logins, log out of those sessions and change your password immediately.",
  learnMoreLabel = "Learn more",
  logoutAllLabel = "Log out of all other sessions",
  pageLabel = "Page",
  page = 1,
  rowsPerPageLabel = "Rows per page:",
  rowsPerPage = 10,
  sessions = DEFAULT_SESSIONS,
  className = "",
  onSessionClick,
  onLogoutAll,
}: SessionDeviceTableProps) {
  return (
    <div data-session-table className={`w-full rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900 ${className}`}>
      <div data-session-header className="flex flex-wrap items-start justify-between gap-3 border-b border-zinc-100 px-5 py-4 dark:border-zinc-800">
        <div className="max-w-2xl">
          <p data-session-title className="text-base font-semibold text-zinc-900 dark:text-zinc-50">{title}</p>
          <p data-session-description className="mt-1 text-sm leading-5 text-zinc-500 dark:text-zinc-400">
            {description}{" "}
            <a data-session-learn-more href="#" onClick={(e) => e.preventDefault()} className="font-medium text-violet-600 hover:underline dark:text-violet-400">{learnMoreLabel}</a>
          </p>
        </div>
        <button
          data-session-logout-all
          type="button"
          onClick={() => onLogoutAll?.()}
          className="rounded-lg border border-zinc-200 px-3 py-2 text-sm font-medium text-violet-600 transition-colors hover:bg-violet-50 dark:border-zinc-700 dark:text-violet-400 dark:hover:bg-violet-950/40"
        >
          {logoutAllLabel}
        </button>
      </div>
      <table data-session-table-body className="w-full text-left text-xs">
        <thead>
          <tr className="border-b border-zinc-100 text-[11px] font-semibold uppercase tracking-wide text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
            <th className="px-5 py-2.5 font-semibold">Operating system</th>
            <th className="px-2 py-2.5 font-semibold">Application</th>
            <th className="px-2 py-2.5 font-semibold">Location</th>
            <th className="px-2 py-2.5 font-semibold">IP address</th>
            <th className="px-2 py-2.5 font-semibold">Last active</th>
            <th className="px-5 py-2.5 font-semibold">Status</th>
          </tr>
        </thead>
        <tbody>
          {sessions.map((session) => {
            const style = STATUS_STYLES[session.status] ?? STATUS_STYLES["logged-out"];
            return (
              <tr
                key={session.id}
                data-session-row={session.id}
                tabIndex={0}
                onClick={() => onSessionClick?.(session)}
                className="cursor-pointer border-b border-zinc-50 transition-colors last:border-b-0 hover:bg-zinc-50 dark:border-zinc-800/60 dark:hover:bg-zinc-800/60"
              >
                <td data-session-row-os={session.os} className="whitespace-nowrap px-5 py-3 font-medium text-zinc-800 dark:text-zinc-100">
                  <span className="mr-1.5 inline-flex" aria-hidden="true">{iconFor(session.os)}</span>
                  {session.os}
                </td>
                <td data-session-row-app={session.application} className="px-2 py-3 text-zinc-600 dark:text-zinc-300">{session.application}</td>
                <td data-session-row-location={session.location} className="px-2 py-3 text-zinc-600 dark:text-zinc-300">{session.location}</td>
                <td data-session-row-ip={session.ip} className="px-2 py-3 font-mono text-zinc-500 dark:text-zinc-400">{session.ip}</td>
                <td data-session-row-active={session.lastActive} className="whitespace-nowrap px-2 py-3 text-zinc-500 dark:text-zinc-400">{session.lastActive}</td>
                <td data-session-row-status={session.status} className="px-5 py-3">
                  <span className={`inline-block rounded px-2 py-0.5 text-[11px] font-semibold ${style.cls}`}>{style.label}</span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div data-session-footer className="flex items-center justify-between border-t border-zinc-100 px-5 py-3 dark:border-zinc-800">
        <div data-session-pager className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-300">
          <button type="button" data-session-pager-prev aria-label="Previous page" className="rounded-md border border-zinc-200 px-2 py-1 text-zinc-400 transition-colors hover:text-zinc-600 dark:border-zinc-700 dark:text-zinc-500 dark:hover:text-zinc-300">‹</button>
          <span data-session-page>{pageLabel} {page}</span>
          <button type="button" data-session-pager-next aria-label="Next page" className="rounded-md border border-zinc-200 px-2 py-1 text-zinc-400 transition-colors hover:text-zinc-600 dark:border-zinc-700 dark:text-zinc-500 dark:hover:text-zinc-300">›</button>
        </div>
        <label data-session-rows-per-page className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
          {rowsPerPageLabel}
          <select data-session-rows-select defaultValue={String(rowsPerPage)} className="rounded-md border border-zinc-200 bg-white px-2 py-1 text-xs text-zinc-700 outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200">
            {[10, 25, 50].map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
}
