<script setup lang="ts">
export interface NoResultsStateProps {
  query?: string;
  suggestions?: string[];
  clearLabel?: string;
  didYouMeanLabel?: string;
  class?: string;
}

const props = withDefaults(defineProps<NoResultsStateProps>(), {
  query: "",
  suggestions: () => [],
  clearLabel: "Clear all filters",
  didYouMeanLabel: "Did you mean",
  class: "",
});

const emit = defineEmits<{
  (e: "suggestion", suggestion: string): void;
  (e: "clear-filters"): void;
}>();
</script>

<template>
  <div data-noresults-state class="flex w-full flex-col items-center justify-center gap-4 rounded-xl border border-zinc-200 bg-white px-6 py-14 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900" :class="props.class">
    <div data-noresults-illustration aria-hidden="true" class="flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-100 text-3xl dark:bg-zinc-800">🔍</div>
    <div class="space-y-1.5">
      <p data-noresults-title class="text-base font-semibold text-zinc-900 dark:text-zinc-50">
        No results for <span v-if="props.query" data-noresults-query class="font-mono text-zinc-700 dark:text-zinc-200">“{{ props.query }}”</span>
      </p>
      <p data-noresults-description class="mx-auto max-w-md text-sm leading-5 text-zinc-500 dark:text-zinc-400">Try a different keyword or remove some filters to widen your search.</p>
    </div>
    <div v-if="(Array.isArray(props.suggestions) ? props.suggestions : []).length" data-noresults-suggestions class="flex flex-wrap items-center justify-center gap-2">
      <span class="text-xs text-zinc-400 dark:text-zinc-500">{{ props.didYouMeanLabel }}</span>
      <button
        v-for="s in (Array.isArray(props.suggestions) ? props.suggestions : [])"
        :key="s"
        type="button"
        :data-noresults-suggestion="s"
        class="rounded-full border border-zinc-200 px-3 py-1 text-xs font-medium text-zinc-600 transition-colors hover:border-violet-300 hover:text-violet-600 dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-violet-700 dark:hover:text-violet-400"
        @click="emit('suggestion', s)"
      >
        {{ s }}
      </button>
    </div>
    <button type="button" data-noresults-clear class="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800" @click="emit('clear-filters')">{{ props.clearLabel }}</button>
  </div>
</template>
