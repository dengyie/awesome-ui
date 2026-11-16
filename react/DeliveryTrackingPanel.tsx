/**
 * DeliveryTrackingPanel - Delivery tracking: map placeholder with floating
 * controls, right info column with ETA header, four-step progress stepper,
 * courier card with contact buttons, collapsible order details, gift share
 * block and copy-link / text-me actions
 * (DoorDash delivery tracking pattern).
 */
import React from "react";

export interface DeliveryStep {
  id: string;
  icon: string;
  label: string;
  state: "done" | "active" | "pending";
}

export interface DeliveryItem {
  id: string;
  name: string;
  quantity: string;
  price: string;
}

export interface DeliveryTrackingPanelProps {
  title?: string;
  etaPrefix?: string;
  eta?: string;
  statusText?: string;
  steps?: DeliveryStep[];
  courierName?: string;
  courierRole?: string;
  orderName?: string;
  orderSummary?: string;
  items?: DeliveryItem[];
  giftRecipient?: string;
  giftMessage?: string;
  shareTitle?: string;
  shareDescription?: string;
  copyLinkLabel?: string;
  textLinkLabel?: string;
  className?: string;
  onCourierCall?: () => void;
  onCourierMessage?: () => void;
  onCopyLink?: () => void;
  onTextLink?: () => void;
}

const STEP_ICONS: Record<string, string> = {
  store: "🏪",
  rider: "🛵",
  car: "🚗",
  home: "🏠",
  check: "✓",
};

export default function DeliveryTrackingPanel({
  title = "Heading to Sam Lee",
  etaPrefix = "Arrives between",
  eta = "8:35 - 8:41 AM",
  statusText = "Your Dasher is heading to Sam Lee with your order.",
  steps = [
    { id: "store", icon: "store", label: "Store", state: "done" },
    { id: "pickup", icon: "rider", label: "Pickup", state: "done" },
    { id: "enroute", icon: "car", label: "En route", state: "active" },
    { id: "delivered", icon: "home", label: "Delivered", state: "pending" },
  ],
  courierName = "JOSHUA L",
  courierRole = "Your Dasher",
  orderName = "Shake Shack",
  orderSummary = "3 Items",
  items = [
    { id: "i1", name: "Shack Stack", quantity: "2×", price: "$32.78" },
    { id: "i2", name: "Cheese Fries", quantity: "1×", price: "$7.49" },
  ],
  giftRecipient = "Sam Lee",
  giftMessage = "Hey, sending over some dinner, hope you enjoy!",
  shareTitle = "Share your digital card with Sam Lee",
  shareDescription = "Send a link to your recipient so they can view your digital card and track their gift. They don't need an account.",
  copyLinkLabel = "Copy link",
  textLinkLabel = "Text me the link",
  className = "",
  onCourierCall,
  onCourierMessage,
  onCopyLink,
  onTextLink,
}: DeliveryTrackingPanelProps) {
  const [detailsOpen, setDetailsOpen] = React.useState(true);

  return (
    <div data-delivery-panel className={`flex w-full overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900 ${className}`}>
      {/* map placeholder */}
      <div data-delivery-map className="relative hidden min-h-[420px] flex-1 bg-zinc-100 lg:block dark:bg-zinc-800">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,#d1fae5_0%,transparent_45%),radial-gradient(circle_at_70%_60%,#dbeafe_0%,transparent_40%)] dark:bg-[radial-gradient(circle_at_30%_40%,#064e3b_0%,transparent_45%),radial-gradient(circle_at_70%_60%,#1e3a8a_0%,transparent_40%)]" aria-hidden="true" />
        <div data-delivery-pin className="absolute left-1/2 top-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-red-500 text-lg text-white shadow-lg" aria-hidden="true">🚗</div>
        <div data-delivery-pin-destination className="absolute left-[60%] top-[45%] flex h-9 w-9 items-center justify-center rounded-full bg-zinc-900 text-base text-white shadow-lg" aria-hidden="true">🏠</div>
        <button data-delivery-back className="absolute left-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white text-zinc-700 shadow-md transition-colors hover:bg-zinc-50 dark:bg-zinc-900 dark:text-zinc-200" aria-label="Back">←</button>
        <button data-delivery-help className="absolute right-4 top-4 rounded-full bg-white px-4 py-2 text-sm font-semibold text-zinc-800 shadow-md transition-colors hover:bg-zinc-50 dark:bg-zinc-900 dark:text-zinc-100">Help</button>
        <div data-delivery-zoom className="absolute bottom-6 right-4 flex flex-col overflow-hidden rounded-xl bg-white shadow-md dark:bg-zinc-900">
          <button className="border-b border-zinc-100 px-3 py-2 text-zinc-600 dark:border-zinc-800 dark:text-zinc-300" aria-label="Zoom in">＋</button>
          <button className="px-3 py-2 text-zinc-600 dark:text-zinc-300" aria-label="Zoom out">－</button>
        </div>
      </div>

      {/* info column */}
      <div data-delivery-info className="flex w-full flex-col border-l border-zinc-100 lg:w-96 lg:shrink-0 dark:border-zinc-800">
        <div data-delivery-header className="flex items-start justify-between gap-3 px-6 pt-5">
          <div>
            <h2 data-delivery-title className="text-xl font-bold text-zinc-900 dark:text-zinc-50">{title}</h2>
            <p data-delivery-eta className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{etaPrefix} <span className="font-semibold text-zinc-900 dark:text-zinc-50">{eta}</span></p>
          </div>
          <span data-delivery-avatar className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xl dark:bg-emerald-950/60" aria-hidden="true">🍔</span>
        </div>

        <div data-delivery-stepper className="flex items-center px-6 pt-5">
          {steps.map((step, i) => (
            <React.Fragment key={step.id}>
              {i > 0 && <div className={`h-0.5 flex-1 ${step.state === "pending" ? "bg-zinc-200 dark:bg-zinc-700" : "bg-zinc-900 dark:bg-zinc-100"}`} aria-hidden="true" />}
              <div
                data-delivery-step={step.id}
                data-delivery-step-state={step.state}
                title={step.label}
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm ${
                  step.state === "pending"
                    ? "bg-zinc-100 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500"
                    : "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                }`}
              >
                {STEP_ICONS[step.icon] ?? "•"}
              </div>
            </React.Fragment>
          ))}
        </div>
        <p data-delivery-status className="px-6 pt-3 text-sm text-zinc-700 dark:text-zinc-200">{statusText}</p>

        <div data-delivery-courier className="mt-4 flex items-center justify-between border-y border-zinc-100 px-6 py-4 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <span aria-hidden="true" className="text-zinc-400 dark:text-zinc-500">👤</span>
            <div>
              <p data-delivery-courier-role className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{courierRole}</p>
              <p data-delivery-courier-name className="text-sm text-zinc-500 dark:text-zinc-400">{courierName}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button data-delivery-call type="button" onClick={() => onCourierCall?.()} className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-100 text-zinc-700 transition-colors hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700" aria-label="Call courier">📞</button>
            <button data-delivery-message type="button" onClick={() => onCourierMessage?.()} className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-100 text-zinc-700 transition-colors hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700" aria-label="Message courier">💬</button>
          </div>
        </div>

        <div className="px-6 py-4">
          <button
            data-delivery-details-toggle
            type="button"
            onClick={() => setDetailsOpen((v) => !v)}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-zinc-100 py-2.5 text-sm font-semibold text-zinc-800 transition-colors hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
          >
            Order Details <span aria-hidden="true">{detailsOpen ? "▴" : "▾"}</span>
          </button>

          {detailsOpen && (
            <div data-delivery-items className="mt-4 space-y-3">
              <div className="flex items-center gap-3">
                <span data-delivery-order-avatar className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-lg dark:bg-emerald-950/60" aria-hidden="true">🍔</span>
                <div>
                  <p data-delivery-order-name className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{orderName}</p>
                  <p data-delivery-order-summary className="text-sm text-zinc-500 dark:text-zinc-400">{orderSummary}</p>
                </div>
              </div>
              {items.map((item) => (
                <div key={item.id} data-delivery-item={item.id} className="flex items-center justify-between text-sm">
                  <span className="text-zinc-800 dark:text-zinc-100">{item.quantity} {item.name}</span>
                  <span className="font-medium text-zinc-900 dark:text-zinc-50">{item.price}</span>
                </div>
              ))}

              <div data-delivery-gift className="border-t border-zinc-100 pt-4 dark:border-zinc-800">
                <p data-delivery-gift-recipient className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{giftRecipient}</p>
                <p data-delivery-gift-message className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">{giftMessage}</p>
              </div>

              <div data-delivery-share className="border-t border-zinc-100 pt-4 dark:border-zinc-800">
                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{shareTitle}</p>
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{shareDescription}</p>
                <div className="mt-3 flex justify-end gap-2">
                  <button data-delivery-copy-link type="button" onClick={() => onCopyLink?.()} className="rounded-full bg-zinc-100 px-4 py-2 text-sm font-semibold text-zinc-800 transition-colors hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700">{copyLinkLabel}</button>
                  <button data-delivery-text-link type="button" onClick={() => onTextLink?.()} className="rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700">{textLinkLabel}</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
