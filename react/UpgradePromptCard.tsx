import React from "react";
import { UiIcon } from "./UiIcon";

export interface UpgradePromptCardProps {
  used: number;
  limit: number;
  planName?: string;
  unit?: string;
  title?: string;
  features?: string[];
  ctaText?: string;
  onUpgrade?: () => void;
  className?: string;
}

const formatNumber = (value: number) => (typeof value === "number" ? value.toLocaleString("en-US") : String(value));

export const UpgradePromptCard: React.FC<UpgradePromptCardProps> = ({
  used,
  limit,
  planName = "Free",
  unit = "requests",
  title = "Upgrade to keep going",
  features = [],
  ctaText = "See plans",
  onUpgrade,
  className = "",
}) => {
  const safeLimit = limit > 0 ? limit : 1;
  const percent = Math.min(100, Math.max(0, Math.round((used / safeLimit) * 100)));
  const tone =
    percent >= 90
      ? { bar: "bg-red-500", text: "text-red-600 dark:text-red-400", chip: "bg-red-50 dark:bg-red-950/40" }
      : percent >= 70
        ? { bar: "bg-amber-500", text: "text-amber-600 dark:text-amber-400", chip: "bg-amber-50 dark:bg-amber-950/40" }
        : { bar: "bg-emerald-500", text: "text-emerald-600 dark:text-emerald-400", chip: "bg-emerald-50 dark:bg-emerald-950/40" };

  return (
    <div className={`rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 ${className}`}>
      <div className="flex items-start gap-3">
        <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${tone.chip} ${tone.text}`}>
          <UiIcon name="zap" size={16} />
        </span>
        <div className="min-w-0">
          <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">{title}</div>
          <div className="mt-0.5 text-[11px] text-zinc-500 dark:text-zinc-400">
            You're on the {planName} plan — {percent}% of your {unit} used.
          </div>
        </div>
      </div>

      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
        <div className={`h-full rounded-full ${tone.bar} transition-all duration-300`} style={{ width: `${percent}%` }} />
      </div>

      <div className="mt-1.5 flex items-center text-[11px] text-zinc-500 dark:text-zinc-400">
        <span className="tabular-nums">
          {formatNumber(used)} / {formatNumber(limit)} {unit}
        </span>
        <span className={`ml-auto tabular-nums ${tone.text}`}>{percent}%</span>
      </div>

      {features.length > 0 && (
        <ul className="mt-3 space-y-1.5">
          {features.map((feature) => (
            <li key={feature} className="flex items-start gap-2 text-[11px] text-zinc-600 dark:text-zinc-300">
              <UiIcon name="check" size={12} className="mt-0.5 shrink-0 text-emerald-500" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      )}

      <button
        type="button"
        onClick={() => onUpgrade?.()}
        className="mt-3 w-full rounded-lg bg-indigo-600 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-indigo-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-zinc-900"
      >
        {ctaText}
      </button>
    </div>
  );
};

export default UpgradePromptCard;
