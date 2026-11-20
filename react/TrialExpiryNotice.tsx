import React from "react";

export interface TrialExpiryNoticeProps {
  planName?: string;
  /** days until expiry (counted down into tone) */
  daysLeft?: number;
  /** variant tone: expiring (amber) or urgent (red, <=3 days) */
  tone?: "expiring" | "urgent" | "auto";
  /** features lost when the trial ends */
  losingFeatures?: string[];
  /** what still works after expiry */
  keepingFeatures?: string[];
  /** deadline as a readable date, e.g. "Nov 28" */
  expiresOn?: string;
  extendLabel?: string;
  upgradeLabel?: string;
  onExtend?: () => void;
  onUpgrade?: () => void;
  className?: string;
}

export default function TrialExpiryNotice({
  planName = "Pro",
  daysLeft = 0,
  tone = "auto",
  losingFeatures = [],
  keepingFeatures = [],
  expiresOn,
  extendLabel = "Extend trial",
  upgradeLabel = "Upgrade now",
  onExtend,
  onUpgrade,
  className = "",
}: TrialExpiryNoticeProps) {
  const resolved: "expiring" | "urgent" = tone === "auto" ? (daysLeft <= 3 ? "urgent" : "expiring") : tone;

  const palette =
    resolved === "urgent"
      ? {
          wrap: "border-red-200 bg-red-50 dark:border-red-900/60 dark:bg-red-950/40",
          icon: "bg-red-100 text-red-600 dark:bg-red-900/60 dark:text-red-300",
          title: "text-red-900 dark:text-red-100",
          body: "text-red-700/90 dark:text-red-200/80",
          big: "text-red-600 dark:text-red-300",
          primary: "bg-red-600 hover:bg-red-700 text-white",
        }
      : {
          wrap: "border-amber-200 bg-amber-50 dark:border-amber-900/60 dark:bg-amber-950/40",
          icon: "bg-amber-100 text-amber-600 dark:bg-amber-900/60 dark:text-amber-300",
          title: "text-amber-900 dark:text-amber-100",
          body: "text-amber-700/90 dark:text-amber-200/80",
          big: "text-amber-600 dark:text-amber-300",
          primary: "bg-amber-500 hover:bg-amber-600 text-white",
        };

  return (
    <div
      data-trial-expiry-notice
      className={`rounded-xl border p-4 ${palette.wrap} ${className}`}
      role="alert"
    >
      <div className="flex items-start gap-3">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg ${palette.icon}`} aria-hidden="true">
          ⏳
        </div>
        <div className="min-w-0 flex-1">
          <p data-trial-expiry-title className={`text-sm font-semibold ${palette.title}`}>
            Your free {planName} trial
            {daysLeft > 0 ? ` expires in ${daysLeft} day${daysLeft === 1 ? "" : "s"}.` : " has expired."}
          </p>
          <p data-trial-expiry-sub className={`mt-0.5 text-xs ${palette.body}`}>
            {expiresOn ? `Deadline: ${expiresOn}. ` : ""}
            {resolved === "urgent"
              ? "Act now to keep your workspace running without interruption."
              : "After the trial ends, paid features below will be locked."}
          </p>
          <p className="mt-1 flex items-baseline gap-1">
            <span data-trial-expiry-days className={`font-mono text-3xl font-bold ${palette.big}`}>{Math.max(daysLeft, 0)}</span>
            <span className={`text-xs font-medium ${palette.body}`}>days left</span>
          </p>

          {losingFeatures.length ? (
            <ul data-trial-expiry-losing className="mt-2 space-y-1">
              {losingFeatures.map((f) => (
                <li key={f} className={`flex items-start gap-1.5 text-xs ${palette.body}`}>
                  <span aria-hidden="true">🔒</span>
                  <span className="line-through decoration-current/60">{f}</span>
                </li>
              ))}
            </ul>
          ) : null}
          {keepingFeatures.length ? (
            <ul data-trial-expiry-keeping className="mt-1.5 space-y-1">
              {keepingFeatures.map((f) => (
                <li key={f} className={`flex items-start gap-1.5 text-xs ${palette.body}`}>
                  <span aria-hidden="true">✅</span>
                  {f}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2 pl-[52px]">
        <button
          type="button"
          data-trial-expiry-upgrade
          onClick={() => onUpgrade?.()}
          className={`rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors ${palette.primary}`}
        >
          {upgradeLabel}
        </button>
        <button
          type="button"
          data-trial-expiry-extend
          onClick={() => onExtend?.()}
          className={`rounded-lg border px-3.5 py-2 text-xs font-semibold transition-colors ${
            resolved === "urgent"
              ? "border-red-300 text-red-700 hover:bg-red-100 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-900/40"
              : "border-amber-300 text-amber-700 hover:bg-amber-100 dark:border-amber-800 dark:text-amber-300 dark:hover:bg-amber-900/40"
          }`}
        >
          {extendLabel}
        </button>
      </div>
    </div>
  );
}
