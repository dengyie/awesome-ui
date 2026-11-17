<script setup lang="ts">
import { computed, ref } from "vue";

export interface SavedView {
  id: string;
  label: string;
  filters?: string[];
}

export interface TableSavedViewsProps {
  views?: SavedView[];
  active?: string;
  saveLabel?: string;
  shareLabel?: string;
  class?: string;
}

const props = withDefaults(defineProps<TableSavedViewsProps>(), {
  views: () => [
    { id: "all", label: "All records", filters: [] },
    { id: "mine", label: "Assigned to me", filters: ["assignee: me"] },
    { id: "stale", label: "Stale 30d+", filters: ["updated < 30d", "status: open"] },
  ],
  active: "",
  saveLabel: "Save view",
  shareLabel: "Share",
  class: "",
});

const emit = defineEmits<{
  (e: "view-change", view: SavedView): void;
  (e: "view-save", id: string): void;
  (e: "view-share", id: string): void;
}>();

const list = computed(() => (Array.isArray(props.views) ? props.views : []));
const internalActive = ref("");
const activeId = computed(() => props.active || internalActive.value || list.value[0]?.id || "all");
const active = computed(() => list.value.find((v) => v.id === activeId.value) ?? list.value[0] ?? { id: "all", label: "All records", filters: [] });

const switchTo = (view: SavedView) => {
  internalActive.value = view.id;
  emit("view-change", view);
};
</script>

<template>
  <div data-savedviews-bar class="w-full rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900" :class="props.class">
    <div data-savedviews-tabs class="flex items-center gap-1 border-b border-zinc-100 px-3 dark:border-zinc-800">
      <button
        v-for="view in list"
        :key="view.id"
        type="button"
        :data-savedview-tab="view.id"
        class="whitespace-nowrap px-3 py-2 text-sm transition-colors"
        :class="view.id === active.id
          ? 'border-b-2 border-violet-600 font-semibold text-violet-700 dark:border-violet-500 dark:text-violet-300'
          : 'border-b-2 border-transparent font-medium text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200'"
        @click="switchTo(view)"
      >
        {{ view.label }}
      </button>
    </div>
    <div data-savedviews-body class="flex flex-wrap items-center gap-2 px-5 py-3">
      <span data-savedview-filters class="inline-flex flex-wrap items-center gap-2">
        <template v-if="(active.filters || []).length">
          <span v-for="f in active.filters" :key="f" :data-savedview-filter="f" class="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">{{ f }}</span>
        </template>
        <span v-else data-savedview-nofilters class="text-xs text-zinc-400 dark:text-zinc-500">No filters</span>
      </span>
      <span class="flex-1"></span>
      <button type="button" :data-savedview-share="active.id" class="rounded-md border border-zinc-200 px-2.5 py-1 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800" @click="emit('view-share', active.id)">{{ props.shareLabel }}</button>
      <button type="button" :data-savedview-save="active.id" class="rounded-md bg-violet-600 px-2.5 py-1 text-xs font-semibold text-white transition-colors hover:bg-violet-500" @click="emit('view-save', active.id)">{{ props.saveLabel }}</button>
    </div>
  </div>
</template>
