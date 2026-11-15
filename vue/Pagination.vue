<template>
  <nav :aria-label="ariaLabel" :class="['flex items-center gap-1', $attrs.class]">
    <button v-if="showEdges" type="button" aria-label="First page" :disabled="page <= 1" :class="[BASE, EDGE_CLASS]"
      @click="go(1)">
      <UiIcon name="chevron-left" :size="13" />
    </button>
    <button type="button" aria-label="Previous page" :disabled="page <= 1" :class="[BASE, EDGE_CLASS]"
      @click="go(page - 1)">
      <UiIcon name="chevron-left" :size="13" />
    </button>
    <template v-for="(slot, index) in slots" :key="slot === 'gap' ? `gap-${index}` : slot">
      <span v-if="slot === 'gap'" aria-hidden="true" class="px-1 text-[11px] text-zinc-400">…</span>
      <button v-else type="button" :aria-label="`Page ${slot}`" :aria-current="slot === page ? 'page' : undefined"
        :class="[BASE, 'tabular-nums', slot === page ? 'bg-indigo-600 text-white' : PAGE_CLASS]" @click="go(slot)">
        {{ slot }}
      </button>
    </template>
    <button type="button" aria-label="Next page" :disabled="page >= pageCount" :class="[BASE, EDGE_CLASS]"
      @click="go(page + 1)">
      <UiIcon name="chevron-right" :size="13" />
    </button>
    <button v-if="showEdges" type="button" aria-label="Last page" :disabled="page >= pageCount"
      :class="[BASE, EDGE_CLASS]" @click="go(pageCount)">
      <UiIcon name="chevron-right" :size="13" />
    </button>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import UiIcon from './UiIcon.vue';

export type PaginationSlot = number | 'gap';

const props = withDefaults(
  defineProps<{
    page: number;
    pageCount: number;
    siblingCount?: number;
    showEdges?: boolean;
    ariaLabel?: string;
  }>(),
  { siblingCount: 1, showEdges: true, ariaLabel: 'Pagination' }
);

const emit = defineEmits<{ (e: 'change', page: number): void }>();

const BASE =
  'inline-flex h-7 min-w-7 items-center justify-center rounded-md px-1.5 text-[11px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-40';
const EDGE_CLASS =
  'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100';
const PAGE_CLASS = EDGE_CLASS;

const slots = computed<PaginationSlot[]>(() => {
  const { page, pageCount, siblingCount } = props;
  if (pageCount <= 0) return [];
  const seen = new Set<number>([1, pageCount, page]);
  for (let offset = 1; offset <= siblingCount; offset += 1) {
    seen.add(page - offset);
    seen.add(page + offset);
  }
  const sorted = Array.from(seen)
    .filter((entry) => entry >= 1 && entry <= pageCount)
    .sort((a, b) => a - b);
  const result: PaginationSlot[] = [];
  let previous = 0;
  for (const entry of sorted) {
    if (previous > 0 && entry - previous > 1) result.push('gap');
    result.push(entry);
    previous = entry;
  }
  return result;
});

const go = (next: number) => {
  if (next < 1 || next > props.pageCount || next === props.page) return;
  emit('change', next);
};
</script>
