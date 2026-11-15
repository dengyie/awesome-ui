<script setup lang="ts">
export type TraceSpanKind = 'llm' | 'tool' | 'retrieval';

export interface TraceSpan {
  id: string;
  name: string;
  startMs: number;
  durationMs: number;
  depth?: number;
  kind?: TraceSpanKind;
  costUsd?: number;
  tokens?: number;
}

interface Props {
  spans?: TraceSpan[];
  title?: string;
}

const props = withDefaults(defineProps<Props>(), {
  spans: () => [],
  title: 'Trace waterfall',
});

const emit = defineEmits<{
  (e: 'span-select', span: TraceSpan): void;
}>();

const kindDot = (kind?: TraceSpanKind) => {
  switch (kind) {
    case 'tool':
      return 'bg-emerald-500';
    case 'retrieval':
      return 'bg-amber-500';
    default:
      return 'bg-indigo-500';
  }
};

const formatDuration = (ms: number) => (ms >= 1000 ? `${(ms / 1000).toFixed(1)}s` : `${ms}ms`);

const formatCost = (usd?: number) => (typeof usd === 'number' ? `$${usd.toFixed(3)}` : '');

const total = props.spans.length > 0 ? Math.max(...props.spans.map((s) => s.startMs + s.durationMs)) : 0;
</script>

<template>
  <div
    data-trace-waterfall
    class="w-full overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
  >
    <div class="flex items-center gap-2 border-b border-zinc-100 px-4 py-2.5 dark:border-zinc-800">
      <span class="text-xs font-semibold text-zinc-700 dark:text-zinc-200">{{ props.title }}</span>
      <span class="ml-auto text-[11px] tabular-nums text-zinc-400 dark:text-zinc-500">
        {{ props.spans.length }} spans · {{ formatDuration(total) }}
      </span>
    </div>

    <div class="px-4 py-2">
      <div class="flex items-center gap-4 pb-2 text-[10px] text-zinc-400 dark:text-zinc-500">
        <span class="flex items-center gap-1.5">
          <span class="h-1.5 w-1.5 rounded-full bg-indigo-500"></span> LLM
        </span>
        <span class="flex items-center gap-1.5">
          <span class="h-1.5 w-1.5 rounded-full bg-emerald-500"></span> Tool
        </span>
        <span class="flex items-center gap-1.5">
          <span class="h-1.5 w-1.5 rounded-full bg-amber-500"></span> Retrieval
        </span>
      </div>

      <div data-trace-rows class="space-y-1.5">
        <button
          v-for="span in props.spans"
          :key="span.id"
          type="button"
          :data-trace-row="span.id"
          class="flex w-full items-center gap-3 rounded-md px-1 py-1 text-left transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/60"
          @click="emit('span-select', span)"
        >
          <span
            class="flex min-w-0 shrink-0 items-center gap-2 text-xs text-zinc-700 dark:text-zinc-200"
            :style="{ width: `${Math.max(120 - (span.depth ?? 0) * 14, 88)}px`, paddingLeft: `${(span.depth ?? 0) * 14}px` }"
          >
            <span class="h-1.5 w-1.5 shrink-0 rounded-full" :class="kindDot(span.kind)"></span>
            <span data-trace-name class="min-w-0 truncate">{{ span.name }}</span>
          </span>
          <span class="relative h-4 min-w-0 flex-1">
            <span
              data-trace-bar
              class="absolute top-0.5 h-3 rounded-full"
              :class="kindDot(span.kind)"
              :style="{
                left: `${total > 0 ? (span.startMs / total) * 100 : 0}%`,
                width: `${total > 0 ? Math.max((span.durationMs / total) * 100, 2) : 0}%`,
              }"
            ></span>
            <span
              class="absolute top-0.5 whitespace-nowrap text-[10px] tabular-nums text-zinc-500 dark:text-zinc-400"
              :style="{ left: `calc(${total > 0 ? (span.startMs / total) * 100 : 0}% + ${total > 0 ? Math.max((span.durationMs / total) * 100, 2) : 0}% + 6px)` }"
            >
              {{ formatDuration(span.durationMs) }}{{ formatCost(span.costUsd) ? ` · ${formatCost(span.costUsd)}` : '' }}
            </span>
          </span>
        </button>
      </div>
    </div>
  </div>
</template>
