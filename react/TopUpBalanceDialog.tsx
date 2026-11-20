import React, { useState } from "react";

export interface TopUpBalanceDialogProps {
  title?: string;
  /** billing entity shown in the Bill-to select */
  billToOptions?: string[];
  defaultBillTo?: string;
  currencies?: string[];
  defaultCurrency?: string;
  balance?: number;
  currencySymbol?: string;
  /** quick amount chips */
  quickAmounts?: number[];
  minAmount?: number;
  confirmLabel?: string;
  cancelLabel?: string;
  /** render the dialog open on first mount (SSR/testing) */
  defaultOpen?: boolean;
  onConfirm?: (detail: { billTo: string; currency: string; amount: number }) => void;
  onCancel?: () => void;
  className?: string;
}

export default function TopUpBalanceDialog({
  title = "Top up balance",
  billToOptions = ["Acme Inc."],
  defaultBillTo,
  currencies = ["USD", "EUR", "SGD"],
  defaultCurrency,
  balance = 0,
  currencySymbol = "$",
  quickAmounts = [50, 100, 250, 500],
  minAmount = 10,
  confirmLabel = "Confirm top-up",
  cancelLabel = "Cancel",
  defaultOpen = false,
  onConfirm,
  onCancel,
  className = "",
}: TopUpBalanceDialogProps) {
  const [open, setOpen] = useState(defaultOpen);
  const [billTo, setBillTo] = useState(defaultBillTo ?? billToOptions[0] ?? "");
  const [currency, setCurrency] = useState(defaultCurrency ?? currencies[0] ?? "USD");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState<{ billTo: string; currency: string; amount: number } | null>(null);

  const parsed = Number.parseFloat(amount);
  const valid = Number.isFinite(parsed) && parsed >= minAmount;

  const reset = () => {
    setAmount("");
    setError(null);
    setConfirmed(null);
  };

  const close = () => {
    setOpen(false);
    reset();
  };

  const handleConfirm = () => {
    if (!valid) {
      setError(`Minimum top-up is ${currencySymbol}${minAmount.toFixed(2)}`);
      return;
    }
    const detail = { billTo, currency, amount: parsed };
    setConfirmed(detail);
    onConfirm?.(detail);
  };

  return (
    <div data-topup-balance-dialog className={className}>
      <button
        type="button"
        data-topup-open
        onClick={() => setOpen(true)}
        className="rounded-md bg-indigo-600 px-3 py-1.5 text-[11px] font-semibold text-white transition-colors hover:bg-indigo-500"
      >
        {title}
      </button>

      {open ? (
        <div
          data-topup-overlay
          className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) close();
          }}
        >
          <div
            data-topup-panel
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className="w-full max-w-sm rounded-xl border border-zinc-200 bg-white p-4 shadow-xl dark:border-zinc-800 dark:bg-zinc-900"
          >
            {confirmed ? (
              <>
                <p data-topup-confirmed className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                  Top-up confirmed
                </p>
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                  {currencySymbol}
                  {confirmed.amount.toFixed(2)} {confirmed.currency} billed to {confirmed.billTo}.
                </p>
                <div className="mt-3 flex justify-end">
                  <button
                    type="button"
                    data-topup-done
                    onClick={close}
                    className="rounded-md bg-zinc-900 px-3 py-1.5 text-[11px] font-semibold text-white dark:bg-zinc-100 dark:text-zinc-900"
                  >
                    Done
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <p data-topup-title className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{title}</p>
                  <button
                    type="button"
                    data-topup-close
                    aria-label="Close"
                    onClick={close}
                    className="rounded p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
                  >
                    ✕
                  </button>
                </div>

                <label className="mt-3 block">
                  <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">Bill to</span>
                  <select
                    data-topup-billto
                    value={billTo}
                    onChange={(e) => setBillTo(e.target.value)}
                    className="mt-1 w-full rounded-md border border-zinc-200 bg-white px-2 py-1.5 text-xs text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
                  >
                    {billToOptions.map((o) => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>
                </label>

                <label className="mt-2 block">
                  <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">Currency</span>
                  <select
                    data-topup-currency
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="mt-1 w-full rounded-md border border-zinc-200 bg-white px-2 py-1.5 text-xs text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
                  >
                    {currencies.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </label>

                <label className="mt-2 block">
                  <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">Amount</span>
                  <div className="mt-1 flex items-center gap-1 rounded-md border border-zinc-200 bg-white px-2 py-1.5 focus-within:border-indigo-400 dark:border-zinc-700 dark:bg-zinc-900">
                    <span className="text-xs text-zinc-400">{currencySymbol}</span>
                    <input
                      data-topup-amount
                      type="number"
                      inputMode="decimal"
                      min={minAmount}
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => {
                        setAmount(e.target.value);
                        setError(null);
                      }}
                      className="min-w-0 flex-1 bg-transparent text-xs text-zinc-700 outline-none placeholder:text-zinc-400 dark:text-zinc-200"
                    />
                  </div>
                </label>

                <div data-topup-quick className="mt-2 flex flex-wrap gap-1.5">
                  {quickAmounts.map((q) => (
                    <button
                      key={q}
                      type="button"
                      data-topup-quick-amount={q}
                      onClick={() => {
                        setAmount(String(q));
                        setError(null);
                      }}
                      className={`rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors ${
                        Number.parseFloat(amount) === q
                          ? "border-indigo-500 bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400"
                          : "border-zinc-200 text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                      }`}
                    >
                      {currencySymbol}
                      {q}
                    </button>
                  ))}
                </div>

                <p data-topup-summary className="mt-3 flex items-center justify-between border-t border-zinc-100 pt-2 text-xs dark:border-zinc-800">
                  <span className="text-zinc-500 dark:text-zinc-400">New balance after top-up</span>
                  <span data-topup-summary-value className="font-mono font-semibold text-zinc-900 dark:text-zinc-50">
                    {currencySymbol}
                    {(balance + (valid ? parsed : 0)).toFixed(2)}
                  </span>
                </p>

                {error ? (
                  <p data-topup-error role="alert" className="mt-2 text-[11px] font-medium text-rose-600 dark:text-rose-400">
                    {error}
                  </p>
                ) : null}

                <div className="mt-3 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    data-topup-cancel
                    onClick={onCancel ?? close}
                    className="rounded-md border border-zinc-200 px-3 py-1.5 text-[11px] font-semibold text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                  >
                    {cancelLabel}
                  </button>
                  <button
                    type="button"
                    data-topup-confirm
                    onClick={handleConfirm}
                    className="rounded-md bg-indigo-600 px-3 py-1.5 text-[11px] font-semibold text-white transition-colors hover:bg-indigo-500"
                  >
                    {confirmLabel}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
