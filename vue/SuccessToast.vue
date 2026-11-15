<template>
  <div
    v-if="visible"
    data-success-toast
    role="status"
    :class="['fixed right-4 z-50 flex items-center gap-2 rounded-xl bg-emerald-100 px-4 py-2.5 shadow-sm dark:bg-emerald-950', position === 'bottom-right' ? 'bottom-4' : 'top-4']"
  >
    <span class="shrink-0 text-emerald-700 dark:text-emerald-400" v-html="icon || DEFAULT_CHECK" />
    <span class="text-sm text-zinc-900 dark:text-zinc-50">{{ message }}</span>
    <button
      type="button"
      data-toast-close
      title="Dismiss"
      class="ml-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-emerald-800/70 hover:bg-emerald-200 hover:text-emerald-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 dark:text-emerald-300 dark:hover:bg-emerald-900"
      @click="visible = false; emit('close')"
    >
      <svg viewBox="0 0 20 20" fill="none" class="h-3 w-3" aria-hidden="true">
        <path d="m5 5 10 10M15 5 5 15" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

const props = withDefaults(
  defineProps<{
    message: string;
    icon?: string;
    duration?: number;
    position?: 'top-right' | 'bottom-right';
  }>(),
  { icon: '', duration: 3000, position: 'top-right' as const },
);

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const DEFAULT_CHECK =
  '<svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16" aria-hidden="true"><path d="M10 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16Zm-1.2-5.4 5-5-1.13-1.13L8.8 10.34 7.33 8.87 6.2 10l2.6 2.6Z"/></svg>';

const visible = ref(true);

watch(
  () => props.message,
  () => {
    visible.value = true;
  },
);

watch(
  [visible, () => props.duration],
  () => {
    if (props.duration > 0) {
      const timer = setTimeout(() => {
        visible.value = false;
      }, props.duration);
      return () => clearTimeout(timer);
    }
  },
  { immediate: true },
);
</script>
