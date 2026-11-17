<script setup lang="ts">
import { computed } from "vue";

export interface BentoTile {
  id: string;
  title: string;
  description?: string;
  icon?: string;
  span?: 1 | 2 | 3;
  media?: string;
}

export interface BentoFeatureGridProps {
  title?: string;
  description?: string;
  tiles?: BentoTile[];
  class?: string;
}

const props = withDefaults(defineProps<BentoFeatureGridProps>(), {
  title: "Built for the AI era",
  description: "A curated atomic library assembled from real product patterns.",
  tiles: () => [
    { id: "t1", title: "Ship faster", description: "Generate production-ready components in one prompt.", icon: "⚡", span: 2 },
    { id: "t2", title: "Zero blackbox", description: "Every component is a single readable file.", icon: "📄", span: 1 },
    { id: "t3", title: "Three stacks", description: "React, Vue 3 and Vanilla with aligned APIs.", icon: "🧩", span: 1 },
    { id: "t4", title: "Mobbin-grade patterns", description: "Visual language borrowed from the best products.", icon: "🎯", span: 2 },
  ],
  class: "",
});

const emit = defineEmits<{
  (e: "tile-click", tile: BentoTile): void;
}>();

const SPAN_CLASS: Record<number, string> = { 2: "sm:col-span-2", 3: "sm:col-span-3" };
const list = computed(() => (Array.isArray(props.tiles) ? props.tiles : []));
</script>

<template>
  <div data-bento-grid class="w-full rounded-xl border border-zinc-200 bg-zinc-50/60 p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/60" :class="props.class">
    <div data-bento-header class="mb-5 text-center">
      <p data-bento-heading class="text-lg font-semibold text-zinc-900 dark:text-zinc-50">{{ props.title }}</p>
      <p data-bento-subtitle class="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{{ props.description }}</p>
    </div>
    <div data-bento-tiles class="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <div
        v-for="tile in list"
        :key="tile.id"
        :data-bento-tile="tile.id"
        class="group cursor-pointer rounded-xl border border-zinc-200 bg-white p-5 transition-all hover:border-violet-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-violet-700"
        :class="SPAN_CLASS[tile.span ?? 1] ?? ''"
        @click="emit('tile-click', tile)"
      >
        <div v-if="tile.icon" :data-bento-icon="tile.id" aria-hidden="true" class="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-violet-50 text-lg dark:bg-violet-950/50">{{ tile.icon }}</div>
        <p :data-bento-title="tile.title" class="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{{ tile.title }}</p>
        <p :data-bento-description="tile.id" class="mt-1 text-xs leading-5 text-zinc-500 dark:text-zinc-400">{{ tile.description || "" }}</p>
        <div v-if="tile.media" :data-bento-media="tile.id" class="mt-3 overflow-hidden rounded-lg border border-zinc-100 dark:border-zinc-800">
          <img :src="tile.media" alt="" loading="lazy" class="h-28 w-full object-cover" />
        </div>
      </div>
    </div>
  </div>
</template>
