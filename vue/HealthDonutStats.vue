<template>
  <div
    v-if="cards.length"
    data-health-donut-stats
    class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3"
    :class="className"
  >
    <div
      v-for="(card, index) in cards"
      :key="`${card.title}-${index}`"
      :data-donut-card="index"
      class="flex flex-col gap-4 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
    >
      <div class="flex items-center gap-4">
        <div class="relative h-16 w-16 shrink-0">
          <div class="h-16 w-16 rounded-full" :style="donutStyle(card.slices)" />
          <div class="absolute inset-[10px] flex items-center justify-center rounded-full bg-white dark:bg-zinc-900">
            <span data-donut-center class="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">{{ percentOf(card.slices) }}%</span>
          </div>
        </div>
        <div class="min-w-0 flex-1">
          <p class="truncate text-xs font-semibold text-zinc-800 dark:text-zinc-200">{{ card.title }}</p>
          <p v-if="card.caption" class="mt-0.5 text-[10px] text-zinc-400">{{ card.caption }}</p>
          <ul class="mt-2 space-y-1">
            <li
              v-for="(slice, sliceIndex) in card.slices"
              :key="`${slice.label}-${sliceIndex}`"
              class="flex items-center gap-1.5 text-[11px] text-zinc-600 dark:text-zinc-300"
            >
              <span class="h-2 w-2 shrink-0 rounded-full" :class="toneDot[slice.tone]" />
              <span class="min-w-0 flex-1 truncate">{{ slice.label }}</span>
              <span class="shrink-0 font-medium tabular-nums">{{ shareOf(slice, card.slices) }}%</span>
            </li>
          </ul>
        </div>
      </div>
      <button
        v-if="card.action"
        type="button"
        data-donut-action
        class="w-full rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
        @click="emit('action-click', index, card.action.label)"
      >
        {{ card.action.label }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
export interface HealthDonutSlice {
  label: string;
  value: number;
  tone: 'indigo' | 'amber' | 'zinc' | 'emerald' | 'rose';
}

export interface HealthDonutCard {
  title: string;
  caption?: string;
  slices: HealthDonutSlice[];
  action?: { label: string };
}

const props = withDefaults(
  defineProps<{
    cards?: HealthDonutCard[];
    className?: string;
  }>(),
  { cards: () => [], className: '' },
);

const emit = defineEmits<{
  (e: 'action-click', index: number, label: string): void;
}>();

const toneDot: Record<string, string> = {
  indigo: 'bg-indigo-500',
  amber: 'bg-amber-400',
  zinc: 'bg-zinc-300 dark:bg-zinc-700',
  emerald: 'bg-emerald-500',
  rose: 'bg-rose-500',
};

const sliceColor: Record<string, string> = {
  indigo: 'bg-indigo-500',
  amber: 'bg-amber-400',
  zinc: 'bg-zinc-300',
  emerald: 'bg-emerald-500',
  rose: 'bg-rose-500',
};

const sumOf = (slices: HealthDonutSlice[]) => slices.reduce((sum, slice) => sum + Math.max(0, slice.value), 0);

const donutStyle = (slices: HealthDonutSlice[]) => {
  const total = sumOf(slices) || 1;
  let cursor = 0;
  const stops: string[] = [];
  slices.forEach((slice) => {
    const start = (cursor / total) * 360;
    cursor += Math.max(0, slice.value);
    const end = (cursor / total) * 360;
    stops.push(`${sliceColor[slice.tone]} ${start}deg ${end}deg`);
  });
  return { background: `conic-gradient(${stops.join(', ')})` };
};

const percentOf = (slices: HealthDonutSlice[]) => {
  const total = sumOf(slices);
  if (!total || !slices.length) return 0;
  const primary = slices.reduce((best, slice) => (slice.value > best.value ? slice : best), slices[0]);
  return Math.round((primary.value / total) * 100);
};

const shareOf = (slice: HealthDonutSlice, slices: HealthDonutSlice[]) => {
  const total = sumOf(slices);
  return total ? Math.round((slice.value / total) * 100) : 0;
};
</script>
