import React from "react";
import { UiIcon } from "./UiIcon";

export interface PricingPlan {
  name: string;
  price: string | number;
  period?: string;
  description?: string;
  features: string[];
  highlighted?: boolean;
  badge?: string;
  ctaText?: string;
}

export interface PricingTableProps {
  plans: PricingPlan[];
  onSelect?: (plan: PricingPlan) => void;
  className?: string;
}

export const PricingTable: React.FC<PricingTableProps> = ({ plans, onSelect, className = "" }) => {
  return (
    <div className={`grid gap-6 md:grid-cols-3 items-start ${className}`}>
      {plans.map((plan) => {
        const highlighted = !!plan.highlighted;
        return (
          <div
            key={plan.name}
            className={`relative flex flex-col rounded-2xl border p-6 transition-shadow ${
              highlighted
                ? "border-indigo-600 bg-white dark:bg-zinc-900 ring-2 ring-indigo-600 shadow-sm"
                : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:shadow-sm"
            }`}
          >
            {highlighted && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-indigo-600 px-3 py-1 text-[11px] font-medium text-white">
                {plan.badge || "Most popular"}
              </span>
            )}

            <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{plan.name}</div>
            {plan.description && (
              <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{plan.description}</div>
            )}

            <div className="mt-5 flex items-baseline gap-1">
              <span className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
                {plan.price}
              </span>
              <span className="text-xs text-zinc-400 dark:text-zinc-500">/{plan.period || "mo"}</span>
            </div>

            <ul className="mt-5 space-y-2.5 flex-1">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-xs text-zinc-600 dark:text-zinc-300">
                  <UiIcon name="check" size={14} className="mt-0.5 shrink-0 text-emerald-500" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <button
              type="button"
              onClick={() => onSelect?.(plan)}
              className={`mt-6 w-full rounded-lg px-4 py-2 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-zinc-900 ${
                highlighted
                  ? "bg-indigo-600 text-white hover:bg-indigo-500"
                  : "border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800"
              }`}
            >
              {plan.ctaText || "Get started"}
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default PricingTable;
