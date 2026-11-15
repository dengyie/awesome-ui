import React from "react";

export interface DevService {
  name: string;
  command: string;
  status: "running" | "stopped" | "failed" | "starting";
  url?: string;
}

export interface DevCheck {
  label: string;
  passed: boolean;
  detail?: string;
}

export interface ServiceStatusListProps {
  services: DevService[];
  checks?: DevCheck[];
  durationLabel?: string;
  onServiceClick?: (service: DevService) => void;
}

const SERVICE_STATUS: Record<string, { icon: React.ReactNode; text: string; tone: string }> = {
  running: {
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-3.5 w-3.5 text-emerald-500"><path d="m5 12 4 4L19 6" /></svg>,
    text: "Running on",
    tone: "text-emerald-600 dark:text-emerald-400",
  },
  starting: {
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5 animate-spin text-sky-500"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>,
    text: "Starting…",
    tone: "text-sky-600 dark:text-sky-400",
  },
  stopped: {
    icon: <span className="block h-2 w-2 rounded-full bg-zinc-400" />,
    text: "Stopped",
    tone: "text-zinc-500",
  },
  failed: {
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-3.5 w-3.5 text-rose-500"><path d="M18 6 6 18M6 6l12 12" /></svg>,
    text: "Failed",
    tone: "text-rose-600 dark:text-rose-400",
  },
};

/**
 * ServiceStatusList - dev-environment service table (command chips + status + URL) with a verification checklist.
 */
export default function ServiceStatusList({ services, checks = [], durationLabel, onServiceClick }: ServiceStatusListProps) {
  return (
    <div data-service-status className="w-full rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <p className="text-sm font-bold text-zinc-900 dark:text-zinc-50">Services</p>
      <ul className="mt-2 space-y-1.5">
        {services.map((service) => {
          const tone = SERVICE_STATUS[service.status] || SERVICE_STATUS.stopped;
          return (
            <li key={service.name} data-service-row={service.name} data-service-status={service.status}>
              <button
                type="button"
                onClick={() => onServiceClick?.(service)}
                className="flex w-full items-center gap-2 rounded-md px-1 py-1 text-left transition-colors hover:bg-zinc-50 focus-visible:outline-none dark:hover:bg-zinc-800/60"
              >
                <span className="w-28 shrink-0 truncate text-xs font-medium text-zinc-800 dark:text-zinc-100">{service.name}</span>
                <code className="shrink-0 rounded border border-zinc-200 bg-zinc-100 px-1.5 py-0.5 font-mono text-[11px] text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">{service.command}</code>
                <span className="flex min-w-0 flex-1 items-center justify-end gap-1.5">
                  {tone.icon}
                  <span className={`truncate text-[11px] font-medium ${tone.tone}`}>{tone.text}</span>
                  {service.url ? (
                    <span className="shrink-0 rounded bg-zinc-900 px-1.5 py-0.5 font-mono text-[10px] text-white dark:bg-zinc-100 dark:text-zinc-900">{service.url}</span>
                  ) : null}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      {checks.length ? (
        <div className="mt-3 border-t border-zinc-200 pt-3 dark:border-zinc-800">
          <ul className="space-y-1">
            {checks.map((check) => (
              <li key={check.label} data-check-row className="flex items-start gap-1.5 text-[11px] text-zinc-600 dark:text-zinc-300">
                {check.passed ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="mt-0.5 h-3 w-3 shrink-0 text-emerald-500"><path d="m5 12 4 4L19 6" /></svg>
                ) : (
                  <span className="mt-1 block h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-400" />
                )}
                <span className="min-w-0 flex-1">
                  <code className="rounded bg-zinc-100 px-1 font-mono text-zinc-800 dark:bg-zinc-800 dark:text-zinc-100">{check.label}</code>
                  {check.detail ? <span className="text-zinc-500 dark:text-zinc-400"> {check.detail}</span> : null}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      {durationLabel ? <p className="mt-3 text-[11px] text-zinc-500 dark:text-zinc-400">{durationLabel}</p> : null}
    </div>
  );
}
