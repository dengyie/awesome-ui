<template>
  <div class="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 overflow-hidden" :class="className">
    <div class="flex items-center gap-2 px-3.5 py-2.5 border-b border-zinc-100 dark:border-zinc-800 text-sm font-semibold text-zinc-800 dark:text-zinc-200">
      <UiIcon name="layers" :size="14" class="text-zinc-400" />
      {{ title }}
      <span class="ml-auto text-[11px] font-mono font-normal text-zinc-400">{{ doneCount }}/{{ items.length }}</span>
    </div>
    <ul class="p-1.5 space-y-0.5">
      <li v-for="item in items" :key="item.id">
        <div
          role="button"
          tabindex="0"
          class="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-colors cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/60"
          :class="item.status === 'done' ? 'text-zinc-400 dark:text-zinc-500' : 'text-zinc-700 dark:text-zinc-300'"
          @click="emit('toggle', item.id)"
          @keydown.enter.prevent="emit('toggle', item.id)"
          @keydown.space.prevent="emit('toggle', item.id)"
        >
          <UiIcon :name="statusIcon(item.status).icon" :size="15" class="shrink-0" :class="statusIcon(item.status).cls" />
          <span class="flex-1 min-w-0 truncate" :class="item.status === 'done' ? 'line-through' : ''">{{ item.label }}</span>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import UiIcon from "./UiIcon.vue";

export interface AgentTaskItem {
  id: string | number;
  label: string;
  status: "pending" | "active" | "done";
}

const props = withDefaults(
  defineProps<{
    items?: AgentTaskItem[];
    title?: string;
    className?: string;
  }>(),
  { items: () => [], title: "Tasks", className: "" }
);

const emit = defineEmits<{
  (e: "toggle", id: string | number): void;
}>();

const doneCount = computed(() => props.items.filter((i) => i.status === "done").length);

const STATUS_ICON: Record<string, { icon: string; cls: string }> = {
  pending: { icon: "square", cls: "text-zinc-300 dark:text-zinc-600" },
  active: { icon: "loader", cls: "text-indigo-500 animate-spin" },
  done: { icon: "check-circle", cls: "text-emerald-500" },
};

function statusIcon(status: string) {
  return STATUS_ICON[status] || STATUS_ICON.pending;
}
</script>
