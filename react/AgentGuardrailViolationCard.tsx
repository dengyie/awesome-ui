import React, { useState } from "react";

export type ViolationSeverity = "low" | "medium" | "high";

export interface AgentGuardrailViolationCardProps {
  /** rule that was violated, e.g. "PII disclosure" */
  rule: string;
  severity?: ViolationSeverity;
  /** agent / run that triggered it */
  runId?: string;
  time?: string;
  /** truncated input that triggered the violation */
  input?: string;
  /** matched snippet highlighted inside the input */
  match?: string;
  /** policy reference, e.g. "policy/security#pii-1" */
  policyRef?: string;
  proceedLabel?: string;
  blockLabel?: string;
  onProceed?: () => void;
  onBlock?: () => void;
  className?: string;
}

const SEVERITY_STYLE: Record<ViolationSeverity, { badge: string; label: string }> = {
  low: {
    badge: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
    label: "Low severity",
  },
  medium: {
    badge: "bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400",
    label: "Medium severity",
  },
  high: {
    badge: "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400",
    label: "High severity",
  },
};

export default function AgentGuardrailViolationCard({
  rule,
  severity = "medium",
  runId,
  time,
  input,
  match,
  policyRef,
  proceedLabel = "Proceed anyway",
  blockLabel = "Block run",
  onProceed,
  onBlock,
  className = "",
}: AgentGuardrailViolationCardProps) {
  const [resolved, setResolved] = useState<null | "proceeded" | "blocked">(null);
  const sev = SEVERITY_STYLE[severity];

  const act = (kind: "proceeded" | "blocked") => {
    setResolved(kind);
    (kind === "proceeded" ? onProceed : onBlock)?.();
  };

  const renderInput = () => {
    if (!input) return null;
    if (match && input.includes(match)) {
      const idx = input.indexOf(match);
      return (
        <>
          {input.slice(0, idx)}
          <mark data-violation-match className="rounded bg-rose-100 px-0.5 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300">
            {match}
          </mark>
          {input.slice(idx + match.length)}
        </>
      );
    }
    return input;
  };

  return (
    <div
      data-guardrail-violation
      role="alert"
      className={`rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 ${className}`}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span data-violation-rule className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{rule}</span>
        <span data-violation-severity className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${sev.badge}`}>
          {sev.label}
        </span>
        {time ? <span data-violation-time className="ml-auto text-[11px] text-zinc-400 dark:text-zinc-500">{time}</span> : null}
      </div>

      {runId ? (
        <p className="mt-1.5">
          <code data-violation-run className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-[11px] text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
            {runId}
          </code>
        </p>
      ) : null}

      {input ? (
        <div data-violation-input className="mt-2.5 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs leading-relaxed text-zinc-600 dark:border-zinc-700 dark:bg-zinc-800/60 dark:text-zinc-300">
          {renderInput()}
        </div>
      ) : null}

      {policyRef ? (
        <p data-violation-policy className="mt-2 text-[11px] text-zinc-400 dark:text-zinc-500">
          Policy: <code className="font-mono text-zinc-500 dark:text-zinc-400">{policyRef}</code>
        </p>
      ) : null}

      {resolved ? (
        <p data-violation-resolved className="mt-3 text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">
          {resolved === "blocked" ? "Run blocked by reviewer." : "Marked reviewed — proceeding anyway."}
        </p>
      ) : (
        <div className="mt-3 flex items-center justify-end gap-2">
          <button
            type="button"
            data-violation-block
            onClick={() => act("blocked")}
            className="rounded-md bg-rose-600 px-3 py-1.5 text-[11px] font-semibold text-white transition-colors hover:bg-rose-500"
          >
            {blockLabel}
          </button>
          <button
            type="button"
            data-violation-proceed
            onClick={() => act("proceeded")}
            className="rounded-md border border-zinc-200 px-3 py-1.5 text-[11px] font-semibold text-zinc-600 transition-colors hover:border-zinc-300 hover:text-zinc-800 dark:border-zinc-700 dark:text-zinc-300 dark:hover:text-zinc-100"
          >
            {proceedLabel}
          </button>
        </div>
      )}
    </div>
  );
}
