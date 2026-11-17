<template>
  <div
    v-if="isOpen"
    :class="className"
    class="w-full max-w-sm overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-lg"
    role="region"
    :aria-label="title"
  >
    <div class="flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800 px-3 py-2.5">
      <UiIcon name="bell" :size="14" class="shrink-0 text-zinc-400" />
      <h3 class="text-xs font-semibold text-zinc-800 dark:text-zinc-200">{{ title }}</h3>
      <span
        v-if="unreadIds.length"
        class="rounded-full bg-indigo-100 px-1.5 py-0.5 text-[10px] font-medium tabular-nums text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400"
      >
        {{ unreadIds.length }} new
      </span>
      <button
        v-if="showPrefsButton"
        type="button"
        aria-label="Notification preferences"
        class="rounded-md p-1 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
        @click="emit('open-preferences')"
      >
        <UiIcon name="settings" :size="12" />
      </button>
      <button
        type="button"
        :disabled="unreadIds.length === 0"
        class="ml-auto text-[11px] font-medium text-indigo-600 transition-colors hover:text-indigo-500 disabled:cursor-not-allowed disabled:text-zinc-300 dark:text-indigo-400 dark:disabled:text-zinc-600"
        @click="emit('mark-all-read')"
      >
        Mark all read
      </button>
      <button
        type="button"
        aria-label="Close notifications"
        class="rounded-md p-1 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
        @click="emit('close')"
      >
        <UiIcon name="x" :size="12" />
      </button>
    </div>

    <div v-if="showFilter" class="flex gap-1 border-b border-zinc-100 dark:border-zinc-800 px-3 py-1.5">
      <button
        v-for="key in (['all', 'unread'] as const)"
        :key="key"
        type="button"
        :aria-pressed="filter === key"
        :class="[
          'rounded-md px-2 py-1 text-[11px] font-medium capitalize transition-colors',
          filter === key
            ? 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-100'
            : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200',
        ]"
        @click="filter = key"
      >
        {{ key }}
        <span class="ml-1 tabular-nums text-zinc-400">{{ key === 'all' ? notifications.length : unreadIds.length }}</span>
      </button>
    </div>

    <div class="max-h-72 overflow-y-auto">
      <div v-if="visible.length === 0" class="px-3 py-8 text-center">
        <UiIcon name="check-circle" :size="20" class="mx-auto mb-1.5 text-emerald-500" />
        <p class="text-[11px] text-zinc-400">{{ emptyText }}</p>
      </div>
      <ul v-else class="divide-y divide-zinc-100 dark:divide-zinc-800">
        <li v-for="item in visible" :key="item.id">
          <button
            type="button"
            class="flex w-full items-start gap-2.5 px-3 py-2.5 text-left transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
            @click="select(item)"
          >
            <span :class="['mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full', TYPE_META[item.type || 'info'].chip]">
              <UiIcon :name="item.icon || TYPE_META[item.type || 'info'].icon" :size="13" />
            </span>
            <span class="min-w-0 flex-1">
              <span class="flex items-center gap-1.5">
                <span class="truncate text-[11px] font-medium text-zinc-800 dark:text-zinc-100">{{ item.title }}</span>
                <span v-if="item.unread" class="h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-500" aria-label="Unread" />
              </span>
              <span v-if="item.description" class="mt-0.5 line-clamp-2 block text-[11px] leading-snug text-zinc-500 dark:text-zinc-400">
                {{ item.description }}
              </span>
              <span v-if="item.time" class="mt-0.5 block text-[10px] text-zinc-400">{{ item.time }}</span>
            </span>
          </button>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import UiIcon from './UiIcon.vue';

type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface NotificationItem {
  id: string | number;
  title: string;
  description?: string;
  time?: string;
  icon?: string;
  unread?: boolean;
  type?: NotificationType;
}

const TYPE_META: Record<NotificationType, { chip: string; icon: string }> = {
  info: { chip: 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400', icon: 'info' },
  success: { chip: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400', icon: 'check-circle' },
  warning: { chip: 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400', icon: 'alert-triangle' },
  error: { chip: 'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400', icon: 'circle-x' },
};

const props = withDefaults(
  defineProps<{
    isOpen: boolean;
    notifications?: NotificationItem[];
    title?: string;
    emptyText?: string;
    showFilter?: boolean;
    showPrefsButton?: boolean;
    className?: string;
  }>(),
  {
    notifications: () => [],
    title: 'Notifications',
    emptyText: "You're all caught up",
    showFilter: true,
    showPrefsButton: false,
    className: '',
  }
);

const emit = defineEmits<{
  (e: 'select', notification: NotificationItem): void;
  (e: 'mark-read', ids: Array<string | number>): void;
  (e: 'mark-all-read'): void;
  (e: 'open-preferences'): void;
  (e: 'close'): void;
}>();

const filter = ref<'all' | 'unread'>('all');

const unreadIds = computed(() => props.notifications.filter((item) => item.unread).map((item) => item.id));
const visible = computed(() => (filter.value === 'unread' ? props.notifications.filter((item) => item.unread) : props.notifications));

watch(
  () => props.isOpen,
  (open) => {
    if (open) filter.value = 'all';
  }
);

function select(item: NotificationItem) {
  if (item.unread) emit('mark-read', [item.id]);
  emit('select', item);
}
</script>
