/**
 * CancelRetentionFlow - Plan-cancellation retention flow: step 1 pick a
 * reason from radio cards, step 2 shows a discounted keep-plan offer card
 * (or a bare confirmation when no offer is configured) with Keep plan as
 * the primary action and Confirm cancel as the destructive ghost action
 * (SaaS downgrade retention pattern).
 */
import React, { useState } from "react";

export interface CancelReason {
  id: string;
  label: string;
}

export interface RetentionOffer {
  title?: string;
  description?: string;
  discountedPrice?: string;
  originalPrice?: string;
  periodLabel?: string;
}

export interface CancelRetentionFlowProps {
  title?: string;
  stepLabel?: string;
  reasonsLabel?: string;
  reasons?: CancelReason[];
  offer?: RetentionOffer | null;
  keepLabel?: string;
  confirmLabel?: string;
  className?: string;
  onKeep?: () => void;
  onConfirmCancel?: (reason: string) => void;
  onStepChange?: (step: 1 | 2) => void;
}

const DEFAULT_REASONS: CancelReason[] = [
  { id: "price", label: "Too expensive" },
  { id: "features", label: "Missing features I need" },
  { id: "switching", label: "Switching to another tool" },
  { id: "pause", label: "Only needed it temporarily" },
];

const DEFAULT_OFFER: RetentionOffer = {
  title: "Before you go — 30% off for 3 months",
  description: "Stay on your current plan at a reduced price. Your data and integrations stay untouched.",
  discountedPrice: "$34.30",
  originalPrice: "$49.00",
  periodLabel: "/ month",
};

export const CancelRetentionFlow: React.FC<CancelRetentionFlowProps> = ({
  title = "Cancel your plan",
  stepLabel = "Step",
  reasonsLabel = "Help us improve — why are you cancelling?",
  reasons = DEFAULT_REASONS,
  offer = DEFAULT_OFFER,
  keepLabel = "Keep my plan",
  confirmLabel = "Confirm cancellation",
  className = "",
  onKeep,
  onConfirmCancel,
  onStepChange,
}) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [reason, setReason] = useState("");

  const goTo = (next: 1 | 2) => {
    setStep(next);
    onStepChange?.(next);
  };

  return (
    <div data-cancel-flow className={`w-full rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 ${className}`}>
      <div data-cancel-header className="mb-4 flex items-center justify-between">
        <p data-cancel-title className="text-base font-semibold text-zinc-900 dark:text-zinc-50">{title}</p>
        <span data-cancel-step-indicator className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-[11px] font-semibold text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">{stepLabel} {step} / 2</span>
      </div>

      {step === 1 ? (
        <div data-cancel-step1 className="space-y-3">
          <p data-cancel-reasons-label className="text-sm font-medium text-zinc-700 dark:text-zinc-200">{reasonsLabel}</p>
          <div data-cancel-reasons className="grid gap-2">
            {(Array.isArray(reasons) ? reasons : []).map((r) => (
              <label
                key={r.id}
                data-cancel-reason-card={r.id}
                htmlFor={`reason-${r.id}`}
                className="flex cursor-pointer items-center gap-3 rounded-lg border border-zinc-200 px-4 py-3 text-sm text-zinc-700 transition-colors hover:border-violet-300 hover:bg-violet-50/50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:border-violet-700 dark:hover:bg-violet-950/30"
              >
                <input
                  type="radio"
                  name="cancel-reason"
                  data-cancel-reason={r.id}
                  id={`reason-${r.id}`}
                  value={r.id}
                  checked={reason === r.id}
                  onChange={() => setReason(r.id)}
                  className="h-4 w-4 accent-violet-600"
                />
                <span>{r.label}</span>
              </label>
            ))}
          </div>
          <div className="flex justify-end pt-2">
            <button
              type="button"
              data-cancel-next
              disabled={!reason}
              onClick={() => { if (reason) goTo(2); }}
              className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white transition-opacity hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Continue
            </button>
          </div>
        </div>
      ) : (
        <div data-cancel-step2 className="space-y-4">
          {offer ? (
            <div data-cancel-offer className="rounded-xl border border-violet-200 bg-violet-50/70 p-5 dark:border-violet-800 dark:bg-violet-950/40">
              <p data-cancel-offer-title className="text-base font-semibold text-violet-900 dark:text-violet-200">{offer.title || ""}</p>
              <p data-cancel-offer-description className="mt-1 text-sm leading-5 text-violet-700 dark:text-violet-300">{offer.description || ""}</p>
              <p data-cancel-offer-price className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{offer.discountedPrice || ""}</span>
                <span className="text-sm text-zinc-400 line-through">{offer.originalPrice || ""}</span>
                <span className="text-xs text-zinc-500 dark:text-zinc-400">{offer.periodLabel || ""}</span>
              </p>
            </div>
          ) : null}
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <button type="button" data-cancel-back onClick={() => goTo(1)} className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800">Back</button>
            <button
              type="button"
              data-cancel-confirm
              onClick={() => onConfirmCancel?.(reason)}
              className="rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950/40"
            >
              {confirmLabel}
            </button>
            <button type="button" data-cancel-keep onClick={() => onKeep?.()} className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-violet-500 dark:bg-violet-600 dark:hover:bg-violet-500">{keepLabel}</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CancelRetentionFlow;
