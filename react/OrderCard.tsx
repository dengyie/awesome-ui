import React from "react";

export interface OrderItem {
  id: string;
  title: string;
  image?: string;
  price?: string;
  qty?: number;
}

export interface OrderCardProps {
  orderNumber: string;
  placedAt?: string;
  status: "placed" | "preparing" | "shipped" | "delivered" | "on-hold" | "canceled";
  fulfillment?: { type: "delivery" | "pickup" | "curbside"; eta?: string; store?: string };
  items?: OrderItem[];
  total?: string;
  statusNote?: string;
  onOpen?: () => void;
  onAction?: (action: string) => void;
}

const STATUS_TONE: Record<string, { label: string; badge: string }> = {
  placed: { label: "Placed", badge: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300" },
  preparing: { label: "Preparing", badge: "bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300" },
  shipped: { label: "On its way", badge: "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300" },
  delivered: { label: "Delivered", badge: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300" },
  "on-hold": { label: "On hold", badge: "bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300" },
  canceled: { label: "Canceled", badge: "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400" },
};

const FULFILLMENT_LABEL: Record<string, string> = {
  delivery: "Arrives",
  pickup: "Ready for pickup",
  curbside: "Curbside ready",
};

/**
 * OrderCard - purchase-history order card with header strip, fulfillment ETA line, item thumbnails and status badge.
 */
export default function OrderCard({
  orderNumber,
  placedAt,
  status,
  fulfillment,
  items = [],
  total,
  statusNote,
  onOpen,
  onAction,
}: OrderCardProps) {
  const tone = STATUS_TONE[status] || STATUS_TONE.placed;
  const canceled = status === "canceled";

  return (
    <div data-order-card className="w-full overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-center justify-between gap-2 bg-zinc-50 px-4 py-2.5 dark:bg-zinc-800/60">
        <p className="truncate text-xs font-semibold text-zinc-700 dark:text-zinc-200">
          Order# {orderNumber}
          {placedAt ? <span className="ml-2 font-normal text-zinc-400">· Placed {placedAt}</span> : null}
        </p>
        <button type="button" data-order-open onClick={() => onOpen?.()} className="shrink-0 rounded-full border border-zinc-300 bg-white px-2.5 py-1 text-[11px] font-semibold text-zinc-600 transition-colors hover:bg-zinc-100 focus-visible:outline-none dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800">
          View details
        </button>
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            {canceled ? (
              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                Canceled{fulfillment?.eta ? ` on ${fulfillment.eta}` : ""}
              </p>
            ) : (
              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                {fulfillment ? FULFILLMENT_LABEL[fulfillment.type] : "Fulfilled"}
                {fulfillment?.eta ? <span className="text-zinc-900 dark:text-zinc-50"> by {fulfillment.eta}</span> : null}
              </p>
            )}
            {fulfillment?.store ? (
              <p className="mt-0.5 flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3 w-3"><path d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11Z" /><circle cx="12" cy="10" r="2.5" /></svg>
                {fulfillment.store}
              </p>
            ) : null}
            {statusNote ? <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{statusNote}</p> : null}
          </div>
          <span data-order-status className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${tone.badge}`}>{tone.label}</span>
        </div>
        {items.length ? (
          <ul data-order-items className="mt-3 space-y-2 border-t border-zinc-100 pt-3 dark:border-zinc-800">
            {items.map((item) => (
              <li key={item.id} data-order-item={item.id} className="flex items-center gap-3">
                {item.image ? <img src={item.image} alt="" className="h-10 w-10 shrink-0 rounded-lg object-cover" /> : <span className="h-10 w-10 shrink-0 rounded-lg bg-zinc-100 dark:bg-zinc-800" />}
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-xs font-medium text-zinc-800 dark:text-zinc-100">{item.title}</span>
                  {item.qty != null ? <span className="block text-[11px] text-zinc-400">Qty: {item.qty}</span> : null}
                </span>
                {item.price ? <span className="shrink-0 text-xs font-semibold text-zinc-700 dark:text-zinc-200">{item.price}</span> : null}
              </li>
            ))}
          </ul>
        ) : null}
        <div className="mt-3 flex items-center justify-between border-t border-zinc-100 pt-3 dark:border-zinc-800">
          <button type="button" data-order-buy-again onClick={() => onAction?.("buy-again")} className="text-xs font-semibold text-indigo-600 hover:underline dark:text-indigo-400">Buy it again</button>
          {total ? <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-50">Total {total}</p> : null}
        </div>
      </div>
    </div>
  );
}
