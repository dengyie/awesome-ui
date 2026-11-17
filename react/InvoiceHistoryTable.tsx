/**
 * InvoiceHistoryTable - Billing invoice history: header with title and
 * currency note, table of invoices (period / invoice id / amount / status
 * badge / date / download action) with a paid-total footer
 * (Contractbook / Remote billing history pattern).
 */
import React from "react";

export type InvoiceStatus = "paid" | "pending" | "failed";

export interface Invoice {
  id: string;
  period: string;
  amount: string;
  status: InvoiceStatus;
  date: string;
}

export interface InvoiceHistoryTableProps {
  title?: string;
  currency?: string;
  downloadLabel?: string;
  invoices?: Invoice[];
  className?: string;
  onDownload?: (invoice: Invoice) => void;
}

const STATUS_STYLES: Record<InvoiceStatus, { label: string; cls: string }> = {
  paid: { label: "Paid", cls: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400" },
  pending: { label: "Pending", cls: "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400" },
  failed: { label: "Failed", cls: "bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-400" },
};

const DEFAULT_INVOICES: Invoice[] = [
  { id: "INV-2026-011", period: "November 2026", amount: "148.00", status: "paid", date: "Nov 1, 2026" },
  { id: "INV-2026-010", period: "October 2026", amount: "148.00", status: "paid", date: "Oct 1, 2026" },
  { id: "INV-2026-009", period: "September 2026", amount: "96.00", status: "pending", date: "Sep 1, 2026" },
  { id: "INV-2026-008", period: "August 2026", amount: "148.00", status: "failed", date: "Aug 1, 2026" },
];

const amountNumber = (invoice: Invoice) => {
  const n = Number.parseFloat(String(invoice.amount ?? "0").replace(/[^0-9.\-]/g, ""));
  return Number.isNaN(n) ? 0 : n;
};

export const InvoiceHistoryTable: React.FC<InvoiceHistoryTableProps> = ({
  title = "Invoice history",
  currency = "USD",
  downloadLabel = "Download",
  invoices = DEFAULT_INVOICES,
  className = "",
  onDownload,
}) => {
  const list = Array.isArray(invoices) ? invoices : [];
  const paidTotal = list
    .filter((inv) => inv.status === "paid")
    .reduce((sum, inv) => sum + amountNumber(inv), 0)
    .toFixed(2);

  return (
    <div data-invoice-table className={`w-full rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900 ${className}`}>
      <div data-invoice-header className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 px-5 py-4 dark:border-zinc-800">
        <p data-invoice-title className="text-base font-semibold text-zinc-900 dark:text-zinc-50">{title}</p>
        <span data-invoice-currency className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-[11px] font-semibold text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">{currency}</span>
      </div>
      <table data-invoice-table-body className="w-full text-left text-xs">
        <thead>
          <tr className="border-b border-zinc-100 text-[11px] font-semibold uppercase tracking-wide text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
            <th className="px-5 py-2.5 font-semibold">Billing period</th>
            <th className="px-2 py-2.5 font-semibold">Invoice</th>
            <th className="px-2 py-2.5 text-right font-semibold">Amount</th>
            <th className="px-2 py-2.5 font-semibold">Status</th>
            <th className="px-2 py-2.5 font-semibold">Date</th>
            <th className="px-5 py-2.5 text-right font-semibold"><span className="sr-only">Actions</span></th>
          </tr>
        </thead>
        <tbody>
          {list.map((inv) => {
            const style = STATUS_STYLES[inv.status] ?? STATUS_STYLES.pending;
            return (
              <tr key={inv.id} data-invoice-row={inv.id} className="border-b border-zinc-50 transition-colors last:border-b-0 hover:bg-zinc-50 dark:border-zinc-800/60 dark:hover:bg-zinc-800/60">
                <td data-invoice-period={inv.period} className="whitespace-nowrap px-5 py-3 font-medium text-zinc-800 dark:text-zinc-100">{inv.period}</td>
                <td data-invoice-id={inv.id} className="px-2 py-3 font-mono text-xs text-zinc-500 dark:text-zinc-400">{inv.id}</td>
                <td data-invoice-amount={inv.amount} className="px-2 py-3 text-right font-mono text-zinc-800 dark:text-zinc-100">{currency} {inv.amount}</td>
                <td data-invoice-status={inv.status} className="px-2 py-3"><span className={`inline-block rounded px-2 py-0.5 text-[11px] font-semibold ${style.cls}`}>{style.label}</span></td>
                <td data-invoice-date={inv.date} className="whitespace-nowrap px-2 py-3 text-zinc-500 dark:text-zinc-400">{inv.date}</td>
                <td className="px-5 py-3 text-right">
                  <button
                    type="button"
                    data-invoice-download={inv.id}
                    onClick={() => onDownload?.(inv)}
                    className="rounded-md border border-zinc-200 px-2.5 py-1 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                  >
                    {downloadLabel}
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div data-invoice-footer className="flex items-center justify-between border-t border-zinc-100 px-5 py-3 text-sm dark:border-zinc-800">
        <span data-invoice-total-label className="text-zinc-500 dark:text-zinc-400">Paid total</span>
        <span data-invoice-total-value className="font-mono font-semibold text-zinc-900 dark:text-zinc-50">{currency} {paidTotal}</span>
      </div>
    </div>
  );
};

export default InvoiceHistoryTable;
