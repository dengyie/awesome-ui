<script setup lang="ts">
import { ref } from "vue";

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
  class?: string;
}

const props = withDefaults(defineProps<TaskDetailPanelProps>(), {
  type: "Milestone",
  title: "Complete Dashboard Feature Screens",
  aiBarText: "Ask Brain to",
  aiBarActions: () => ["create a summary", "generate subtasks", "find similar milestones"],
  statusLabel: "IN DEVELOPMENT",
  fields: () => [
    { label: "Assignees", value: "J", icon: "person" },
    { label: "Dates", value: "Yesterday → 10/31/25", icon: "calendar" },
    { label: "Priority", value: "Normal", icon: "flag" },
    { label: "Time estimate", value: "1h", icon: "clock" },
    { label: "Sprint points", value: "Empty", icon: "target" },
    { label: "Tags", value: "dashboard", icon: "tag", tag: true },
  ],
  description: "Finalize all design deliverables for the Dashboard feature. This includes ensuring layout compositions, maintaining component consistency, and applying visual polish. This milestone marks the completion of all Dashboard-related UI screens, ready for review and developer handoff.",
  actions: () => [
    { id: "fields", icon: "fields", label: "Custom Fields" },
    { id: "subtask", icon: "subtask", label: "Add subtask" },
    { id: "relate", icon: "relate", label: "Relate items or add dependencies" },
    { id: "checklist", icon: "checklist", label: "Create checklist" },
    { id: "attach", icon: "attach", label: "Attach file" },
  ],
  activityTitle: "Activity",
  activity: () => [
    { id: "a1", actor: "You", text: "tracked time · 1m on Oct 22", time: "1 hour ago" },
  ],
  commentPlaceholder: "Write a comment...",
  class: "",
});
const emit = defineEmits(["action-click", "comment-submit"]);

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
const iconFor = (name?: string) => ACTION_ICONS[name ?? ""] ?? "•";

const comment = ref("");
const submit = () => {
  const text = comment.value.trim();
  if (!text) return;
  emit("comment-submit", text);
  comment.value = "";
};
</script>

<template>
  <div data-task-panel class="flex w-full overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900" :class="props.class">
    <div data-task-main class="min-w-0 flex-1">
      <div data-task-header class="flex items-center justify-between border-b border-zinc-100 px-6 py-3 dark:border-zinc-800">
        <div class="flex items-center gap-3">
          <button data-task-type class="flex items-center gap-1.5 rounded-lg border border-zinc-200 px-3 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800">
            <span aria-hidden="true">◆</span> {{ props.type }} <span aria-hidden="true" class="text-zinc-400">▾</span>
          </button>
        </div>
        <div class="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
          <span data-task-created class="hidden sm:inline">Created on Oct 21</span>
          <button data-task-ai class="flex items-center gap-1 rounded-lg px-2 py-1 font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800">✦ Ask AI</button>
          <button data-task-share class="flex items-center gap-1 rounded-lg px-2 py-1 font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800">Share</button>
        </div>
      </div>

      <div class="px-6 py-5">
        <h2 data-task-title class="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">{{ props.title }}</h2>

        <div data-task-ai-bar class="mt-4 flex flex-wrap items-center gap-1.5 rounded-xl bg-zinc-50 px-4 py-3 text-sm text-zinc-600 dark:bg-zinc-800/60 dark:text-zinc-300">
          <span aria-hidden="true">✦</span>
          <span>{{ props.aiBarText }}</span>
          <template v-for="(label, i) in props.aiBarActions" :key="label">
            <button :data-task-ai-action="label" class="font-medium text-zinc-800 underline-offset-2 hover:underline dark:text-zinc-100">{{ label }}</button>
            <span v-if="i < props.aiBarActions.length - 1" class="text-zinc-400 dark:text-zinc-500">or</span>
          </template>
        </div>

        <div data-task-fields class="mt-6 grid grid-cols-1 gap-x-10 gap-y-4 sm:grid-cols-2">
          <div data-task-field="Status" class="flex items-center gap-3">
            <span class="flex w-36 shrink-0 items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400"><span aria-hidden="true">◎</span> Status</span>
            <button data-task-status class="flex items-center gap-1 rounded-md bg-sky-500 px-2.5 py-1 text-xs font-bold tracking-wide text-white">
              {{ props.statusLabel }} <span aria-hidden="true">▸</span>
            </button>
          </div>
          <div v-for="field in props.fields" :key="field.label" :data-task-field="field.label" class="flex items-center gap-3">
            <span class="flex w-36 shrink-0 items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400"><span aria-hidden="true">{{ iconFor(field.icon) }}</span> {{ field.label }}</span>
            <span
              v-if="field.tag"
              :data-task-field-value="field.value"
              class="rounded bg-violet-100 px-2 py-0.5 text-xs font-medium text-violet-700 dark:bg-violet-950/70 dark:text-violet-300"
            >{{ field.value }}</span>
            <span v-else :data-task-field-value="field.value" class="truncate text-sm text-zinc-800 dark:text-zinc-100">{{ field.value }}</span>
          </div>
        </div>

        <div data-task-description class="mt-6 border-t border-zinc-100 pt-5 dark:border-zinc-800">
          <p class="text-sm leading-6 text-zinc-700 dark:text-zinc-200">{{ props.description }}</p>
          <p class="mt-2 text-sm text-zinc-400 dark:text-zinc-500">Empty. Click or drag text/images inside</p>
        </div>

        <div data-task-actions class="mt-6 space-y-1">
          <button
            v-for="action in props.actions"
            :key="action.id"
            :data-task-action="action.id"
            type="button"
            class="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left text-sm text-zinc-700 transition-colors hover:bg-zinc-50 dark:text-zinc-200 dark:hover:bg-zinc-800/60"
            @click="emit('action-click', action)"
          >
            <span aria-hidden="true" class="text-zinc-400 dark:text-zinc-500">{{ iconFor(action.icon) }}</span>
            {{ action.label }}
          </button>
        </div>
      </div>
    </div>

    <div data-task-activity class="hidden w-72 shrink-0 flex-col border-l border-zinc-100 md:flex dark:border-zinc-800">
      <div class="flex items-center justify-between px-5 py-3.5">
        <p data-task-activity-title class="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{{ props.activityTitle }}</p>
        <span class="text-sm text-zinc-400 dark:text-zinc-500">🔔 1 🔍 ≡</span>
      </div>
      <div class="flex-1 space-y-3 px-5">
        <button data-task-activity-more class="flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"><span aria-hidden="true">›</span> Show more</button>
        <div v-for="item in props.activity" :key="item.id" :data-task-activity-item="item.id" class="flex items-start justify-between gap-3 text-sm">
          <div class="min-w-0">
            <p class="text-zinc-800 dark:text-zinc-100"><span class="mr-1 text-zinc-400" aria-hidden="true">•</span>{{ item.actor }} {{ item.text }}</p>
            <p class="mt-0.5 text-xs text-zinc-400 dark:text-zinc-500">⏱ {{ item.time }}</p>
          </div>
          <span class="shrink-0 text-xs text-zinc-400 dark:text-zinc-500">{{ item.time }}</span>
        </div>
      </div>
      <div data-task-comment class="border-t border-zinc-100 px-4 py-3 dark:border-zinc-800">
        <div class="mb-2 flex gap-4 text-sm">
          <button data-task-comment-tab class="border-b-2 border-zinc-900 pb-1 font-medium text-zinc-900 dark:border-zinc-100 dark:text-zinc-50">Comment</button>
          <button data-task-comment-tab-alt class="pb-1 text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200">Email</button>
        </div>
        <textarea
          v-model="comment"
          data-task-comment-input
          :placeholder="props.commentPlaceholder"
          rows="2"
          class="w-full resize-none rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-800 outline-none placeholder:text-zinc-400 focus:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-zinc-600"
        />
        <div class="mt-2 flex items-center justify-between">
          <span class="text-sm text-zinc-400 dark:text-zinc-500">＋ ✦ @ 📎 ⋯</span>
          <button data-task-comment-send type="button" class="rounded-lg px-2 py-1 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200" aria-label="Send comment" @click="submit">➤</button>
        </div>
      </div>
    </div>
  </div>
</template>
