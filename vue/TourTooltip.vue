<template>
  <div
    data-tour-tooltip
    role="dialog"
    :aria-label="title"
    :class="[
      'relative w-80 rounded-xl border p-4 shadow-xl',
      theme === 'dark' ? 'tour-dark bg-zinc-900 text-zinc-50 border-zinc-700' : 'tour-light bg-white text-zinc-900 border-zinc-200',
      caretClass,
    ]"
  >
    <div class="flex items-start justify-between gap-3">
      <p class="text-[11px] font-semibold uppercase tracking-wide text-zinc-400">Step {{ step }} of {{ totalSteps }}</p>
      <button
        type="button"
        data-tour-dismiss
        aria-label="Dismiss"
        :class="['rounded-md p-0.5 transition-colors', theme === 'dark' ? 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200' : 'text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600']"
        @click="emit('dismiss')"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-4 w-4">
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      </button>
    </div>

    <p class="mt-2 text-sm font-bold leading-snug">{{ title }}</p>
    <p :class="['mt-1.5 text-xs leading-relaxed', theme === 'dark' ? 'text-zinc-300' : 'text-zinc-500']">{{ body }}</p>

    <div class="mt-4 flex items-center justify-between border-t pt-3" :class="theme === 'dark' ? 'border-zinc-700' : 'border-zinc-200'">
      <div v-if="feedback" class="flex items-center gap-1.5">
        <span :class="['text-[11px]', theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500']">Was this helpful?</span>
        <button
          type="button"
          data-tour-feedback-up
          aria-label="Yes"
          :class="['rounded-md border px-1.5 py-0.5 text-xs transition-colors', theme === 'dark' ? 'border-zinc-600 hover:bg-zinc-800' : 'border-zinc-300 hover:bg-zinc-50']"
          @click="emit('feedback', true)"
        >
          👍
        </button>
        <button
          type="button"
          data-tour-feedback-down
          aria-label="No"
          :class="['rounded-md border px-1.5 py-0.5 text-xs transition-colors', theme === 'dark' ? 'border-zinc-600 hover:bg-zinc-800' : 'border-zinc-300 hover:bg-zinc-50']"
          @click="emit('feedback', false)"
        >
          👎
        </button>
      </div>
      <span v-else :class="['text-[11px]', theme === 'dark' ? 'text-zinc-400' : 'text-zinc-400']">{{ step }}/{{ totalSteps }}</span>

      <div class="flex items-center gap-2">
        <button
          v-if="step > 1"
          type="button"
          data-tour-prev
          :class="['text-xs font-medium transition-colors', theme === 'dark' ? 'text-zinc-300 hover:text-white' : 'text-zinc-600 hover:text-zinc-900']"
          @click="emit('prev')"
        >
          Previous
        </button>
        <button
          type="button"
          data-tour-next
          :class="['rounded-lg px-3 py-1.5 text-xs font-semibold text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500', step >= totalSteps ? 'bg-indigo-600 hover:bg-indigo-500' : 'bg-zinc-900 hover:bg-zinc-700 dark:bg-indigo-600 dark:hover:bg-indigo-500']"
          @click="emit('next')"
        >
          {{ step >= totalSteps ? 'Finish tour' : 'Next' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    step: number;
    totalSteps: number;
    title: string;
    body: string;
    theme?: 'light' | 'dark';
    caret?: 'top' | 'bottom' | 'none';
    feedback?: boolean;
  }>(),
  { theme: 'light', caret: 'top', feedback: false },
);

const emit = defineEmits<{
  (e: 'prev'): void;
  (e: 'next'): void;
  (e: 'dismiss'): void;
  (e: 'feedback', helpful: boolean): void;
}>();

const caretClass =
  props.caret === 'top'
    ? 'before:absolute before:-top-1.5 before:left-8 before:h-3 before:w-3 before:rotate-45 before:rounded-[2px] before:border-l before:border-t before:bg-inherit'
    : props.caret === 'bottom'
      ? 'after:absolute after:-bottom-1.5 after:left-8 after:h-3 after:w-3 after:rotate-45 after:rounded-[2px] after:border-r after:border-b after:bg-inherit'
      : '';

void props;
</script>
