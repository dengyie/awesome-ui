import React from "react";
import { UiIcon } from "./UiIcon";

export interface SetupSection {
  id: string;
  title: string;
  tasks: { id: string; label: string; done: boolean; href?: string }[];
}

export interface UpNextCard {
  id: string;
  title: string;
  description?: string;
}

export interface WorkspaceSetupPanelProps {
  title?: string;
  sections: SetupSection[];
  upNext?: UpNextCard[];
  className?: string;
  onTaskClick?: (section: SetupSection, task: SetupSection["tasks"][number]) => void;
  onUpNext?: (card: UpNextCard) => void;
}

/**
 * WorkspaceSetupPanel - Customer.io "Workspace setup" panel: per-section
 * checklists with strikethrough completed rows and per-task link arrows,
 * plus an optional "Up next" card grid for the following actions.
 */
export const WorkspaceSetupPanel: React.FC<WorkspaceSetupPanelProps> = ({
  title = "Workspace setup",
  sections,
  upNext = [],
  className = "",
  onTaskClick,
  onUpNext,
}) => {
  const total = sections.reduce((sum, s) => sum + s.tasks.length, 0);
  const done = sections.reduce(
    (sum, s) => sum + s.tasks.filter((t) => t.done).length,
    0
  );
  const allDone = total > 0 && done === total;

  return (
    <div
      data-workspace-setup
      className={`rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 ${className}`}
    >
      <div className="border-b border-zinc-100 dark:border-zinc-800 px-5 py-4">
        <h4 data-workspace-setup-title className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
          {title}
        </h4>
        <p data-workspace-setup-count className="mt-0.5 text-[11px] text-zinc-500 dark:text-zinc-400">
          {allDone ? "All steps complete — your workspace is ready." : `${done} of ${total} steps complete`}
        </p>
      </div>

      <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
        {sections.map((section) => {
          const sectionDone = section.tasks.filter((t) => t.done).length;
          return (
            <div key={section.id} data-workspace-setup-section={section.id} className="px-5 py-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">{section.title}</span>
                <span
                  data-workspace-setup-section-count={section.id}
                  className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium tabular-nums ${
                    sectionDone === section.tasks.length
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400"
                      : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
                  }`}
                >
                  {sectionDone}/{section.tasks.length}
                </span>
              </div>
              <ul className="mt-2 space-y-1.5">
                {section.tasks.map((task) => (
                  <li key={task.id} data-workspace-setup-task={task.id}>
                    <button
                      type="button"
                      onClick={() => onTaskClick?.(section, task)}
                      className="flex w-full items-center gap-2 rounded-md px-1 py-0.5 text-left transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                    >
                      <span
                        className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border ${
                          task.done
                            ? "border-emerald-500 bg-emerald-500 text-white"
                            : "border-zinc-300 dark:border-zinc-600"
                        }`}
                      >
                        {task.done && <UiIcon name="check" size={8} />}
                      </span>
                      <span
                        className={`min-w-0 flex-1 truncate text-xs ${
                          task.done
                            ? "text-zinc-400 dark:text-zinc-500 line-through"
                            : "text-zinc-700 dark:text-zinc-200"
                        }`}
                      >
                        {task.label}
                      </span>
                      {!task.done && (
                        <UiIcon
                          name="arrow-right"
                          size={12}
                          className="shrink-0 text-zinc-300 dark:text-zinc-600"
                        />
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      {upNext.length > 0 && (
        <div className="border-t border-zinc-100 dark:border-zinc-800 px-5 py-4">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
            Up next
          </div>
          <div data-workspace-setup-up-next className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
            {upNext.map((card) => (
              <button
                key={card.id}
                type="button"
                data-workspace-setup-next-card={card.id}
                onClick={() => onUpNext?.(card)}
                className="rounded-lg border border-zinc-200 dark:border-zinc-700 px-3 py-2.5 text-left transition-colors hover:border-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              >
                <div className="text-xs font-medium text-zinc-800 dark:text-zinc-200">{card.title}</div>
                {card.description && (
                  <div className="mt-0.5 text-[11px] text-zinc-500 dark:text-zinc-400">{card.description}</div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkspaceSetupPanel;
