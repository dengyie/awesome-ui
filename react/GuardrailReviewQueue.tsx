import React from "react";

export type GuardrailVerdict = "pending" | "approved" | "rejected";

export interface GuardrailItem {
  id: string;
  author: string;
  content: string;
  reasons: string[];
  rule?: string;
  confidence?: number;
  verdict?: GuardrailVerdict;
}

export interface GuardrailReviewQueueProps {
  items: GuardrailItem[];
  title?: string;
  className?: string;
  onApprove?: (item: GuardrailItem) => void;
  onReject?: (item: GuardrailItem) => void;
}

/**
 * GuardrailReviewQueue - moderation review queue for AI-flagged content:
 * cards with reason chips, rule hit and confidence, approve/reject actions
 * that collapse the card (Circle moderation / X moderation log pattern).
 */
export default function GuardrailReviewQueue({
  items,
  title = "Moderation queue",
  className = "",
  onApprove,
  onReject,
}: GuardrailReviewQueueProps) {
  const pending = items.filter((i) => (i.verdict ?? "pending") === "pending");

  return (
    <div
      data-guardrail-queue
      className={`w-full rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 ${className}`}
    >
      <div className="flex items-center gap-2 border-b border-zinc-100 px-4 py-2.5 dark:border-zinc-800">
        <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-200">{title}</span>
        <span
          data-guardrail-count
          className="ml-auto rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-semibold tabular-nums text-red-700 dark:bg-red-950/60 dark:text-red-300"
        >
          {pending.length} flagged
        </span>
      </div>

      <div data-guardrail-list className="divide-y divide-zinc-100 dark:divide-zinc-800">
        {items.map((item) => {
          const verdict = item.verdict ?? "pending";
          if (verdict !== "pending") {
            return (
              <div
                key={item.id}
                data-guardrail-resolved={item.id}
                className="flex items-center gap-2 px-4 py-2.5 text-[11px] text-zinc-400 dark:text-zinc-500"
              >
                <span
                  className={`inline rounded px-1.5 py-0.5 font-medium ${
                    verdict === "approved"
                      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
                      : "bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-300"
                  }`}
                >
                  {verdict === "approved" ? "✓ Approved" : "✕ Rejected"}
                </span>
                <span data-guardrail-resolved-author>{item.author}</span>
                <span className="min-w-0 flex-1 truncate">{item.content}</span>
              </div>
            );
          }
          return (
            <div key={item.id} data-guardrail-card={item.id} className="p-4">
              <div className="flex items-center gap-2">
                <span data-guardrail-author className="text-xs font-semibold text-zinc-800 dark:text-zinc-100">
                  {item.author}
                </span>
                {typeof item.confidence === "number" && (
                  <span
                    data-guardrail-confidence
                    className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold tabular-nums ${
                      item.confidence >= 0.9
                        ? "bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300"
                        : "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300"
                    }`}
                  >
                    {Math.round(item.confidence * 100)}% confidence
                  </span>
                )}
                {item.rule && (
                  <span data-guardrail-rule className="rounded-full bg-zinc-100 px-1.5 py-0.5 text-[10px] text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                    {item.rule}
                  </span>
                )}
              </div>
              <p
                data-guardrail-content
                className="mt-2 rounded-lg bg-zinc-50 px-3 py-2 text-xs leading-relaxed text-zinc-700 dark:bg-zinc-800/60 dark:text-zinc-200"
              >
                {item.content}
              </p>
              {item.reasons.length > 0 && (
                <div data-guardrail-reasons className="mt-2 flex flex-wrap gap-1.5">
                  {item.reasons.map((reason) => (
                    <span
                      key={reason}
                      data-guardrail-reason
                      className="inline rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-medium text-amber-700 dark:bg-amber-950/60 dark:text-amber-300"
                    >
                      {reason}
                    </span>
                  ))}
                </div>
              )}
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  data-guardrail-approve
                  onClick={() => onApprove?.(item)}
                  className="flex-1 rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-emerald-500"
                >
                  Approve
                </button>
                <button
                  type="button"
                  data-guardrail-reject
                  onClick={() => onReject?.(item)}
                  className="flex-1 rounded-md bg-red-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-red-500"
                >
                  Reject
                </button>
              </div>
            </div>
          );
        })}
        {items.length === 0 && (
          <p data-guardrail-empty className="px-4 py-8 text-center text-xs text-zinc-500 dark:text-zinc-400">
            No flagged content in the queue.
          </p>
        )}
      </div>
    </div>
  );
}
