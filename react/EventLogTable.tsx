/**
 * EventLogTable - Administrative event log: dropdown filter row (Type /
 * Source / Action / Target / date-range) with an Export CSV button, a
 * six-column log table (type / date-time / source with role / action /
 * targets / details) with muted-gray rows for older entries
 * (Vanta event log pattern).
 */
import React from "react";

export interface LogEntry {
  id: string;
  type: string;
  date: string;
  time: string;
  source: string;
  role: string;
  action: string;
  targets: string;
  details: string;
  muted?: boolean;
}

export interface EventLogTableProps {
  title?: string;
  description?: string;
  filters?: string[];
  dateRangeLabel?: string;
  exportLabel?: string;
  columnLabels?: string[];
  entries?: LogEntry[];
  className?: string;
  onFilterSelect?: (filter: string) => void;
  onExport?: () => void;
  onEntryClick?: (entry: LogEntry) => void;
}

export default function EventLogTable({
  title = "Event log",
  description = "Monitor and track a history of changes made by users within your workspace.",
  filters = ["Type", "Source", "Action", "Target"],
  dateRangeLabel = "Select date range",
  exportLabel = "Export CSV",
  columnLabels = ["Type", "Date", "Source", "Action", "Targets", "Details"],
  entries = [
    {
      id: "l1",
      type: "User",
      date: "Sep 11, 2024",
      time: "11:08 AM",
      source: "Jane Smith",
      role: "View-only Admin",
      action: "Login",
      targets: "Authentication method",
      details: "Jane Smith logged in via Google.",
    },
    {
      id: "l2",
      type: "User",
      date: "Sep 4, 2024",
      time: "5:06 PM",
      source: "Alexia Smith",
      role: "Admin",
      action: "Send personnel reminder",
      targets: "User",
      details: "Alexia Smith sent a reminder to complete security tasks.",
    },
    {
      id: "l3",
      type: "User",
      date: "Aug 29, 2024",
      time: "9:14 AM",
      source: "Marcus Lee",
      role: "Editor",
      action: "Update vendor",
      targets: "Vendor",
      details: "Marcus Lee updated renewal date for Figma.",
      muted: true,
    },
    {
      id: "l4",
      type: "User",
      date: "Aug 22, 2024",
      time: "2:47 PM",
      source: "Priya Patel",
      role: "Admin",
      action: "Create integrations",
      targets: "Integration",
      details: "Priya Patel connected Okta to the workspace.",
      muted: true,
    },
    {
      id: "l5",
      type: "User",
      date: "Aug 15, 2024",
      time: "10:02 AM",
      source: "Sam Ortiz",
      role: "Viewer",
      action: "Export report",
      targets: "Report",
      details: "Sam Ortiz exported the SOC 2 readiness report.",
      muted: true,
    },
  ],
  className = "",
  onFilterSelect,
  onExport,
  onEntryClick,
}: EventLogTableProps) {
  const roleCls = (role: string) => {
    if (role === "Admin") return "text-zinc-800 dark:text-zinc-100";
    if (role === "Viewer") return "text-zinc-400 dark:text-zinc-500";
    return "text-zinc-500 dark:text-zinc-400";
  };

  return (
    <div data-eventlog className={`w-full overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900 ${className}`}>
      <div data-eventlog-header className="px-6 pt-6">
        <h2 data-eventlog-title className="text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">{title}</h2>
        <p data-eventlog-description className="mt-1 max-w-3xl text-sm text-zinc-500 dark:text-zinc-400">{description}</p>
      </div>

      {/* filter row */}
      <div data-eventlog-filters className="flex flex-wrap items-center justify-between gap-3 px-6 py-4">
        <div className="flex flex-wrap items-center gap-2">
          {filters.map((filter) => (
            <button
              key={filter}
              data-eventlog-filter={filter}
              type="button"
              onClick={() => onFilterSelect?.(filter)}
              className="rounded-lg border border-zinc-200 px-3 py-1.5 text-sm text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              {filter} <span aria-hidden="true" className="text-zinc-400">⌄</span>
            </button>
          ))}
          <button data-eventlog-daterange type="button" className="rounded-lg border border-zinc-200 px-3 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800">
            🗓 {dateRangeLabel}
          </button>
        </div>
        <button
          data-eventlog-export
          type="button"
          onClick={() => onExport?.()}
          className="rounded-lg border border-zinc-200 px-3 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
        >
          ↓ {exportLabel}
        </button>
      </div>

      {/* table */}
      <div className="overflow-x-auto">
        <table data-eventlog-table className="w-full min-w-[820px] text-left text-sm">
          <thead>
            <tr data-eventlog-columns className="border-y border-zinc-100 text-[11px] uppercase tracking-wide text-zinc-400 dark:border-zinc-800 dark:text-zinc-500">
              {columnLabels.map((label) => (
                <th key={label} className="px-6 py-2.5 font-semibold">{label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr
                key={entry.id}
                data-eventlog-entry={entry.id}
                data-eventlog-muted={entry.muted ? "true" : "false"}
                onClick={() => onEntryClick?.(entry)}
                className={`cursor-pointer border-b border-zinc-100 transition-colors last:border-b-0 dark:border-zinc-800 ${
                  entry.muted ? "text-zinc-400 dark:text-zinc-500" : "text-zinc-700 dark:text-zinc-200"
                } hover:bg-zinc-50 dark:hover:bg-zinc-800/40`}
              >
                <td className="px-6 py-3.5 font-semibold">{entry.type}</td>
                <td className="px-6 py-3.5">
                  <p className="font-medium">{entry.date}</p>
                  <p className="text-xs opacity-70">{entry.time}</p>
                </td>
                <td className="px-6 py-3.5">
                  <p className={`font-medium ${entry.muted ? "" : "text-zinc-800 dark:text-zinc-100"}`}>{entry.source}</p>
                  <p className={`text-xs ${roleCls(entry.role)}`}>{entry.role}</p>
                </td>
                <td className="px-6 py-3.5">{entry.action}</td>
                <td className="px-6 py-3.5">{entry.targets}</td>
                <td className="px-6 py-3.5">{entry.details}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
