<template>
  <nav :aria-label="ariaLabel" :class="$attrs.class">
    <ol class="flex flex-wrap items-center gap-1.5 text-[11px]">
      <li v-for="(item, index) in trail" :key="item ? item.id ?? `${item.label}-${index}` : `ellipsis-${index}`"
        class="flex items-center gap-1.5">
        <span v-if="index > 0" aria-hidden="true" class="text-zinc-300 dark:text-zinc-600">
          <UiIcon name="chevron-right" :size="11" />
        </span>
        <span v-if="!item" aria-hidden="true" class="px-1 text-zinc-400">…</span>
        <span v-else-if="index === trail.length - 1" aria-current="page"
          :class="[BASE, 'font-medium text-zinc-800 dark:text-zinc-100']">
          <UiIcon v-if="item.icon" :name="item.icon" :size="12" />
          <span>{{ item.label }}</span>
        </span>
        <a v-else-if="item.href" :href="item.href" :class="[BASE, LINK_CLASS]"
          @click="onLinkClick($event, item, index)">
          <UiIcon v-if="item.icon" :name="item.icon" :size="12" />
          <span>{{ item.label }}</span>
        </a>
        <button v-else type="button" :class="[BASE, LINK_CLASS]" @click="emit('navigate', item, index)">
          <UiIcon v-if="item.icon" :name="item.icon" :size="12" />
          <span>{{ item.label }}</span>
        </button>
      </li>
    </ol>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import UiIcon, { type IconName } from './UiIcon.vue';

export interface BreadcrumbItem {
  id?: string;
  label: string;
  href?: string;
  icon?: IconName;
}

const props = withDefaults(
  defineProps<{
    items: BreadcrumbItem[];
    maxItems?: number;
    ariaLabel?: string;
  }>(),
  { maxItems: 0, ariaLabel: 'Breadcrumb' }
);

const emit = defineEmits<{ (e: 'navigate', item: BreadcrumbItem, index: number): void }>();

const BASE = 'inline-flex items-center gap-1 rounded px-1 py-0.5 transition-colors';
const LINK_CLASS =
  'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100';

const trail = computed<(BreadcrumbItem | null)[]>(() => {
  const { items, maxItems } = props;
  if (maxItems <= 0 || items.length <= maxItems) return items;
  const tail = Math.max(1, maxItems - 1);
  return [items[0], null, ...items.slice(items.length - tail)];
});

const onLinkClick = (event: MouseEvent, item: BreadcrumbItem, index: number) => {
  event.preventDefault();
  emit('navigate', item, index);
};
</script>
