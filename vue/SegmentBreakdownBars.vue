<template>
  <div
    data-segment-breakdown
    role="table"
    class="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
    :class="className"
  >
    <p class="border-l-2 border-zinc-900 pl-2 text-2xl font-semibold tracking-tight text-zinc-900 dark:border-zinc-50 dark:text-zinc-50">
      {{ headline }}<span class="ml-1 text-sm font-medium text-zinc-400">{{ headlineUnit }}</span>
    </p>
    <p v-if="caption" class="mt-1 pl-3 text-xs text-zinc-400">{{ caption }}</p>
    <div class="mt-4 space-y-3">
      <div
        v-for="(item, index) in items"
        :key="`${item.label}-${index}`"
        role="row"
        :data-segment-index="index"
        class="flex items-center gap-3"
      >
        <span class="w-28 shrink-0 truncate text-xs font-medium text-zinc-600 dark:text-zinc-300">{{ item.label }}</span>
        <span class="relative h-2.5 min-w-0 flex-1 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
          <span
            data-segment-bar
            class="absolute inset-y-0 left-0 rounded-full transition-all duration-300"
            :class="toneBar[item.tone ?? 'indigo']"
            :style="{ width: `${widthOf(item)}%` }"
          />
        </span>
        <span class="w-14 shrink-0 text-right text-xs font-semibold tabular-nums text-zinc-900 dark:text-zinc-50">
          {{ shareOf(item) }}{{ item.unit ?? unit ?? '' }}
        </span>
        <span
          v-if="item.delta !== undefined"
          class="w-16 shrink-0 text-right text-xs font-medium tabular-nums"
          :class="item.delta > 0 ? 'text-emerald-600' : item.delta < 0 ? 'text-rose-600' : 'text-zinc-400'"
        >
          {{ item.delta > 0 ? '+' : '' }}{{ item.delta }}{{ item.deltaUnit ?? 'pp' }}
        </span>
        <span v-else class="w-16 shrink-0" />
      </div>
    </div>
    <p class="mt-4 border-t border-zinc-100 pt-3 text-[10px] text-zinc-400 dark:border-zinc-800">
      Share of {{ total }}{{ unit ?? '' }} across {{ items.length }} segments
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

export interface SegmentBreakdownItem {
  label: string;
  value: number;
  unit?: string;
  delta?: number;
  deltaUnit?: string;
  tone?: 'indigo' | 'emerald' | 'amber' | 'sky' | 'rose';
}

const props = withDefaults(
  defineProps<{
    headline?: string | number;
    headlineUnit?: string;
    caption?: string;
    items?: SegmentBreakdownItem[];
    unit?: string;
    className?: string;
  }>(),
  { headline: 0, headlineUnit: '%', caption: '', items: () => [], unit: '', className: '' },
);

const toneBar: Record<string, string> = {
  indigo: 'bg-indigo-500',
  emerald: 'bg-emerald-500',
  amber: 'bg-amber-400',
  sky: 'bg-sky-500',
  rose: 'bg-rose-500',
};

const max = computed(() =>
  Math.max(...props.items.map((item) => Math.max(0, item.value)), 0.0001),
);
const total = computed(() => Math.round(props.items.reduce((sum, item) => sum + Math.max(0, item.value), 0) * 100) / 100);

const widthOf = (item: SegmentBreakdownItem) =>
  Math.min(100, Math.round((Math.max(0, item.value) / max.value) * 100));
const shareOf = (item: SegmentBreakdownItem) => Math.max(0, item.value);
</script>
