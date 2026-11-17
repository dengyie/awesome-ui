<script setup lang="ts">
import { computed } from "vue";

export interface StatItem {
  value: string;
  label: string;
  note?: string;
}

export interface StatsBandProps {
  stats?: StatItem[];
  class?: string;
}

const props = withDefaults(defineProps<StatsBandProps>(), {
  stats: () => [
    { value: "235+", label: "Production components", note: "React / Vue / Vanilla" },
    { value: "771", label: "Regression tests", note: "jsdom + SSR + compile" },
    { value: "706", label: "Source files", note: "Single-file, copy-paste" },
    { value: "3.5k", label: "Reference screens", note: "Mobbin-curated patterns" },
  ],
  class: "",
});

const list = computed(() => (Array.isArray(props.stats) ? props.stats : []));
const columnsFor = (count: number) => {
  if (count >= 4) return "sm:grid-cols-4";
  if (count === 3) return "sm:grid-cols-3";
  if (count === 2) return "sm:grid-cols-2";
  return "";
};
</script>

<template>
  <div data-stats-band class="w-full rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900" :class="props.class">
    <div data-stats-grid class="grid grid-cols-1 divide-y divide-zinc-100 dark:divide-zinc-800 sm:divide-x sm:divide-y-0" :class="columnsFor(list.length)">
      <div v-for="(stat, index) in list" :key="index" :data-stats-cell="index" class="flex flex-col items-center gap-1 px-4 py-3 text-center">
        <span :data-stats-value="stat.value" class="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">{{ stat.value }}</span>
        <span :data-stats-label="stat.label" class="text-sm font-medium text-zinc-600 dark:text-zinc-300">{{ stat.label }}</span>
        <p v-if="stat.note" :data-stats-note="index" class="mt-1 text-[11px] font-medium text-zinc-400 dark:text-zinc-500">{{ stat.note }}</p>
      </div>
    </div>
  </div>
</template>
