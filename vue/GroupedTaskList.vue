<script setup lang="ts">
import { ref } from "vue";

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
  class?: string;
}

const props = withDefaults(defineProps<GroupedTaskListProps>(), {
  sections: () => [
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
  detail: () => ({
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
  }),
  addTaskLabel: "Add task…",
  commentPlaceholder: "Add a comment",
  class: "",
});
const emit = defineEmits(["task-click", "section-toggle", "comment-submit"]);

const openSections = ref<string[]>(["todo", "inprogress", "done"]);
const comment = ref("");

const toggle = (sectionId: string) => {
  const isOpen = openSections.value.includes(sectionId);
  openSections.value = isOpen ? openSections.value.filter((s) => s !== sectionId) : [...openSections.value, sectionId];
  emit("section-toggle", sectionId, !isOpen);
};

const fieldCls = (tone?: string) =>
  tone === "rose"
    ? "rounded px-1.5 py-0.5 font-medium bg-red-100 text-red-700 dark:bg-red-950/70 dark:text-red-300"
    : tone === "emerald"
      ? "rounded px-1.5 py-0.5 font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300"
      : "text-zinc-800 dark:text-zinc-100";

const initials = (name: string) =>
  name.split(" ").map((p) => p[0]).join("");
</script>

<template>
  <div data-tasklist class="grid w-full overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm lg:grid-cols-5" :class="props.class">
    <!-- left: grouped list -->
    <div data-tasklist-list class="border-r border-zinc-100 lg:col-span-3 dark:border-zinc-800">
      <div data-tasklist-toolbar class="border-b border-zinc-100 px-4 py-3 dark:border-zinc-800">
        <button data-tasklist-add type="button" class="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-semibold text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800">＋ Add task</button>
      </div>
      <div data-tasklist-name-header class="border-b border-zinc-100 px-4 py-2 text-xs font-medium text-zinc-400 dark:border-zinc-800 dark:text-zinc-500">Name</div>
      <div v-for="section in props.sections" :key="section.id" :data-tasklist-section="section.id">
        <button :data-tasklist-section-toggle="section.id" type="button" class="flex w-full items-center gap-2 px-4 py-2.5 text-left" @click="toggle(section.id)">
          <span aria-hidden="true" class="text-xs text-zinc-400">{{ openSections.includes(section.id) ? "▾" : "▸" }}</span>
          <span class="text-sm font-bold text-zinc-800 dark:text-zinc-100">{{ section.label }}</span>
        </button>
        <ul v-if="openSections.includes(section.id)" data-tasklist-items>
          <li v-for="task in section.tasks" :key="task.id">
            <button
              :data-tasklist-task="task.id"
              type="button"
              class="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/40"
              @click="emit('task-click', task)"
            >
              <span
                aria-hidden="true"
                class="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border text-[9px]"
                :class="task.done ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-zinc-300 text-transparent dark:border-zinc-600'"
              >✓</span>
              <span class="flex-1 truncate" :class="task.done ? 'text-zinc-400 line-through dark:text-zinc-500' : 'text-zinc-800 dark:text-zinc-100'">{{ task.title }}</span>
              <span v-if="task.likes" class="text-[11px] text-zinc-400">👍 {{ task.likes }}</span>
              <span v-if="task.comments" class="text-[11px] text-zinc-400">💬 {{ task.comments }}</span>
              <span v-if="task.subtasks" class="text-[11px] text-zinc-400">⑂ {{ task.subtasks }}</span>
              <span class="w-24 shrink-0 truncate text-right text-[11px] text-zinc-500 dark:text-zinc-400">{{ task.due }}</span>
              <span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-400 text-[10px] font-bold text-amber-950">{{ task.assignee }}</span>
            </button>
          </li>
          <li data-tasklist-add-inline class="px-4 py-2 text-sm text-zinc-400 dark:text-zinc-500">{{ props.addTaskLabel }}</li>
        </ul>
      </div>
    </div>

    <!-- right: detail pane -->
    <div data-tasklist-detail class="space-y-4 p-5 lg:col-span-2">
      <span
        v-if="props.detail.completedLabel"
        data-tasklist-completed
        class="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-300"
      >✓ {{ props.detail.completedLabel }}</span>
      <h2 data-tasklist-title class="text-xl font-bold text-zinc-900 dark:text-zinc-50">{{ props.detail.title }}</h2>

      <div data-tasklist-meta class="space-y-2.5 text-sm">
        <div class="flex items-center gap-3">
          <span class="w-20 text-xs text-zinc-500 dark:text-zinc-400">Assignee</span>
          <span class="flex h-6 w-6 items-center justify-center rounded-full bg-amber-400 text-[10px] font-bold text-amber-950">{{ initials(props.detail.assignee) }}</span>
          <span class="text-zinc-800 dark:text-zinc-100">{{ props.detail.assignee }}</span>
        </div>
        <div class="flex items-center gap-3">
          <span class="w-20 text-xs text-zinc-500 dark:text-zinc-400">Due date</span>
          <span class="text-zinc-800 dark:text-zinc-100">🗓 {{ props.detail.due }}</span>
        </div>
        <div class="flex items-center gap-3">
          <span class="w-20 text-xs text-zinc-500 dark:text-zinc-400">Projects</span>
          <span data-tasklist-project-chip class="inline-flex items-center gap-1.5 rounded-md bg-zinc-100 px-2 py-1 text-xs dark:bg-zinc-800">
            <span class="h-2 w-2 rounded-full bg-sky-500"></span>
            <span class="font-medium text-zinc-800 dark:text-zinc-100">{{ props.detail.project }}</span>
            <span v-if="props.detail.projectStatus" class="text-zinc-400 dark:text-zinc-500">{{ props.detail.projectStatus }}</span>
          </span>
        </div>
      </div>

      <div data-tasklist-fields class="overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800">
        <div
          v-for="(field, i) in props.detail.fields"
          :key="field.label"
          class="grid grid-cols-3 gap-2 px-3 py-2.5 text-xs"
          :class="i > 0 ? 'border-t border-zinc-100 dark:border-zinc-800' : ''"
        >
          <span class="text-zinc-500 dark:text-zinc-400">{{ field.label }}</span>
          <span class="col-span-2" :class="field.tone ? fieldCls(field.tone) : 'text-zinc-800 dark:text-zinc-100'">{{ field.value }}</span>
        </div>
        <div v-if="props.detail.tags && props.detail.tags.length" class="grid grid-cols-3 gap-2 border-t border-zinc-100 px-3 py-2.5 text-xs dark:border-zinc-800">
          <span class="text-zinc-500 dark:text-zinc-400">Tags</span>
          <span class="col-span-2 flex flex-wrap gap-1.5">
            <span v-for="tag in props.detail.tags" :key="tag" class="rounded bg-emerald-100 px-2 py-0.5 font-medium text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300">{{ tag }} ✕</span>
          </span>
        </div>
      </div>

      <p v-if="props.detail.description" data-tasklist-description class="text-xs leading-5 text-zinc-600 dark:text-zinc-300">{{ props.detail.description }}</p>

      <div data-tasklist-comment class="flex items-center gap-2 border-t border-zinc-100 pt-4 dark:border-zinc-800">
        <span aria-hidden="true" class="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-200 text-xs dark:bg-zinc-700">👤</span>
        <input
          data-tasklist-comment-input
          v-model="comment"
          type="text"
          :placeholder="props.commentPlaceholder"
          class="flex-1 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-800 placeholder-zinc-400 outline-none focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-950/60 dark:text-zinc-100"
          @keydown.enter="comment.trim() && (emit('comment-submit', comment), (comment = ''))"
        />
      </div>
    </div>
  </div>
</template>
