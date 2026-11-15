import React from "react";
import { UiIcon } from "./UiIcon";

export interface BillingLineItem {
  label: string;
  /** Pre-formatted amount, e.g. "$207.00". */
  amount: string;
  /** Emphasized rows (subtotal/total) render bolder with a top border. */
  emphasized?: boolean;
}

export interface BillingPanelProps {
  planName: string;
  /** "Monthly" | "Annual" — toggles via onPeriodChange. */
  period?: "monthly" | "annual";
  onPeriodChange?: (period: "monthly" | "annual") => void;
  price: string;
  /** Small text after the price, e.g. "Per month". */
  priceSuffix?: string;
  features?: string[];
  lineItems?: BillingLineItem[];
  ctaLabel: string;
  onCta?: () => void;
  /** Optional note rendered under the CTA, e.g. trial reminder. */
  note?: string;
  className?: string;
}

export const BillingPanel: React.FC<BillingPanelProps> = ({
  planName,
  period = "monthly",
  onPeriodChange,
  price,
  priceSuffix,
  features = [],
  lineItems = [],
  ctaLabel,
  onCta,
  note,
  className = "",
}) => {
  const periods: { id: "monthly" | "annual"; label: string }[] = [
    { id: "monthly", label: "Monthly" },
    { id: "annual", label: "Annual" },
  ];

  return (
    <div
      className={`w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900 ${className}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] text-zinc-400">Upgrade to</p>
          <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50">{planName}</h3>
        </div>
        {onPeriodChange && (
          <div
            role="group"
            aria-label="Billing period"
            className="flex shrink-0 rounded-lg border border-zinc-200 p-0.5 dark:border-zinc-700"
          >
            {periods.map((p) => (
              <button
                key={p.id}
                type="button"
                aria-pressed={period === p.id}
                onClick={() => onPeriodChange?.(p.id)}
                className={`rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors ${
                  period === p.id
                    ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                    : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <p className="mt-3 flex items-baseline gap-1.5">
        <span className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">{price}</span>
        {priceSuffix && <span className="text-xs text-zinc-400">{priceSuffix}</span>}
      </p>

      {features.length > 0 && (
        <ul className="mt-3 space-y-1.5">
          {features.map((feature) => (
            <li key={feature} className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-300">
              <UiIcon name="check" size={13} className="shrink-0 text-emerald-500" />
              {feature}
            </li>
          ))}
        </ul>
      )}

      {lineItems.length > 0 && (
        <dl className="mt-4 space-y-2 border-t border-zinc-100 pt-3 dark:border-zinc-800">
          {lineItems.map((item) => (
            <div
              key={item.label}
              className={`flex items-center justify-between gap-4 ${
                item.emphasized
                  ? "border-t border-zinc-100 pt-2 font-semibold text-zinc-900 dark:border-zinc-800 dark:text-zinc-50"
                  : "text-zinc-500 dark:text-zinc-400"
              }`}
            >
              <dt className="text-xs">{item.label}</dt>
              <dd className="text-xs font-medium tabular-nums text-zinc-800 dark:text-zinc-200">{item.amount}</dd>
            </div>
          ))}
        </dl>
      )}

      <button
        type="button"
        onClick={onCta}
        className="mt-4 w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-zinc-900"
      >
        {ctaLabel}
      </button>

      {note && (
        <p className="mt-2.5 flex items-start gap-1.5 rounded-lg bg-sky-50 px-3 py-2 text-[11px] leading-relaxed text-sky-700 dark:bg-sky-950/60 dark:text-sky-300">
          <UiIcon name="info" size={12} className="mt-0.5 shrink-0" />
          {note}
        </p>
      )}
    </div>
  );
};
export default BillingPanel;
