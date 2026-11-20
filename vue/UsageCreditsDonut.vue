<script setup lang="ts">
import { ref, computed } from "vue";

export interface CreditSlice {
  id: string;
  label: string;
  value: number;
  color?: string;
}
interface Props {
  title?: string;
  unit?: string;
  total?: number;
  slices?: CreditSlice[];
  ranges?: string[];
  defaultRange?: string;
}
const props = withDefaults(defineProps<Props>(), {
  title: "Usage by Type",
  unit: "credits",
  slices: () => [],
  ranges: () => ["Last 7 days", "Last 30 days"],
});

const PALETTE = ["#6366f1", "#22c55e", "#f59e0b", "#ec4899", "#06b6d4", "#a855f7"];

const emit = defineEmits<{
  (e: "range-change", range: string): void;
}>();

const range = ref(props.defaultRange ?? props.ranges[0] ?? "");
const active = ref<string | null>(null);

const sum = computed(() => props.total ?? props.slices.reduce((acc, s) => acc + s.value, 0));
const colored = computed(() => props.slices.map((s, i) => ({ ...s, color: s.color ?? PALETTE[i % PALETTE.length] })));

const size = 160;
const cx = size / 2;
const cy = size / 2;
const rOuter = 70;
const rInner = 44;

const polar = (r: number, deg: number): [number, number] => {
  const rad = ((deg - 90) * Math.PI) / 180;
  return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)];
};

const donutArc = (startDeg: number, endDeg: number) => {
  const [x1, y1] = polar(rOuter, startDeg);
  const [x2, y2] = polar(rOuter, endDeg);
  const [x3, y3] = polar(rInner, endDeg);
  const [x4, y4] = polar(rInner, startDeg);
  const large = endDeg - startDeg > 180 ? 1 : 0;
  return [
    `M ${x1} ${y1}`,
    `A ${rOuter} ${rOuter} 0 ${large} 1 ${x2} ${y2}`,
    `L ${x3} ${y3}`,
    `A ${rInner} ${rInner} 0 ${large} 0 ${x4} ${y4}`,
    "Z",
  ].join(" ");
};

const arcs = computed(() => {
  let angle = 0;
  return colored.value.map((s) => {
    const sweep = sum.value > 0 ? (s.value / sum.value) * 360 : 0;
    const start = angle;
    const end = angle + sweep;
    angle = end;
    return { ...s, path: donutArc(start, Math.max(end - 0.6, start + 0.1)) };
  });
});

const activeSlice = computed(() => (active.value ? colored.value.find((s) => s.id === active.value) : undefined));
const firstPct = computed(() => `${(((arcs.value[0]?.value ?? 0) / (sum.value || 1)) * 100).toFixed(0)}%`);

const setRange = (e: Event) => {
  const value = (e.target as HTMLSelectElement | null)?.value ?? "";
  range.value = value;
  emit("range-change", value);
};
</script>

<template>
  <div data-usage-donut class="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
    <div class="flex flex-wrap items-center justify-between gap-2">
      <p data-usage-donut-title class="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{{ props.title }}</p>
      <select
        v-if="props.ranges.length > 0"
        data-usage-donut-range
        :value="range"
        @change="setRange"
        class="rounded-md border border-zinc-200 bg-white px-2 py-1 text-[11px] text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
      >
        <option v-for="r in props.ranges" :key="r" :value="r">{{ r }}</option>
      </select>
    </div>
    <p data-usage-donut-total class="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{{ sum.toFixed(2) }} {{ props.unit }}</p>

    <div class="mt-3 flex flex-wrap items-center gap-4">
      <svg
        data-usage-donut-chart
        :width="size"
        :height="size"
        :viewBox="`0 0 ${size} ${size}`"
        role="img"
        :aria-label="props.title + ' donut chart'"
      >
        <path
          v-for="a in arcs"
          :key="a.id"
          :d="a.path"
          :fill="a.color"
          :opacity="active && active !== a.id ? 0.35 : 1"
          @mouseenter="active = a.id"
          @mouseleave="active = null"
        />
        <circle
          v-if="sum <= 0"
          :cx="cx"
          :cy="cy"
          :r="(rOuter + rInner) / 2"
          fill="none"
          stroke="#e4e4e7"
          :stroke-width="rOuter - rInner"
          class="dark:opacity-20"
        />
        <text :x="cx" :y="cy - 2" text-anchor="middle" class="fill-zinc-900 text-sm font-semibold dark:fill-zinc-50">
          {{ activeSlice ? activeSlice.label : firstPct }}
        </text>
        <text :x="cx" :y="cy + 14" text-anchor="middle" class="fill-zinc-400 text-[10px]">
          {{ activeSlice ? activeSlice.value + " " + props.unit : props.unit }}
        </text>
      </svg>

      <ul data-usage-donut-legend class="min-w-0 flex-1 space-y-1.5">
        <li
          v-for="s in colored"
          :key="s.id"
          :data-usage-donut-slice="s.id"
          @mouseenter="active = s.id"
          @mouseleave="active = null"
          class="flex items-center gap-2 text-xs"
        >
          <span class="h-2.5 w-2.5 shrink-0 rounded-sm" :style="{ backgroundColor: s.color }" />
          <span class="min-w-0 flex-1 truncate text-zinc-600 dark:text-zinc-300">{{ s.label }}</span>
          <span class="font-mono text-[11px] text-zinc-500 dark:text-zinc-400">{{ s.value }}</span>
          <span class="w-10 text-right text-[10px] text-zinc-400 dark:text-zinc-500">
            {{ sum > 0 ? ((s.value / sum) * 100).toFixed(0) + "%" : "—" }}
          </span>
        </li>
        <li v-if="colored.length === 0" data-usage-donut-empty class="text-xs text-zinc-400 dark:text-zinc-500">No usage recorded</li>
      </ul>
    </div>
  </div>
</template>
