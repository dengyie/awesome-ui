import React from "react";
import { UiIcon, type UiIconName } from "./UiIcon";

export interface ApprovalApprover {
  initials: string;
  tone?: "indigo" | "emerald" | "rose" | "amber";
}

export interface ApprovalCardProps {
  title: string;
  approvers: ApprovalApprover[];
  approvedCount?: number;
  dueDate?: string;
  decision?: "approved" | "rejected" | "pending";
  note?: string;
  onRequestChange?: () => void;
  onApprove?: () => void;
  onReject?: () => void;
  className?: string;
}

const TONE_AVATAR: Record<string, string> = {
  indigo: "bg-indigo-600",
  emerald: "bg-emerald-600",
  rose: "bg-rose-600",
  amber: "bg-amber-500",
};

const DECISION_TONE: Record<string, { icon: UiIconName; className: string }> = {
  approved: { icon: "check-circle", className: "text-emerald-600" },
  rejected: { icon: "circle-x", className: "text-rose-600" },
  pending: { icon: "clock", className: "text-zinc-400" },
};

export const ApprovalCard: React.FC<ApprovalCardProps> = ({
  title,
  approvers,
  approvedCount = 0,
  dueDate,
  decision = "pending",
  note,
  onRequestChange,
  onApprove,
  onReject,
  className = "",
}) => {
  const decisionTone = DECISION_TONE[decision] || DECISION_TONE.pending;

  return (
    <section
      data-approval-card
      className={`rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 ${className}`}
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="flex min-w-0 items-center gap-1.5 text-xs font-semibold text-zinc-800 dark:text-zinc-200">
          <UiIcon name="check-circle" size={14} className="shrink-0 text-zinc-400" />
          <span className="truncate">{title}</span>
        </h3>
        <span className="shrink-0 font-mono text-[10px] font-medium text-zinc-400">
          {approvedCount}/{approvers.length}
        </span>
      </div>

      <dl className="mt-3 space-y-2 text-xs">
        <div className="flex items-center gap-2">
          <dt className="w-20 shrink-0 text-zinc-400">Approvers</dt>
          <dd className="flex items-center -space-x-1">
            {approvers.map((approver, index) => (
              <span
                key={`${approver.initials}-${index}`}
                title={approver.initials}
                className={`flex h-6 w-6 items-center justify-center rounded-full border-2 border-white text-[9px] font-bold text-white ring-2 ring-white dark:border-zinc-900 dark:ring-zinc-900 ${TONE_AVATAR[approver.tone || "indigo"]}`}
              >
                {approver.initials}
              </span>
            ))}
            {onRequestChange ? (
              <button
                type="button"
                onClick={onRequestChange}
                aria-label="Add approver"
                className="flex h-6 w-6 items-center justify-center rounded-full border border-dashed border-zinc-300 text-zinc-400 transition-colors hover:border-zinc-400 hover:text-zinc-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-zinc-600"
              >
                <UiIcon name="plus" size={11} />
              </button>
            ) : null}
          </dd>
        </div>
        {dueDate ? (
          <div className="flex items-center gap-2">
            <dt className="w-20 shrink-0 text-zinc-400">Due date</dt>
            <dd className="flex items-center gap-1 font-medium text-zinc-700 dark:text-zinc-200">
              <UiIcon name="calendar" size={12} className="text-zinc-400" />
              {dueDate}
            </dd>
          </div>
        ) : null}
        <div className="flex items-center gap-2">
          <dt className="w-20 shrink-0 text-zinc-400">Decision</dt>
          <dd
            data-approval-decision
            className={`flex items-center gap-1 font-medium capitalize ${decisionTone.className}`}
          >
            <UiIcon name={decisionTone.icon} size={12} />
            {decision}
          </dd>
        </div>
      </dl>

      {note ? (
        <p className="mt-3 border-t border-zinc-100 pt-3 text-xs leading-relaxed text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
          {note}
        </p>
      ) : null}

      {onApprove || onReject ? (
        <div className="mt-3 flex items-center gap-2">
          {onReject ? (
            <button
              type="button"
              data-approval-reject
              onClick={onReject}
              className="rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Request change
            </button>
          ) : null}
          {onApprove ? (
            <button
              type="button"
              data-approval-approve
              onClick={onApprove}
              className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-emerald-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            >
              Approve
            </button>
          ) : null}
        </div>
      ) : null}
    </section>
  );
};

export default ApprovalCard;
