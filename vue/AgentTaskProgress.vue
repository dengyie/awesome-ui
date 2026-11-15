<template>
  <div data-agent-task-progress class="w-full rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
    <p v-if="title" class="text-sm font-bold text-zinc-900 dark:text-zinc-50">{{ title }}</p>
    <div v-if="contextText" class="mt-2 rounded-lg bg-zinc-100 px-3 py-2 dark:bg-zinc-800">
      <p v-if="contextLabel" class="text-[10px] font-medium uppercase tracking-wide text-zinc-400">{{ contextLabel }}</p>
      <p class="text-xs font-medium text-zinc-800 dark:text-zinc-100">{{ contextText }}</p>
    </div>
    <p v-if="hint" class="mt-2 text-[11px] text-zinc-500 dark:text-zinc-400">{{ hint }}</p>

    <ul class="mt-3 space-y-2">
      <li v-for="(step, index) in steps" :key="index" :data-task-step="index" :data-task-state="step.state" class="rounded-lg border border-zinc-200 p-3 dark:border-zinc-700">
        <div class="flex items-center gap-2 text-xs font-semibold text-zinc-800 dark:text-zinc-100">
          <svg v-if="step.state === 'done'" viewBox="0 0 24 24" fill="currentColor" class="h-3.5 w-3.5 shrink-0 text-zinc-900 dark:text-zinc-50">
            <path d="M8 5v14l11-7z" />
          </svg>
          <svg v-else-if="step.state === 'active'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-3.5 w-3.5 shrink-0 animate-spin text-indigo-500">
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
          </svg>
          <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-3.5 w-3.5 shrink-0 text-zinc-400">
            <path d="m9 18 6-6-6-6" />
          </svg>
          {{ step.label }}
        </div>
        <ul v-if="step.state === 'active' && step.substeps?.length" data-task-substeps class="mt-2 space-y-1 border-l-2 border-zinc-200 pl-3 dark:border-zinc-700">
          <li v-for="substep in step.substeps" :key="substep" class="text-[11px] text-zinc-500 dark:text-zinc-400">{{ substep }}</li>
        </ul>
      </li>
    </ul>

    <div class="mt-4 flex items-center justify-between border-t border-zinc-200 pt-3 dark:border-zinc-800">
      <a href="#" data-task-feedback class="text-[11px] text-zinc-500 underline underline-offset-2 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200">{{ feedbackLabel }}</a>
      <div class="flex items-center gap-2">
        <button type="button" data-task-refine class="rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-semibold text-zinc-600 transition-colors hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800" @click="emit('refine')">
          {{ refineLabel }}
        </button>
        <button type="button" data-task-next class="rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-white" @click="emit('next')">
          {{ nextLabel }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
export interface ProgressStep {
  label: string;
  state: 'done' | 'active' | 'pending';
  substeps?: string[];
}

withDefaults(
  defineProps<{
    title?: string;
    contextLabel?: string;
    contextText?: string;
    hint?: string;
    steps?: ProgressStep[];
    refineLabel?: string;
    nextLabel?: string;
    feedbackLabel?: string;
  }>(),
  { title: '', contextLabel: '', contextText: '', hint: 'This may take a few minutes, you can come back later.', steps: () => [], refineLabel: 'Refine', nextLabel: 'Next', feedbackLabel: 'Send feedback' },
);

const emit = defineEmits<{
  (e: 'refine'): void;
  (e: 'next'): void;
}>();
</script>
