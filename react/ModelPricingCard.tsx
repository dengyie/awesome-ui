import React from "react";

export interface ModelPricing {
  inputPerMillion?: number;
  outputPerMillion?: number;
}

export interface ModelPricingCardProps {
  modelName: string;
  modelId?: string;
  pricing?: ModelPricing;
  currency?: string;
  className?: string;
  onCopyId?: (modelId: string) => void;
}

const fmtPrice = (value: number | undefined, currency: string) =>
  typeof value === "number" ? `$ ${value.toFixed(2)} / million tokens` : "—";

/**
 * ModelPricingCard - empty-state model pricing card (Cloudflare AI
 * Playground pattern): model name, copyable Model ID and per-million-token
 * input/output pricing rows.
 */
export default function ModelPricingCard({
  modelName,
  modelId,
  pricing,
  currency = "USD",
  className = "",
  onCopyId,
}: ModelPricingCardProps) {
  return (
    <div
      data-model-pricing-card
      className={`w-full rounded-lg border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900 ${className}`}
    >
      <h4
        data-model-pricing-name
        className="font-mono text-sm font-bold text-zinc-900 dark:text-zinc-50"
      >
        {modelName}
      </h4>
      <dl className="mt-3 space-y-2.5 text-xs">
        <div className="flex items-center justify-between gap-3 border-b border-zinc-100 pb-2.5 dark:border-zinc-800">
          <dt className="shrink-0 text-zinc-500 dark:text-zinc-400">Model ID</dt>
          <dd data-model-pricing-id className="flex min-w-0 items-center gap-1.5 font-mono text-zinc-800 dark:text-zinc-200">
            <span className="truncate">{modelId ?? "—"}</span>
            {modelId && (
              <button
                type="button"
                data-model-pricing-copy
                aria-label="Copy model ID"
                onClick={() => onCopyId?.(modelId)}
                className="shrink-0 rounded p-0.5 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
              >
                ⧉
              </button>
            )}
          </dd>
        </div>
        <div data-model-pricing-input className="flex items-center justify-between gap-3 border-b border-zinc-100 pb-2.5 dark:border-zinc-800">
          <dt className="text-zinc-500 dark:text-zinc-400">Input pricing</dt>
          <dd className="font-mono tabular-nums text-zinc-800 dark:text-zinc-200">
            {fmtPrice(pricing?.inputPerMillion, currency)}
          </dd>
        </div>
        <div data-model-pricing-output className="flex items-center justify-between gap-3">
          <dt className="text-zinc-500 dark:text-zinc-400">Output pricing</dt>
          <dd className="font-mono tabular-nums text-zinc-800 dark:text-zinc-200">
            {fmtPrice(pricing?.outputPerMillion, currency)}
          </dd>
        </div>
      </dl>
    </div>
  );
}
