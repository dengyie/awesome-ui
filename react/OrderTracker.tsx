import React from "react";

export interface TrackerStage {
  id: string;
  label: string;
  timestamp?: string;
}

export interface OrderTrackerProps {
  stages: TrackerStage[];
  current: number | "canceled";
  variant?: "dots" | "bar";
  eta?: string;
  trackingNumber?: string;
  trackingUrl?: string;
  canceledReason?: string;
  onTrack?: () => void;
}

/**
 * OrderTracker - horizontal fulfillment progress tracker (dot connector or continuous bar) with canceled state.
 */
export default function OrderTracker({
  stages,
  current,
  variant = "dots",
  eta,
  trackingNumber,
  trackingUrl,
  canceledReason,
  onTrack,
}: OrderTrackerProps) {
  const canceled = current === "canceled";
  const currentIndex = canceled ? -1 : (current as number);
  const progress = canceled ? 0 : Math.round(((currentIndex + 1) / stages.length) * 100);

  if (variant === "bar") {
    return (
      <div data-order-tracker className="w-full">
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
          <div
            data-tracker-fill
            className={`h-full rounded-full transition-all ${canceled ? "bg-zinc-400 dark:bg-zinc-600" : "bg-emerald-600"}`}
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="mt-2 flex justify-between">
          {stages.map((stage, index) => {
            const reached = !canceled && index <= currentIndex;
            const isCurrent = !canceled && index === currentIndex;
            return (
              <span
                key={stage.id}
                data-tracker-stage={stage.id}
                className={`text-[10px] font-medium ${isCurrent ? "font-bold text-zinc-900 dark:text-zinc-50" : reached ? "text-zinc-500 dark:text-zinc-400" : "text-zinc-400 dark:text-zinc-600"}`}
              >
                {stage.label}
              </span>
            );
          })}
        </div>
        {canceled && canceledReason ? <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">{canceledReason}</p> : null}
      </div>
    );
  }

  return (
    <div data-order-tracker className="w-full">
      {eta && !canceled ? (
        <p className="mb-2 text-xs font-semibold text-zinc-800 dark:text-zinc-100">
          {eta}
          {trackingNumber ? <span className="ml-2 font-normal text-zinc-400">· {trackingNumber}</span> : null}
        </p>
      ) : null}
      {canceled ? <p className="mb-2 text-xs font-semibold text-zinc-700 dark:text-zinc-200">Canceled{canceledReason ? ` — ${canceledReason}` : ""}</p> : null}
      <ol className="flex items-start">
        {stages.map((stage, index) => {
          const reached = !canceled && index <= currentIndex;
          const isCurrent = !canceled && index === currentIndex;
          const last = index === stages.length - 1;
          return (
            <li key={stage.id} data-tracker-stage={stage.id} className="flex min-w-0 flex-1 items-start">
              <span className="flex flex-col items-center">
                <span
                  className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${
                    isCurrent
                      ? "ring-2 ring-zinc-900 ring-offset-2 ring-offset-white dark:ring-zinc-100 dark:ring-offset-zinc-900"
                      : ""
                  } ${reached ? "bg-emerald-600" : "bg-zinc-300 dark:bg-zinc-700"}`}
                >
                  {reached ? <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" className="h-2.5 w-2.5"><path d="m5 12 4 4L19 6" /></svg> : null}
                </span>
                <span className={`mt-1 whitespace-nowrap text-[10px] font-medium ${isCurrent ? "text-zinc-900 dark:text-zinc-50" : reached ? "text-zinc-500 dark:text-zinc-400" : "text-zinc-400 dark:text-zinc-600"}`}>{stage.label}</span>
                {stage.timestamp ? <span className="text-[9px] text-zinc-400 dark:text-zinc-600">{stage.timestamp}</span> : null}
              </span>
              {!last ? <span className={`mx-1 mt-2 h-0.5 flex-1 ${reached && index < currentIndex ? "bg-emerald-600" : "bg-zinc-200 dark:bg-zinc-700"}`} /> : null}
            </li>
          );
        })}
      </ol>
      {trackingUrl ? (
        <button type="button" data-tracker-track onClick={() => onTrack?.()} className="mt-2 text-xs font-semibold text-indigo-600 hover:underline dark:text-indigo-400">
          Track shipment &gt;
        </button>
      ) : null}
    </div>
  );
}
