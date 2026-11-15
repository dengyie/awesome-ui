import React from "react";
import { UiIcon } from "./UiIcon";

export interface SchedulerSlot {
  id: string;
  /** Start time in 24h "HH:MM". */
  time: string;
  available?: boolean;
  note?: string;
}

export interface SchedulerSlotsProps {
  /** ISO date shown in the header, e.g. "2026-11-20". */
  date: string;
  slots?: SchedulerSlot[];
  selectedId?: string;
  timezone?: string;
  onSelect?: (slot: SchedulerSlot) => void;
  className?: string;
}

const PERIODS = [
  { key: "morning", label: "Morning", range: [6, 12] },
  { key: "afternoon", label: "Afternoon", range: [12, 17] },
  { key: "evening", label: "Evening", range: [17, 24] },
] as const;

const humanDate = (iso: string) => {
  const [year, month, day] = iso.split("-").map(Number);
  if (!year || !month || !day) return iso;
  return new Date(year, month - 1, day).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
};

const hourOf = (time: string) => {
  const [hour] = time.split(":").map(Number);
  return Number.isFinite(hour) ? hour : -1;
};

const AM_PM = (time: string) => {
  const [hour, minute] = time.split(":").map(Number);
  if (!Number.isFinite(hour) || !Number.isFinite(minute)) return time;
  const suffix = hour >= 12 ? "PM" : "AM";
  const display = hour % 12 === 0 ? 12 : hour % 12;
  return `${display}:${String(minute).padStart(2, "0")} ${suffix}`;
};

export const SchedulerSlots: React.FC<SchedulerSlotsProps> = ({
  date,
  slots = [],
  selectedId,
  timezone,
  onSelect,
  className = "",
}) => {
  const groups = PERIODS.map((period) => ({
    period,
    slots: slots.filter((slot) => {
      const hour = hourOf(slot.time);
      return hour >= period.range[0] && hour < period.range[1];
    }),
  })).filter((group) => group.slots.length > 0);

  return (
    <div className={`rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900 ${className}`}>
      <header className="flex items-center gap-2 border-b border-zinc-100 pb-2 dark:border-zinc-800">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400">
          <UiIcon name="calendar" size={14} />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-xs font-semibold text-zinc-800 dark:text-zinc-100">{humanDate(date)}</h3>
          {timezone && <p className="text-[10px] text-zinc-400">All times in {timezone}</p>}
        </div>
        <span className="rounded-full bg-zinc-100 px-1.5 py-0.5 text-[10px] font-medium tabular-nums text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
          {slots.filter((slot) => slot.available !== false).length} open
        </span>
      </header>

      {groups.length === 0 ? (
        <p className="py-8 text-center text-[11px] text-zinc-400">No slots available for this day.</p>
      ) : (
        <div className="mt-2 space-y-3">
          {groups.map(({ period, slots: periodSlots }) => (
            <fieldset key={period.key}>
              <legend className="text-[10px] font-medium uppercase tracking-wide text-zinc-400">
                {period.label}
              </legend>
              <div className="mt-1 grid grid-cols-2 gap-1.5">
                {periodSlots.map((slot) => {
                  const disabled = slot.available === false;
                  const selected = slot.id === selectedId;
                  return (
                    <button
                      key={slot.id}
                      type="button"
                      disabled={disabled}
                      aria-pressed={selected}
                      onClick={() => onSelect?.(slot)}
                      className={`flex items-center justify-between rounded-lg border px-2 py-1.5 text-[11px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                        selected
                          ? "border-indigo-600 bg-indigo-600 font-medium text-white"
                          : disabled
                            ? "cursor-not-allowed border-zinc-100 text-zinc-300 line-through dark:border-zinc-800 dark:text-zinc-600"
                            : "border-zinc-200 text-zinc-700 hover:border-indigo-300 hover:bg-indigo-50/60 dark:border-zinc-700 dark:text-zinc-200 dark:hover:border-indigo-500 dark:hover:bg-indigo-950/20"
                      }`}
                    >
                      <span className="tabular-nums">{AM_PM(slot.time)}</span>
                      {selected && <UiIcon name="check" size={11} />}
                      {!selected && disabled && <UiIcon name="lock" size={11} />}
                    </button>
                  );
                })}
              </div>
              {periodSlots.some((slot) => slot.note) && (
                <p className="mt-1 text-[10px] text-zinc-400">
                  {periodSlots.filter((slot) => slot.note).map((slot) => slot.note).join(" · ")}
                </p>
              )}
            </fieldset>
          ))}
        </div>
      )}
    </div>
  );
};

export default SchedulerSlots;
