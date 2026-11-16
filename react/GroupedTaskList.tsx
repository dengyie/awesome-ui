/**
 * GroupedTaskList - Grouped task list with a split detail pane: left list
 * with collapsible sections (To Do / In Progress / Done), task rows with
 * completion circle, due date, subtask count and assignee avatar, "Add
 * task…" inline rows; right detail pane with completion badge, title,
 * assignee row, due date row, project chip, fields grid (estimated/actual
 * time, duration, summary, priority, tags) and a comment composer
 * (Asana list view pattern).
 */
import React from "react";

export interface GroupedTask {
  id: string;
  title: string;
  due: string;
  done: boolean;
  subtasks?: number;
  likes?: number;
  comments?: number;
  assignee: string;
}

export interface TaskSection {
  id: string;
  label: string;
  tasks: GroupedTask[];
}

export interface TaskDetail {
  completedLabel?: string;
  title: string;
  assignee: string;
  due: string;
  project: string;
  projectStatus?: string;
  fields: { label: string; value: string; tone?: "rose" | "emerald" | "zinc" }[];
  tags?: string[];
  description?: string;
}

export interface GroupedTaskListProps {
  sections?: TaskSection[];
  detail?: TaskDetail;
  addTaskLabel?: string;
  commentPlaceholder?: string;
  className?: string;
  onTaskClick?: (task: GroupedTask) => void;
  onSectionToggle?: (sectionId: string, open: boolean) => void;
  onCommentSubmit?: (text: string) => void;
}

export default function GroupedTaskList({
  sections = [
    {
      id: "todo",
      label: "To Do",
      tasks: [
        { id: "t1", title: "Prepare Demo Materials", due: "", done: false, subtasks: 1, assignee: "JM" },
        { id: "t2", title: "Align Schedule with Other Divisions", due: "Jan 2, 2026", done: false, assignee: "JM" },
        { id: "t3", title: "Schedule a meeting to define Demo Scope & Key Features", due: "Tuesday", done: false, assignee: "AK" },
      ],
    },
    {
      id: "inprogress",
      label: "In Progress",
      tasks: [
        { id: "t4", title: "Define Product Demo Goal", due: "Tomorrow 3:30pm", done: false, likes: 1, comments: 2, subtasks: 1, assignee: "AK" },
        { id: "t5", title: "Scheduling a quick call with Product Owner", due: "Friday", done: false, assignee: "AK" },
      ],
    },
    {
      id: "done",
      label: "Done",
      tasks: [
        { id: "t6", title: "Scheduling a KickOff Meeting", due: "Dec 19", done: false, assignee: "JM" },
        { id: "t7", title: "Create a Template for Demo Script", due: "Dec 22", done: true, assignee: "AK" },
      ],
    },
  ],
  detail = {
    completedLabel: "Completed",
    title: "Define Product Demo Goal",
    assignee: "Alex Smith",
    due: "Tomorrow 3:30pm",
    project: "Product Demo – A",
    projectStatus: "In Progress",
    fields: [
      { label: "Estimated time", value: "3h 45m" },
      { label: "Actual time", value: "1h 36m" },
      { label: "Duration", value: "-1d 2h" },
      { label: "Task summary", value: "Documented Product Demo A goal including target audience, value message, success criteria & feature scope. Review requested by 8AM." },
      { label: "Priority", value: "High", tone: "rose" },
      { label: "Percent allocation", value: "–" },
    ],
    tags: ["documentation"],
    description: "Document the goal of Product Demo A, including target audience, primary value message, success criteria, and feature scope.",
  },
  addTaskLabel = "Add task…",
  commentPlaceholder = "Add a comment",
  className = "",
  onTaskClick,
  onSectionToggle,
  onCommentSubmit,
}: GroupedTaskListProps) {
  const [openSections, setOpenSections] = React.useState<string[]>([sections[0]?.id ?? "", sections[1]?.id ?? "", sections[2]?.id ?? ""]);
  const [activeTaskId, setActiveTaskId] = React.useState("t4");
  const [comment, setComment] = React.useState("");

  const toggle = (sectionId: string) => {
    setOpenSections((prev) => (prev.includes(sectionId) ? prev.filter((s) => s !== sectionId) : [...prev, sectionId]));
    onSectionToggle?.(sectionId, !openSections.includes(sectionId));
  };

  const valueCls = (tone?: string) =>
    tone === "rose"
      ? "bg-red-100 text-red-700 dark:bg-red-950/70 dark:text-red-300"
      : tone === "emerald"
        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300"
        : "text-zinc-800 dark:text-zinc-100";

  return (
    <div data-tasklist className={`grid w-full overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm lg:grid-cols-5 dark:border-zinc-800 dark:bg-zinc-900 ${className}`}>
      {/* left: grouped list */}
      <div data-tasklist-list className="lg:col-span-3 border-r border-zinc-100 dark:border-zinc-800">
        <div data-tasklist-toolbar className="border-b border-zinc-100 px-4 py-3 dark:border-zinc-800">
          <button data-tasklist-add type="button" className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-semibold text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800">
            ＋ Add task
          </button>
        </div>
        <div data-tasklist-name-header className="border-b border-zinc-100 px-4 py-2 text-xs font-medium text-zinc-400 dark:border-zinc-800 dark:text-zinc-500">
          Name
        </div>
        {sections.map((section) => {
          const open = openSections.includes(section.id);
          return (
            <div key={section.id} data-tasklist-section={section.id}>
              <button
                data-tasklist-section-toggle={section.id}
                type="button"
                onClick={() => toggle(section.id)}
                className="flex w-full items-center gap-2 px-4 py-2.5 text-left"
              >
                <span aria-hidden="true" className="text-xs text-zinc-400">{open ? "▾" : "▸"}</span>
                <span className="text-sm font-bold text-zinc-800 dark:text-zinc-100">{section.label}</span>
              </button>
              {open && (
                <ul data-tasklist-items>
                  {section.tasks.map((task) => {
                    const active = task.id === activeTaskId;
                    return (
                      <li key={task.id}>
                        <button
                          data-tasklist-task={task.id}
                          type="button"
                          onClick={() => {
                            setActiveTaskId(task.id);
                            onTaskClick?.(task);
                          }}
                          className={`flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors ${
                            active ? "bg-sky-50 dark:bg-sky-950/40" : "hover:bg-zinc-50 dark:hover:bg-zinc-800/40"
                          }`}
                        >
                          <span
                            aria-hidden="true"
                            className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border text-[9px] ${
                              task.done
                                ? "border-emerald-500 bg-emerald-500 text-white"
                                : "border-zinc-300 text-transparent dark:border-zinc-600"
                            }`}
                          >
                            ✓
                          </span>
                          <span className={`flex-1 truncate ${task.done ? "text-zinc-400 line-through dark:text-zinc-500" : "text-zinc-800 dark:text-zinc-100"}`}>{task.title}</span>
                          {task.likes ? <span className="text-[11px] text-zinc-400">👍 {task.likes}</span> : null}
                          {task.comments ? <span className="text-[11px] text-zinc-400">💬 {task.comments}</span> : null}
                          {task.subtasks ? <span className="text-[11px] text-zinc-400">⑂ {task.subtasks}</span> : null}
                          <span className="w-24 shrink-0 truncate text-right text-[11px] text-zinc-500 dark:text-zinc-400">{task.due}</span>
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-400 text-[10px] font-bold text-amber-950">{task.assignee}</span>
                        </button>
                      </li>
                    );
                  })}
                  <li data-tasklist-add-inline className="px-4 py-2 text-sm text-zinc-400 dark:text-zinc-500">{addTaskLabel}</li>
                </ul>
              )}
            </div>
          );
        })}
      </div>

      {/* right: detail pane */}
      <div data-tasklist-detail className="space-y-4 lg:col-span-2 p-5">
        {detail.completedLabel && (
          <span data-tasklist-completed className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-300">
            ✓ {detail.completedLabel}
          </span>
        )}
        <h2 data-tasklist-title className="text-xl font-bold text-zinc-900 dark:text-zinc-50">{detail.title}</h2>

        <div data-tasklist-meta className="space-y-2.5 text-sm">
          <div className="flex items-center gap-3">
            <span className="w-20 text-xs text-zinc-500 dark:text-zinc-400">Assignee</span>
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-400 text-[10px] font-bold text-amber-950">{detail.assignee.split(" ").map((p) => p[0]).join("")}</span>
            <span className="text-zinc-800 dark:text-zinc-100">{detail.assignee}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="w-20 text-xs text-zinc-500 dark:text-zinc-400">Due date</span>
            <span className="text-zinc-800 dark:text-zinc-100">🗓 {detail.due}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="w-20 text-xs text-zinc-500 dark:text-zinc-400">Projects</span>
            <span data-tasklist-project-chip className="inline-flex items-center gap-1.5 rounded-md bg-zinc-100 px-2 py-1 text-xs dark:bg-zinc-800">
              <span className="h-2 w-2 rounded-full bg-sky-500"></span>
              <span className="font-medium text-zinc-800 dark:text-zinc-100">{detail.project}</span>
              {detail.projectStatus && <span className="text-zinc-400 dark:text-zinc-500">{detail.projectStatus}</span>}
            </span>
          </div>
        </div>

        <div data-tasklist-fields className="overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800">
          {detail.fields.map((field, i) => (
            <div key={field.label} className={`grid grid-cols-3 gap-2 px-3 py-2.5 text-xs ${i > 0 ? "border-t border-zinc-100 dark:border-zinc-800" : ""}`}>
              <span className="text-zinc-500 dark:text-zinc-400">{field.label}</span>
              <span className={`col-span-2 ${field.tone ? "rounded px-1.5 py-0.5 font-medium " + valueCls(field.tone) : "text-zinc-800 dark:text-zinc-100"}`}>{field.value}</span>
            </div>
          ))}
          {detail.tags && detail.tags.length > 0 && (
            <div className="grid grid-cols-3 gap-2 border-t border-zinc-100 px-3 py-2.5 text-xs dark:border-zinc-800">
              <span className="text-zinc-500 dark:text-zinc-400">Tags</span>
              <span className="col-span-2 flex flex-wrap gap-1.5">
                {detail.tags.map((tag) => (
                  <span key={tag} className="rounded bg-emerald-100 px-2 py-0.5 font-medium text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300">{tag} ✕</span>
                ))}
              </span>
            </div>
          )}
        </div>

        {detail.description && (
          <p data-tasklist-description className="text-xs leading-5 text-zinc-600 dark:text-zinc-300">{detail.description}</p>
        )}

        <div data-tasklist-comment className="flex items-center gap-2 border-t border-zinc-100 pt-4 dark:border-zinc-800">
          <span aria-hidden="true" className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-200 text-xs dark:bg-zinc-700">👤</span>
          <input
            data-tasklist-comment-input
            type="text"
            value={comment}
            placeholder={commentPlaceholder}
            onChange={(e) => setComment(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && comment.trim()) {
                onCommentSubmit?.(comment);
                setComment("");
              }
            }}
            className="flex-1 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-800 placeholder-zinc-400 outline-none focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-950/60 dark:text-zinc-100"
          />
        </div>
      </div>
    </div>
  );
}
