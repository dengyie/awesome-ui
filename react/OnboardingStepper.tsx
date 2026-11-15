import React from "react";

export interface StepperSegment {
  label: string;
  description: string;
  /** Optional example rows shown inside the description card. */
  examples?: { label: string; value: string }[];
}

export interface OnboardingStepperProps {
  steps: string[];
  current?: number;
  segments?: StepperSegment[];
  title?: string;
  continueLabel?: string;
  onContinue?: () => void;
  onStepClick?: (index: number) => void;
  className?: string;
}

export const OnboardingStepper: React.FC<OnboardingStepperProps> = ({
  steps,
  current = 0,
  segments = [],
  title = "Transaction types",
  continueLabel = "Continue",
  onContinue,
  onStepClick,
  className = "",
}) => {
  const [activeSegment, setActiveSegment] = React.useState(0);
  const total = steps.length;
  const active = Math.min(Math.max(current, 0), total - 1);
  const segment = segments[Math.min(activeSegment, segments.length - 1)];

  return (
    <div
      data-onboarding-stepper
      className={`rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900 ${className}`}
    >
      {/* Horizontal step chain */}
      <ol className="flex flex-wrap items-center gap-1.5 text-xs" aria-label="Setup steps">
        {steps.map((step, index) => {
          const done = index < active;
          const isCurrent = index === active;
          return (
            <li key={step} className="flex items-center gap-1.5">
              {index > 0 ? (
                <span aria-hidden="true" className="text-zinc-300 dark:text-zinc-700">
                  &gt;
                </span>
              ) : null}
              <button
                type="button"
                data-step-index={index}
                aria-current={isCurrent ? "step" : undefined}
                onClick={() => onStepClick?.(index)}
                className={`rounded-md px-2 py-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                  isCurrent
                    ? "border-b-2 border-indigo-500 font-semibold text-zinc-900 dark:text-zinc-50"
                    : done
                      ? "text-zinc-500 dark:text-zinc-400"
                      : "text-zinc-400"
                }`}
              >
                {step}
              </button>
            </li>
          );
        })}
      </ol>
      <div className="mt-2 h-1 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
        <div
          data-stepper-progress
          className="h-full rounded-full bg-indigo-500 transition-all duration-300"
          style={{ width: `${((active + 1) / total) * 100}%` }}
        />
      </div>

      {/* Segmented control + description card */}
      {segments.length ? (
        <div className="mt-4">
          <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{title}</p>
          <div
            role="tablist"
            aria-label={title}
            className="mt-2 inline-flex rounded-lg bg-zinc-100 p-1 dark:bg-zinc-800"
          >
            {segments.map((seg, index) => (
              <button
                key={seg.label}
                type="button"
                role="tab"
                aria-selected={index === activeSegment}
                data-segment-index={index}
                onClick={() => setActiveSegment(index)}
                className={`rounded-md px-3 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                  index === activeSegment
                    ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-900 dark:text-zinc-50"
                    : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
                }`}
              >
                {seg.label}
              </button>
            ))}
          </div>
          {segment ? (
            <div data-segment-description className="mt-3 rounded-lg border border-zinc-200 p-3 dark:border-zinc-800">
              <p className="text-xs leading-relaxed text-zinc-600 dark:text-zinc-300">{segment.description}</p>
              {segment.examples?.length ? (
                <ul className="mt-3 space-y-2">
                  {segment.examples.map((example, index) => (
                    <li
                      key={`${example.label}-${index}`}
                      className="flex items-center justify-between gap-3 text-xs"
                    >
                      <span className="flex min-w-0 items-center gap-2 text-zinc-700 dark:text-zinc-200">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-[10px] font-bold text-zinc-500 dark:bg-zinc-800 dark:text-zinc-300">
                          {index + 1}
                        </span>
                        <span className="truncate">{example.label}</span>
                      </span>
                      <span className="shrink-0 font-medium tabular-nums text-zinc-900 dark:text-zinc-50">
                        {example.value}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}

      <button
        type="button"
        data-stepper-continue
        onClick={onContinue}
        className="mt-5 w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
      >
        {continueLabel}
      </button>
    </div>
  );
};

export default OnboardingStepper;
