import React from "react";
import { UiIcon } from "./UiIcon";

export interface WizardStep {
  label: string;
  hint?: string;
  optional?: boolean;
}

export interface WizardStepsProps {
  steps: WizardStep[];
  current: number;
  variant?: "vertical" | "bar";
  nextLabel?: string;
  onStepClick?: (index: number) => void;
  className?: string;
}

export const WizardSteps: React.FC<WizardStepsProps> = ({
  steps,
  current,
  variant = "vertical",
  nextLabel,
  onStepClick,
  className = "",
}) => {
  const total = steps.length;
  const progress = total ? Math.round(((current + 1) / total) * 100) : 0;
  const nextStep = steps[current + 1];

  if (variant === "bar") {
    return (
      <div
        data-wizard-steps
        role="group"
        aria-label="Wizard progress"
        className={`flex flex-col gap-2 ${className}`}
      >
        <p className="flex flex-wrap items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400">
          <span className="font-semibold text-zinc-900 dark:text-zinc-50">
            {current + 1} of {total} steps
          </span>
          {nextStep ? (
            <>
              <span aria-hidden="true" className="text-zinc-300 dark:text-zinc-700">|</span>
              <span>Next: {nextStep.label}</span>
            </>
          ) : null}
        </p>
        <div
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={total}
          aria-valuenow={current + 1}
          className="h-2 overflow-hidden rounded-full bg-violet-100 dark:bg-violet-950/50"
        >
          <div
            className="h-full rounded-full bg-violet-600 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    );
  }

  return (
    <ol data-wizard-steps className={`flex flex-col ${className}`}>
      {steps.map((step, index) => {
        const state = index < current ? "done" : index === current ? "active" : "todo";
        const isLast = index === total - 1;
        const interactive = typeof onStepClick === "function" && index <= current;
        return (
          <li
            key={`${step.label}-${index}`}
            className="relative flex gap-3 pb-4 last:pb-0"
          >
            {!isLast ? (
              <span
                aria-hidden="true"
                className={`absolute left-[13px] top-7 bottom-0 w-px ${
                  index < current ? "bg-emerald-500" : "bg-zinc-200 dark:bg-zinc-700"
                }`}
              />
            ) : null}
            <button
              type="button"
              data-step-index={index}
              disabled={!interactive}
              onClick={() => onStepClick?.(index)}
              aria-current={state === "active" ? "step" : undefined}
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-[11px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                state === "done"
                  ? "border-emerald-500 bg-emerald-500 text-white"
                  : state === "active"
                    ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-50 dark:bg-zinc-50 dark:text-zinc-900"
                    : "border-zinc-300 bg-white text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400"
              } ${interactive ? "cursor-pointer" : "cursor-default"}`}
            >
              {state === "done" ? <UiIcon name="check" size={13} /> : index + 1}
            </button>
            <span className="min-w-0 pt-1">
              <span
                className={`block truncate text-sm font-medium ${
                  state === "active"
                    ? "text-zinc-900 dark:text-zinc-50"
                    : state === "done"
                      ? "text-zinc-700 dark:text-zinc-300"
                      : "text-zinc-500 dark:text-zinc-400"
                }`}
              >
                {step.label}
                {step.optional ? (
                  <span className="ml-1.5 text-xs font-normal text-zinc-400">(Optional)</span>
                ) : null}
              </span>
              {step.hint ? (
                <span className="mt-0.5 block truncate text-xs text-zinc-400">{step.hint}</span>
              ) : null}
            </span>
          </li>
        );
      })}
      {nextLabel ? (
        <li className="pt-1 pl-10 text-xs text-zinc-400">{nextLabel}</li>
      ) : null}
    </ol>
  );
};

export default WizardSteps;
