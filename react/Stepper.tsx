import React from "react";
import { UiIcon, type UiIconName } from "./UiIcon";

export type StepperStatus = "complete" | "current" | "upcoming" | "error";

export interface StepperStep {
  id: string;
  label: string;
  description?: string;
  status?: StepperStatus;
}

export interface StepperProps {
  steps: StepperStep[];
  /** 1-based index of the current step; steps before it render complete unless status overrides. */
  current?: number;
  onStepClick?: (step: StepperStep, index: number) => void;
  className?: string;
}

const statusFor = (step: StepperStep, index: number, current: number): StepperStatus =>
  step.status ?? (index + 1 < current ? "complete" : index + 1 === current ? "current" : "upcoming");

const CIRCLE: Record<StepperStatus, { cls: string; icon?: UiIconName }> = {
  complete: { cls: "bg-indigo-600 text-white", icon: "check" },
  current: { cls: "border-2 border-indigo-600 text-indigo-600 dark:text-indigo-400" },
  upcoming: { cls: "border border-zinc-300 text-zinc-400 dark:border-zinc-700" },
  error: { cls: "bg-rose-500 text-white", icon: "x" },
};

export const Stepper: React.FC<StepperProps> = ({ steps, current = 1, onStepClick, className = "" }) => {
  return (
    <ol className={`flex items-start ${className}`}>
      {steps.map((step, index) => {
        const status = statusFor(step, index, current);
        const styles = CIRCLE[status];
        const last = index === steps.length - 1;
        const clickable = onStepClick && status !== "upcoming";
        return (
          <li key={step.id} className={`flex min-w-0 ${last ? "flex-none" : "flex-1"}`}>
            <div className="flex flex-col items-center gap-1.5 text-center">
              <button
                type="button"
                disabled={!clickable}
                onClick={() => clickable && onStepClick?.(step, index)}
                aria-current={status === "current" ? "step" : undefined}
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:cursor-default ${styles.cls}`}
              >
                {styles.icon ? <UiIcon name={styles.icon} size={12} /> : index + 1}
              </button>
              <div className="max-w-28">
                <p
                  className={`text-[11px] font-medium leading-tight ${
                    status === "upcoming"
                      ? "text-zinc-400 dark:text-zinc-500"
                      : "text-zinc-800 dark:text-zinc-100"
                  }`}
                >
                  {step.label}
                </p>
                {step.description && (
                  <p className="mt-0.5 text-[10px] leading-tight text-zinc-400 dark:text-zinc-500">{step.description}</p>
                )}
              </div>
            </div>
            {!last && (
              <span
                aria-hidden="true"
                className={`mt-3.5 h-0.5 flex-1 rounded ${
                  status === "complete" ? "bg-indigo-600" : "bg-zinc-200 dark:bg-zinc-800"
                } ${index === 0 ? "ml-2" : "ml-2"} mr-2`}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
};

export default Stepper;
