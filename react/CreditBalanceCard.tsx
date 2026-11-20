import React, { useState } from "react";

export interface CreditBalanceCardProps {
  /** headline balance value, e.g. 6.68 */
  balance?: number;
  /** currency/unit label shown next to the balance */
  unit?: string;
  /** plan label shown in the status badge */
  plan?: string;
  /** mono currency prefix like $ or credits symbol */
  currency?: string;
  /** under this balance the card flips into a low-balance warning */
  warnBelow?: number;
  buyLabel?: string;
  couponLabel?: string;
  onBuy?: () => void;
  onCoupon?: () => void;
  className?: string;
}

export default function CreditBalanceCard({
  balance = 0,
  unit = "credits",
  plan = "Current plan",
  currency = "",
  warnBelow,
  buyLabel = "Buy More Credits",
  couponLabel = "Apply Coupon",
  onBuy,
  onCoupon,
  className = "",
}: CreditBalanceCardProps) {
  const [pulse, setPulse] = useState(false);

  const low = typeof warnBelow === "number" && balance < warnBelow;
  const formatted = balance.toFixed(2);

  const handle = (fn?: () => void) => () => {
    setPulse(true);
    window.setTimeout(() => setPulse(false), 600);
    fn?.();
  };

  return (
    <div
      data-credit-balance-card
      className={`rounded-xl border bg-white p-4 dark:bg-zinc-900 ${
        low ? "border-amber-300 dark:border-amber-500/60" : "border-zinc-200 dark:border-zinc-800"
      } ${className}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p data-credit-balance-title className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
          Credit Balance
        </p>
        <span
          data-credit-balance-plan
          className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-medium ${
            low
              ? "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400"
              : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${low ? "bg-amber-500" : "bg-emerald-500"}`}
            aria-hidden="true"
          />
          {plan}
        </span>
      </div>

      <p className="mt-2 flex items-baseline gap-2">
        <span
          data-credit-balance-value
          className={`font-mono text-3xl font-semibold tracking-tight ${
            low ? "text-amber-600 dark:text-amber-400" : "text-zinc-900 dark:text-zinc-50"
          }`}
        >
          {currency}
          {formatted}
        </span>
        <span data-credit-balance-unit className="text-xs text-zinc-500 dark:text-zinc-400">{unit}</span>
      </p>

      {low ? (
        <p data-credit-balance-warning className="mt-1 text-[11px] font-medium text-amber-600 dark:text-amber-400">
          Balance is running low — top up to avoid interruptions.
        </p>
      ) : null}

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          data-credit-balance-buy
          onClick={handle(onBuy)}
          className={`rounded-md bg-emerald-600 px-3 py-1.5 text-[11px] font-semibold text-white transition-all hover:bg-emerald-500 ${
            pulse ? "ring-2 ring-emerald-300 ring-offset-1" : ""
          }`}
        >
          {buyLabel}
        </button>
        <button
          type="button"
          data-credit-balance-coupon
          onClick={handle(onCoupon)}
          className="rounded-md border border-zinc-200 px-3 py-1.5 text-[11px] font-semibold text-zinc-600 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          {couponLabel}
        </button>
      </div>
    </div>
  );
}
