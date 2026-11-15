<script setup lang="ts">
import { ref } from "vue";

export interface PrQueueGroup {
  id: string;
  label: string;
  prs: Array<{ id: string; title: string; repo: string; number: number; author: string }>;
}

export interface PrReviewQueueProps {
  groups?: PrQueueGroup[];
  class?: string;
}

const props = withDefaults(defineProps<PrReviewQueueProps>(), {
  groups: () => [
    {
      id: "waiting",
      label: "Waiting for reviewers",
      prs: [{ id: "p1", title: "Add activity feed API", repo: "mini-landing-page", number: 4, author: "Sam Lee" }],
    },
    {
      id: "drafts",
      label: "Drafts",
      prs: [
        { id: "p2", title: "Add user search", repo: "mini-landing-page", number: 7, author: "Sam Lee" },
        { id: "p3", title: "Add frontend for search", repo: "mini-landing-page", number: 6, author: "Sam Lee" },
      ],
    },
  ],
  class: "",
});
defineEmits(["pr-click"]);

const collapsed = ref<Record<string, boolean>>({});
const isCollapsed = (id: string) => collapsed.value[id] ?? false;
const toggle = (id: string) => {
  collapsed.value = { ...collapsed.value, [id]: !isCollapsed(id) };
};
const initials = (author: string) =>
  author.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
</script>

<template>
  <div data-pr-review-queue class="w-full rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900" :class="props.class">
    <div v-for="group in props.groups" :key="group.id" :data-pr-group="group.id" class="border-b border-zinc-200 last:border-b-0 dark:border-zinc-800">
      <button
        type="button"
        :data-pr-group-toggle="group.id"
        class="flex w-full items-center gap-2 px-4 py-2.5 text-left transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/60"
        @click="toggle(group.id)"
      >
        <span data-pr-group-caret class="text-[10px] text-zinc-400 dark:text-zinc-500">{{ isCollapsed(group.id) ? '▶' : '▼' }}</span>
        <span data-pr-group-count class="rounded bg-zinc-100 px-1.5 py-0.5 text-[10px] font-semibold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">{{ group.prs.length }}</span>
        <span data-pr-group-label class="text-xs font-medium text-zinc-700 dark:text-zinc-200">{{ group.label }}</span>
      </button>
      <div v-if="!isCollapsed(group.id)" data-pr-group-items class="pb-2">
        <button
          v-for="pr in group.prs"
          :key="pr.id"
          type="button"
          :data-pr-row="pr.id"
          class="flex w-full items-start gap-3 px-4 py-2 text-left transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800"
          @click="$emit('pr-click', pr)"
        >
          <span data-pr-avatar class="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-[9px] font-semibold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">{{ initials(pr.author) }}</span>
          <span class="min-w-0 flex-1">
            <span data-pr-title class="block truncate text-xs font-medium text-zinc-900 dark:text-zinc-50">{{ pr.title }}</span>
            <span data-pr-meta class="block truncate text-[11px] text-zinc-400 dark:text-zinc-500">{{ pr.author }} · {{ pr.repo }} #{{ pr.number }}</span>
          </span>
        </button>
      </div>
    </div>
  </div>
</template>
