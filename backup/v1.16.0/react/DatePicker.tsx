import React, { useEffect, useMemo, useState } from "react";
import { UiIcon } from "./UiIcon";

export interface DatePickerProps {
  /** Selected date as YYYY-MM-DD. */
  value?: string;
  /** Earliest selectable date (inclusive), YYYY-MM-DD. */
  min?: string;
  /** Latest selectable date (inclusive), YYYY-MM-DD. */
  max?: string;
  /** 0 = Sunday, 1 = Monday. */
  weekStartsOn?: 0 | 1;
  showToday?: boolean;
  disabled?: boolean;
  onChange?: (isoDate: string) => void;
  className?: string;
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

const pad = (n: number) => String(n).padStart(2, "0");
export const toIso = (year: number, month: number, day: number) => `${year}-${pad(month + 1)}-${pad(day)}`;

export const parseIso = (iso?: string): { year: number; month: number; day: number } | null => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || "");
  if (!match) return null;
  return { year: Number(match[1]), month: Number(match[2]) - 1, day: Number(match[3]) };
};

const todayIso = () => {
  const now = new Date();
  return toIso(now.getFullYear(), now.getMonth(), now.getDate());
};

export const DatePicker: React.FC<DatePickerProps> = ({
  value,
  min,
  max,
  weekStartsOn = 1,
  showToday = true,
  disabled = false,
  onChange,
  className = "",
}) => {
  const selected = parseIso(value);
  const today = todayIso();

  const [view, setView] = useState(() => {
    const base = selected || parseIso(today)!;
    return { year: base.year, month: base.month };
  });

  // Follow an externally controlled value.
  useEffect(() => {
    if (selected) setView({ year: selected.year, month: selected.month });
  }, [value]);

  const cells = useMemo(() => {
    const first = new Date(view.year, view.month, 1).getDay();
    const lead = (first - weekStartsOn + 7) % 7;
    const total = new Date(view.year, view.month + 1, 0).getDate();
    const out: Array<number | null> = Array.from({ length: lead }, () => null);
    for (let day = 1; day <= total; day += 1) out.push(day);
    while (out.length % 7 !== 0) out.push(null);
    return out;
  }, [view, weekStartsOn]);

  const weekdays = useMemo(
    () => Array.from({ length: 7 }, (_, i) => WEEKDAYS[(i + weekStartsOn) % 7]),
    [weekStartsOn]
  );

  const shift = (delta: number) => {
    const next = new Date(view.year, view.month + delta, 1);
    setView({ year: next.getFullYear(), month: next.getMonth() });
  };

  const isDisabled = (day: number) => {
    if (disabled) return true;
    const iso = toIso(view.year, view.month, day);
    if (min && iso < min) return true;
    if (max && iso > max) return true;
    return false;
  };

  const selectDay = (day: number) => {
    if (isDisabled(day)) return;
    onChange?.(toIso(view.year, view.month, day));
  };

  return (
    <div
      className={`w-full max-w-[17rem] rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-3 ${className}`}
    >
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => shift(-1)}
          aria-label="Previous month"
          className="rounded-md p-1 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
        >
          <UiIcon name="chevron-left" size={14} />
        </button>
        <span className="flex-1 text-center text-xs font-semibold text-zinc-800 dark:text-zinc-100">
          {MONTHS[view.month]} {view.year}
        </span>
        <button
          type="button"
          onClick={() => shift(1)}
          aria-label="Next month"
          className="rounded-md p-1 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
        >
          <UiIcon name="chevron-right" size={14} />
        </button>
      </div>

      <div className="mt-2 grid grid-cols-7 gap-0.5">
        {weekdays.map((label) => (
          <span key={label} className="py-1 text-center text-[10px] font-medium uppercase text-zinc-400">
            {label}
          </span>
        ))}

        {cells.map((day, index) => {
          if (day === null) return <span key={`blank-${index}`} />;
          const iso = toIso(view.year, view.month, day);
          const isSelected = value === iso;
          const isToday = iso === today;
          const blocked = isDisabled(day);
          return (
            <button
              key={iso}
              type="button"
              onClick={() => selectDay(day)}
              disabled={blocked}
              aria-pressed={isSelected}
              aria-label={iso}
              className={`relative flex h-7 items-center justify-center rounded-md text-[11px] tabular-nums transition-colors ${
                isSelected
                  ? "bg-indigo-600 font-semibold text-white hover:bg-indigo-500"
                  : isToday
                    ? "font-semibold text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-950/40"
                    : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
              } disabled:cursor-not-allowed disabled:text-zinc-300 disabled:hover:bg-transparent dark:disabled:text-zinc-600`}
            >
              {day}
            </button>
          );
        })}
      </div>

      {showToday && (
        <div className="mt-2 border-t border-zinc-100 pt-2 dark:border-zinc-800">
          <button
            type="button"
            onClick={() => {
              if (disabled) return;
              const iso = today;
              if ((min && iso < min) || (max && iso > max)) return;
              onChange?.(iso);
            }}
            className="w-full rounded-md py-1 text-[11px] font-medium text-indigo-600 transition-colors hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-950/40"
          >
            Today
          </button>
        </div>
      )}
    </div>
  );
};

export default DatePicker;
