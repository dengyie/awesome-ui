/**
 * WebhookConfigPanel - Webhook endpoint management: header, endpoint rows
 * with active toggle / mono URL / event chips / last-delivery status badge
 * and a Test action, plus an events legend (webhook settings pattern).
 */
import React from "react";

export interface WebhookEndpoint {
  id: string;
  url: string;
  events: string[];
  lastStatus?: number | string;
  lastDelivery?: string;
  active?: boolean;
}

export interface WebhookConfigPanelProps {
  title?: string;
  description?: string;
  endpoints?: WebhookEndpoint[];
  events?: string[];
  testLabel?: string;
  eventsLabel?: string;
  className?: string;
  onTest?: (endpoint: WebhookEndpoint) => void;
  onToggle?: (endpoint: WebhookEndpoint, active: boolean) => void;
}

const DEFAULT_ENDPOINTS: WebhookEndpoint[] = [
  { id: "wh1", url: "https://api.example.com/hooks/deploy", events: ["build.finished", "deploy.failed"], lastStatus: 200, lastDelivery: "2 minutes ago", active: true },
  { id: "wh2", url: "https://hooks.slack.com/services/T00/B00/XYZ", events: ["alert.triggered"], lastStatus: 503, lastDelivery: "1 hour ago", active: true },
  { id: "wh3", url: "https://staging.example.com/hooks", events: ["build.finished"], lastStatus: 404, lastDelivery: "3 days ago", active: false },
];

const DEFAULT_EVENTS: string[] = ["build.finished", "deploy.failed", "alert.triggered"];

const deliveryCls = (status: number | string | undefined) => {
  const code = Number.parseInt(String(status ?? ""), 10);
  if (Number.isNaN(code)) return "bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-400";
  if (code < 300) return "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400";
  if (code < 500) return "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400";
  return "bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-400";
};

export const WebhookConfigPanel: React.FC<WebhookConfigPanelProps> = ({
  title = "Webhooks",
  description = "Send real-time event notifications to your own services.",
  endpoints = DEFAULT_ENDPOINTS,
  events = DEFAULT_EVENTS,
  testLabel = "Test",
  eventsLabel = "Available events",
  className = "",
  onTest,
  onToggle,
}) => {
  const list = Array.isArray(endpoints) ? endpoints : [];

  return (
    <div data-webhook-panel className={`w-full rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900 ${className}`}>
      <div data-webhook-header className="border-b border-zinc-100 px-5 py-4 dark:border-zinc-800">
        <p data-webhook-title className="text-base font-semibold text-zinc-900 dark:text-zinc-50">{title}</p>
        <p data-webhook-description className="mt-1 text-sm leading-5 text-zinc-500 dark:text-zinc-400">{description}</p>
      </div>
      <div data-webhook-list>
        {list.map((ep) => (
          <div
            key={ep.id}
            data-webhook-endpoint={ep.id}
            className={`flex flex-wrap items-center gap-3 border-b border-zinc-50 px-5 py-4 last:border-b-0 dark:border-zinc-800/60 ${ep.active === false ? "opacity-50" : ""}`}
          >
            <label data-webhook-active-wrapper={ep.id} className="flex cursor-pointer items-center">
              <input
                type="checkbox"
                data-webhook-toggle={ep.id}
                checked={ep.active !== false}
                onChange={(e) => onToggle?.(ep, e.target.checked)}
                className="h-4 w-4 accent-violet-600"
                aria-label="Toggle endpoint"
              />
            </label>
            <div className="min-w-0 flex-1">
              <p data-webhook-url={ep.url} className="truncate font-mono text-xs text-zinc-800 dark:text-zinc-100">{ep.url}</p>
              <div data-webhook-events={ep.id} className="mt-1.5 flex flex-wrap gap-1.5">
                {(Array.isArray(ep.events) ? ep.events : []).map((ev) => (
                  <span key={ev} data-webhook-event={ev} className="rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">{ev}</span>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span data-webhook-delivery={ep.id} className="inline-flex items-center gap-1.5 text-[11px] text-zinc-500 dark:text-zinc-400">
                <span className={`inline-block rounded px-2 py-0.5 font-semibold ${deliveryCls(ep.lastStatus)}`}>{String(ep.lastStatus ?? "—")}</span>
                {ep.lastDelivery || ""}
              </span>
              <button
                type="button"
                data-webhook-test={ep.id}
                onClick={() => onTest?.(ep)}
                className="rounded-md border border-zinc-200 px-2.5 py-1 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                {testLabel}
              </button>
            </div>
          </div>
        ))}
      </div>
      <div data-webhook-footer className="border-t border-zinc-100 px-5 py-3 dark:border-zinc-800">
        <p data-webhook-events-label className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">{eventsLabel}</p>
        <div data-webhook-events-legend className="flex flex-wrap gap-1.5">
          {(Array.isArray(events) ? events : []).map((ev) => (
            <span key={ev} className="rounded-md border border-dashed border-zinc-300 px-2 py-0.5 font-mono text-[11px] text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">{ev}</span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WebhookConfigPanel;
