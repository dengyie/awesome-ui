import React from "react";

export interface ApiKeyRow {
  id: string;
  name: string;
  preview: string;
  created?: string;
  status?: "active" | "revoked";
}

export interface ApiKeyTableProps {
  title?: string;
  keys?: ApiKeyRow[];
  createLabel?: string;
  className?: string;
  onCreate?: () => void;
  onCopy?: (row: ApiKeyRow) => void;
  onRevoke?: (row: ApiKeyRow) => void;
}

/**
 * ApiKeyTable - OpenAI Platform "API keys" management table: rows with name,
 * masked key preview, created date and status badge, plus per-row Copy /
 * Revoke actions and a Create key CTA.
 */
export default function ApiKeyTable({
  title = "API keys",
  keys = [],
  createLabel = "Create new secret key",
  className = "",
  onCreate,
  onCopy,
  onRevoke,
}: ApiKeyTableProps) {
  const active = keys.filter((k) => k.status !== "revoked").length;
  return (
    <div
      data-api-key-table
      className={`w-full rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 ${className}`}
    >
      <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-3 dark:border-zinc-800">
        <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
          {title}{" "}
          <span data-api-key-count className="ml-1 rounded-full bg-zinc-100 px-1.5 py-0.5 text-[10px] font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
            {active} active
          </span>
        </h4>
        <button
          type="button"
          data-api-key-create
          onClick={() => onCreate?.()}
          className="rounded-md bg-emerald-600 px-2.5 py-1.5 text-[11px] font-semibold text-white transition-colors hover:bg-emerald-500"
        >
          + {createLabel}
        </button>
      </div>
      <div data-api-key-list className="divide-y divide-zinc-100 dark:divide-zinc-800">
        {keys.length === 0 ? (
          <p data-api-key-empty className="px-4 py-6 text-center text-xs text-zinc-400 dark:text-zinc-500">
            No API keys yet.
          </p>
        ) : (
          keys.map((k) => {
            const revoked = k.status === "revoked";
            return (
              <div key={k.id} data-api-key-row={k.id} className="flex items-center gap-3 px-4 py-2.5">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p data-api-key-name className="truncate text-xs font-medium text-zinc-900 dark:text-zinc-50">
                      {k.name}
                    </p>
                    <span
                      data-api-key-status
                      className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${
                        revoked
                          ? "bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400"
                          : "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400"
                      }`}
                    >
                      {revoked ? "Revoked" : "Active"}
                    </span>
                  </div>
                  <p data-api-key-preview className="mt-0.5 truncate font-mono text-[11px] text-zinc-400 dark:text-zinc-500">
                    {k.preview}
                    {k.created ? ` · created ${k.created}` : ""}
                  </p>
                </div>
                {!revoked && (
                  <div className="flex shrink-0 items-center gap-1.5">
                    <button
                      type="button"
                      data-api-key-copy
                      onClick={() => onCopy?.(k)}
                      className="rounded border border-zinc-200 px-2 py-1 text-[11px] font-medium text-zinc-600 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                    >
                      Copy
                    </button>
                    <button
                      type="button"
                      data-api-key-revoke
                      onClick={() => onRevoke?.(k)}
                      className="rounded border border-red-200 px-2 py-1 text-[11px] font-medium text-red-500 transition-colors hover:bg-red-50 dark:border-red-900/60 dark:hover:bg-red-950/40"
                    >
                      Revoke
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
