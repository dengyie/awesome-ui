import React, { useState } from "react";

export interface PaywallPlan {
  /** plan id, e.g. "pro" */
  id: string;
  name: string;
  /** price label, e.g. "$12" */
  price: string;
  /** billing period shown under price, e.g. "/mo" */
  period?: string;
  /** optional original price rendered struck-through */
  originalPrice?: string;
  /** optional highlight badge, e.g. "Most popular" */
  badge?: string;
  features: string[];
  /** mark the recommended plan (dark card) */
  featured?: boolean;
}

export interface PaywallDialogProps {
  title?: string;
  description?: string;
  /** emoji or short glyph shown in the icon tile */
  glyph?: string;
  plans?: PaywallPlan[];
  /** cadence toggle labels */
  cadences?: string[];
  defaultCadence?: string;
  /** per-cadence price multiplier label, e.g. Yearly shows "-25%" */
  cadenceNote?: Record<string, string>;
  /** price strings per plan per cadence; falls back to plan.price */
  cadencePrices?: Record<string, Record<string, string>>;
  ctaLabel?: string;
  discountBadge?: string;
  defaultOpen?: boolean;
  onUpgrade?: (plan: PaywallPlan) => void;
  onDismiss?: () => void;
  className?: string;
}

export default function PaywallDialog({
  title = "Upgrade to continue",
  description = "You've reached the limit of the free plan. Upgrade to unlock this feature.",
  glyph = "🔒",
  plans = [],
  cadences = ["Monthly", "Yearly"],
  defaultCadence,
  cadenceNote = {},
  cadencePrices = {},
  ctaLabel = "Upgrade now",
  discountBadge,
  defaultOpen = false,
  onUpgrade,
  onDismiss,
  className = "",
}: PaywallDialogProps) {
  const cadenceList = cadences.length ? cadences : ["Monthly"];
  const [cadence, setCadence] = useState(
    defaultCadence && cadenceList.includes(defaultCadence) ? defaultCadence : cadenceList[0],
  );
  const [open, setOpen] = useState(defaultOpen);
  if (!open) return null;

  const priceFor = (plan: PaywallPlan) => cadencePrices[plan.id]?.[cadence] ?? plan.price;

  return (
    <div
      data-paywall-dialog
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${className}`}
    >
      <div data-paywall-overlay className="absolute inset-0 bg-zinc-950/60 backdrop-blur-sm" onClick={() => { setOpen(false); onDismiss?.(); }} />

      <div
        data-paywall-panel
        className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-700 dark:bg-zinc-900"
      >
        {discountBadge ? (
          <span
            data-paywall-discount
            className="absolute right-4 top-4 z-10 rotate-3 rounded-full bg-amber-400 px-2.5 py-1 text-[11px] font-bold text-amber-950 shadow"
          >
            {discountBadge}
          </span>
        ) : null}

        <div className="flex flex-col items-center px-6 pb-6 pt-8 text-center">
          <div
            data-paywall-glyph
            className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-100 text-2xl dark:bg-violet-950/60"
            aria-hidden="true"
          >
            {glyph}
          </div>
          <h2 data-paywall-title className="mt-3 text-lg font-semibold text-zinc-900 dark:text-zinc-50">{title}</h2>
          <p data-paywall-description className="mt-1 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
            {description}
          </p>

          {cadenceList.length > 1 ? (
            <div
              data-paywall-cadence
              role="tablist"
              aria-label="Billing cadence"
              className="mt-4 flex items-center rounded-lg border border-zinc-200 bg-zinc-100 p-0.5 dark:border-zinc-700 dark:bg-zinc-800"
            >
              {cadenceList.map((c) => (
                <button
                  key={c}
                  type="button"
                  role="tab"
                  aria-selected={c === cadence}
                  data-paywall-cadence-option={c}
                  onClick={() => setCadence(c)}
                  className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                    c === cadence
                      ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-zinc-50"
                      : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400"
                  }`}
                >
                  {c}
                  {cadenceNote[c] ? (
                    <span className="ml-1 rounded-full bg-emerald-100 px-1.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                      {cadenceNote[c]}
                    </span>
                  ) : null}
                </button>
              ))}
            </div>
          ) : null}

          <div data-paywall-plans className="mt-4 grid w-full gap-2" style={{ gridTemplateColumns: `repeat(${Math.min(plans.length, 3)}, minmax(0, 1fr))` }}>
            {plans.map((plan) => (
              <button
                key={plan.id}
                type="button"
                data-paywall-plan={plan.id}
                onClick={() => onUpgrade?.(plan)}
                className={`relative rounded-xl border p-3 text-left transition-colors ${
                  plan.featured
                    ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
                    : "border-zinc-200 bg-white text-zinc-900 hover:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:hover:border-zinc-500"
                }`}
              >
                {plan.badge ? (
                  <span
                    className={`absolute -top-2 left-3 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                      plan.featured
                        ? "bg-violet-600 text-white"
                        : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
                    }`}
                  >
                    {plan.badge}
                  </span>
                ) : null}
                <p className="text-xs font-semibold">{plan.name}</p>
                <p className="mt-1">
                  <span className="font-mono text-lg font-bold">{priceFor(plan)}</span>
                  <span className={`ml-0.5 text-[11px] ${plan.featured ? "text-zinc-300 dark:text-zinc-600" : "text-zinc-400"}`}>
                    {plan.period ?? ""}
                  </span>
                </p>
                {plan.originalPrice ? (
                  <p className={`text-[11px] line-through ${plan.featured ? "text-zinc-400" : "text-zinc-400 dark:text-zinc-500"}`}>
                    {plan.originalPrice}
                  </p>
                ) : null}
                <ul className={`mt-2 space-y-1 ${plan.featured ? "text-zinc-200 dark:text-zinc-700" : "text-zinc-500 dark:text-zinc-400"}`}>
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-1 text-[11px] leading-snug">
                      <span aria-hidden="true" className={plan.featured ? "text-emerald-400" : "text-emerald-500"}>✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
              </button>
            ))}
          </div>

          <button
            type="button"
            data-paywall-cta
            onClick={() => {
              const featured = plans.find((p) => p.featured) ?? plans[0];
              if (featured) onUpgrade?.(featured);
            }}
            className="mt-4 w-full rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-violet-700"
          >
            {ctaLabel} · {cadence}
          </button>
          <button
            type="button"
            data-paywall-dismiss
            onClick={() => { setOpen(false); onDismiss?.(); }}
            className="mt-2 text-xs text-zinc-400 underline-offset-2 hover:text-zinc-600 hover:underline dark:text-zinc-500 dark:hover:text-zinc-300"
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
}
