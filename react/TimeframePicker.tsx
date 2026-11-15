import React from "react";
import { UiIcon } from "./UiIcon";

export interface TimeframePickerProps {
  presets?: string[];
  value?: string;
  rangeLabel?: string;
  disabled?: boolean;
  onChange?: (value: string) => void;
  onStep?: (direction: -1 | 1, value: string) => void;
  className?: string;
}

export const TimeframePicker: React.FC<TimeframePickerProps> = ({
  presets = ["Today", "7d", "30d", "90d", "12mo"],
  value,
  rangeLabel,
  disabled = false,
  onChange,
  onStep,
  className = "",
}) => {
  const current = value ?? presets[0] ?? "";

  return (
    <div
      data-timeframe-picker
      role="group"
      aria-label="Timeframe"
      className={`flex flex-wrap items-center gap-2 ${className}`}
    >
      <div className="flex items-center overflow-hidden rounded-lg border border-zinc-300 bg-white dark:border-zinc-700 dark:bg-zinc-900">
        {presets.map((preset) => {
          const active = preset === current;
          return (
            <button
              key={preset}
              type="button"
              data-preset={preset}
              aria-pressed={active ? "true" : "false"}
              disabled={disabled}
              onClick={() => onChange?.(preset)}
              className={`px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-500 ${
                active
                  ? "bg-indigo-600 text-white"
                  : "text-zinc-600 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-800/60"
              } ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
            >
              {preset}
            </button>
          );
        })}
      </div>
      <div className="flex items-center overflow-hidden rounded-lg border border-zinc-300 bg-white dark:border-zinc-700 dark:bg-zinc-900">
        <button
          type="button"
          data-step="-1"
          aria-label="Previous period"
          disabled={disabled}
          onClick={() => onStep?.(-1, current)}
          className="px-2 py-1.5 text-zinc-500 transition-colors hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-500 dark:text-zinc-400 dark:hover:bg-zinc-800/60"
        >
          <UiIcon name="chevron-left" size={13} />
        </button>
        {rangeLabel ? (
          <span className="flex items-center gap-1.5 border-x border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-700 dark:border-zinc-800 dark:text-zinc-200">
            <UiIcon name="calendar" size={12} className="text-zinc-400" />
            {rangeLabel}
          </span>
        ) : null}
        <button
          type="button"
          data-step="1"
          aria-label="Next period"
          disabled={disabled}
          onClick={() => onStep?.(1, current)}
          className="px-2 py-1.5 text-zinc-500 transition-colors hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-500 dark:text-zinc-400 dark:hover:bg-zinc-800/60"
        >
          <UiIcon name="chevron-right" size={13} />
        </button>
      </div>
    </div>
  );
};

export default TimeframePicker;
