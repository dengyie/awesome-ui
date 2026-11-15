<template>
  <div data-federated-search class="w-full overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
    <div class="border-b border-zinc-100 p-3 dark:border-zinc-800">
      <div class="relative">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400">
          <circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" />
        </svg>
        <input
          type="text"
          v-model="term"
          data-federated-input
          :placeholder="searchPlaceholder"
          class="w-full rounded-lg border border-zinc-200 bg-zinc-50 py-2 pl-9 pr-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
          @input="emit('query-change', term)"
        />
      </div>
      <div v-if="sourceFilters.length" class="mt-2 flex flex-wrap items-center gap-1.5">
        <button
          v-for="filter in sourceFilters"
          :key="filter.id"
          type="button"
          :data-source-chip="filter.id"
          :aria-pressed="scopes.has(filter.id)"
          :class="['rounded-full border px-2.5 py-1 text-[11px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500', scopes.has(filter.id) ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300' : 'border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800']"
          @click="toggleSource(filter.id)"
        >
          {{ filter.label }}
        </button>
      </div>
    </div>
    <ul class="max-h-80 overflow-y-auto p-2">
      <li v-if="filtered.length === 0" data-federated-empty class="px-3 py-6 text-center text-xs text-zinc-400 dark:text-zinc-500">No results match your filters.</li>
      <li v-for="result in filtered" :key="result.id">
        <button
          type="button"
          :data-federated-result="result.id"
          class="w-full rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:hover:bg-zinc-800/60"
          @click="emit('result-select', result)"
        >
          <span class="flex items-center gap-2">
            <span v-if="result.icon" aria-hidden="true">{{ result.icon }}</span>
            <span class="min-w-0 flex-1 truncate text-sm font-semibold text-zinc-900 dark:text-zinc-50">{{ result.title }}</span>
            <span v-if="result.source" class="shrink-0 rounded bg-zinc-100 px-1.5 py-0.5 text-[10px] font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">{{ result.source }}</span>
          </span>
          <span v-if="result.subtitle" class="mt-0.5 block text-[11px] text-zinc-400 dark:text-zinc-500">{{ result.subtitle }}</span>
          <span class="mt-1 block text-xs leading-5 text-zinc-600 dark:text-zinc-300" v-html="highlight(result.snippet)" />
        </button>
      </li>
    </ul>
    <div v-if="showKeyboardLegend" class="flex items-center justify-between border-t border-zinc-100 bg-zinc-50 px-3 py-2 dark:border-zinc-800 dark:bg-zinc-800/60">
      <p data-federated-legend class="text-[11px] text-zinc-500 dark:text-zinc-400">{{ LEGEND }}</p>
      <span v-if="askAiLabel" class="rounded-full bg-zinc-900 px-2.5 py-1 text-[11px] font-semibold text-white dark:bg-zinc-100 dark:text-zinc-900">{{ askAiLabel }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';

export interface FederatedResult {
  id: string;
  title: string;
  icon?: string;
  subtitle?: string;
  snippet: string;
  source?: string;
}

const LEGEND = '↑↓ Navigate · ⏎ Select · ESC Close · ⇧⏎ Open in new tab';

const props = withDefaults(
  defineProps<{
    query?: string;
    results: FederatedResult[];
    sourceFilters?: { id: string; label: string }[];
    selectedSources?: string[];
    searchPlaceholder?: string;
    showKeyboardLegend?: boolean;
    askAiLabel?: string;
  }>(),
  { query: '', sourceFilters: () => [], selectedSources: () => [], searchPlaceholder: 'Search everything…', showKeyboardLegend: true, askAiLabel: 'Press Tab to Ask AI' },
);

const emit = defineEmits<{
  (e: 'query-change', query: string): void;
  (e: 'source-change', ids: string[]): void;
  (e: 'result-select', result: FederatedResult): void;
}>();

const term = ref(props.query);
const scopes = ref(new Set<string>(props.selectedSources));

watch(
  () => props.query,
  (value) => {
    term.value = value;
  },
);

const escapeRegExp = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const highlight = (snippet: string) => {
  if (!term.value.trim()) return snippet;
  const parts = snippet.split(new RegExp(`(${escapeRegExp(term.value)})`, 'gi'));
  return parts
    .map((part) =>
      part.toLowerCase() === term.value.toLowerCase()
        ? `<mark class="rounded-sm bg-yellow-200 px-0.5 font-medium text-zinc-900 dark:bg-yellow-400/70">${part}</mark>`
        : part,
    )
    .join('');
};

const toggleSource = (id: string) => {
  const next = new Set(scopes.value);
  if (next.has(id)) next.delete(id);
  else next.add(id);
  scopes.value = next;
  emit('source-change', [...next]);
};

const filtered = computed(() =>
  scopes.value.size ? props.results.filter((result) => !result.source || scopes.value.has(result.source)) : props.results,
);
</script>
