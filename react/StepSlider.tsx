import React from "react";

export interface StepSliderProps {
  /** Discrete stops, e.g. ["+0k", "+1k", "+5k"]. */
  steps: string[];
  /** Zero-based selected index. */
  value?: number;
  onChange?: (index: number, step: string) => void;
  /** Marks steps from index+1 as emphasized (paid tiers). */
  highlightFrom?: number;
  label?: string;
  disabled?: boolean;
  className?: string;
}

export const StepSlider: React.FC<StepSliderProps> = ({
  steps,
  value = 0,
  onChange,
  highlightFrom,
  label,
  disabled = false,
  className = "",
}) => {
  const count = steps.length;
  const lastIndex = count - 1;
  const ratio = count > 1 ? value / lastIndex : 0;
  const highlightIndex = highlightFrom === undefined ? lastIndex + 1 : highlightFrom;

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <p className="mb-2 text-xs font-medium text-zinc-800 dark:text-zinc-200">{label}</p>
      )}
      <div
        role="slider"
        tabIndex={disabled ? -1 : 0}
        aria-label={label || "Step slider"}
        aria-valuemin={0}
        aria-valuemax={lastIndex}
        aria-valuenow={value}
        aria-valuetext={steps[value]}
        aria-disabled={disabled || undefined}
        onKeyDown={(event) => {
          if (disabled) return;
          if (event.key === "ArrowRight" && value < lastIndex) onChange?.(value + 1, steps[value + 1]);
          if (event.key === "ArrowLeft" && value > 0) onChange?.(value - 1, steps[value - 1]);
          if (event.key === "Home") onChange?.(0, steps[0]);
          if (event.key === "End") onChange?.(lastIndex, steps[lastIndex]);
        }}
        className="group relative flex cursor-pointer items-center pb-1 focus-visible:outline-none"
      >
        {/* Track */}
        <span className="absolute left-0 right-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-zinc-200 dark:bg-zinc-700" />
        {/* Filled portion */}
        <span
          className="absolute left-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-indigo-600 transition-[width] duration-150"
          style={{ width: `${ratio * 100}%` }}
        />
        {/* Click targets + stops */}
        {steps.map((step, index) => {
          const reached = index <= value;
          const highlighted = index >= highlightIndex;
          return (
            <button
              key={step + index}
              type="button"
              disabled={disabled}
              aria-label={step}
              aria-pressed={index === value}
              onClick={(event) => {
                event.stopPropagation();
                onChange?.(index, step);
              }}
              className="relative z-10 flex flex-1 flex-col items-center focus-visible:outline-none"
            >
              <span
                className={`h-3 w-3 rounded-full border-2 transition-colors ${
                  reached
                    ? "border-indigo-600 bg-indigo-600"
                    : highlighted
                      ? "border-indigo-300 bg-white dark:border-indigo-700 dark:bg-zinc-900"
                      : "border-zinc-300 bg-white dark:border-zinc-600 dark:bg-zinc-900"
                } ${disabled ? "opacity-50" : ""}`}
              />
              <span
                className={`mt-1.5 whitespace-nowrap font-mono text-[10px] ${
                  index === value
                    ? "font-semibold text-indigo-600 dark:text-indigo-400"
                    : "text-zinc-400"
                }`}
              >
                {step}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
export default StepSlider;
