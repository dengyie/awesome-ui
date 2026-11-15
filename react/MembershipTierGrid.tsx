import React from "react";

export interface MembershipTier {
  id: string;
  name: string;
  price: string;
  period?: string;
  image?: string;
  description?: string;
  perks?: string[];
  badge?: string;
  limited?: number;
  highlighted?: boolean;
  ctaText?: string;
}

export interface MembershipTierGridProps {
  title?: string;
  subtitle?: string;
  tiers: MembershipTier[];
  onSelect?: (tier: MembershipTier) => void;
  className?: string;
}

/**
 * MembershipTierGrid - Patreon style creator membership tiers: cover image, monthly
 * price, trial CTA, "Limited (N remaining)" stock note and perk bullets.
 */
export default function MembershipTierGrid({
  title = "Get more from this creator",
  subtitle = "Upgrade to access exclusive benefits.",
  tiers,
  onSelect,
  className = "",
}: MembershipTierGridProps) {
  return (
    <div data-membership-grid className={className}>
      <div className="text-center">
        <h3 data-membership-title className="text-xl font-bold text-zinc-900 dark:text-zinc-50">{title}</h3>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{subtitle}</p>
      </div>
      <div className={`mt-6 grid gap-5 ${tiers.length >= 3 ? "md:grid-cols-3" : tiers.length === 2 ? "md:grid-cols-2" : ""}`}>
        {tiers.map((tier) => (
          <div
            key={tier.id}
            data-membership-tier={tier.id}
            className={`overflow-hidden rounded-xl border bg-white dark:bg-zinc-900 ${
              tier.highlighted ? "border-zinc-900 dark:border-zinc-100" : "border-zinc-200 dark:border-zinc-800"
            }`}
          >
            {tier.image && (
              <img src={tier.image} alt={tier.name} className="h-36 w-full object-cover" />
            )}
            <div className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-base font-semibold text-zinc-900 dark:text-zinc-50">{tier.name}</span>
                {tier.badge && (
                  <span className="rounded-full bg-zinc-900 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white dark:bg-zinc-100 dark:text-zinc-900">
                    {tier.badge}
                  </span>
                )}
              </div>
              <div className="mt-1 flex items-baseline gap-1">
                <span data-membership-price className="text-xl font-bold text-zinc-900 dark:text-zinc-50">{tier.price}</span>
                <span className="text-xs text-zinc-500 dark:text-zinc-400">/ {tier.period || "month"}</span>
              </div>
              {tier.limited !== undefined && (
                <p data-membership-limited className="mt-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Limited ({tier.limited} remaining)
                </p>
              )}
              <button
                type="button"
                data-membership-cta
                onClick={() => onSelect?.(tier)}
                className={`mt-3 w-full rounded-md px-3 py-2 text-sm font-semibold transition-colors ${
                  tier.highlighted
                    ? "bg-zinc-900 text-white hover:bg-zinc-700 dark:bg-white dark:text-zinc-900"
                    : "border border-zinc-300 text-zinc-800 hover:border-zinc-500 dark:border-zinc-700 dark:text-zinc-100"
                }`}
              >
                {tier.ctaText || "Start 7-day free trial"}
              </button>
              {tier.description && <p className="mt-3 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">{tier.description}</p>}
              {tier.perks && tier.perks.length > 0 && (
                <ul data-membership-perks className="mt-3 space-y-1.5">
                  {tier.perks.map((perk) => (
                    <li key={perk} className="flex items-start gap-2 text-xs text-zinc-700 dark:text-zinc-300">
                      <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-400 dark:bg-zinc-600" />
                      {perk}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
