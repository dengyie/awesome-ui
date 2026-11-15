<script setup lang="ts">
export interface IterationActionBarProps {
  page?: number;
  totalPages?: number;
  class?: string;
}

const props = withDefaults(defineProps<IterationActionBarProps>(), {
  page: 1,
  totalPages: 4,
  class: "",
});
const emit = defineEmits(["action", "page-change"]);

const pill =
  "rounded-full px-3 py-1.5 text-xs font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500";
const pillOutlined = `${pill} border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800`;
const pillIcon = `${pill} border border-zinc-200 bg-white px-2 text-zinc-500 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800`;
const arrow = `${pill} border border-zinc-200 bg-white px-2.5 py-1.5 text-xs text-zinc-600 transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800`;
</script>

<template>
  <div data-iteration-action-bar class="flex flex-wrap items-center gap-2" :class="props.class">
    <button type="button" data-iteration-action="show-more" :class="pillOutlined" @click="emit('action', 'show-more')">↻ Show More</button>
    <button type="button" data-iteration-action="brainstorm" :class="pillOutlined" @click="emit('action', 'brainstorm')">✦ Brainstorm</button>
    <button type="button" data-iteration-action="reply" :class="pillOutlined" @click="emit('action', 'reply')">❝ Reply</button>
    <button type="button" data-iteration-action="more" aria-label="More actions" :class="pillIcon" @click="emit('action', 'more')">···</button>
    <span data-iteration-pager class="ml-1 inline-flex items-center gap-1">
      <button type="button" data-iteration-prev aria-label="Previous page" :class="arrow" :disabled="props.page <= 1" @click="emit('page-change', props.page - 1)">‹</button>
      <button type="button" data-iteration-next aria-label="Next page" :class="arrow" :disabled="props.page >= props.totalPages" @click="emit('page-change', props.page + 1)">›</button>
      <span data-iteration-page-label class="ml-1 text-[11px] font-medium text-zinc-400 dark:text-zinc-500">{{ props.page }}/{{ props.totalPages }}</span>
    </span>
  </div>
</template>
