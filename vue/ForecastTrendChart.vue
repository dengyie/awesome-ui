<template>
  <div
    data-forecast-trend
    class="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
    :class="className"
  >
    <div class="flex flex-wrap items-baseline gap-2">
      <p class="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
        {{ headline }}<span v-if="unit" class="ml-1 text-sm font-medium text-zinc-400">{{ unit }}</span>
      </p>
      <span v-if="deltaLabel" class="flex items-center gap-0.5 text-xs font-semibold" :class="toneText[deltaTone]">
        <UiIcon :name="deltaIcon as IconName" :size="12" />
        {{ deltaLabel }}
      </span>
    </div>
    <p v-if="note" class="mt-0.5 text-xs text-zinc-400">{{ note }}</p>
    <div class="mt-4 flex h-28 items-end gap-1" role="img" aria-label="Trend with forecast">
      <div
        v-for="(point, index) in points"
        :key="`${point.label}-${index}`"
        :data-point-index="index"
        class="flex min-w-0 flex-1 flex-col items-center gap-1"
      >
        <div class="relative flex h-full w-full items-end justify-center">
          <div
            v-if="point.forecast"
            class="w-full max-w-6 rounded-md border-2 border-dashed border-sky-400 bg-sky-100/50 dark:border-sky-500 dark:bg-sky-900/40"
            :style="{ height: `${heightOf(point.value)}%` }"
            :title="`${point.label}: ${point.value}${unit ?? ''} (forecast)`"
          />
          <div
            v-else
            class="w-full max-w-6 rounded-md bg-sky-500 transition-all duration-300 dark:bg-sky-400"
            :style="{ height: `${heightOf(point.value)}%` }"
            :title="`${point.label}: ${point.value}${unit ?? ''}`"
          />
        </div>
        <span class="truncate text-[9px] text-zinc-400">{{ point.label }}</span>
      </div>
    </div>
    <div class="mt-3 flex items-center gap-4 border-t border-zinc-100 pt-3 text-[10px] text-zinc-400 dark:border-zinc-800">
      <span class="flex items-center gap-1.5">
        <span class="h-2.5 w-2.5 rounded-sm bg-sky-500" /> Actual
      </span>
      <span class="flex items-center gap-1.5">
        <span class="h-2.5 w-2.5 rounded-sm border border-dashed border-sky-400 bg-sky-100/50" /> Forecast
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import UiIcon, { type IconName } from './UiIcon.vue';

export interface ForecastPoint {
  label: string;
  value: number;
  forecast?: boolean;
}

const props = withDefaults(
  defineProps<{
    headline?: string | number;
    deltaLabel?: string;
    deltaTone?: 'emerald' | 'rose' | 'zinc';
    note?: string;
    points?: ForecastPoint[];
    unit?: string;
    className?: string;
  }>(),
  { headline: 0, deltaLabel: '', deltaTone: 'emerald', note: '', points: () => [], unit: '', className: '' },
);

const toneText: Record<string, string> = {
  emerald: 'text-emerald-600',
  rose: 'text-rose-600',
  zinc: 'text-zinc-400',
};

const deltaIcon = computed<IconName>(() =>
  props.deltaTone === 'emerald' ? 'trending-up' : props.deltaTone === 'rose' ? 'trending-down' : 'minus',
);

const max = computed(() => Math.max(...props.points.map((point) => point.value), 0.0001));
const heightOf = (value: number) => Math.max(4, Math.round((value / max.value) * 100));
</script>
