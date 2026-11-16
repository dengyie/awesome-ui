/**
 * FormTrackingDashboard - Form tracking dashboard: back arrow header with
 * title, Active pill and Options dropdown, four stat cards with colored
 * icon dots and % progress bars, a two-column form details grid, and a
 * sortable client requests table with avatar rows and status pills
 * (Fresha form tracking pattern).
 */
import React from "react";

export interface FormStat {
  id: string;
  label: string;
  value: number;
  pct: number; // 0-100
  tone: "sky" | "emerald" | "amber" | "rose";
  icon?: string;
}

export interface FormDetail {
  label: string;
  value: string;
}

export interface FormRequestRow {
  id: string;
  name: string;
  initials?: string;
  avatarUrl?: string;
  submitted: string;
  service: string;
  status: "completed" | "to-be-completed" | "not-completed";
}

export interface FormTrackingDashboardProps {
  title?: string;
  active?: boolean;
  stats?: FormStat[];
  details?: FormDetail[];
  requests?: FormRequestRow[];
  sortOptions?: string[];
  className?: string;
  onBack?: () => void;
  onSortChange?: (option: string) => void;
  onRequestClick?: (row: FormRequestRow) => void;
}

const STATUS_META: Record<FormRequestRow["status"], { label: string; cls: string }> = {
  completed: { label: "Completed", cls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300" },
  "to-be-completed": { label: "To be completed", cls: "bg-amber-100 text-amber-700 dark:bg-amber-950/70 dark:text-amber-300" },
  "not-completed": { label: "Not completed", cls: "bg-rose-100 text-rose-700 dark:bg-rose-950/70 dark:text-rose-300" },
};

const TONE_DOT: Record<FormStat["tone"], string> = {
  sky: "bg-sky-500",
  emerald: "bg-emerald-500",
  amber: "bg-amber-500",
  rose: "bg-rose-500",
};

const TONE_BAR: Record<FormStat["tone"], string> = {
  sky: "bg-sky-500",
  emerald: "bg-emerald-500",
  amber: "bg-amber-500",
  rose: "bg-rose-500",
};

export default function FormTrackingDashboard({
  title = "Consultation form",
  active = true,
  stats = [
    { id: "s1", label: "Sent to", value: 12, pct: 100, tone: "sky", icon: "📤" },
    { id: "s2", label: "Completed", value: 8, pct: 67, tone: "emerald", icon: "✅" },
    { id: "s3", label: "To be completed", value: 2, pct: 17, tone: "amber", icon: "⏳" },
    { id: "s4", label: "Not completed", value: 2, pct: 17, tone: "rose", icon: "⛔" },
  ],
  details = [
    { label: "Form name", value: "Consultation form" },
    { label: "Service", value: "Initial consultation" },
    { label: "Sent to", value: "12 clients" },
    { label: "Created", value: "Nov 2, 2026" },
    { label: "Reminder", value: "Automatic · 3 days" },
    { label: "Expiration", value: "No expiration" },
  ],
  requests = [
    { id: "r1", name: "Anna Kowalski", initials: "AK", submitted: "Nov 12, 2026", service: "Initial consultation", status: "completed" },
    { id: "r2", name: "Ben Carter", initials: "BC", submitted: "Nov 13, 2026", service: "Initial consultation", status: "to-be-completed" },
    { id: "r3", name: "Chen Wei", initials: "CW", submitted: "—", service: "Initial consultation", status: "not-completed" },
    { id: "r4", name: "Dana Patel", initials: "DP", submitted: "Nov 14, 2026", service: "Initial consultation", status: "completed" },
  ],
  sortOptions = ["Newest first", "Oldest first", "Name A–Z", "Status"],
  className = "",
  onBack,
  onSortChange,
  onRequestClick,
}: FormTrackingDashboardProps) {
  const [sortOpen, setSortOpen] = React.useState(false);
  const [sort, setSort] = React.useState(sortOptions[0] ?? "Newest first");

  return (
    <div data-formtrack className={`w-full rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900 sm:p-6 ${className}`}>
      {/* header */}
      <div data-formtrack-header className="flex items-center gap-3">
        <button
          data-formtrack-back
          type="button"
          aria-label="Back"
          onClick={() => onBack?.()}
          className="rounded-lg p-1.5 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-800 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
        >
          ←
        </button>
        <h2 data-formtrack-title className="text-xl font-bold text-zinc-900 dark:text-zinc-50">{title}</h2>
        {active && (
          <span data-formtrack-active className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300">
            Active
          </span>
        )}
        <div className="relative ml-auto">
          <button
            data-formtrack-options
            type="button"
            onClick={() => setSortOpen((v) => !v)}
            className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Options ▾
          </button>
          {sortOpen && (
            <div data-formtrack-sortmenu className="absolute right-0 z-10 mt-1 w-44 overflow-hidden rounded-xl border border-zinc-200 bg-white py-1 shadow-lg dark:border-zinc-700 dark:bg-zinc-800">
              {sortOptions.map((opt) => (
                <button
                  key={opt}
                  data-formtrack-sortoption={opt}
                  type="button"
                  onClick={() => {
                    setSort(opt);
                    setSortOpen(false);
                    onSortChange?.(opt);
                  }}
                  className={`block w-full px-3 py-1.5 text-left text-xs transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-700 ${
                    opt === sort ? "font-semibold text-indigo-600 dark:text-indigo-300" : "text-zinc-600 dark:text-zinc-300"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* stat cards */}
      <div data-formtrack-stats className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div
            key={s.id}
            data-formtrack-stat={s.id}
            className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800"
          >
            <div className="flex items-center gap-2">
              <span className={`h-2.5 w-2.5 rounded-full ${TONE_DOT[s.tone]}`} aria-hidden="true" />
              <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                {s.icon ? <span aria-hidden="true" className="mr-1">{s.icon}</span> : null}
                {s.label}
              </p>
            </div>
            <p data-formtrack-stat-value={s.id} className="mt-1.5 text-2xl font-black text-zinc-900 dark:text-zinc-50">{s.value}</p>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
              <div className={`h-full rounded-full ${TONE_BAR[s.tone]}`} style={{ width: `${Math.min(100, Math.max(0, s.pct))}%` }} />
            </div>
            <p className="mt-1 text-[11px] text-zinc-400 dark:text-zinc-500">{s.pct}% of sent</p>
          </div>
        ))}
      </div>

      {/* details grid */}
      <div data-formtrack-details className="mt-6">
        <p className="text-sm font-bold text-zinc-900 dark:text-zinc-50">Consultation form details</p>
        <div className="mt-2 grid gap-x-8 gap-y-2 rounded-xl border border-zinc-200 p-4 sm:grid-cols-2 dark:border-zinc-800">
          {details.map((d) => (
            <div key={d.label} className="flex items-center justify-between gap-4 text-sm">
              <span className="text-zinc-500 dark:text-zinc-400">{d.label}</span>
              <span className="font-medium text-zinc-800 dark:text-zinc-100">{d.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* requests table */}
      <div data-formtrack-table className="mt-6">
        <p className="text-sm font-bold text-zinc-900 dark:text-zinc-50">Client form requests</p>
        <div className="mt-2 overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50 text-xs uppercase tracking-wide text-zinc-400 dark:border-zinc-800 dark:bg-zinc-800/50 dark:text-zinc-500">
                <th className="px-4 py-2.5 font-semibold">Client</th>
                <th className="px-4 py-2.5 font-semibold">Submitted</th>
                <th className="px-4 py-2.5 font-semibold">Service</th>
                <th className="px-4 py-2.5 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((r) => {
                const meta = STATUS_META[r.status];
                return (
                  <tr
                    key={r.id}
                    data-formtrack-row={r.id}
                    onClick={() => onRequestClick?.(r)}
                    className="cursor-pointer border-b border-zinc-100 transition-colors last:border-0 hover:bg-zinc-50 dark:border-zinc-800/60 dark:hover:bg-zinc-800/40"
                  >
                    <td className="px-4 py-2.5">
                      <span className="flex items-center gap-2.5">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-indigo-100 text-xs font-bold text-indigo-700 dark:bg-indigo-950/70 dark:text-indigo-300">
                          {r.avatarUrl ? <img src={r.avatarUrl} alt={r.name} className="h-8 w-8 rounded-full object-cover" /> : r.initials ?? r.name.slice(0, 2).toUpperCase()}
                        </span>
                        <span className="font-medium text-zinc-800 dark:text-zinc-100">{r.name}</span>
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-2.5 text-zinc-500 dark:text-zinc-400">{r.submitted}</td>
                    <td className="px-4 py-2.5 text-zinc-500 dark:text-zinc-400">{r.service}</td>
                    <td className="px-4 py-2.5">
                      <span data-formtrack-status={r.status} className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${meta.cls}`}>
                        {meta.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
