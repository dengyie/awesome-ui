<script setup lang="ts">
export interface CampsiteHandoffItem {
  id: string;
  label: string;
  done?: boolean;
  assignee?: string;
  due?: string;
}

export interface CampsiteHandoffProps {
  items?: CampsiteHandoffItem[];
  summary?: string;
  class?: string;
}

const props = withDefaults(defineProps<CampsiteHandoffProps>(), {
  items: () => [
    { id: "h1", label: "Redlines attached for spacing scale", done: true, assignee: "Alex Smith", due: "Nov 12" },
    { id: "h2", label: "Empty states exported to Lottie", done: true, assignee: "Brook Taylor", due: "Nov 13" },
    { id: "h3", label: "Motion spec review with eng", done: false, assignee: "Casey Morgan", due: "Nov 15" },
  ],
  summary: "3 handoff tasks, 2 done. Motion spec review is still open and due Nov 15 — the only blocker for a clean handoff.",
  class: "",
});
defineEmits(["toggle"]);

const initialsFor = (name: string) =>
  name
    .split(/\s+/)
    .map((part) => part[0] ?? "")
    .join("")
    .slice(0, 2)
    .toUpperCase();
</script>

<template>
  <div data-campsite-handoff class="w-full rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900" :class="props.class">
    <div class="flex items-center justify-between">
      <h3 data-campsite-handoff-title class="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Design handoff</h3>
      <span data-campsite-handoff-count class="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
        {{ props.items.filter((i) => i.done).length }}/{{ props.items.length }} done
      </span>
    </div>
    <div data-campsite-handoff-items class="mt-3 space-y-2">
      <label
        v-for="item in props.items"
        :key="item.id"
        :data-campsite-handoff-item="item.id"
        class="flex cursor-pointer items-center gap-2.5 rounded-lg border border-zinc-100 px-2.5 py-2 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800/60"
      >
        <input
          type="checkbox"
          data-campsite-handoff-check
          :checked="Boolean(item.done)"
          class="h-3.5 w-3.5 shrink-0 cursor-pointer rounded accent-indigo-500"
          @change="$emit('toggle', item)"
        />
        <span :class="['min-w-0 flex-1 text-xs', item.done ? 'text-zinc-400 line-through dark:text-zinc-500' : 'text-zinc-800 dark:text-zinc-200']">
          {{ item.label }}
        </span>
        <span
          v-if="item.assignee"
          data-campsite-handoff-assignee
          :title="item.assignee"
          class="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-[9px] font-semibold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300"
        >
          {{ initialsFor(item.assignee) }}
        </span>
        <span v-if="item.due" data-campsite-handoff-due class="shrink-0 text-[10px] font-medium text-zinc-400 dark:text-zinc-500">
          {{ item.due }}
        </span>
      </label>
    </div>
    <div v-if="props.summary" data-campsite-handoff-summary class="mt-3 rounded-lg bg-indigo-50 p-3 dark:bg-indigo-950/40">
      <p class="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-indigo-500 dark:text-indigo-300">
        <span aria-hidden="true">✦</span>
        AI summary
      </p>
      <p class="mt-1 text-xs leading-relaxed text-indigo-900 dark:text-indigo-200">{{ props.summary }}</p>
    </div>
  </div>
</template>
