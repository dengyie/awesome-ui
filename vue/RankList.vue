<template>
  <section
    data-rank-list
    class="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
    :class="className"
  >
    <header
      v-if="title || valueHeader"
      class="flex items-center justify-between border-b border-zinc-100 px-4 py-2.5 dark:border-zinc-800"
    >
      <h3 v-if="title" class="text-xs font-semibold text-zinc-800 dark:text-zinc-200">{{ title }}</h3>
      <span v-else />
      <span v-if="valueHeader" class="text-[10px] font-semibold uppercase tracking-wide text-zinc-400">{{ valueHeader }}</span>
    </header>
    <p v-if="!visible.length" class="px-4 py-6 text-center text-xs text-zinc-400">{{ emptyText }}</p>
    <ul v-else class="divide-y divide-zinc-50 dark:divide-zinc-800/60">
      <li
        v-for="(item, index) in visible"
        :key="`${item.label}-${index}`"
        :role="onSelect ? 'button' : undefined"
        :tabindex="onSelect ? 0 : undefined"
        :data-rank-index="index"
        class="relative flex items-center gap-2 px-4 py-2 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-500"
        :class="onSelect ? 'cursor-pointer' : ''"
        @click="handleSelect(index, item)"
        @keydown.enter.prevent="handleSelect(index, item)"
        @keydown.space.prevent="handleSelect(index, item)"
      >
        <span
          v-if="showRatio"
          aria-hidden="true"
          class="absolute inset-y-1 left-2 rounded bg-zinc-100 dark:bg-zinc-800"
          :style="{ width: `calc((100% - 1rem) * ${ratioOf(item) / 100})` }"
        />
        <span
          class="relative z-10 flex min-w-0 flex-1 items-center gap-1.5 truncate font-medium text-zinc-800 dark:text-zinc-200"
          :class="showRatio ? 'px-1.5 py-0.5' : ''"
        >
          <UiIcon v-if="item.icon" :name="item.icon" :size="13" class="shrink-0 text-zinc-400" />
          <span class="truncate">{{ item.label }}</span>
        </span>
        <span class="relative z-10 shrink-0 font-mono text-[11px] font-semibold text-zinc-600 dark:text-zinc-300">{{ item.value }}</span>
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import UiIcon, { type IconName } from './UiIcon.vue';

export interface RankListItem {
  label: string;
  value: string | number;
  ratio?: number;
  icon?: IconName;
}

const props = withDefaults(
  defineProps<{
    items?: RankListItem[];
    title?: string;
    valueHeader?: string;
    showRatio?: boolean;
    maxItems?: number;
    emptyText?: string;
    onSelect?: (index: number, item: RankListItem) => void;
    className?: string;
  }>(),
  { items: () => [], title: '', valueHeader: 'Value', showRatio: false, emptyText: 'No data yet', className: '' },
);

const emit = defineEmits<{
  (e: 'select', index: number, item: RankListItem): void;
}>();

const visible = computed(() =>
  typeof props.maxItems === 'number' ? props.items.slice(0, props.maxItems) : props.items,
);

const peak = computed(() =>
  Math.max(...visible.value.map((item) => Number(item.ratio ?? item.value) || 0), 1),
);

const ratioOf = (item: RankListItem) =>
  Math.max(4, Math.min(100, ((Number(item.ratio ?? item.value) || 0) / peak.value) * 100));

const handleSelect = (index: number, item: RankListItem) => {
  props.onSelect?.(index, item);
  emit('select', index, item);
};
</script>
