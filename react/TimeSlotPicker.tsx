import React from "react";

export interface TimeSlot {
  id: string;
  label: string;
  period?: "morning" | "afternoon" | "evening";
  available?: number;
  disabled?: boolean;
}

export interface SlotDay {
  id: string;
  label: string;
  weekday: string;
  disabled?: boolean;
  slots: TimeSlot[];
}

export interface TimeSlotPickerProps {
  days: SlotDay[];
  value?: { dayId: string; slotId: string } | null;
  timezone?: string;
  daysLabel?: string;
  slotsLabel?: string;
  onSelect?: (value: { dayId: string; slotId: string; slot: TimeSlot }) => void;
}

const PERIOD_LABELS: Record<string, string> = {
  morning: "Morning",
  afternoon: "Afternoon",
  evening: "Evening",
};

/**
 * TimeSlotPicker - date strip plus grouped time-slot list with availability counts for appointment booking.
 */
export default function TimeSlotPicker({
  days,
  value = null,
  timezone,
  daysLabel = "Date",
  slotsLabel = "Select a time",
  onSelect,
}: TimeSlotPickerProps) {
  const [selected, setSelected] = React.useState(value);
  const [activeDayId, setActiveDayId] = React.useState(
    value?.dayId || days.find((day) => !day.disabled)?.id || days[0]?.id || "",
  );

  React.useEffect(() => {
    if (value) {
      setSelected(value);
      setActiveDayId(value.dayId);
    }
  }, [value]);

  const activeDay = days.find((day) => day.id === activeDayId) || days[0];

  const choose = (slot: TimeSlot) => {
    if (slot.disabled) return;
    const next = { dayId: activeDayId, slotId: slot.id };
    setSelected(next);
    onSelect?.({ ...next, slot });
  };

  return (
    <div data-time-slot-picker className="w-full rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <div className="border-b border-zinc-100 px-4 pt-3 dark:border-zinc-800">
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">{daysLabel}</p>
        <div className="mt-2 flex gap-1.5 overflow-x-auto pb-3">
          {days.map((day) => {
            const active = day.id === activeDayId;
            return (
              <button
                key={day.id}
                type="button"
                data-slot-day={day.id}
                disabled={day.disabled}
                onClick={() => setActiveDayId(day.id)}
                className={`min-w-[64px] rounded-lg px-2 py-2 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-40 ${
                  active
                    ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                    : "bg-zinc-50 text-zinc-700 hover:bg-zinc-100 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
                }`}
              >
                <span className="block text-[10px] font-medium uppercase tracking-wide opacity-70">{day.weekday}</span>
                <span className="block text-sm font-semibold">{day.label}</span>
              </button>
            );
          })}
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between">
          <p data-slot-heading className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            {slotsLabel}
            {activeDay ? <span className="ml-1 font-normal text-zinc-400">· {activeDay.weekday} {activeDay.label}</span> : null}
          </p>
          {timezone ? <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">{timezone}</span> : null}
        </div>
        {activeDay ? (
          <div data-slot-periods className="mt-3 space-y-4">
            {["morning", "afternoon", "evening"].map((period) => {
              const slots = activeDay.slots.filter((slot) => (slot.period || "morning") === period);
              if (!slots.length) return null;
              return (
                <div key={period}>
                  <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">{PERIOD_LABELS[period]}</p>
                  <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
                    {slots.map((slot) => {
                      const isSelected = selected?.dayId === activeDayId && selected?.slotId === slot.id;
                      return (
                        <button
                          key={slot.id}
                          type="button"
                          data-time-slot={slot.id}
                          disabled={slot.disabled}
                          onClick={() => choose(slot)}
                          className={`rounded-lg border px-2 py-2 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-40 ${
                            isSelected
                              ? "border-indigo-600 bg-indigo-50 dark:border-indigo-500 dark:bg-indigo-950/60"
                              : "border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
                          }`}
                        >
                          <span className={`block text-xs font-semibold ${isSelected ? "text-indigo-700 dark:text-indigo-300" : "text-zinc-800 dark:text-zinc-100"}`}>{slot.label}</span>
                          {slot.available != null ? (
                            <span className={`mt-0.5 block text-[10px] ${slot.available > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-zinc-400"}`}>
                              {slot.available > 0 ? `${slot.available} available` : "Fully booked"}
                            </span>
                          ) : null}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        ) : null}
      </div>
    </div>
  );
}
