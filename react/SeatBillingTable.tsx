import React, { useState } from "react";

export interface SeatRow {
  id: string;
  user: string;
  email?: string;
  /** seat type, e.g. "Admin" / "Member" / "Guest" */
  seat?: string;
  /** monthly cost for this seat */
  cost?: number;
  /** usage snapshot, e.g. "1.2 credits" */
  usage?: string;
  status?: "active" | "invited" | "suspended";
}

export interface SeatBillingTableProps {
  title?: string;
  description?: string;
  rows?: SeatRow[];
  /** billing period label, e.g. "Monthly · Nov 2026" */
  period?: string;
  currency?: string;
  /** searchable */
  searchable?: boolean;
  className?: string;
}

const STATUS_BADGE: Record<NonNullable<SeatRow["status"]>, string> = {
  active: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
  invited: "bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-400",
  suspended: "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400",
};

const STATUS_LABEL: Record<NonNullable<SeatRow["status"]>, string> = {
  active: "Active",
  invited: "Invited",
  suspended: "Suspended",
};

export default function SeatBillingTable({
  title = "Usage by User",
  description = "Per-seat costs and credit consumption for the current billing period.",
  rows = [],
  period = "Monthly",
  currency = "$",
  searchable = true,
  className = "",
}: SeatBillingTableProps) {
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  const filtered = q
    ? rows.filter((r) => r.user.toLowerCase().includes(q) || (r.email ?? "").toLowerCase().includes(q))
    : rows;

  const billedSeats = rows.filter((r) => r.status !== "suspended");
  const totalCost = billedSeats.reduce((acc, r) => acc + (r.cost ?? 0), 0);

  return (
    <div data-seat-table className={`rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p data-seat-title className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{title}</p>
        {period ? <span data-seat-period className="text-[11px] text-zinc-400 dark:text-zinc-500">{period}</span> : null}
      </div>
      <p data-seat-description className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{description}</p>

      {searchable ? (
        <input
          data-seat-search
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for a user…"
          className="mt-3 w-full rounded-md border border-zinc-200 bg-white px-2.5 py-1.5 text-xs text-zinc-700 placeholder:text-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
        />
      ) : null}

      <table data-seat-rows className="mt-2 w-full text-left text-xs">
        <thead>
          <tr className="border-b border-zinc-200 text-[10px] uppercase tracking-wide text-zinc-400 dark:border-zinc-700">
            <th className="py-1.5 pr-2 font-semibold">Name</th>
            <th className="py-1.5 pr-2 font-semibold">Seat</th>
            <th className="py-1.5 pr-2 font-semibold">Usage</th>
            <th className="py-1.5 text-right font-semibold">Cost</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((r) => (
            <tr key={r.id} data-seat-row={r.id} className="border-b border-zinc-100 last:border-0 dark:border-zinc-800">
              <td className="py-2 pr-2">
                <div className="flex items-center gap-2">
                  <span data-seat-user className="truncate font-medium text-zinc-700 dark:text-zinc-200">{r.user}</span>
                  {r.status && r.status !== "active" ? (
                    <span data-seat-status className={`rounded-full px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide ${STATUS_BADGE[r.status]}`}>
                      {STATUS_LABEL[r.status]}
                    </span>
                  ) : null}
                </div>
                {r.email ? <p className="mt-0.5 truncate text-[10px] text-zinc-400 dark:text-zinc-500">{r.email}</p> : null}
              </td>
              <td className="py-2 pr-2 text-zinc-500 dark:text-zinc-400">{r.seat ?? "Member"}</td>
              <td className="py-2 pr-2 font-mono text-[11px] text-zinc-500 dark:text-zinc-400">{r.usage ?? "—"}</td>
              <td data-seat-cost className="py-2 text-right font-mono text-[11px] text-zinc-700 dark:text-zinc-200">
                {r.cost != null ? `${currency}${r.cost.toFixed(2)}` : "—"}
              </td>
            </tr>
          ))}
          {filtered.length === 0 ? (
            <tr>
              <td colSpan={4} data-seat-empty className="py-4 text-center text-xs text-zinc-400 dark:text-zinc-500">
                {q ? "No users match your search" : "No seats billed this period"}
              </td>
            </tr>
          ) : null}
        </tbody>
        {billedSeats.length > 0 ? (
          <tfoot>
            <tr data-seat-total className="border-t border-zinc-200 dark:border-zinc-700">
              <td className="py-2 pr-2 text-[11px] font-semibold text-zinc-600 dark:text-zinc-300">
                {billedSeats.length} billed seat{billedSeats.length === 1 ? "" : "s"}
              </td>
              <td colSpan={2}></td>
              <td data-seat-total-cost className="py-2 text-right font-mono text-xs font-semibold text-zinc-800 dark:text-zinc-100">
                {currency}{totalCost.toFixed(2)}
              </td>
            </tr>
          </tfoot>
        ) : null}
      </table>
    </div>
  );
}
