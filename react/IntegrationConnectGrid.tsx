/**
 * IntegrationConnectGrid - Settings integrations: category filter tabs and
 * a responsive grid of service cards with logo placeholder, connected
 * badge and Connect / Disconnect action (integration settings pattern).
 */
import React, { useState } from "react";

export interface IntegrationService {
  id: string;
  name: string;
  category?: string;
  connected?: boolean;
}

export interface IntegrationConnectGridProps {
  title?: string;
  description?: string;
  integrations?: IntegrationService[];
  connectLabel?: string;
  disconnectLabel?: string;
  className?: string;
  onToggle?: (integration: IntegrationService, connected: boolean) => void;
}

const DEFAULT_INTEGRATIONS: IntegrationService[] = [
  { id: "gh", name: "GitHub", category: "Code", connected: true },
  { id: "sl", name: "Slack", category: "Chat", connected: true },
  { id: "li", name: "Linear", category: "Code", connected: false },
  { id: "no", name: "Notion", category: "Docs", connected: false },
  { id: "fg", name: "Figma", category: "Design", connected: false },
  { id: "sn", name: "Sentry", category: "Monitoring", connected: true },
];

const CATEGORY_ALL = "All";

export const IntegrationConnectGrid: React.FC<IntegrationConnectGridProps> = ({
  title = "Integrations",
  description = "Connect third-party services to extend your workspace.",
  integrations = DEFAULT_INTEGRATIONS,
  connectLabel = "Connect",
  disconnectLabel = "Disconnect",
  className = "",
  onToggle,
}) => {
  const all = Array.isArray(integrations) ? integrations : [];
  const [category, setCategory] = useState(CATEGORY_ALL);
  const categories = [CATEGORY_ALL, ...new Set(all.map((it) => it.category).filter((c): c is string => Boolean(c)))];
  const visible = category === CATEGORY_ALL ? all : all.filter((it) => it.category === category);

  return (
    <div data-integration-grid className={`w-full rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 ${className}`}>
      <div data-integration-header className="mb-4">
        <p data-integration-title className="text-base font-semibold text-zinc-900 dark:text-zinc-50">{title}</p>
        <p data-integration-description className="mt-1 text-sm leading-5 text-zinc-500 dark:text-zinc-400">{description}</p>
        <div data-integration-tabs className="mt-3 flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              data-integration-tab={cat}
              onClick={() => setCategory(cat)}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                cat === category
                  ? "border-violet-500 bg-violet-50 text-violet-700 dark:border-violet-600 dark:bg-violet-950/40 dark:text-violet-300"
                  : "border-zinc-200 text-zinc-500 hover:text-zinc-700 dark:border-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>
      <div data-integration-cards className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((it) => (
          <div key={it.id} data-integration-card={it.id} className="flex flex-col gap-3 rounded-xl border border-zinc-200 bg-white p-4 transition-shadow hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center gap-3">
              <span data-integration-logo={it.name} aria-hidden="true" className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-100 text-sm font-bold text-zinc-500 dark:bg-zinc-800 dark:text-zinc-300">{(it.name || "?").slice(0, 1).toUpperCase()}</span>
              <div className="min-w-0">
                <p data-integration-name={it.name} className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-50">{it.name}</p>
                <p data-integration-category={it.category || ""} className="text-[11px] text-zinc-400 dark:text-zinc-500">{it.category || ""}</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              {it.connected ? (
                <span data-integration-state="connected" className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden="true"></span>Connected</span>
              ) : (
                <span data-integration-state="not-connected" className="inline-flex items-center rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] font-semibold text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">Not connected</span>
              )}
              <button
                type="button"
                data-integration-action={it.id}
                onClick={() => onToggle?.(it, !it.connected)}
                className={`rounded-md border px-3 py-1.5 text-xs font-semibold transition-colors ${
                  it.connected
                    ? "border-zinc-200 text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                    : "border-violet-300 bg-violet-600 text-white hover:bg-violet-500 dark:border-violet-600 dark:bg-violet-600 dark:hover:bg-violet-500"
                }`}
              >
                {it.connected ? disconnectLabel : connectLabel}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default IntegrationConnectGrid;
