<template>
  <div data-live-tail-console class="w-full overflow-hidden rounded-lg border border-neutral-800 bg-neutral-950">
    <div class="flex items-center gap-2 border-b border-neutral-800 px-3 py-2">
      <select v-if="sources.length" data-tail-source class="rounded-md border border-neutral-700 bg-neutral-900 px-2 py-1 text-xs text-neutral-200 focus-visible:outline-none" @change="emit('source-change', ($event.target as HTMLSelectElement).value)">
        <option value="all">All sources</option>
        <option v-for="source in sources" :key="source" :value="source">{{ source }}</option>
      </select>
      <div class="relative min-w-0 flex-1">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-500">
          <circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" />
        </svg>
        <input type="text" :value="query" :placeholder="searchPlaceholder" data-tail-search class="w-full rounded-md border border-neutral-700 bg-neutral-900 py-1 pl-7 pr-2 text-xs text-neutral-200 placeholder:text-neutral-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-500" @input="onInput" />
      </div>
      <button type="button" data-tail-follow :class="['inline-flex shrink-0 items-center gap-1.5 rounded-md px-2 py-1 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-500', follow ? 'border border-emerald-500/40 bg-emerald-500/15 text-emerald-400' : 'border border-neutral-700 bg-neutral-900 text-neutral-300']" @click="toggleFollow">
        <svg viewBox="0 0 24 24" fill="currentColor" class="h-3 w-3"><path d="M13 2 3 14h7l-1 8 10-12h-7l1-8z" /></svg>
        Live tail
      </button>
      <span v-if="timezone" class="shrink-0 rounded-md border border-neutral-700 px-1.5 py-0.5 font-mono text-[10px] text-neutral-400">{{ timezone }}</span>
    </div>
    <div data-tail-lines class="max-h-72 overflow-y-auto px-3 py-2 font-mono text-xs leading-5 text-neutral-300">
      <p v-if="filtered.length === 0" class="py-4 text-center text-neutral-500">No log lines match.</p>
      <div v-for="(line, index) in filtered" :key="index" data-tail-line class="flex items-start gap-2 whitespace-pre-wrap break-all">
        <span v-if="line.ts" class="shrink-0 text-neutral-500">{{ line.ts }}</span>
        <span :class="['mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full', LEVEL_DOT[line.level] || LEVEL_DOT.info]" />
        <span class="min-w-0 flex-1 text-neutral-300">{{ line.message }}</span>
        <span v-if="line.source" class="shrink-0 rounded bg-neutral-800 px-1 text-[10px] text-neutral-400">{{ line.source }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

export interface TailLogLine {
  ts?: string;
  level: 'info' | 'warn' | 'error' | 'success';
  message: string;
  source?: string;
}

const LEVEL_DOT: Record<string, string> = {
  info: 'bg-sky-500',
  warn: 'bg-amber-500',
  error: 'bg-rose-500',
  success: 'bg-emerald-500',
};

const props = withDefaults(
  defineProps<{
    lines: TailLogLine[];
    sources?: string[];
    liveTail?: boolean;
    searchPlaceholder?: string;
    timezone?: string;
    maxLines?: number;
  }>(),
  { sources: () => [], liveTail: true, searchPlaceholder: 'Search logs…', timezone: 'GMT+7', maxLines: 200 },
);

const emit = defineEmits<{
  (e: 'search', query: string): void;
  (e: 'source-change', source: string): void;
  (e: 'live-tail-change', enabled: boolean): void;
}>();

const query = ref('');
const follow = ref(props.liveTail);

const filtered = computed(() => {
  const base = query.value
    ? props.lines.filter((line) => line.message.toLowerCase().includes(query.value.toLowerCase()) || (line.source || '').toLowerCase().includes(query.value.toLowerCase()))
    : props.lines;
  return props.maxLines > 0 ? base.slice(-props.maxLines) : base;
});

const onInput = (event: Event) => {
  query.value = (event.target as HTMLInputElement).value;
  emit('search', query.value);
};

const toggleFollow = () => {
  follow.value = !follow.value;
  emit('live-tail-change', follow.value);
};
</script>
