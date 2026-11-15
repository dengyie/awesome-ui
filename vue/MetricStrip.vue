<template>
  <div
    v-if="metrics.length"
    data-metric-strip
    class="flex flex-wrap items-stretch divide-x divide-zinc-100 overflow-hidden rounded-xl border border-zinc-200 bg-white dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-900"
    :class="className"
  >
    <div
      v-for="(metric, index) in metrics"
      :key="`${metric.label}-${index}`"
      role="button"
      tabindex="0"
      :data-metric-index="index"
      :aria-current="index === activeIndex ? 'true' : undefined"
      class="group flex min-w-[140px] flex-1 cursor-pointer flex-col gap-0.5 px-4 py-3 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-500"
      :class="index === activeIndex ? 'bg-zinc-50 dark:bg-zinc-800/60' : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/40'"
      @click="emit('metric-click', index, metric)"
      @keydown.enter.prevent="emit('metric-click', index, metric)"
      @keydown.space.prevent="emit('metric-click', index, metric)"
    >
      <span class="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
        <UiIcon v-if="metric.icon" :name="metric.icon" :size="12" class="text-zinc-400" />
        {{ metric.label }}
      </span>
      <span class="flex items-baseline gap-2">
        <span class="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">{{ metric.value }}</span>
        <template v-if="metric.delta !== undefined">
          <span class="flex items-center gap-0.5 text-[10px] font-medium" :class="toneOf(metric.delta)">
            <UiIcon v-if="deltaIcon(metric.delta)" :name="deltaIcon(metric.delta) as IconName" :size="11" />
            {{ metric.delta > 0 ? '+' : '' }}{{ metric.delta }}{{ metric.deltaLabel ? ` ${metric.deltaLabel}` : '%' }}
          </span>
        </template>
        <span v-else-if="metric.deltaLabel" class="text-[10px] font-medium text-zinc-400">{{ metric.deltaLabel }}</span>
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import UiIcon, { type IconName } from './UiIcon.vue';

export interface MetricStripItem {
  label: string;
  value: string | number;
  delta?: number;
  deltaLabel?: string;
  icon?: IconName;
}

withDefaults(
  defineProps<{
    metrics?: MetricStripItem[];
    activeIndex?: number;
    className?: string;
  }>(),
  { metrics: () => [], activeIndex: -1, className: '' },
);

const emit = defineEmits<{
  (e: 'metric-click', index: number, metric: MetricStripItem): void;
}>();

const toneOf = (delta: number | undefined) => {
  if (delta === undefined) return 'text-zinc-400';
  return delta > 0 ? 'text-emerald-600' : delta < 0 ? 'text-rose-600' : 'text-zinc-400';
};

const deltaIcon = (delta: number | undefined): IconName | null =>
  delta === undefined ? null : delta > 0 ? 'trending-up' : delta < 0 ? 'trending-down' : 'minus';
</script>
