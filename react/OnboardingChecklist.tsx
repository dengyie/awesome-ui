import React from "react";
import { UiIcon } from "./UiIcon";

export interface OnboardingTask {
  id: string;
  title: string;
  description?: string;
  done: boolean;
  actionText?: string;
}

export interface OnboardingChecklistProps {
  tasks: OnboardingTask[];
  title?: string;
  onToggle?: (task: OnboardingTask) => void;
  onTaskAction?: (task: OnboardingTask) => void;
  className?: string;
}

export const OnboardingChecklist: React.FC<OnboardingChecklistProps> = ({
  tasks,
  title = "Get started",
  onToggle,
  onTaskAction,
  className = "",
}) => {
  const doneCount = tasks.filter((task) => task.done).length;
  const total = tasks.length;
  const percent = total === 0 ? 0 : Math.round((doneCount / total) * 100);
  const allDone = total > 0 && doneCount === total;

  return (
    <div className={`rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 ${className}`}>
      <div className="border-b border-zinc-100 dark:border-zinc-800 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">{title}</span>
          <span className="ml-auto text-[11px] tabular-nums text-zinc-400 dark:text-zinc-500">
            {doneCount}/{total}
          </span>
        </div>

        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
          <div
            className="h-full rounded-full bg-indigo-600 transition-all duration-300"
            style={{ width: `${percent}%` }}
          />
        </div>

        <div className="mt-2 flex items-center gap-1.5 text-[11px] text-zinc-500 dark:text-zinc-400">
          {allDone ? (
            <>
              <UiIcon name="check-circle" size={12} className="text-emerald-500" />
              <span className="text-emerald-600 dark:text-emerald-400">All set — nothing left to do.</span>
            </>
          ) : (
            <span>
              {percent}% complete · {total - doneCount} left
            </span>
          )}
        </div>
      </div>

      <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
        {tasks.map((task) => (
          <li key={task.id} className="flex items-start gap-3 px-4 py-3">
            <button
              type="button"
              onClick={() => onToggle?.(task)}
              aria-pressed={task.done}
              aria-label={task.done ? `Mark ${task.title} as not done` : `Mark ${task.title} as done`}
              className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                task.done
                  ? "border-emerald-500 bg-emerald-500 text-white"
                  : "border-zinc-300 dark:border-zinc-600 text-transparent hover:border-indigo-500"
              }`}
            >
              <UiIcon name="check" size={10} />
            </button>

            <div className="min-w-0 flex-1">
              <div
                className={`text-xs ${
                  task.done
                    ? "text-zinc-400 dark:text-zinc-500 line-through"
                    : "text-zinc-800 dark:text-zinc-200"
                }`}
              >
                {task.title}
              </div>
              {task.description && (
                <div className="mt-0.5 text-[11px] text-zinc-500 dark:text-zinc-400">{task.description}</div>
              )}
            </div>

            {!task.done && task.actionText && (
              <button
                type="button"
                onClick={() => onTaskAction?.(task)}
                className="shrink-0 rounded-md px-1.5 py-0.5 text-[11px] font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              >
                {task.actionText}
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default OnboardingChecklist;
