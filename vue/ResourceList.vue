<template>
  <section
    data-resource-list
    :class="`overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 ${className}`"
  >
    <header
      v-if="title"
      class="flex items-center justify-between border-b border-zinc-100 px-4 py-2.5 dark:border-zinc-800"
    >
      <h3 class="text-xs font-semibold text-zinc-800 dark:text-zinc-200">{{ title }}</h3>
      <span class="font-mono text-[10px] font-medium text-zinc-400">{{ items.length }}</span>
    </header>
    <p v-if="visible.length === 0" class="px-4 py-6 text-center text-xs text-zinc-400">{{ emptyText }}</p>
    <ul v-else class="divide-y divide-zinc-50 dark:divide-zinc-800/60">
      <li
        v-for="(item, index) in visible"
        :key="`${item.name}-${index}`"
        :role="onSelect ? 'button' : undefined"
        :tabindex="onSelect ? 0 : undefined"
        :data-resource-index="index"
        @click="handleSelect(item, index)"
        @keydown="handleKeydown($event, item, index)"
        :class="`flex items-center gap-3 px-4 py-2 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-500 ${
          onSelect ? 'cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/40' : ''
        }`"
      >
        <span
          class="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
        >
          <UiIcon :name="(item.icon || 'layers') as IconName" :size="14" />
        </span>
        <span class="min-w-0 flex-1">
          <span class="block truncate font-medium text-zinc-800 dark:text-zinc-200">{{ item.name }}</span>
          <span v-if="item.path" class="block truncate font-mono text-[10px] text-zinc-400">{{ item.path }}</span>
        </span>
        <span v-if="item.timeLabel" class="shrink-0 text-[10px] text-zinc-400">{{ item.timeLabel }}</span>
        <span
          v-if="item.kind"
          :class="`shrink-0 rounded-full px-2 py-px text-[10px] font-medium ${kindTone(item.kindTone)}`"
        >
          {{ item.kind }}
        </span>
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import UiIcon, { type IconName } from './UiIcon.vue';

export interface ResourceItem {
  name: string;
  path?: string;
  kind?: string;
  kindTone?: 'zinc' | 'indigo' | 'emerald' | 'amber';
  timeLabel?: string;
  icon?: IconName;
}

const props = withDefaults(
  defineProps<{
    items: ResourceItem[];
    title?: string;
    emptyText?: string;
    maxItems?: number;
    onSelect?: (item: ResourceItem, index: number) => void;
    className?: string;
  }>(),
  { emptyText: 'No resources yet', className: '' }
);

const emit = defineEmits<{ (e: 'select', item: ResourceItem, index: number): void }>();

const visible = computed(() =>
  typeof props.maxItems === 'number' ? props.items.slice(0, props.maxItems) : props.items
);

const kindTone = (tone?: string) => {
  if (tone === 'indigo') return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300';
  if (tone === 'emerald') return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300';
  if (tone === 'amber') return 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300';
  return 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400';
};

const handleSelect = (item: ResourceItem, index: number) => {
  props.onSelect?.(item, index);
  emit('select', item, index);
};

const handleKeydown = (event: KeyboardEvent, item: ResourceItem, index: number) => {
  if (props.onSelect && (event.key === 'Enter' || event.key === ' ')) {
    event.preventDefault();
    handleSelect(item, index);
  }
};
</script>
