<script setup lang="ts">
interface Props {
  title?: string;
  description?: string;
  runId?: string;
  retryLabel?: string;
  resetLabel?: string;
  supportText?: string;
}
const props = withDefaults(defineProps<Props>(), {
  title: "Oops! Something went wrong",
  description: "The agent run failed unexpectedly. Please try again.",
  retryLabel: "Retry",
});
const emit = defineEmits<{
  (e: "retry"): void;
  (e: "reset"): void;
}>();
</script>

<template>
  <div
    data-agent-error
    role="alert"
    class="flex flex-col items-center justify-center rounded-xl border border-zinc-200 bg-white px-6 py-10 text-center dark:border-zinc-800 dark:bg-zinc-900"
  >
    <div aria-hidden="true" class="flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 dark:bg-rose-950/60">
      <svg class="h-6 w-6 text-rose-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    </div>
    <p data-agent-error-title class="mt-4 text-base font-semibold text-zinc-900 dark:text-zinc-50">{{ props.title }}</p>
    <code v-if="props.runId" data-agent-error-run class="mt-1.5 rounded bg-zinc-100 px-2 py-0.5 font-mono text-[11px] text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">{{ props.runId }}</code>
    <p data-agent-error-description class="mt-2 max-w-sm text-xs text-zinc-500 dark:text-zinc-400">{{ props.description }}</p>
    <div data-agent-error-actions class="mt-5 flex items-center gap-2">
      <button
        type="button"
        data-agent-error-retry
        @click="emit('retry')"
        class="rounded-lg bg-zinc-900 px-4 py-2 text-xs font-semibold text-zinc-50 transition-colors hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-300"
      >
        {{ props.retryLabel }}
      </button>
      <button
        v-if="props.resetLabel"
        type="button"
        data-agent-error-reset
        @click="emit('reset')"
        class="rounded-lg bg-zinc-100 px-4 py-2 text-xs font-semibold text-zinc-600 transition-colors hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
      >
        {{ props.resetLabel }}
      </button>
    </div>
    <p v-if="props.supportText" data-agent-error-support class="mt-4 text-[11px] text-zinc-400 dark:text-zinc-500">{{ props.supportText }}</p>
  </div>
</template>
