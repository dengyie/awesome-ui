import React from "react";

export interface ConnectorItem {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  connected?: boolean;
}

export interface ConnectorGridProps {
  title?: string;
  connectors: ConnectorItem[];
  connectText?: string;
  connectedText?: string;
  onToggle?: (id: string, connected: boolean) => void;
  className?: string;
}

/**
 * ConnectorGrid - "Apps & Connectors" style integration panel: cards with an
 * icon, name, one-line description and a Connect / Connected toggle button.
 */
export default function ConnectorGrid({
  title = "Apps & Connectors",
  connectors,
  connectText = "Connect",
  connectedText = "Connected",
  onToggle,
  className = "",
}: ConnectorGridProps) {
  const connectedCount = connectors.filter((c) => c.connected).length;
  return (
    <div data-connector-grid className={`rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 ${className}`}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{title}</p>
        <span data-connector-count className="rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
          {connectedCount}/{connectors.length} connected
        </span>
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {connectors.map((connector) => (
          <div
            key={connector.id}
            data-connector={connector.id}
            className={`flex items-start justify-between gap-3 rounded-lg border px-3 py-3 transition-colors ${
              connector.connected
                ? "border-indigo-200 bg-indigo-50/60 dark:border-indigo-800 dark:bg-indigo-950/40"
                : "border-zinc-200 hover:border-zinc-300 dark:border-zinc-800 dark:hover:border-zinc-700"
            }`}
          >
            <div className="flex min-w-0 items-start gap-2.5">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-zinc-100 text-base dark:bg-zinc-800" aria-hidden="true">{connector.icon || "🔌"}</span>
              <div className="min-w-0">
                <p data-connector-name className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-50">{connector.name}</p>
                {connector.description && (
                  <p data-connector-desc className="mt-0.5 line-clamp-2 text-xs text-zinc-500 dark:text-zinc-400">{connector.description}</p>
                )}
              </div>
            </div>
            <button
              type="button"
              data-connector-toggle
              onClick={() => onToggle?.(connector.id, !connector.connected)}
              className={`shrink-0 rounded-md px-2.5 py-1.5 text-xs font-semibold transition-colors ${
                connector.connected
                  ? "border border-zinc-300 text-zinc-700 hover:border-zinc-400 dark:border-zinc-600 dark:text-zinc-200"
                  : "bg-indigo-600 text-white hover:bg-indigo-500"
              }`}
            >
              {connector.connected ? (
                <span className="flex items-center gap-1">
                  <svg viewBox="0 0 20 20" fill="none" className="h-3 w-3" aria-hidden="true"><path d="m4.5 10.5 3.5 3.5 7.5-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  {connectedText}
                </span>
              ) : (
                connectText
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
