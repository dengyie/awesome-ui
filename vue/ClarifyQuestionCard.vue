<template>
  <div data-clarify-card class="w-full rounded-lg border border-indigo-300 bg-white p-3 dark:border-indigo-500/60 dark:bg-zinc-900">
    <div class="flex items-start gap-2.5">
      <span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-xs font-bold text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-300">?</span>
      <div class="min-w-0 flex-1">
        <p class="text-sm font-bold text-zinc-900 dark:text-zinc-50">{{ title || question }}</p>
        <p v-if="title" class="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">{{ question }}</p>
      </div>
      <span v-if="total > 1" data-clarify-paging class="flex shrink-0 items-center gap-1 text-[11px] font-medium text-indigo-500 dark:text-indigo-400">
        <button type="button" data-clarify-prev aria-label="Previous question" class="rounded px-1 transition-colors hover:bg-indigo-50 dark:hover:bg-indigo-950/60" @click="emit('prev')">‹</button>
        {{ index }} of {{ total }}
        <button type="button" data-clarify-next aria-label="Next question" class="rounded px-1 transition-colors hover:bg-indigo-50 dark:hover:bg-indigo-950/60" @click="emit('next')">›</button>
      </span>
    </div>

    <p v-if="answered" data-clarify-value class="mt-2.5 rounded-md bg-zinc-100 px-3 py-2 text-xs text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
      {{ value || '—' }}
    </p>
    <input
      v-else
      type="text"
      :value="value"
      :placeholder="placeholder"
      data-clarify-input
      class="mt-2.5 w-full rounded-md bg-zinc-100 px-3 py-2 text-xs text-zinc-900 placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:bg-zinc-800 dark:text-zinc-50"
      @keydown.enter="emit('answer', ($event.target as HTMLInputElement).value)"
    />

    <p data-clarify-step class="mt-2 flex items-center gap-1.5 text-[11px] text-zinc-400 dark:text-zinc-500">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-3 w-3 text-emerald-500">
        <path d="m5 12 4 4L19 6" />
      </svg>
      {{ stepLabel }}
    </p>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    question: string;
    title?: string;
    value?: string;
    placeholder?: string;
    index?: number;
    total?: number;
    answered?: boolean;
    stepLabel?: string;
  }>(),
  { title: '', value: '', placeholder: 'Type your answer…', index: 1, total: 1, answered: false, stepLabel: 'Used ask user question' },
);

const emit = defineEmits<{
  (e: 'answer', value: string): void;
  (e: 'prev'): void;
  (e: 'next'): void;
}>();
</script>
