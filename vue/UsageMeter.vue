<template>
  <div :class="['rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900', $attrs.class]">
    <div class="flex items-baseline justify-between gap-2">
      <p class="text-xs font-semibold text-zinc-800 dark:text-zinc-100">{{ label }}</p>
      <p :class="['text-xs font-bold tabular-nums', styles.text]">{{ percent }}%</p>
    </div>
    <div class="mt-2 h-2 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
      <div :class="['h-full rounded-full transition-[width] duration-500', styles.bar]" :style="{ width: `${ratio * 100}%` }"></div>
    </div>
    <div class="mt-1.5 flex items-center justify-between text-[10.5px] tabular-nums text-zinc-500 dark:text-zinc-400">
      <span>{{ used.toLocaleString() }} / {{ limit.toLocaleString() }}{{ unit ? ` ${unit}` : '' }}</span>
      <span v-if="showLegend && remaining > 0" class="inline-flex items-center gap-1">
        <UiIcon name="clock" :size="10" />
        {{ remaining.toLocaleString() }} left
      </span>
      <span v-else-if="showLegend && remaining <= 0" class="font-semibold text-rose-500">Limit reached</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import UiIcon from './UiIcon.vue';

export type UsageMeterTone = 'ok' | 'warning' | 'danger';

const props = withDefaults(
  defineProps<{
    label: string;
    used: number;
    limit: number;
    unit?: string;
    showLegend?: boolean;
  }>(),
  { unit: '', showLegend: true }
);

const TONE = {
  ok: { bar: 'bg-indigo-500', text: 'text-indigo-600 dark:text-indigo-400' },
  warning: { bar: 'bg-amber-500', text: 'text-amber-600 dark:text-amber-400' },
  danger: { bar: 'bg-rose-500', text: 'text-rose-600 dark:text-rose-400' },
};

const ratio = computed(() => {
  if (props.limit <= 0) return 1;
  return Math.min(1, Math.max(0, props.used / props.limit));
});

const tone = computed<UsageMeterTone>(() => {
  if (props.limit <= 0) return 'danger';
  const value = props.used / props.limit;
  if (value >= 0.9) return 'danger';
  if (value >= 0.7) return 'warning';
  return 'ok';
});

const styles = computed(() => TONE[tone.value]);
const percent = computed(() => Math.round(ratio.value * 100));
const remaining = computed(() => Math.max(0, props.limit - props.used));
</script>
