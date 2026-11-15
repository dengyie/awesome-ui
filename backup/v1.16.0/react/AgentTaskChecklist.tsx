import React from "react";
import { UiIcon, UiIconName } from "./UiIcon";

export interface AgentTaskItem {
  id: string | number;
  label: string;
  status: "pending" | "active" | "done";
}

export interface AgentTaskChecklistProps {
  items: AgentTaskItem[];
  title?: string;
  onToggle?: (id: string | number) => void;
  className?: string;
}

const STATUS_ICON: Record<AgentTaskItem["status"], { icon: UiIconName; cls: string }> = {
  pending: { icon: "square", cls: "text-zinc-300 dark:text-zinc-600" },
  active: { icon: "loader", cls: "text-indigo-500 animate-spin" },
  done: { icon: "check-circle", cls: "text-emerald-500" },
};

export const AgentTaskChecklist: React.FC<AgentTaskChecklistProps> = ({
  items = [],
  title = "Tasks",
  onToggle,
  className = "",
}) => {
  const doneCount = items.filter((i) => i.status === "done").length;

  return (
    <div className={`rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 overflow-hidden ${className}`}>
      <div className="flex items-center gap-2 px-3.5 py-2.5 border-b border-zinc-100 dark:border-zinc-800 text-sm font-semibold text-zinc-800 dark:text-zinc-200">
        <UiIcon name="layers" size={14} className="text-zinc-400" />
        {title}
        <span className="ml-auto text-[11px] font-mono font-normal text-zinc-400">
          {doneCount}/{items.length}
        </span>
      </div>
      <ul className="p-1.5 space-y-0.5">
        {items.map((item) => {
          const meta = STATUS_ICON[item.status] || STATUS_ICON.pending;
          const isDone = item.status === "done";
          return (
            <li key={item.id}>
              <div
                role={onToggle ? "button" : undefined}
                tabIndex={onToggle ? 0 : undefined}
                onClick={onToggle ? () => onToggle(item.id) : undefined}
                onKeyDown={
                  onToggle
                    ? (e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          onToggle(item.id);
                        }
                      }
                    : undefined
                }
                className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-colors ${
                  onToggle ? "cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/60" : ""
                } ${isDone ? "text-zinc-400 dark:text-zinc-500" : "text-zinc-700 dark:text-zinc-300"}`}
              >
                <UiIcon name={meta.icon} size={15} className={`shrink-0 ${meta.cls}`} />
                <span className={`flex-1 min-w-0 truncate ${isDone ? "line-through" : ""}`}>{item.label}</span>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
export default AgentTaskChecklist;
