<script setup lang="ts">
export interface ComparisonPlan {
  id: string;
  name: string;
  highlighted?: boolean;
}
export interface ComparisonSection {
  id: string;
  title: string;
  rows: { id: string; label: string; values: { value: boolean | string }[] }[];
}
interface Props {
  plans: ComparisonPlan[];
  sections: ComparisonSection[];
  ctaText?: string;
}
const props = withDefaults(defineProps<Props>(), { ctaText: "Choose plan" });
const emit = defineEmits<{ (e: "select", planId: string): void }>();

const gridStyle = (n: number) => ({ gridTemplateColumns: `minmax(180px, 1.4fr) repeat(${n}, minmax(120px, 1fr))` });
const cellValue = (row: { values: { value: boolean | string }[] }, idx: number) => row.values[idx]?.value ?? false;
</script>

<template>
  <div data-plan-comparison class="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800">
    <!-- header row -->
    <div class="grid" :style="gridStyle(plans.length)">
      <div class="border-b border-zinc-200 px-4 py-3 dark:border-zinc-800" />
      <div
        v-for="plan in plans"
        :key="plan.id"
        :data-comparison-plan="plan.id"
        class="border-b border-zinc-200 px-4 py-3 dark:border-zinc-800"
        :class="plan.highlighted ? 'bg-indigo-50/60 dark:bg-indigo-950/40' : ''"
      >
        <span class="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{{ plan.name }}</span>
      </div>
    </div>
    <div v-for="section in sections" :key="section.id">
      <div
        :data-comparison-section="section.id"
        class="bg-zinc-900 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-zinc-50 dark:bg-zinc-800"
      >
        {{ section.title }}
      </div>
      <div
        v-for="row in section.rows"
        :key="row.id"
        :data-comparison-row="row.id"
        class="grid border-b border-zinc-100 last:border-b-0 dark:border-zinc-800/60"
        :style="gridStyle(plans.length)"
      >
        <div class="px-4 py-2.5 text-sm text-zinc-700 dark:text-zinc-300">{{ row.label }}</div>
        <div
          v-for="(plan, idx) in plans"
          :key="plan.id"
          class="flex items-center gap-2 px-4 py-2.5"
          :class="plan.highlighted ? 'bg-indigo-50/60 dark:bg-indigo-950/40' : ''"
        >
          <template v-if="cellValue(row, idx) === true">
            <span data-comparison-check class="text-indigo-600 dark:text-indigo-400">
              <svg viewBox="0 0 20 20" fill="currentColor" class="h-4 w-4" aria-hidden="true"><path d="M10 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16Zm-1.2-5.4 5-5-1.13-1.13L8.8 10.34 7.33 8.87 6.2 10l2.6 2.6Z" /></svg>
            </span>
          </template>
          <template v-else-if="cellValue(row, idx) === false">
            <span data-comparison-empty class="text-zinc-300 dark:text-zinc-700">
              <svg viewBox="0 0 20 20" fill="currentColor" class="h-4 w-4" aria-hidden="true"><path d="M10 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16ZM6.5 9.25h7v1.5h-7v-1.5Z" /></svg>
            </span>
          </template>
          <template v-else>
            <span data-comparison-check class="text-indigo-600 dark:text-indigo-400">
              <svg viewBox="0 0 20 20" fill="currentColor" class="h-4 w-4" aria-hidden="true"><path d="M10 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16Zm-1.2-5.4 5-5-1.13-1.13L8.8 10.34 7.33 8.87 6.2 10l2.6 2.6Z" /></svg>
            </span>
            <span data-comparison-note class="text-xs text-zinc-600 dark:text-zinc-400">{{ cellValue(row, idx) }}</span>
          </template>
        </div>
      </div>
    </div>
    <!-- footer CTA row -->
    <div class="grid border-t border-zinc-200 dark:border-zinc-800" :style="gridStyle(plans.length)">
      <div class="px-4 py-3" />
      <div
        v-for="plan in plans"
        :key="plan.id"
        class="px-4 py-3"
        :class="plan.highlighted ? 'bg-indigo-50/60 dark:bg-indigo-950/40' : ''"
      >
        <button
          type="button"
          :data-comparison-cta="plan.id"
          class="w-full rounded-md px-3 py-1.5 text-xs font-semibold transition-colors"
          :class="plan.highlighted
            ? 'bg-indigo-600 text-white hover:bg-indigo-500'
            : 'border border-zinc-300 text-zinc-700 hover:border-zinc-400 dark:border-zinc-700 dark:text-zinc-200 dark:hover:border-zinc-600'"
          @click="emit('select', plan.id)"
        >
          {{ ctaText }}
        </button>
      </div>
    </div>
  </div>
</template>
