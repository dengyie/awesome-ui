import React from "react";

export interface CheckoutLineItem {
  id: string;
  label: string;
  amount: string;
  muted?: boolean;
  strikethrough?: boolean;
}

export interface UpgradeCheckoutPanelProps {
  title?: string;
  planName?: string;
  billingPeriod?: "monthly" | "annual";
  onBillingPeriodChange?: (period: "monthly" | "annual") => void;
  seats?: number;
  onSeatsChange?: (seats: number) => void;
  minSeats?: number;
  maxSeats?: number;
  lineItems: CheckoutLineItem[];
  totalLabel?: string;
  total: string;
  totalNote?: string;
  discountLabel?: string;
  discount?: string;
  confirmText?: string;
  processing?: boolean;
  onConfirm?: () => void;
  terms?: string;
  className?: string;
}

const MINUS_SVG = (
  <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden="true">
    <path d="M5.5 9.25h9v1.5h-9v-1.5Z" />
  </svg>
);

const PLUS_SVG = (
  <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden="true">
    <path d="M9.25 5.5h1.5v3.75h3.75v1.5h-3.75v3.75h-1.5v-3.75H5.5v-1.5h3.75V5.5Z" />
  </svg>
);

/**
 * UpgradeCheckoutPanel - Clockwise/Attio style upgrade checkout: billing-period switch,
 * seat stepper, line-item summary with total and confirm CTA.
 */
export default function UpgradeCheckoutPanel({
  title = "Upgrade to the Teams plan",
  planName = "Teams",
  billingPeriod = "annual",
  onBillingPeriodChange,
  seats,
  onSeatsChange,
  minSeats = 1,
  maxSeats = 99,
  lineItems,
  totalLabel = "Total billed today",
  total,
  totalNote,
  discountLabel,
  discount,
  confirmText = "Confirm upgrade",
  processing = false,
  onConfirm,
  terms,
  className = "",
}: UpgradeCheckoutPanelProps) {
  const clampSeats = (n: number) => Math.min(maxSeats, Math.max(minSeats, n));
  return (
    <div data-upgrade-checkout className={`grid gap-6 rounded-xl border border-zinc-200 bg-white p-6 md:grid-cols-[1.2fr_1fr] dark:border-zinc-800 dark:bg-zinc-900 ${className}`}>
      <div>
        <h3 data-checkout-title className="text-xl font-bold text-zinc-900 dark:text-zinc-50">{title}</h3>

        <p className="mt-5 text-sm font-semibold text-zinc-900 dark:text-zinc-100">Billing cadence</p>
        <div className="mt-2 inline-flex rounded-lg border border-zinc-200 p-0.5 dark:border-zinc-700">
          {(["monthly", "annual"] as const).map((period) => (
            <button
              key={period}
              type="button"
              data-checkout-period={period}
              onClick={() => onBillingPeriodChange?.(period)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                billingPeriod === period
                  ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                  : "text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
              }`}
            >
              {period === "annual" ? "Annual plan" : "Monthly plan"}
            </button>
          ))}
        </div>

        {seats !== undefined && (
          <>
            <p className="mt-5 text-sm font-semibold text-zinc-900 dark:text-zinc-100">Seats</p>
            <div data-checkout-seats className="mt-2 flex items-center gap-3">
              <button
                type="button"
                data-checkout-seat-minus
                title="Fewer seats"
                onClick={() => onSeatsChange?.(clampSeats(seats - 1))}
                className="flex h-8 w-8 items-center justify-center rounded-md border border-zinc-300 text-zinc-600 hover:border-zinc-400 disabled:opacity-40 dark:border-zinc-700 dark:text-zinc-300"
                disabled={seats <= minSeats}
              >
                {MINUS_SVG}
              </button>
              <span data-checkout-seat-count className="min-w-8 text-center text-sm font-semibold text-zinc-900 dark:text-zinc-50">{seats}</span>
              <button
                type="button"
                data-checkout-seat-plus
                title="More seats"
                onClick={() => onSeatsChange?.(clampSeats(seats + 1))}
                className="flex h-8 w-8 items-center justify-center rounded-md border border-zinc-300 text-zinc-600 hover:border-zinc-400 disabled:opacity-40 dark:border-zinc-700 dark:text-zinc-300"
                disabled={seats >= maxSeats}
              >
                {PLUS_SVG}
              </button>
              <span className="text-xs text-zinc-500 dark:text-zinc-400">${planName} plan · {billingPeriod === "annual" ? "billed annually" : "billed monthly"}</span>
            </div>
          </>
        )}
      </div>

      <div data-checkout-summary className="rounded-lg bg-zinc-50 p-4 dark:bg-zinc-800/60">
        <div className="space-y-2.5">
          {lineItems.map((item) => (
            <div key={item.id} className="flex items-center justify-between text-sm">
              <span className="text-zinc-600 dark:text-zinc-300">{item.label}</span>
              <span className={`font-medium ${item.strikethrough ? "text-zinc-400 line-through" : "text-zinc-900 dark:text-zinc-50"} ${item.muted ? "text-zinc-400 dark:text-zinc-500" : ""}`}>
                {item.amount}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-3 border-t border-zinc-200 pt-3 dark:border-zinc-700">
          <div className="flex items-center justify-between text-sm font-semibold">
            <span className="text-zinc-900 dark:text-zinc-50">{totalLabel}</span>
            <span data-checkout-total className="text-zinc-900 dark:text-zinc-50">{total}</span>
          </div>
          {discount && (
            <div className="mt-1 flex items-center justify-between text-xs">
              <span className="text-emerald-600 dark:text-emerald-400">{discountLabel || "Discount"}</span>
              <span data-checkout-discount className="font-medium text-emerald-600 dark:text-emerald-400">{discount}</span>
            </div>
          )}
          {totalNote && <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{totalNote}</p>}
        </div>
        {terms && <p className="mt-3 text-[11px] leading-relaxed text-zinc-500 dark:text-zinc-400">{terms}</p>}
        <button
          type="button"
          data-checkout-confirm
          onClick={() => onConfirm?.()}
          disabled={processing}
          className="mt-4 w-full rounded-md bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-500 disabled:opacity-60"
        >
          {processing ? "Processing…" : confirmText}
        </button>
      </div>
    </div>
  );
}
