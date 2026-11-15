<template>
  <div
    data-ai-inline-menu
    :class="['inline-flex max-w-full items-center gap-1 rounded-full border bg-white py-1 pl-1.5 pr-1 shadow-lg dark:bg-zinc-900', error ? 'border-red-300 dark:border-red-900' : 'border-zinc-200 dark:border-zinc-700']"
  >
    <span :class="['inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold', tone === 'brand' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300' : 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-300']">
      <span :class="loading ? 'animate-pulse' : ''">
        <svg viewBox="0 0 20 20" fill="currentColor" class="h-3.5 w-3.5" aria-hidden="true">
          <path d="M10 2.5l1.4 4.1L15.5 8l-4.1 1.4L10 13.5 8.6 9.4 4.5 8l4.1-1.4L10 2.5Z" />
          <path d="M15.8 12.6l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7.7-2Z" opacity="0.7" />
        </svg>
      </span>
      AI
    </span>
    <span class="mx-0.5 h-4 w-px bg-zinc-200 dark:bg-zinc-700" />
    <div v-for="action in resolvedActions" :key="action.id" class="relative">
      <button
        type="button"
        :data-ai-action="action.id"
        :disabled="loading"
        class="inline-flex items-center gap-0.5 rounded-md px-1.5 py-1 text-xs font-medium text-indigo-600 transition-colors hover:bg-indigo-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 dark:text-indigo-300 dark:hover:bg-indigo-950/60"
        @click="action.options?.length ? (openId = openId === action.id ? null : action.id) : run(action)"
      >
        {{ action.label }}
        <svg v-if="action.options?.length" viewBox="0 0 20 20" fill="none" class="h-3.5 w-3.5" aria-hidden="true">
          <path d="m6 8 4 4 4-4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </button>
      <div v-if="openId === action.id" :data-ai-menu="action.id" class="absolute bottom-full left-0 z-10 mb-1 w-40 rounded-lg border border-zinc-200 bg-white py-1 shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
        <button
          v-for="option in action.options"
          :key="option"
          type="button"
          :data-ai-option="option"
          class="block w-full px-3 py-1.5 text-left text-xs text-zinc-700 hover:bg-indigo-50 hover:text-indigo-700 dark:text-zinc-200 dark:hover:bg-indigo-950/60 dark:hover:text-indigo-300"
          @click="run(action, option)"
        >{{ option }}</button>
      </div>
    </div>
    <span v-if="lastRun && !loading && !error" data-ai-status class="max-w-[160px] truncate px-1 text-[10px] text-zinc-400" :title="lastRun">{{ lastRun }}</span>
    <span v-if="loading" data-ai-loading class="px-1 text-[10px] text-indigo-500">Working…</span>
    <span v-if="error" data-ai-error class="px-1 text-[10px] text-red-600 dark:text-red-400">{{ error }}</span>
    <button
      type="button"
      data-ai-dismiss
      title="Dismiss"
      class="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:hover:bg-zinc-800"
      @click="openId = null; emit('dismiss')"
    >
      <svg viewBox="0 0 20 20" fill="none" class="h-3 w-3" aria-hidden="true">
        <path d="m5 5 10 10M15 5 5 15" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

export interface AIAction {
  id: string;
  label: string;
  options?: string[];
}

const props = withDefaults(
  defineProps<{
    actions?: AIAction[];
    loading?: boolean;
    error?: string;
    tone?: 'neutral' | 'brand';
  }>(),
  {
    actions: () => [
      { id: 'edit', label: 'Edit' },
      { id: 'tone', label: 'Change tone', options: ['Professional', 'Friendly', 'Concise'] },
    ],
    loading: false,
    error: '',
    tone: 'neutral' as const,
  },
);

const emit = defineEmits<{
  (e: 'action', id: string, option?: string): void;
  (e: 'dismiss'): void;
}>();

const resolvedActions = computed(() => props.actions);
const openId = ref<string | null>(null);
const lastRun = ref<string | null>(null);

const run = (action: AIAction, option?: string) => {
  if (props.loading) return;
  openId.value = null;
  lastRun.value = `${action.id}${option ? `:${option}` : ''}`;
  emit('action', action.id, option);
};
</script>
