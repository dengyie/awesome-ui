/**
 * AuditLogTable - Audit log: date-range and keyword filter bar with a
 * mini bar-chart trend, view segmented switch and a four-column event
 * table (time / actor / event / target) with status badges
 * (Okta System Log pattern).
 */
import React from "react";

export type AuditEventStatus = "success" | "failure" | "pending";

export interface AuditEvent {
  id: string;
  time: string;
  actor: string;
  event: string;
  status: AuditEventStatus;
  target: string;
}

export interface AuditLogTableProps {
  title?: string;
  filters?: { label: string; value: string }[];
  trend?: { label: string; value: number }[];
  views?: string[];
  activeView?: string;
  events?: AuditEvent[];
  className?: string;
  onEventClick?: (event: AuditEvent) => void;
  onViewChange?: (view: string) => void;
}

const STATUS_STYLES: Record<AuditEventStatus, { label: string; cls: string }> = {
  success: { label: "SUCCESS", cls: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400" },
  failure: { label: "FAILURE", cls: "bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-400" },
  pending: { label: "PENDING", cls: "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400" },
};

const DEFAULT_TREND = [
  { label: "Mon", value: 12 },
  { label: "Tue", value: 28 },
  { label: "Wed", value: 19 },
  { label: "Thu", value: 41 },
  { label: "Fri", value: 33 },
  { label: "Sat", value: 9 },
  { label: "Sun", value: 5 },
];

const DEFAULT_EVENTS: AuditEvent[] = [
  {
    id: "e1",
    time: "2026-11-16 09:41:22",
    actor: "admin@mango.dev",
    event: "user.session.login",
    status: "success",
    target: "Web session (Chrome 141, macOS)",
  },
  {
    id: "e2",
    time: "2026-11-16 09:38:04",
    actor: "svc-deploy@github",
    event: "app.oauth2.token.grant",
    status: "success",
    target: "deploy-bot client",
  },
  {
    id: "e3",
    time: "2026-11-16 08:57:51",
    actor: "unknown@203.0.113.7",
    event: "user.session.login",
    status: "failure",
    target: "Sign-in attempt — invalid password",
  },
  {
    id: "e4",
    time: "2026-11-16 08:12:10",
    actor: "admin@mango.dev",
    event: "group.membership.add",
    status: "success",
    target: "engineering → sso-everyone",
  },
  {
    id: "e5",
    time: "2026-11-16 07:44:36",
    actor: "audit-daemon",
    event: "policy.rule.evaluate",
    status: "pending",
    target: "mfa-required rule (draft)",
  },
];

export default function AuditLogTable({
  title = "System Log",
  filters = [
    { label: "Date range", value: "Last 24 hours" },
    { label: "Keyword", value: "user.session" },
  ],
  trend = DEFAULT_TREND,
  views = ["Events", "Raw export"],
  activeView = "Events",
  events = DEFAULT_EVENTS,
  className = "",
  onEventClick,
  onViewChange,
}: AuditLogTableProps) {
  const max = Math.max(...trend.map((t) => t.value), 1);
  return (
    <div data-audit-log className={`w-full rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900 ${className}`}>
      <div data-audit-header className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 px-4 py-3 dark:border-zinc-800">
        <p data-audit-title className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">{title}</p>
        <div data-audit-filters className="flex flex-wrap items-center gap-2">
          {filters.map((f) => (
            <button
              key={f.label}
              data-audit-filter={f.label}
              type="button"
              className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 px-2.5 py-1.5 text-xs text-zinc-600 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              <span className="text-zinc-400" aria-hidden="true">◷</span>
              <span className="font-medium">{f.label}:</span> {f.value}
              <span className="text-zinc-400" aria-hidden="true">▾</span>
            </button>
          ))}
        </div>
      </div>
      <div data-audit-overview className="flex flex-wrap items-end justify-between gap-4 px-4 py-3">
        <div data-audit-trend className="flex items-end gap-1.5" aria-hidden="true">
          {trend.map((t) => (
            <span key={t.label} data-audit-trend-bar={t.label} className="flex w-4 flex-col items-center gap-0.5">
              <span
                className="w-full rounded-sm bg-zinc-200 dark:bg-zinc-700"
                style={{ height: `${Math.round((t.value / max) * 36) + 4}px` }}
              />
              <span className="text-[9px] text-zinc-400 dark:text-zinc-500">{t.label}</span>
            </span>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <p data-audit-count className="text-sm text-zinc-500 dark:text-zinc-400">
            <span className="font-semibold text-zinc-900 dark:text-zinc-50">{events.length}</span> events
          </p>
          <div data-audit-views className="inline-flex items-center gap-0.5 rounded-md bg-zinc-100 p-0.5 dark:bg-zinc-800">
            {views.map((v) => (
              <button
                key={v}
                type="button"
                data-audit-view={v}
                aria-pressed={v === activeView}
                onClick={() => onViewChange?.(v)}
                className={v === activeView
                  ? "rounded bg-white px-2 py-0.5 text-[11px] font-medium text-zinc-800 shadow-sm dark:bg-zinc-700 dark:text-zinc-100"
                  : "rounded px-2 py-0.5 text-[11px] font-medium text-zinc-500 transition-colors hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"}
              >
                {v}
              </button>
            ))}
          </div>
        </div>
      </div>
      <table data-audit-table className="w-full text-left text-xs">
        <thead>
          <tr className="border-y border-zinc-100 text-[11px] font-medium text-zinc-400 dark:border-zinc-800 dark:text-zinc-500">
            <th className="px-4 py-2 font-medium">Time</th>
            <th className="px-2 py-2 font-medium">Actor</th>
            <th className="px-2 py-2 font-medium">Event info</th>
            <th className="px-4 py-2 font-medium">Targets</th>
          </tr>
        </thead>
        <tbody>
          {events.map((event) => {
            const style = STATUS_STYLES[event.status] ?? STATUS_STYLES.pending;
            return (
              <tr
                key={event.id}
                data-audit-row={event.id}
                tabIndex={0}
                onClick={() => onEventClick?.(event)}
                className="cursor-pointer border-b border-zinc-50 align-top transition-colors last:border-b-0 hover:bg-zinc-50 dark:border-zinc-800/60 dark:hover:bg-zinc-800/60"
              >
                <td data-audit-row-time className="whitespace-nowrap px-4 py-2.5 text-zinc-500 dark:text-zinc-400">{event.time}</td>
                <td data-audit-row-actor className="px-2 py-2.5 text-zinc-700 dark:text-zinc-200">{event.actor}</td>
                <td data-audit-row-event className="px-2 py-2.5">
                  <span className="font-mono text-zinc-800 dark:text-zinc-100">{event.event}</span>
                  <span className={`ml-2 inline-block rounded px-1.5 py-0.5 text-[9px] font-semibold ${style.cls}`} data-audit-row-status={event.status}>
                    {style.label}
                  </span>
                </td>
                <td data-audit-row-target className="max-w-[18rem] truncate px-4 py-2.5 text-zinc-500 dark:text-zinc-400" title={event.target}>{event.target}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
