import React from "react";

export interface PaymentMethodCardProps {
  brand: "visa" | "mastercard" | "amex" | string;
  last4: string;
  exp?: string;
  amount?: string;
  holderLabel?: string;
  holder?: string;
  showAddNew?: boolean;
  changeLabel?: string;
  addNewLabel?: string;
  onChange?: () => void;
  onAddNew?: () => void;
}

const BRAND_LABEL: Record<string, string> = {
  visa: "VISA",
  mastercard: "MC",
  amex: "AMEX",
};

const BRAND_TONE: Record<string, string> = {
  visa: "bg-blue-700 text-white",
  mastercard: "bg-zinc-900 text-white",
  amex: "bg-sky-600 text-white",
};

/**
 * PaymentMethodCard - saved card display with brand tile, masked number, expiry and change/add actions.
 */
export default function PaymentMethodCard({
  brand,
  last4,
  exp,
  amount,
  holderLabel = "Billing address",
  holder,
  showAddNew = true,
  changeLabel = "Change",
  addNewLabel = "+ Add new payment",
  onChange,
  onAddNew,
}: PaymentMethodCardProps) {
  const key = String(brand).toLowerCase();
  const brandLabel = BRAND_LABEL[key] || String(brand).slice(0, 4).toUpperCase();
  const brandTone = BRAND_TONE[key] || "bg-zinc-700 text-white";

  return (
    <div data-payment-card className="w-full rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-center gap-3">
        <span data-payment-brand className={`flex h-8 w-12 shrink-0 items-center justify-center rounded-md text-[11px] font-black tracking-wide ${brandTone}`}>{brandLabel}</span>
        <div className="min-w-0 flex-1">
          <p data-payment-number className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            Ending in {last4}
            {amount ? <span className="ml-2 font-normal text-zinc-500 dark:text-zinc-400">{amount}</span> : null}
          </p>
          {exp ? <p className="text-xs text-zinc-400 dark:text-zinc-500">Exp. {exp}</p> : null}
        </div>
        <button type="button" data-payment-change onClick={() => onChange?.()} className="shrink-0 text-xs font-semibold uppercase tracking-wide text-indigo-600 hover:underline dark:text-indigo-400">{changeLabel}</button>
      </div>
      {holder ? (
        <div className="mt-3 border-t border-zinc-100 pt-3 dark:border-zinc-800">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">{holderLabel}</p>
          <p className="mt-0.5 text-xs text-zinc-700 dark:text-zinc-200">{holder}</p>
        </div>
      ) : null}
      {showAddNew ? (
        <button type="button" data-payment-add onClick={() => onAddNew?.()} className="mt-3 text-xs font-medium text-zinc-500 underline-offset-2 hover:text-zinc-700 hover:underline dark:text-zinc-400 dark:hover:text-zinc-200">{addNewLabel}</button>
      ) : null}
    </div>
  );
}
