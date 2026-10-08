<template>
  <div class="flex flex-col w-64 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden" :class="className">
    <div class="flex items-center gap-2 px-4 py-3 border-b border-zinc-100 dark:border-zinc-800 text-sm font-semibold text-zinc-800 dark:text-zinc-200">
      <UiIcon name="sparkles" :size="15" class="text-indigo-500" />
      {{ title }}
      <span class="ml-auto text-[11px] font-mono font-normal text-zinc-400">{{ sessions.length }}</span>
    </div>

    <div v-if="sessions.length === 0" class="p-6 text-center text-xs text-zinc-400">{{ emptyText }}</div>
    <ul v-else class="flex-1 overflow-y-auto p-1.5 space-y-0.5">
      <li v-for="s in sessions" :key="s.id">
        <div
          role="button"
          tabindex="0"
          class="group w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-left text-sm cursor-pointer transition-colors"
          :class="String(s.id) === String(activeId)
            ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300'
            : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/70'"
          @click="emit('select', s)"
          @keydown.enter.prevent="emit('select', s)"
          @keydown.space.prevent="emit('select', s)"
        >
          <span class="flex-1 min-w-0">
            <span class="block truncate font-medium">{{ s.title }}</span>
            <span v-if="s.timeLabel" class="block text-[11px] text-zinc-400">{{ s.timeLabel }}</span>
          </span>
          <button
            type="button"
            aria-label="Delete session"
            class="opacity-0 group-hover:opacity-100 focus:opacity-100 p-1 rounded-md text-zinc-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all shrink-0"
            @click.stop="emit('delete', s.id)"
          >
            <UiIcon name="x" :size="13" />
          </button>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import UiIcon from "./UiIcon.vue";

export interface ChatSessionItem {
  id: string | number;
  title: string;
  timeLabel?: string;
}

withDefaults(
  defineProps<{
    sessions?: ChatSessionItem[];
    activeId?: string | number | null;
    title?: string;
    emptyText?: string;
    className?: string;
  }>(),
  { sessions: () => [], activeId: null, title: "Chats", emptyText: "No conversations yet", className: "" }
);

const emit = defineEmits<{
  (e: "select", session: ChatSessionItem): void;
  (e: "delete", id: string | number): void;
}>();
</script>
