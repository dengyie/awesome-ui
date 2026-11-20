<script setup lang="ts">
import { ref, computed } from "vue";

export interface MetricSeries {
  name: string;
  color: string;
  values: number[];
}
interface Props {
  headline?: string;
  value?: string;
  delta?: string;
  deltaTone?: "up" | "down" | "flat";
  ranges?: string[];
  defaultRange?: string;
  labels?: string[];
  series?: MetricSeries[];
  unit?: string;
}
const props = withDefaults(defineProps<Props>(), {
  headline: "Active users",
  value: "0",
  delta: undefined,
  deltaTone: "flat",
  ranges: () => ["24h", "7d", "30d", "90d"],
  defaultRange: undefined,
  labels: () => [],
  series: () => [],
  unit: "",
});

const emit = defineEmits<{
  (e: "range-change", range: string): void;
}>();

const HEIGHT = 160;
const PAD_LEFT = 30;
const PAD_BOTTOM = 22;
const PLOT_W = 100;
const VIEW_W = PAD_LEFT + PLOT_W;

const rangeList = computed(() => (props.ranges.length ? props.ranges : ["30d"]));
const range = ref(
  props.defaultRange && rangeList.value.includes(props.defaultRange) ? props.defaultRange : rangeList.value[0],
);
const hover = ref<number | null>(null);

const n = computed(() => props.labels.length);
const max = computed(() => Math.max(...props.series.flatMap((s) => s.values), 1));
const plotH = HEIGHT - PAD_BOTTOM - 8;

const xAt = (i: number) => PAD_LEFT + (n.value > 1 ? (PLOT_W * i) / (n.value - 1) : PLOT_W / 2);
const yAt = (v: number) => 8 + plotH - (v / max.value) * plotH;

const pickRange = (next: string) => {
  if (next === range.value || !rangeList.value.includes(next)) return;
  range.value = next;
  emit("range-change", next);
};

function smoothPath(pts: Array<[number, number]>): string {
  if (pts.length === 0) return "";
  if (pts.length === 1) return `M ${pts[0][0]} ${pts[0][1]}`;
  let d = `M ${pts[0][0]} ${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(i - 1, 0)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(i + 2, pts.length - 1)];
    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ` C ${c1x.toFixed(2)} ${c1y.toFixed(2)}, ${c2x.toFixed(2)} ${c2y.toFixed(2)}, ${p2[0].toFixed(2)} ${p2[1].toFixed(2)}`;
  }
  return d;
}

const paths = computed(() =>
  props.series.map((s) => ({
    name: s.name,
    color: s.color,
    d: smoothPath(s.values.map((v, i) => [xAt(i), yAt(v)] as [number, number])),
  })),
);

const deltaCls = computed(() =>
  props.deltaTone === "up"
    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
    : props.deltaTone === "down"
      ? "bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-300"
      : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300",
);
const deltaArrow = computed(() =>
  props.deltaTone === "up" ? "▲" : props.deltaTone === "down" ? "▼" : "—",
);

const xLabelTop = ((HEIGHT - PAD_BOTTOM + 8) / HEIGHT) * 100;
const yLabelRight = ((PLOT_W + 6) / VIEW_W) * 100;
const hitLeft = (PAD_LEFT / VIEW_W) * 100;
const pctY = (y: number) => `${(y / HEIGHT) * 100}%`;
const pctX = (x: number) => `${(x / VIEW_W) * 100}%`;
</script>

<template>
  <div
    data-metric-line-chart
    class="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
  >
    <div class="flex flex-wrap items-start justify-between gap-2">
      <div>
        <p data-metric-line-title class="text-sm font-medium text-zinc-500 dark:text-zinc-400">{{ props.headline }}</p>
        <p class="mt-0.5 flex items-center gap-2">
          <span data-metric-line-value class="font-mono text-2xl font-semibold text-zinc-900 dark:text-zinc-50">{{ props.value }}</span>
          <span
            v-if="props.delta"
            data-metric-line-delta
            class="rounded-full px-1.5 py-0.5 text-[11px] font-medium"
            :class="deltaCls"
          >
            {{ deltaArrow }} {{ props.delta }}
          </span>
        </p>
      </div>
      <div
        data-metric-line-ranges
        role="tablist"
        aria-label="Time range"
        class="flex items-center gap-0.5 rounded-md border border-zinc-200 bg-zinc-50 p-0.5 dark:border-zinc-700 dark:bg-zinc-800"
      >
        <button
          v-for="r in rangeList"
          :key="r"
          type="button"
          role="tab"
          :aria-selected="r === range"
          :data-metric-line-range-option="r"
          class="rounded px-2 py-1 text-[11px] font-medium transition-colors"
          :class="
            r === range
              ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-900 dark:text-zinc-50'
              : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200'
          "
          @click="pickRange(r)"
        >
          {{ r }}
        </button>
      </div>
    </div>

    <div class="relative mt-3" :style="{ height: HEIGHT + 'px' }">
      <svg
        data-metric-line-svg
        width="100%"
        :height="HEIGHT"
        :viewBox="`0 0 ${VIEW_W} ${HEIGHT}`"
        preserveAspectRatio="none"
        role="img"
        :aria-label="props.headline + ' line chart, ' + range"
      >
        <line
          v-for="f in [0.25, 0.5, 0.75]"
          :key="'grid-' + f"
          :x1="PAD_LEFT"
          :x2="VIEW_W"
          :y1="8 + plotH * f"
          :y2="8 + plotH * f"
          stroke="#3f3f46"
          stroke-opacity="0.3"
          stroke-dasharray="3 4"
          vector-effect="non-scaling-stroke"
        />

        <path
          v-for="p in paths"
          :key="p.name"
          :d="p.d"
          fill="none"
          :stroke="p.color"
          stroke-width="2"
          vector-effect="non-scaling-stroke"
          stroke-linecap="round"
        />

        <g v-if="hover !== null && n > 0" data-metric-line-hover-group>
          <line
            :x1="xAt(hover)"
            :x2="xAt(hover)"
            y1="8"
            :y2="8 + plotH"
            stroke="#a1a1aa"
            stroke-opacity="0.6"
            stroke-dasharray="2 3"
            vector-effect="non-scaling-stroke"
          />
          <circle
            v-for="s in props.series"
            :key="'dot-' + s.name"
            :cx="xAt(hover)"
            :cy="yAt(s.values[hover] ?? 0)"
            r="3"
            :fill="s.color"
            stroke="#fff"
            stroke-width="1.5"
            vector-effect="non-scaling-stroke"
          />
        </g>
      </svg>

      <!-- hover column hit areas -->
      <div
        class="absolute inset-y-0 flex"
        :style="{ left: hitLeft + '%', right: 0 }"
        @mouseleave="hover = null"
      >
        <div
          v-for="(label, i) in props.labels"
          :key="label + i"
          :data-metric-line-col="label"
          class="flex-1 cursor-crosshair"
          @mouseenter="hover = i"
        />
      </div>

      <!-- text labels as HTML overlay so preserveAspectRatio never stretches them -->
      <div class="pointer-events-none absolute inset-0">
        <span
          v-for="f in [0, 0.5, 1]"
          :key="'ylabel-' + f"
          class="absolute -translate-y-1/2 text-[9px] leading-none text-zinc-400 dark:text-zinc-500"
          :style="{ top: pctY(8 + plotH * f), right: yLabelRight + '%' }"
        >
          {{ Math.round(max * (1 - f)) }}
        </span>
        <template v-for="(label, i) in props.labels" :key="'x-' + label + '-' + i">
          <span
            v-if="n <= 7 || i % Math.ceil(n / 7) === 0 || i === n - 1"
            class="absolute -translate-x-1/2 text-[9px] leading-none text-zinc-400 dark:text-zinc-500"
            :style="{ top: xLabelTop + '%', left: pctX(xAt(i)) }"
          >
            {{ label }}
          </span>
        </template>

        <!-- hover tooltip -->
        <div
          v-if="hover !== null && n > 0"
          data-metric-line-tooltip
          class="absolute z-10 rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 shadow-md dark:border-zinc-700 dark:bg-zinc-800"
          :style="{
            top: 0,
            left: pctX(xAt(hover)),
            transform: `translateX(${hover > n / 2 ? '-90%' : '-10%'})`,
          }"
        >
          <p class="text-[10px] font-medium text-zinc-500 dark:text-zinc-400">{{ props.labels[hover] }}</p>
          <p
            v-for="s in props.series"
            :key="'tt-' + s.name"
            class="mt-0.5 flex items-center gap-1.5 whitespace-nowrap text-[11px]"
          >
            <span class="inline-block h-1.5 w-1.5 rounded-full" :style="{ background: s.color }" />
            <span class="text-zinc-500 dark:text-zinc-400">{{ s.name }}</span>
            <span class="ml-auto font-mono font-medium text-zinc-900 dark:text-zinc-50">
              {{ s.values[hover] ?? 0 }}{{ props.unit }}
            </span>
          </p>
        </div>
      </div>
    </div>

    <!-- legend -->
    <div v-if="props.series.length > 1" data-metric-line-legend class="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
      <span
        v-for="s in props.series"
        :key="'lg-' + s.name"
        class="flex items-center gap-1.5 text-[11px] text-zinc-500 dark:text-zinc-400"
      >
        <span class="inline-block h-1.5 w-1.5 rounded-full" :style="{ background: s.color }" />
        {{ s.name }}
      </span>
    </div>
  </div>
</template>
