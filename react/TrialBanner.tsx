import React from "react";

export interface TrialBannerProps {
  planName?: string;
  daysLeft: number;
  message?: string;
  ctaText?: string;
  onCta?: () => void;
  onDismiss?: () => void;
  dismissible?: boolean;
  tone?: "indigo" | "amber";
  className?: string;
}

const CLOSE_SVG = (
  <svg viewBox="0 0 20 20" fill="none" className="h-3 w-3" aria-hidden="true">
    <path d="m5 5 10 10M15 5 5 15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

/**
 * TrialBanner - Later style trial countdown banner: days-left pill, unlock CTA and dismiss.
 */
export default function TrialBanner({
  planName = "Pro",
  daysLeft,
  message,
  ctaText = "Upgrade now",
  onCta,
  onDismiss,
  dismissible = false,
  tone = "indigo",
  className = "",
}: TrialBannerProps) {
  const toneClass =
    tone === "amber"
      ? "border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/40"
      : "border-indigo-200 bg-indigo-50 dark:border-indigo-900 dark:bg-indigo-950/40";
  const pillClass = tone === "amber" ? "bg-amber-500" : "bg-indigo-600";
  const urgent = daysLeft <= 3;
  return (
    <div
      data-trial-banner
      className={`flex flex-wrap items-center gap-3 rounded-lg border px-4 py-3 ${toneClass} ${className}`}
    >
      <span
        data-trial-days
        className={`rounded-full px-2.5 py-1 text-xs font-bold text-white ${pillClass} ${urgent ? "animate-pulse" : ""}`}
      >
        {daysLeft} {daysLeft === 1 ? "day" : "days"} left
      </span>
      <span data-trial-message className="flex-1 text-sm text-zinc-800 dark:text-zinc-100">
        {message || `Your ${planName} trial ends soon — upgrade to keep ${planName} features.`}
      </span>
      <button
        type="button"
        data-trial-cta
        onClick={() => onCta?.()}
        className="rounded-md bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
      >
        {ctaText}
      </button>
      {(dismissible || onDismiss) && (
        <button
          type="button"
          data-trial-dismiss
          title="Dismiss"
          onClick={() => onDismiss?.()}
          className="flex h-6 w-6 items-center justify-center rounded-full text-zinc-400 hover:bg-zinc-200 hover:text-zinc-700 dark:hover:bg-zinc-800"
        >
          {CLOSE_SVG}
        </button>
      )}
    </div>
  );
}
