<script setup lang="ts">
export interface VisionAnalysisSection {
  heading: string;
  rows: Array<{ key: string; value: string }>;
}

export interface VisionAnalysisCardProps {
  sections?: VisionAnalysisSection[];
  class?: string;
}

const props = withDefaults(defineProps<VisionAnalysisCardProps>(), {
  sections: () => [
    {
      heading: "Image Details",
      rows: [
        { key: "Lighting", value: "Strong overhead sunlight creating sharp shadows on sand; excellent clarity suggests midday conditions" },
        { key: "Beach Activity", value: "Scattered groups of swimmers and sunbathers distributed across the sand and shallow water" },
        { key: "Wave Patterns", value: "Multiple rolling waves with consistent whitecaps indicate moderate, consistent swell" },
      ],
    },
  ],
  class: "",
});
defineEmits(["section-click"]);
</script>

<template>
  <div data-vision-analysis-card class="w-full rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900" :class="props.class">
    <div v-for="section in props.sections" :key="section.heading" data-vision-section class="mb-4 last:mb-0">
      <button
        type="button"
        :data-vision-section-heading="section.heading"
        class="mb-2 text-left text-sm font-semibold text-zinc-900 transition-colors hover:text-indigo-600 dark:text-zinc-50 dark:hover:text-indigo-400"
        @click="$emit('section-click', section)"
      >
        {{ section.heading }}
      </button>
      <dl data-vision-rows class="overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800">
        <div
          v-for="row in section.rows"
          :key="row.key"
          :data-vision-row="row.key"
          class="grid grid-cols-[minmax(0,9rem)_1fr] gap-3 border-b border-zinc-100 px-3 py-2 last:border-b-0 dark:border-zinc-800/60"
        >
          <dt data-vision-row-key class="text-xs font-semibold text-zinc-700 dark:text-zinc-200">{{ row.key }}</dt>
          <dd data-vision-row-value class="text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">{{ row.value }}</dd>
        </div>
      </dl>
    </div>
  </div>
</template>
