import React from "react";

export interface SummaryRow {
  id: string;
  label: string;
  value: string;
  kind?: "item" | "discount" | "tax" | "fee" | "subtotal" | "total";
  strikeValue?: string;
  note?: string;
}

export interface OrderSummaryPanelProps {
  rows: SummaryRow[];
  heading?: string;
  ctaLabel?: string;
  ctaAmount?: string;
  promoPlaceholder?: string;
  appliedPromos?: string[];
  trustFooter?: string;
  onCta?: () => void;
  onApplyPromo?: (code: string) => void;
  onRemovePromo?: (code: string) => void;
}

const KIND_TONE: Record<string, string> = {
  discount: "text-emerald-600 dark:text-emerald-400",
  fee: "text-emerald-600 dark:text-emerald-400",
  total: "text-zinc-900 dark:text-zinc-50",
};

/**
 * OrderSummaryPanel - price breakdown with line rows, discounts, bold total, promo entry and primary CTA.
 */
export default function OrderSummaryPanel({
  rows,
  heading = "Order summary",
  ctaLabel = "Place your order",
  ctaAmount,
  promoPlaceholder = "Add a promo code",
  appliedPromos = [],
  trustFooter,
  onCta,
  onApplyPromo,
  onRemovePromo,
}: OrderSummaryPanelProps) {
  const [code, setCode] = React.useState("");

  const submitPromo = () => {
    if (!code.trim()) return;
    onApplyPromo?.(code.trim());
    setCode("");
  };

  return (
    <div data-order-summary className="w-full rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{heading}</p>
      <ul className="mt-3 space-y-2">
        {rows.map((row, index) => {
          const isTotal = row.kind === "total";
          const isLast = index === rows.length - 1;
          return (
            <li key={row.id} data-summary-row={row.id} className={`flex items-baseline justify-between gap-3 ${isTotal ? "border-t border-zinc-200 pt-2 dark:border-zinc-700" : ""}`}>
              <span className={`text-xs ${isTotal ? "font-semibold text-zinc-900 dark:text-zinc-50" : "text-zinc-500 dark:text-zinc-400"}`}>
                {row.label}
                {row.note ? <span className="ml-1 text-[10px] text-zinc-400">({row.note})</span> : null}
              </span>
              <span className={`shrink-0 text-xs font-medium ${KIND_TONE[row.kind || ""] || "text-zinc-800 dark:text-zinc-200"}`}>
                {row.strikeValue ? <span className="mr-1.5 font-normal text-zinc-400 line-through">{row.strikeValue}</span> : null}
                {row.value}
              </span>
              {isLast && !isTotal ? null : null}
            </li>
          );
        })}
      </ul>
      <div data-promo-block className="mt-3 border-t border-zinc-100 pt-3 dark:border-zinc-800">
        {appliedPromos.length ? (
          <ul className="mb-2 space-y-1">
            {appliedPromos.map((promo) => (
              <li key={promo} data-promo-applied className="flex items-center justify-between rounded-md bg-emerald-50 px-2 py-1 dark:bg-emerald-950/40">
                <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">{promo} applied</span>
                <button type="button" data-promo-remove={promo} aria-label={`Remove ${promo}`} onClick={() => onRemovePromo?.(promo)} className="text-[11px] text-emerald-600 hover:underline dark:text-emerald-400">Remove</button>
              </li>
            ))}
          </ul>
        ) : null}
        <div className="flex gap-1.5">
          <input
            type="text"
            data-promo-input
            value={code}
            placeholder={promoPlaceholder}
            onChange={(event) => setCode(event.target.value)}
            onKeyDown={(event) => { if (event.key === "Enter") submitPromo(); }}
            className="min-w-0 flex-1 rounded-lg border border-zinc-300 px-2 py-1.5 text-xs text-zinc-800 placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
          />
          <button type="button" data-promo-apply onClick={submitPromo} className="rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-semibold text-zinc-600 transition-colors hover:bg-zinc-50 focus-visible:outline-none dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800">Apply</button>
        </div>
      </div>
      <button type="button" data-summary-cta onClick={() => onCta?.()} className="mt-3 w-full rounded-full bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white">
        {ctaLabel}{ctaAmount ? ` · ${ctaAmount}` : ""}
      </button>
      {trustFooter ? (
        <p data-trust-footer className="mt-2 flex items-center justify-center gap-1 text-[10px] font-medium uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3 w-3"><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></svg>
          {trustFooter}
        </p>
      ) : null}
    </div>
  );
}
