<template>
  <div class="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4" :class="$attrs.class">
    <div class="flex items-center justify-between">
      <span class="text-xs text-zinc-500 dark:text-zinc-400">{{ label }}</span>
      <span v-if="icon" class="text-zinc-400 dark:text-zinc-500"><UiIcon :name="icon" :size="16" /></span>
    </div>
    <div class="mt-2 flex items-end justify-between gap-3">
      <div>
        <div class="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">{{ value }}</div>
        <div v-if="typeof delta === 'number'" class="mt-1 flex items-center gap-1">
          <UiIcon :name="positive ? 'trending-up' : 'trending-down'" :size="13" :class="positive ? 'text-emerald-500' : 'text-red-500'" />
          <span :class="['text-[11px] font-medium', positive ? 'text-emerald-600 dark:text-emerald-500' : 'text-red-600 dark:text-red-500']">
            {{ positive ? '+' : '' }}{{ delta }}%
          </span>
          <span v-if="deltaLabel" class="text-[11px] text-zinc-400 dark:text-zinc-500">{{ deltaLabel }}</span>
        </div>
      </div>
      <svg v-if="trendPoints" viewBox="0 0 96 28" class="h-7 w-24" fill="none" aria-hidden="true">
        <polyline :points="trendPoints" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"
          :class="positive ? 'stroke-emerald-500' : 'stroke-red-500'" />
      </svg>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import UiIcon from './UiIcon.vue';

type IconName = 'trending-up' | 'trending-down' | 'zap' | 'cpu' | 'clock' | 'users' | 'credit-card' | 'sparkles' | 'check-circle';

const props = withDefaults(defineProps<{
  label: string;
  value: string | number;
  delta?: number;
  deltaLabel?: string;
  trend?: number[];
  icon?: IconName;
}>(), { trend: undefined, icon: undefined });

const positive = computed(() => (props.delta ?? 0) >= 0);

const trendPoints = computed(() => {
  const data = props.trend;
  if (!data || data.length < 2) return '';
  const width = 96;
  const height = 28;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const span = max - min || 1;
  return data
    .map((value, index) => {
      const x = (index / (data.length - 1)) * width;
      const y = height - ((value - min) / span) * (height - 4) - 2;
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(' ');
});
</script>
