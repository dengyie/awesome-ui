import React, { useState } from "react";

export interface ScheduleFrequency {
  id: string;
  label: string;
  /** cron-like expression shown in the mono field when selected */
  expression: string;
}

export interface AgentScheduleEditorProps {
  title?: string;
  description?: string;
  frequencies?: ScheduleFrequency[];
  /** index into frequencies of the active one */
  activeId?: string;
  time?: string;
  nextRun?: string;
  timezone?: string;
  onSave?: (freq: ScheduleFrequency, time: string) => void;
  className?: string;
}

const DEFAULT_FREQUENCIES: ScheduleFrequency[] = [
  { id: "hourly", label: "Every hour", expression: "0 * * * *" },
  { id: "daily", label: "Daily", expression: "0 9 * * *" },
  { id: "weekly", label: "Weekly", expression: "0 9 * * 1" },
];

export default function AgentScheduleEditor({
  title = "Run schedule",
  description = "Configure when the agent runs automatically. The cron expression is derived from your selection.",
  frequencies = DEFAULT_FREQUENCIES,
  activeId,
  time = "09:00",
  nextRun,
  timezone,
  onSave,
  className = "",
}: AgentScheduleEditorProps) {
  const [selectedId, setSelectedId] = useState(activeId ?? frequencies[0]?.id ?? "");
  const [timeValue, setTimeValue] = useState(time);
  const [saved, setSaved] = useState(false);

  const selected = frequencies.find((f) => f.id === selectedId) ?? frequencies[0];

  const handleSave = () => {
    if (!selected) return;
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1600);
    onSave?.(selected, timeValue);
  };

  return (
    <div data-schedule-editor className={`rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 ${className}`}>
      <p data-schedule-title className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{title}</p>
      <p data-schedule-description className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{description}</p>

      <div data-schedule-frequencies className="mt-3 flex flex-wrap gap-1.5">
        {frequencies.map((f) => (
          <button
            key={f.id}
            type="button"
            data-schedule-frequency={f.id}
            aria-pressed={f.id === selectedId}
            onClick={() => setSelectedId(f.id)}
            className={
              f.id === selectedId
                ? "rounded-full bg-indigo-600 px-3 py-1 text-[11px] font-semibold text-white transition-colors hover:bg-indigo-500"
                : "rounded-full border border-zinc-200 px-3 py-1 text-[11px] font-semibold text-zinc-500 transition-colors hover:border-zinc-300 hover:text-zinc-700 dark:border-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
            }
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <label data-schedule-time-wrap className="flex items-center gap-2">
          <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">Run at</span>
          <input
            data-schedule-time
            type="time"
            value={timeValue}
            onChange={(e) => setTimeValue(e.target.value)}
            className="rounded-md border border-zinc-200 bg-white px-2 py-1.5 font-mono text-xs text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
          />
        </label>
        {timezone ? (
          <span data-schedule-timezone className="text-[11px] text-zinc-400 dark:text-zinc-500">{timezone}</span>
        ) : null}
      </div>

      <div className="mt-3 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-800/60">
        <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">Cron</span>
        <code data-schedule-cron className="ml-2 font-mono text-xs text-zinc-700 dark:text-zinc-200">{selected?.expression ?? "—"}</code>
        <span className="mx-2 text-zinc-300 dark:text-zinc-600">|</span>
        <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">Next run</span>
        <span data-schedule-next className="ml-2 text-xs text-zinc-700 dark:text-zinc-200">{nextRun ?? "—"}</span>
      </div>

      <div className="mt-3 flex items-center justify-end gap-2">
        {saved ? (
          <span data-schedule-saved className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">Schedule saved</span>
        ) : null}
        <button
          type="button"
          data-schedule-save
          onClick={handleSave}
          className="rounded-md bg-indigo-600 px-3 py-1.5 text-[11px] font-semibold text-white transition-colors hover:bg-indigo-500"
        >
          Save schedule
        </button>
      </div>
    </div>
  );
}
