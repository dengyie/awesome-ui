<template>
  <div class="w-full" data-search-typeahead>
    <div class="flex items-center gap-3 border-b border-zinc-200 pb-3 dark:border-zinc-700">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-5 w-5 shrink-0 text-zinc-400">
        <circle cx="11" cy="11" r="7" />
        <path d="m21 21-4-4" />
      </svg>
      <input
        type="text"
        :value="query"
        :placeholder="placeholder"
        data-typeahead-input
        class="w-full bg-transparent text-2xl font-semibold text-zinc-900 placeholder:text-zinc-300 focus-visible:outline-none dark:text-zinc-50 dark:placeholder:text-zinc-600"
        @input="emit('submit', ($event.target as HTMLInputElement).value)"
      />
      <button v-if="query" type="button" data-typeahead-clear aria-label="Clear search" class="rounded-md p-1 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800" @click="emit('submit', '')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-4 w-4">
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      </button>
    </div>

    <ul v-if="suggestions.length" class="mt-3 space-y-1" data-typeahead-suggestions>
      <li v-for="(suggestion, index) in suggestions" :key="index">
        <button
          type="button"
          :data-typeahead-suggestion="index"
          class="flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left text-sm text-zinc-700 transition-colors hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:text-zinc-200 dark:hover:bg-zinc-800"
          @click="emit('select', suggestion.label)"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-3.5 w-3.5 shrink-0 text-zinc-400">
            <circle cx="11" cy="11" r="7" />
            <path d="m21 21-4-4" />
          </svg>
          <span class="min-w-0 truncate" v-html="markMatches(suggestion.label)" />
          <span v-if="suggestion.type" class="ml-auto shrink-0 rounded-md border border-zinc-300 px-1.5 py-0.5 font-mono text-[10px] font-medium text-zinc-500 dark:border-zinc-600 dark:text-zinc-400">
            {{ suggestion.type }}
          </span>
        </button>
      </li>
    </ul>

    <div v-if="results.length" class="mt-5" data-typeahead-results>
      <p class="text-sm font-bold text-zinc-900 dark:text-zinc-50">{{ resultsHeading }}</p>
      <ul class="mt-2 divide-y divide-zinc-100 dark:divide-zinc-800">
        <li v-for="(result, index) in results" :key="index" class="flex items-center gap-3 py-2.5">
          <button
            type="button"
            :data-typeahead-result="index"
            class="min-w-0 flex-1 truncate text-left text-sm font-medium text-zinc-800 transition-colors hover:text-indigo-600 focus-visible:outline-none dark:text-zinc-100 dark:hover:text-indigo-400"
            @click="emit('select', result.title)"
            v-html="markMatches(result.title)"
          />
          <span v-if="result.badge" class="shrink-0 rounded-md border border-zinc-300 px-1.5 py-0.5 font-mono text-[10px] font-medium text-zinc-500 dark:border-zinc-600 dark:text-zinc-400">
            {{ result.badge }}
          </span>
        </li>
      </ul>
    </div>

    <div v-if="footerHint" class="mt-4 flex items-center justify-between border-t border-zinc-200 pt-3 text-xs text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
      <span>{{ footerHint }}</span>
      <a href="#" class="font-medium text-indigo-600 hover:underline dark:text-indigo-400" data-typeahead-help>Help Center</a>
    </div>
  </div>
</template>

<script setup lang="ts">
export interface TypeaheadSuggestion {
  label: string;
  type?: string;
  meta?: string;
  icon?: string;
}

export interface TypeaheadResult {
  title: string;
  badge?: string;
}

const props = withDefaults(
  defineProps<{
    query?: string;
    placeholder?: string;
    suggestions?: TypeaheadSuggestion[];
    results?: TypeaheadResult[];
    resultsHeading?: string;
    footerHint?: string;
    highlight?: string;
  }>(),
  { query: '', placeholder: 'Search…', suggestions: () => [], results: () => [], resultsHeading: 'Top results', footerHint: '', highlight: '' },
);

const emit = defineEmits<{
  (e: 'select', label: string): void;
  (e: 'submit', query: string): void;
}>();

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const markMatches = (label: string) => {
  if (!props.highlight.trim()) return label;
  const escaped = label
    .split(new RegExp(`(${escapeRegExp(props.highlight.trim())})`, 'ig'))
    .map((part) =>
      part.toLowerCase() === props.highlight.trim().toLowerCase()
        ? `<mark class="rounded-sm bg-yellow-200 px-0.5 text-zinc-900 dark:bg-yellow-400/70">${part}</mark>`
        : part,
    )
    .join('');
  return escaped;
};
</script>
