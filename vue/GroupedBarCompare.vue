<template>
  <div
    data-grouped-bar-compare
    role="table"
    class="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
    :class="className"
  >
    <div class="flex items-center justify-between">
      <p class="text-xs font-semibold text-zinc-800 dark:text-zinc-200">{{ title }}</p>
      <div class="flex items-center gap-3 text-[10px] text-zinc-400">
        <span class="flex items-center gap-1">
          <span class="h-2 w-2 rounded-sm bg-violet-400" />
          {{ legendEstimated }}
        </span>
        <span class="flex items-center gap-1">
          <span class="h-2 w-2 rounded-sm bg-lime-400" />
          {{ legendActual }}
        </span>
      </div>
    </div>
    <div class="mt-4 flex items-end justify-between gap-3" aria-label="Grouped bar chart">
      <div
        v-for="(row, index) in rows"
        :key="`${row.name}-${index}`"
        :data-bar-row="index"
        role="row"
        class="flex min-w-0 flex-1 flex-col items-center gap-1.5"
      >
        <div class="flex h-28 w-full items-end justify-center gap-1">
          <div class="flex h-full w-1/3 flex-col items-center justify-end">
            <span class="mb-0.5 text-[9px] font-semibold tabular-nums text-zinc-600 dark:text-zinc-300">
              {{ row.estimated }}{{ row.unit ?? unit }}
            </span>
            <div
              class="w-full rounded-t-md bg-violet-400 transition-all duration-300"
              :style="{ height: `${heightOf(row.estimated)}%` }"
              :title="`${legendEstimated}: ${row.estimated}${row.unit ?? unit}`"
            />
          </div>
          <div class="flex h-full w-1/3 flex-col items-center justify-end">
            <span class="mb-0.5 text-[9px] font-semibold tabular-nums text-zinc-600 dark:text-zinc-300">
              {{ row.actual }}{{ row.unit ?? unit }}
            </span>
            <div
              class="w-full rounded-t-md bg-lime-400 transition-all duration-300"
              :style="{ height: `${heightOf(row.actual)}%` }"
              :title="`${legendActual}: ${row.actual}${row.unit ?? unit}`"
            />
          </div>
        </div>
        <span class="w-full truncate text-center text-[10px] text-zinc-500 dark:text-zinc-400">{{ row.name }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

export interface GroupedBarRow {
  name: string;
  estimated: number;
  actual: number;
  unit?: string;
}

const props = withDefaults(
  defineProps<{
    rows?: GroupedBarRow[];
    title?: string;
    legendEstimated?: string;
    legendActual?: string;
    unit?: string;
    className?: string;
  }>(),
  {
    rows: () => [],
    title: 'Estimated vs actual',
    legendEstimated: 'Estimated',
    legendActual: 'Actual',
    unit: 'h',
    className: '',
  },
);

const max = computed(() => Math.max(...props.rows.flatMap((row) => [row.estimated, row.actual]), 0.0001));
const heightOf = (value: number) => Math.max(4, Math.round((value / max.value) * 100));
</script>
