import React from "react";

export interface UsageQuotaCardProps {
  label?: string;
  used?: number;
  total?: number;
  unit?: string;
  summary?: string;
  upgradeLine?: string;
  ctaLabel?: string;
  ctaTone?: "dark" | "primary";
  banner?: boolean;
  onCta?: () => void;
}

/**
 * UsageQuotaCard - credit/quota meter card (or banner) with progress and upgrade CTA.
 */
export default function UsageQuotaCard({
  label = "Credits Remaining",
  used = 0,
  total = 0,
  unit = "",
  summary = "",
  upgradeLine = "Upgrade for unlimited use",
  ctaLabel = "Upgrade",
  ctaTone = "dark",
  banner = false,
  onCta,
}: UsageQuotaCardProps) {
  if (banner) {
    return (
      <div data-quota-banner className="flex w-full items-center justify-between gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 dark:border-emerald-500/40 dark:bg-emerald-950/40">
        <p className="min-w-0 text-xs text-emerald-900 dark:text-emerald-200">{summary}</p>
        <button
          type="button"
          data-quota-cta
          onClick={() => onCta?.()}
          className="shrink-0 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-emerald-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
        >
          {ctaLabel}
        </button>
      </div>
    );
  }

  const percent = total > 0 ? Math.round(((total - used) / total) * 100) : 0;
  const valueLabel = `${used}${unit ? ` ${unit}` : ""}${total ? ` of ${total}${unit ? ` ${unit}` : ""}` : ""}`;

  return (
    <div data-quota-card className="w-full rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-800/60">
      {label ? <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">{label}</p> : null}
      <p className="mt-1 text-sm font-bold tabular-nums text-zinc-900 dark:text-zinc-50">{summary || valueLabel}</p>
      {total ? (
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
          <div className="h-full rounded-full bg-sky-500 transition-all" style={{ width: `${percent}%` }} />
        </div>
      ) : null}
      {upgradeLine ? <p className="mt-1.5 text-[11px] text-zinc-500 dark:text-zinc-400">{upgradeLine}</p> : null}
      <button
        type="button"
        data-quota-cta
        onClick={() => onCta?.()}
        className={`mt-3 w-full rounded-lg px-3 py-2 text-xs font-semibold text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
          ctaTone === "dark" ? "bg-zinc-900 hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-white" : "bg-indigo-600 hover:bg-indigo-500"
        }`}
      >
        {ctaLabel}
      </button>
    </div>
  );
}
