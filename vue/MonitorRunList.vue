<script setup lang="ts">
export interface RunRow {
  id: string;
  name: string;
  startedAt: string;
  latencyMs: number;
  ok?: boolean;
}
export interface HistogramBar {
  label: string;
  value: number;
}
export interface MonitorRunListProps {
  runs?: RunRow[];
  histogram?: HistogramBar[];
  ranges?: string[];
  activeRange?: string;
  class?: string;
}
const props = withDefaults(defineProps<MonitorRunListProps>(), {
  runs: () => [
    { id: "r1", name: "Product Performance Metrics", startedAt: "Oct 14, 1:00 AM", latencyMs: 7000, ok: true },
    { id: "r2", name: "Q2 Financial Overview", startedAt: "Oct 14, 12:59 AM", latencyMs: 6688, ok: true },
    { id: "r3", name: "Customer Retention Strategy", startedAt: "Oct 14, 12:37 AM", latencyMs: 1819, ok: true },
    { id: "r4", name: "Employee Satisfaction Survey 2025", startedAt: "Oct 13, 10:44 PM", latencyMs: 903, ok: true },
  ],
  histogram: () => [
    { label: "13:00", value: 40 }, { label: "15:00", value: 25 }, { label: "17:00", value: 55 },
    { label: "19:00", value: 30 }, { label: "21:00", value: 70 }, { label: "23:00", value: 45 },
    { label: "01:00", value: 60 }, { label: "03:00", value: 35 }, { label: "05:00", value: 80 },
    { label: "07:00", value: 50 }, { label: "09:00", value: 65 }, { label: "11:00", value: 20 },
  ],
  ranges: () => ["24 hrs", "7 days", "30 days", "6 months"],
  activeRange: "24 hrs",
  class: "",
});
const emit = defineEmits(["run-click", "range-change"]);
const formatLatency = (ms: number) => {
  if (ms < 1000) return `${ms} ms`;
  const s = Math.floor(ms / 1000);
  const rem = ms % 1000;
  return rem === 0 ? `${s} s` : `${s} s ${rem} ms`;
};
const max = () => Math.max(1, ...props.histogram.map((b) => b.value));
const barHeight = (value: number) => `${Math.max(4, (value / max()) * 56)}px`;
</script>

<template>
  <div data-monitor-run-list class="w-full rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900" :class="props.class">
    <div data-monitor-toolbar class="flex items-center justify-between gap-2 border-b border-zinc-100 px-4 py-2.5 dark:border-zinc-800">
      <button type="button" data-monitor-filter class="inline-flex items-center gap-1.5 rounded-md border border-zinc-200 px-2.5 py-1 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800">
        <span aria-hidden="true">⏳</span> Filter
      </button>
      <div data-monitor-ranges class="inline-flex items-center gap-1">
        <button
          v-for="range in props.ranges"
          :key="range"
          type="button"
          :data-monitor-range="range"
          :aria-pressed="range === props.activeRange"
          :class="range === props.activeRange
            ? 'rounded-md bg-emerald-600 px-2 py-1 text-xs font-medium text-white'
            : 'rounded-md px-2 py-1 text-xs font-medium text-zinc-500 transition-colors hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-800'"
          @click="emit('range-change', range)"
        >
          {{ range }}
        </button>
      </div>
    </div>
    <div data-monitor-histogram class="flex h-20 items-end gap-1 border-b border-zinc-100 px-4 pt-3 dark:border-zinc-800">
      <div v-for="bar in props.histogram" :key="bar.label" :data-monitor-bar="bar.label" class="flex min-w-0 flex-1 flex-col items-center gap-1">
        <div class="w-full rounded-sm bg-emerald-600/85 transition-colors hover:bg-emerald-500" :style="{ height: barHeight(bar.value) }" :title="bar.label + ' · ' + bar.value" />
        <span class="w-full truncate text-center text-[9px] text-zinc-400 dark:text-zinc-500">{{ bar.label }}</span>
      </div>
    </div>
    <table data-monitor-runs class="w-full">
      <thead>
        <tr class="border-b border-zinc-100 text-left text-[11px] font-medium text-zinc-400 dark:border-zinc-800 dark:text-zinc-500">
          <th class="px-4 py-2 font-medium">Started At</th>
          <th class="px-2 py-2 font-medium">Name</th>
          <th class="px-4 py-2 text-right font-medium">Latency</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="run in props.runs"
          :key="run.id"
          :data-monitor-run="run.id"
          tabindex="0"
          class="cursor-pointer border-b border-zinc-50 text-xs transition-colors last:border-b-0 hover:bg-zinc-50 dark:border-zinc-800/60 dark:hover:bg-zinc-800/60"
          @click="emit('run-click', run)"
          @keydown.enter="emit('run-click', run)"
        >
          <td data-monitor-run-time class="whitespace-nowrap px-4 py-2.5 text-zinc-400 dark:text-zinc-500">
            <span class="mr-1.5 inline-flex items-center" aria-hidden="true">{{ run.ok !== false ? '✅' : '⚠️' }}</span>
            {{ run.startedAt }}
          </td>
          <td data-monitor-run-name class="max-w-0 truncate px-2 py-2.5 font-medium text-zinc-800 dark:text-zinc-100">{{ run.name }}</td>
          <td data-monitor-run-latency class="whitespace-nowrap px-4 py-2.5 text-right text-zinc-500 dark:text-zinc-400">{{ formatLatency(run.latencyMs) }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
