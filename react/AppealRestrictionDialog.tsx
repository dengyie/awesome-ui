import React from "react";

export interface AppealRestrictionDialogProps {
  open?: boolean;
  reasonTitle?: string;
  reasonDetail?: string;
  policyLabel?: string;
  appealLabel?: string;
  backLabel?: string;
  className?: string;
  onAppeal?: () => void;
  onClose?: () => void;
  onBack?: () => void;
}

/**
 * AppealRestrictionDialog - content restriction appeal dialog (TikTok
 * "Request another review" pattern): reason card, policy link, appeal CTA.
 */
export default function AppealRestrictionDialog({
  open = true,
  reasonTitle = "Unsafe Conduct",
  reasonDetail = "This content contains depictions, instructions for, or explanations of dangerous stunts by non-professionals.",
  policyLabel = "Content Policy",
  appealLabel = "Appeal",
  backLabel = "Request another review",
  className = "",
  onAppeal,
  onClose,
  onBack,
}: AppealRestrictionDialogProps) {
  if (!open) return null;

  return (
    <div
      data-appeal-dialog
      className={`w-full max-w-md overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-lg dark:border-zinc-700 dark:bg-zinc-900 ${className}`}
      role="dialog"
      aria-label="Request another review"
    >
      <div className="flex items-center justify-between px-5 pt-4">
        <button
          type="button"
          data-appeal-back
          aria-label="Go back"
          onClick={() => onBack?.()}
          className="rounded p-1 text-zinc-500 transition-colors hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
        >
          ←
        </button>
        <button
          type="button"
          data-appeal-close
          aria-label="Close"
          onClick={() => onClose?.()}
          className="rounded p-1 text-zinc-500 transition-colors hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
        >
          ✕
        </button>
      </div>

      <div className="px-5 pb-5 pt-2">
        <h3 data-appeal-title className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
          {backLabel}
        </h3>
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          If you disagree with the content restriction, you have 180 days to appeal.
        </p>

        <div data-appeal-reason className="mt-4 rounded-lg bg-zinc-50 px-4 py-3 dark:bg-zinc-800/60">
          <span className="text-xs font-bold text-zinc-900 dark:text-zinc-50">Reason</span>
          <p data-appeal-reason-title className="mt-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-200">
            {reasonTitle}
          </p>
          <p data-appeal-reason-detail className="mt-1 text-[11px] leading-relaxed text-zinc-500 dark:text-zinc-400">
            {reasonDetail}
          </p>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Read our{" "}
            <a href="#" className="font-semibold text-zinc-800 underline dark:text-zinc-200">
              {policyLabel}
            </a>
          </p>
          <button
            type="button"
            data-appeal-submit
            onClick={() => onAppeal?.()}
            className="rounded-md bg-rose-500 px-4 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-rose-400"
          >
            {appealLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
