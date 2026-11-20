<script setup lang="ts">
import { ref, computed } from "vue";

export interface AgentNotificationItem {
  id: string;
  kind: "started" | "completed" | "failed" | "info";
  title: string;
  statusText?: string;
  caption?: string;
  time: string;
  unread?: boolean;
}
interface Props {
  title?: string;
  items: AgentNotificationItem[];
}
const props = withDefaults(defineProps<Props>(), {
  title: "Notifications",
});
const emit = defineEmits<{
  (e: "open", item: AgentNotificationItem): void;
}>();

const read = ref<Record<string, boolean>>({});
const isUnread = (item: AgentNotificationItem) => !!item.unread && !read.value[item.id];
const unreadCount = computed(() => props.items.filter(isUnread).length);

const open = (item: AgentNotificationItem) => {
  read.value = { ...read.value, [item.id]: true };
  emit("open", item);
};

const KIND_DOT: Record<string, string> = {
  started: "bg-sky-500",
  completed: "bg-emerald-500",
  failed: "bg-rose-500",
  info: "bg-zinc-400",
};
const KIND_TEXT: Record<string, string> = {
  started: "text-sky-600 dark:text-sky-400",
  completed: "text-emerald-600 dark:text-emerald-400",
  failed: "text-rose-600 dark:text-rose-400",
  info: "text-zinc-500 dark:text-zinc-400",
};
</script>

<template>
  <div data-agent-feed class="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
    <div class="flex items-center justify-between border-b border-zinc-100 px-4 py-3 dark:border-zinc-800">
      <p data-agent-feed-title class="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{{ props.title }}</p>
      <span
        v-if="unreadCount > 0"
        data-agent-feed-count
        class="rounded-full bg-indigo-50 px-2 py-0.5 text-[11px] font-semibold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300"
      >
        {{ unreadCount }} new
      </span>
    </div>
    <div data-agent-feed-list class="divide-y divide-zinc-100 dark:divide-zinc-800">
      <button
        v-for="item in props.items"
        :key="item.id"
        type="button"
        :data-agent-feed-item="item.id"
        :data-unread="isUnread(item) ? 'true' : 'false'"
        @click="open(item)"
        class="flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
      >
        <span
          aria-hidden="true"
          :class="['mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full', isUnread(item) ? (KIND_DOT[item.kind] || KIND_DOT.info) : 'bg-zinc-300 dark:bg-zinc-600']"
        ></span>
        <span class="min-w-0 flex-1">
          <span class="block text-xs font-medium text-zinc-900 dark:text-zinc-50">
            {{ item.title }}<span v-if="item.statusText" :class="['font-semibold', KIND_TEXT[item.kind] || KIND_TEXT.info]"> {{ item.statusText }}</span>
          </span>
          <span v-if="item.caption" class="mt-0.5 block text-[11px] text-zinc-500 dark:text-zinc-400">{{ item.caption }}</span>
        </span>
        <span class="shrink-0 text-[11px] text-zinc-400 dark:text-zinc-500">{{ item.time }}</span>
      </button>
      <p v-if="props.items.length === 0" data-agent-feed-empty class="px-4 py-6 text-center text-xs text-zinc-400 dark:text-zinc-500">No notifications yet</p>
    </div>
  </div>
</template>
