/**
 * TaskDetailPanel - Task/milestone detail sidebar: header with type pill and
 * AI summary bar, status pill with two-column field grid (assignees, dates,
 * priority, time estimate, sprint points, tags), collapsible description,
 * action list and an activity column with comment box
 * (ClickUp task detail pattern).
 */
import React from "react";

export interface TaskField {
  label: string;
  value: string;
  icon?: string;
  tag?: boolean;
}

export interface TaskAction {
  id: string;
  icon: string;
  label: string;
}

export interface TaskActivityItem {
  id: string;
  actor: string;
  text: string;
  time: string;
}

export interface TaskDetailPanelProps {
  type?: string;
  title?: string;
  aiBarText?: string;
  aiBarActions?: string[];
  statusLabel?: string;
  fields?: TaskField[];
  description?: string;
  actions?: TaskAction[];
  activityTitle?: string;
  activity?: TaskActivityItem[];
  commentPlaceholder?: string;
  className?: string;
  onActionClick?: (action: TaskAction) => void;
  onCommentSubmit?: (text: string) => void;
}

const ACTION_ICONS: Record<string, string> = {
  fields: "▤",
  subtask: "⑂",
  relate: "⤱",
  checklist: "☑",
  attach: "📎",
  link: "🔗",
  clock: "⏱",
  target: "◎",
  calendar: "📅",
  flag: "⚑",
  tag: "🏷",
  person: "👤",
};

export default function TaskDetailPanel({
  type = "Milestone",
  title = "Complete Dashboard Feature Screens",
  aiBarText = "Ask Brain to",
  aiBarActions = ["create a summary", "generate subtasks", "find similar milestones"],
  statusLabel = "IN DEVELOPMENT",
  fields = [
    { label: "Assignees", value: "J", icon: "person" },
    { label: "Dates", value: "Yesterday → 10/31/25", icon: "calendar" },
    { label: "Priority", value: "Normal", icon: "flag" },
    { label: "Time estimate", value: "1h", icon: "clock" },
    { label: "Sprint points", value: "Empty", icon: "target" },
    { label: "Tags", value: "dashboard", icon: "tag", tag: true },
  ],
  description = "Finalize all design deliverables for the Dashboard feature. This includes ensuring layout compositions, maintaining component consistency, and applying visual polish. This milestone marks the completion of all Dashboard-related UI screens, ready for review and developer handoff.",
  actions = [
    { id: "fields", icon: "fields", label: "Custom Fields" },
    { id: "subtask", icon: "subtask", label: "Add subtask" },
    { id: "relate", icon: "relate", label: "Relate items or add dependencies" },
    { id: "checklist", icon: "checklist", label: "Create checklist" },
    { id: "attach", icon: "attach", label: "Attach file" },
  ],
  activityTitle = "Activity",
  activity = [
    { id: "a1", actor: "You", text: "tracked time · 1m on Oct 22", time: "1 hour ago" },
  ],
  commentPlaceholder = "Write a comment...",
  className = "",
  onActionClick,
  onCommentSubmit,
}: TaskDetailPanelProps) {
  const [comment, setComment] = React.useState("");

  const submit = () => {
    const text = comment.trim();
    if (!text) return;
    onCommentSubmit?.(text);
    setComment("");
  };

  return (
    <div data-task-panel className={`flex w-full overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900 ${className}`}>
      {/* main column */}
      <div data-task-main className="min-w-0 flex-1">
        <div data-task-header className="flex items-center justify-between border-b border-zinc-100 px-6 py-3 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <button data-task-type className="flex items-center gap-1.5 rounded-lg border border-zinc-200 px-3 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800">
              <span aria-hidden="true">◆</span> {type} <span aria-hidden="true" className="text-zinc-400">▾</span>
            </button>
          </div>
          <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
            <span data-task-created className="hidden sm:inline">Created on Oct 21</span>
            <button data-task-ai className="flex items-center gap-1 rounded-lg px-2 py-1 font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800">✦ Ask AI</button>
            <button data-task-share className="flex items-center gap-1 rounded-lg px-2 py-1 font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800">Share</button>
          </div>
        </div>

        <div className="px-6 py-5">
          <h2 data-task-title className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">{title}</h2>

          <div data-task-ai-bar className="mt-4 flex flex-wrap items-center gap-1.5 rounded-xl bg-zinc-50 px-4 py-3 text-sm text-zinc-600 dark:bg-zinc-800/60 dark:text-zinc-300">
            <span aria-hidden="true">✦</span>
            <span>{aiBarText}</span>
            {aiBarActions.map((label, i) => (
              <React.Fragment key={label}>
                <button data-task-ai-action={label} className="font-medium text-zinc-800 underline-offset-2 hover:underline dark:text-zinc-100">{label}</button>
                {i < aiBarActions.length - 1 && <span className="text-zinc-400 dark:text-zinc-500">or</span>}
              </React.Fragment>
            ))}
          </div>

          <div data-task-fields className="mt-6 grid grid-cols-1 gap-x-10 gap-y-4 sm:grid-cols-2">
            <div data-task-field="Status" className="flex items-center gap-3">
              <span className="flex w-36 shrink-0 items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400"><span aria-hidden="true">◎</span> Status</span>
              <button data-task-status className="flex items-center gap-1 rounded-md bg-sky-500 px-2.5 py-1 text-xs font-bold tracking-wide text-white">
                {statusLabel} <span aria-hidden="true">▸</span>
              </button>
            </div>
            {fields.map((field) => (
              <div key={field.label} data-task-field={field.label} className="flex items-center gap-3">
                <span className="flex w-36 shrink-0 items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400"><span aria-hidden="true">{ACTION_ICONS[field.icon ?? ""] ?? "•"}</span> {field.label}</span>
                {field.tag ? (
                  <span data-task-field-value={field.value} className="rounded bg-violet-100 px-2 py-0.5 text-xs font-medium text-violet-700 dark:bg-violet-950/70 dark:text-violet-300">{field.value}</span>
                ) : (
                  <span data-task-field-value={field.value} className="truncate text-sm text-zinc-800 dark:text-zinc-100">{field.value}</span>
                )}
              </div>
            ))}
          </div>

          <div data-task-description className="mt-6 border-t border-zinc-100 pt-5 dark:border-zinc-800">
            <p className="text-sm leading-6 text-zinc-700 dark:text-zinc-200">{description}</p>
            <p className="mt-2 text-sm text-zinc-400 dark:text-zinc-500">Empty. Click or drag text/images inside</p>
          </div>

          <div data-task-actions className="mt-6 space-y-1">
            {actions.map((action) => (
              <button
                key={action.id}
                data-task-action={action.id}
                type="button"
                onClick={() => onActionClick?.(action)}
                className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left text-sm text-zinc-700 transition-colors hover:bg-zinc-50 dark:text-zinc-200 dark:hover:bg-zinc-800/60"
              >
                <span aria-hidden="true" className="text-zinc-400 dark:text-zinc-500">{ACTION_ICONS[action.icon] ?? "•"}</span>
                {action.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* activity column */}
      <div data-task-activity className="hidden w-72 shrink-0 flex-col border-l border-zinc-100 md:flex dark:border-zinc-800">
        <div className="flex items-center justify-between px-5 py-3.5">
          <p data-task-activity-title className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{activityTitle}</p>
          <span className="text-sm text-zinc-400 dark:text-zinc-500">🔔 1 🔍 ≡</span>
        </div>
        <div className="flex-1 space-y-3 px-5">
          <button data-task-activity-more className="flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"><span aria-hidden="true">›</span> Show more</button>
          {activity.map((item) => (
            <div key={item.id} data-task-activity-item={item.id} className="flex items-start justify-between gap-3 text-sm">
              <div className="min-w-0">
                <p className="text-zinc-800 dark:text-zinc-100"><span className="mr-1 text-zinc-400" aria-hidden="true">•</span>{item.actor} {item.text}</p>
                <p className="mt-0.5 text-xs text-zinc-400 dark:text-zinc-500">⏱ {item.time}</p>
              </div>
              <span className="shrink-0 text-xs text-zinc-400 dark:text-zinc-500">{item.time}</span>
            </div>
          ))}
        </div>
        <div data-task-comment className="border-t border-zinc-100 px-4 py-3 dark:border-zinc-800">
          <div className="mb-2 flex gap-4 text-sm">
            <button data-task-comment-tab className="border-b-2 border-zinc-900 pb-1 font-medium text-zinc-900 dark:border-zinc-100 dark:text-zinc-50">Comment</button>
            <button data-task-comment-tab-alt className="pb-1 text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200">Email</button>
          </div>
          <textarea
            data-task-comment-input
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={commentPlaceholder}
            rows={2}
            className="w-full resize-none rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-800 outline-none placeholder:text-zinc-400 focus:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-zinc-600"
          />
          <div className="mt-2 flex items-center justify-between">
            <span className="text-sm text-zinc-400 dark:text-zinc-500">＋ ✦ @ 📎 ⋯</span>
            <button data-task-comment-send type="button" onClick={submit} className="rounded-lg px-2 py-1 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200" aria-label="Send comment">➤</button>
          </div>
        </div>
      </div>
    </div>
  );
}
