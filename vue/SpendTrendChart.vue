<script setup lang="ts">
import { ref, computed } from "vue";

export interface SpendPoint {
  label: string;
  value: number;
}
interface Props {
  headline?: string;
  unit?: string;
  granularities?: string[];
  defaultGranularity?: string;
  points?: Record<string, SpendPoint[]>;
  maxY?: number;
  yTicks?: number;
}
const props = withDefaults(defineProps<Props>(), {
  headline: "Spend",
  unit: "$",
  granularities: () => ["Daily", "Weekly"],
  defaultGranularity: undefined,
  points: () => ({}),
  maxY: undefined,
  yTicks: 4,
});

const emit = defineEmits<{
  (e: "granularity-change", granularity: string): void;
}>();

const GRANULARITIES = ["Daily", "Weekly"];

const granularity = ref(
  props.defaultGranularity && GRANULARITIES.includes(props.defaultGranularity)
    ? props.defaultGranularity
    : GRANULARITIES[0],
);

const data = computed(() => props.points[granularity.value] ?? []);
const total = computed(() => data.value.reduce((acc, p) => acc + p.value, 0));
const max = computed(() => props.maxY ?? Math.max(...data.value.map((p) => p.value), 1));

const height = 180;
const padLeft = 34;
const padBottom = 26;
const plotW = 100;

const ticks = computed(() => {
  const m = max.value;
  return Array.from({ length: props.yTicks + 1 }, (_, i) => ({
    value: Math.round((m / props.yTicks) * (props.yTicks - i)),
    y: 8 + ((height - padBottom - 16) * i) / props.yTicks,
  }));
});

const switchGranularity = (next: string) => {
  if (next === granularity.value) return;
  granularity.value = next;
  emit("granularity-change", next);
};

const barGeometry = computed(() => {
  const n = data.value.length;
  if (n === 0) return [];
  const slot = plotW / n;
  const every = Math.ceil(n / 8);
  return data.value.map((p, i) => {
    const bw = Math.min(slot * 0.45, 8);
    const x = padLeft + slot * i + (slot - bw) / 2;
    const h = Math.max((p.value / max.value) * (height - padBottom - 16), p.value > 0 ? 3 : 0);
    const y = height - padBottom - h;
    const showLabel = n <= 14 || i % every === 0;
    return { p, x, y, bw, h, showLabel, midX: x + bw / 2 };
  });
});

const yLabelRight = ((plotW + 6) / (padLeft + plotW)) * 100;
const xLabelTop = ((height - padBottom + 10) / height) * 100;
const pctY = (y: number) => `${(y / height) * 100}%`;
const pctX = (x: number) => `${(x / (padLeft + plotW)) * 100}%`;
</script>

<template>
  <div
    data-spend-trend-chart
    class="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
  >
    <div class="flex flex-wrap items-center justify-between gap-2">
      <p data-spend-trend-title class="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{{ props.headline }}</p>
      <div
        data-spend-trend-granularity
        role="tablist"
        aria-label="Granularity"
        class="flex items-center rounded-md border border-zinc-200 bg-zinc-50 p-0.5 dark:border-zinc-700 dark:bg-zinc-800"
      >
        <button
          v-for="g in GRANULARITIES"
          :key="g"
          type="button"
          role="tab"
          :aria-selected="g === granularity"
          :data-spend-trend-granularity-option="g"
          class="rounded px-2.5 py-1 text-[11px] font-medium transition-colors"
          :class="
            g === granularity
              ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-900 dark:text-zinc-50'
              : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200'
          "
          @click="switchGranularity(g)"
        >
          {{ g }}
        </button>
      </div>
    </div>

    <p data-spend-trend-total class="mt-1 font-mono text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
      {{ props.unit }}{{ total.toFixed(2) }}
      <span class="ml-1.5 font-sans text-xs font-normal text-zinc-400 dark:text-zinc-500">{{ granularity }}</span>
    </p>

    <div class="relative mt-3" :style="{ height: height + 'px' }">
      <svg
        data-spend-trend-svg
        width="100%"
        :height="height"
        :viewBox="`0 0 ${padLeft + plotW} ${height}`"
        preserveAspectRatio="none"
        role="img"
        :aria-label="props.headline + ' ' + granularity + ' bar chart'"
      >
        <line
          v-for="(t, i) in ticks"
          :key="'grid-' + i"
          :x1="padLeft"
          :x2="padLeft + plotW"
          :y1="t.y"
          :y2="t.y"
          stroke="#3f3f46"
          stroke-opacity="0.35"
          stroke-dasharray="3 4"
          vector-effect="non-scaling-stroke"
        />

        <rect
          v-for="(b, i) in barGeometry"
          :key="b.p.label + i"
          :data-spend-trend-bar="b.p.label"
          :x="b.x"
          :y="b.y"
          :width="b.bw"
          :height="b.h"
          rx="2"
          fill="#14b8a6"
          :opacity="b.p.value > 0 ? 0.9 : 0.25"
        />

        <text
          v-if="data.length === 0"
          :x="padLeft + plotW / 2"
          :y="height / 2"
          text-anchor="middle"
          font-size="10"
          fill="#a1a1aa"
        >
          No spend recorded
        </text>
      </svg>

      <!-- text labels as HTML overlay so preserveAspectRatio never stretches them -->
      <div class="pointer-events-none absolute inset-0">
        <span
          v-for="(t, i) in ticks"
          :key="'ylabel-' + i"
          class="absolute -translate-y-1/2 text-[9px] leading-none text-zinc-400 dark:text-zinc-500"
          :style="{ top: pctY(t.y), right: yLabelRight + '%' }"
        >
          {{ t.value }}
        </span>
        <span
          v-for="(b, i) in barGeometry"
          :key="'xlabel-' + i"
          v-show="b.showLabel"
          class="absolute -translate-x-1/2 text-[9px] leading-none text-zinc-400 dark:text-zinc-500"
          :style="{ top: xLabelTop + '%', left: pctX(b.midX) }"
        >
          {{ b.p.label.slice(5) }}
        </span>
      </div>
    </div>
  </div>
</template>
