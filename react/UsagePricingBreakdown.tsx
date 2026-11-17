/**
 * UsagePricingBreakdown - Metered usage pricing: tiered unit-price table
 * (range / usage / unit price / subtotal) with the current tier highlighted
 * and an estimated total footer (usage-based billing pattern).
 */
import React from "react";

export interface UsageTier {
  range: string;
  unit?: string;
  usage: number;
  unitPrice: number;
}

export interface UsagePricingBreakdownProps {
  title?: string;
  currency?: string;
  tiers?: UsageTier[];
  footerNote?: string;
  className?: string;
}

const DEFAULT_TIERS: UsageTier[] = [
  { range: "First 10,000", unit: "requests", usage: 9420, unitPrice: 0.002 },
  { range: "10,001 – 50,000", unit: "requests", usage: 18340, unitPrice: 0.0012 },
  { range: "50,001 – 200,000", unit: "requests", usage: 0, unitPrice: 0.0008 },
];

const toNumber = (value: unknown, fallback = 0) => {
  const n = Number.parseFloat(String(value ?? ""));
  return Number.isNaN(n) ? fallback : n;
};

export const UsagePricingBreakdown: React.FC<UsagePricingBreakdownProps> = ({
  title = "Usage this cycle",
  currency = "USD",
  tiers = DEFAULT_TIERS,
  footerNote = "Estimated charges based on metered usage to date.",
  className = "",
}) => {
  const list = Array.isArray(tiers) ? tiers : [];
  let total = 0;
  const rows = list.map((tier, index) => {
    const usage = Math.max(0, toNumber(tier.usage));
    const unitPrice = Math.max(0, toNumber(tier.unitPrice));
    const subtotal = usage * unitPrice;
    total += subtotal;
    return { tier, index, usage, unitPrice, subtotal, current: usage > 0 };
  });

  return (
    <div data-pricing-breakdown className={`w-full rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900 ${className}`}>
      <div data-pricing-header className="flex items-center justify-between border-b border-zinc-100 px-5 py-4 dark:border-zinc-800">
        <p data-pricing-title className="text-base font-semibold text-zinc-900 dark:text-zinc-50">{title}</p>
        <span data-pricing-currency className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-[11px] font-semibold text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">{currency}</span>
      </div>
      <table data-pricing-table-body className="w-full text-left text-xs">
        <thead>
          <tr className="border-b border-zinc-100 text-[11px] font-semibold uppercase tracking-wide text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
            <th className="px-5 py-2.5 font-semibold">Tier</th>
            <th className="px-2 py-2.5 text-right font-semibold">Usage</th>
            <th className="px-2 py-2.5 text-right font-semibold">Unit price</th>
            <th className="px-5 py-2.5 text-right font-semibold">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ tier, index, usage, unitPrice, subtotal, current }) => (
            <tr
              key={index}
              data-pricing-tier={index}
              className={`border-b border-zinc-50 transition-colors last:border-b-0 dark:border-zinc-800/60 ${current ? "bg-violet-50/60 dark:bg-violet-950/30" : ""}`}
            >
              <td data-pricing-range={tier.range} className="whitespace-nowrap px-5 py-3 font-medium text-zinc-800 dark:text-zinc-100">
                {tier.range} <span className="ml-1 text-[11px] font-normal text-zinc-400">{tier.unit || ""}</span>
              </td>
              <td data-pricing-usage={usage} className="px-2 py-3 text-right font-mono text-zinc-700 dark:text-zinc-200">{usage.toLocaleString()}</td>
              <td data-pricing-unit-price={unitPrice} className="px-2 py-3 text-right font-mono text-zinc-500 dark:text-zinc-400">{currency} {unitPrice.toFixed(4)}</td>
              <td data-pricing-subtotal={subtotal.toFixed(2)} className={`px-5 py-3 text-right font-mono font-semibold ${current ? "text-violet-700 dark:text-violet-300" : "text-zinc-400 dark:text-zinc-500"}`}>
                {currency} {subtotal.toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div data-pricing-footer className="flex items-center justify-between border-t border-zinc-100 px-5 py-4 dark:border-zinc-800">
        <div>
          <p data-pricing-total-label className="text-sm font-medium text-zinc-600 dark:text-zinc-300">Estimated total</p>
          {footerNote ? <p data-pricing-note className="mt-2 text-[11px] leading-4 text-zinc-400 dark:text-zinc-500">{footerNote}</p> : null}
        </div>
        <span data-pricing-total-value className="font-mono text-lg font-bold text-zinc-900 dark:text-zinc-50">{currency} {total.toFixed(2)}</span>
      </div>
    </div>
  );
};

export default UsagePricingBreakdown;
