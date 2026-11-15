/**
 * AgentSessionTimeline - Agent browser-session timeline: summary header with
 * status/duration/steps chips, a segmented activity strip, a step list with
 * Reason/Tool badges and a request panel (Browserbase session pattern).
 */
import React from "react";

export type AgentStepKind = "prompt" | "reason" | "tool";

export interface AgentStep {
  id: string;
  kind: AgentStepKind;
  label: string;
  at: string;
}

export interface AgentRequest {
  id: string;
  url: string;
  method?: string;
  status: string;
  duration: string;
  ok?: boolean;
}

export interface AgentSessionTimelineProps {
  title?: string;
  status?: string;
  duration?: string;
  stepsCount?: number;
  steps?: AgentStep[];
  requests?: AgentRequest[];
  className?: string;
  onStepClick?: (step: AgentStep) => void;
}

const KIND_STYLES: Record<AgentStepKind, { badge: string }> = {
  prompt: { badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300" },
  reason: { badge: "bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300" },
  tool: { badge: "bg-orange-100 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300" },
};

const DEFAULT_STEPS: AgentStep[] = [
  { id: "s1", kind: "prompt", label: "Summarize the top 5 trending tech articles", at: "0:00" },
  { id: "s2", kind: "reason", label: "Plan fetch strategy", at: "0:03" },
  { id: "s3", kind: "tool", label: "HTTP probe", at: "0:03" },
  { id: "s4", kind: "tool", label: "Fetch API", at: "0:14" },
  { id: "s5", kind: "reason", label: "Need to actually fetch the pages", at: "0:14" },
  { id: "s6", kind: "tool", label: "Search HTML", at: "0:26" },
  { id: "s7", kind: "tool", label: "Run code", at: "0:31" },
];

const DEFAULT_REQUESTS: AgentRequest[] = [
  { id: "q1", url: "techcrunch.com", method: "HTTP probe", status: "HTTP 200", duration: "0:03", ok: true },
  { id: "q2", url: "techcrunch.com/2026/08/02/sam-altman-an…", method: "Fetch API", status: "HTTP 200", duration: "0:50", ok: true },
  { id: "q3", url: "techcrunch.com/2026/08/01/inside-one-lond…", method: "Fetch API", status: "HTTP 200", duration: "0:50", ok: true },
  { id: "q4", url: "techcrunch.com/2026/08/02/the-global-me…", method: "Fetch API", status: "HTTP 429", duration: "0:50", ok: false },
];

export default function AgentSessionTimeline({
  title = "Go to techcrunch.com and summarize the top 5 trending tech articles",
  status = "Complete",
  duration = "1m 11s",
  stepsCount = 11,
  steps = DEFAULT_STEPS,
  requests = DEFAULT_REQUESTS,
  className = "",
  onStepClick,
}: AgentSessionTimelineProps) {
  const segments = steps.slice(0, 24);
  return (
    <div data-agent-session-timeline className={`w-full rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900 ${className}`}>
      <div data-agent-session-header className="border-b border-zinc-100 px-4 py-3 dark:border-zinc-800">
        <p data-agent-session-title className="mb-2 truncate text-sm font-semibold text-zinc-900 dark:text-zinc-50">{title}</p>
        <div className="flex flex-wrap items-center gap-2">
          <span data-agent-session-status className="rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
            {status}
          </span>
          <span data-agent-session-duration className="text-[11px] text-zinc-400 dark:text-zinc-500">⏱ {duration}</span>
          <span data-agent-session-steps-count className="text-[11px] text-zinc-400 dark:text-zinc-500">≡ {stepsCount} steps</span>
        </div>
        <div data-agent-session-strip className="mt-3 flex h-2 items-stretch gap-0.5 overflow-hidden rounded-full">
          {segments.map((s) => (
            <span
              key={s.id}
              title={`${s.kind} · ${s.label}`}
              className={`flex-1 rounded-sm ${
                s.kind === "prompt"
                  ? "bg-emerald-400 dark:bg-emerald-500"
                  : s.kind === "reason"
                    ? "bg-sky-400 dark:bg-sky-500"
                    : "bg-orange-400 dark:bg-orange-500"
              }`}
            />
          ))}
        </div>
      </div>
      <div data-agent-session-body className="grid grid-cols-1 md:grid-cols-2">
        <ol data-agent-steps className="divide-y divide-zinc-50 border-b border-zinc-100 md:border-b-0 md:border-r dark:divide-zinc-800/60 dark:border-zinc-800">
          {steps.map((step) => (
            <li key={step.id}>
              <button
                type="button"
                data-agent-step={step.id}
                onClick={() => onStepClick?.(step)}
                className="flex w-full items-center gap-2 px-4 py-2 text-left transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/60"
              >
                <span data-agent-step-badge={step.kind} className={`inline-flex shrink-0 items-center rounded px-1.5 py-0.5 text-[9px] font-bold tracking-wide ${KIND_STYLES[step.kind].badge}`}>
                  {step.kind}
                </span>
                <span data-agent-step-label className="min-w-0 flex-1 truncate text-xs text-zinc-700 dark:text-zinc-200">{step.label}</span>
                <span data-agent-step-at className="shrink-0 text-[10px] text-zinc-400 dark:text-zinc-500">{step.at}</span>
              </button>
            </li>
          ))}
        </ol>
        <div data-agent-requests className="divide-y divide-zinc-50 dark:divide-zinc-800/60">
          {requests.map((req) => (
            <div key={req.id} data-agent-request={req.id} className="flex items-center gap-2 px-4 py-2">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-[9px] font-bold text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400" aria-hidden="true">
                ⌾
              </span>
              <span className="min-w-0 flex-1">
                <span data-agent-request-url className="block truncate text-xs font-medium text-zinc-800 dark:text-zinc-100">{req.url}</span>
                <span data-agent-request-status className={`block truncate text-[10px] ${(req.ok ?? true) ? "text-zinc-400 dark:text-zinc-500" : "text-red-500 dark:text-red-400"}`}>
                  {req.status}
                  {req.method ? ` · ${req.method}` : ""}
                </span>
              </span>
              <span data-agent-request-duration className="shrink-0 text-[10px] text-zinc-400 dark:text-zinc-500">{req.duration}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
