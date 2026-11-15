<template>
  <div
    data-target-gauge
    role="img"
    :aria-label="`${label}: ${valuePrefix}${value}${valueSuffix} of ${valuePrefix}${target}${valueSuffix}`"
    class="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
    :class="className"
  >
    <p class="text-[10px] font-semibold uppercase tracking-wide text-zinc-400">{{ label }}</p>
    <div class="relative mx-auto mt-3 h-[70px] w-[140px] overflow-hidden">
      <div class="absolute inset-x-0 top-0 flex h-[70px] w-[140px] overflow-hidden rounded-t-full">
        <span v-for="(zone, index) in segments" :key="index" class="h-full" :class="zoneColor[zone.tone]" :style="{ width: zone.width }" />
      </div>
      <div class="absolute left-1/2 top-[18px] h-[52px] w-[104px] -translate-x-1/2 rounded-t-full bg-white dark:bg-zinc-900" />
      <div
        data-gauge-needle
        class="absolute bottom-0 left-1/2 h-[54px] w-0.5 origin-bottom bg-zinc-900 dark:bg-zinc-100"
        :style="{ transform: `rotate(${angle}deg)` }"
      >
        <span class="absolute -top-[3px] left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-zinc-900 dark:bg-zinc-100" />
      </div>
      <div class="absolute bottom-[-4px] left-1/2 h-3 w-3 -translate-x-1/2 rounded-full border-2 border-white bg-zinc-900 dark:border-zinc-900 dark:bg-zinc-100" />
    </div>
    <div class="mt-1 flex items-center justify-between text-[10px] font-medium text-zinc-400">
      <span>{{ valuePrefix }}0{{ valueSuffix }}</span>
      <span data-gauge-value class="rounded-full px-2 py-0.5 text-[11px] font-semibold text-white" :class="zoneColor[currentTone]">
        {{ valuePrefix }}{{ value }}{{ valueSuffix }}
      </span>
      <span>{{ valuePrefix }}{{ target }}{{ valueSuffix }}</span>
    </div>
    <p v-if="remainingLabel" class="mt-3 border-t border-zinc-100 pt-3 text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
      {{ remaining > 0 ? `Remaining: ${valuePrefix}${remaining}${valueSuffix} — ` : '' }}{{ remainingLabel }}
    </p>
    <span class="hidden" data-gauge-percent>{{ Math.round(percent) }}%</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

export interface TargetGaugeZone {
  from: number;
  tone: 'rose' | 'amber' | 'emerald';
}

const props = withDefaults(
  defineProps<{
    value?: number;
    target?: number;
    label?: string;
    valuePrefix?: string;
    valueSuffix?: string;
    zones?: TargetGaugeZone[];
    remainingLabel?: string;
    className?: string;
  }>(),
  {
    value: 0,
    target: 100,
    label: 'Progress',
    valuePrefix: '',
    valueSuffix: '',
    zones: () => [
      { from: 0, tone: 'rose' },
      { from: 60, tone: 'amber' },
      { from: 85, tone: 'emerald' },
    ],
    remainingLabel: '',
    className: '',
  },
);

const zoneColor: Record<string, string> = {
  rose: 'bg-rose-500',
  amber: 'bg-amber-400',
  emerald: 'bg-emerald-500',
};

const clamp01 = (raw: number) => Math.min(100, Math.max(0, raw));

const percent = computed(() => (props.target > 0 ? (props.value / props.target) * 100 : 0));
const angle = computed(() => (clamp01(percent.value) / 100) * 180 - 90);
const remaining = computed(() => Math.max(0, props.target - props.value));

const segments = computed(() => {
  const sorted = [...props.zones].sort((a, b) => a.from - b.from);
  return sorted.map((zone, index) => {
    const end = index + 1 < sorted.length ? sorted[index + 1].from : 100;
    return { ...zone, width: `${Math.max(0, end - zone.from)}%` };
  });
});

const currentTone = computed<'rose' | 'amber' | 'emerald'>(() => {
  const found = [...segments.value].reverse().find((zone) => clamp01(percent.value) >= zone.from);
  return found?.tone ?? 'rose';
});
</script>
