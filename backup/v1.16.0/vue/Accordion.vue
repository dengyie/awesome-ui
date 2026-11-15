<template>
  <div
    :class="['divide-y divide-zinc-100 overflow-hidden rounded-xl border border-zinc-200 bg-white dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-900', $attrs.class]">
    <div v-for="item in items" :key="item.id">
      <h3>
        <button type="button" :id="`accordion-trigger-${item.id}`" :aria-expanded="isOpen(item.id)"
          :aria-controls="`accordion-panel-${item.id}`" @click="toggle(item.id)"
          class="flex w-full items-center gap-2.5 px-4 py-3 text-left transition-colors hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-500 dark:hover:bg-zinc-800/50">
          <span v-if="item.icon" class="shrink-0 text-indigo-600 dark:text-indigo-400">
            <UiIcon :name="item.icon" :size="14" />
          </span>
          <span class="min-w-0 flex-1">
            <span class="block text-xs font-medium text-zinc-800 dark:text-zinc-100">{{ item.title }}</span>
            <span v-if="item.description" class="mt-0.5 block text-[11px] text-zinc-500 dark:text-zinc-400">{{ item.description }}</span>
          </span>
          <span :class="['shrink-0 text-zinc-400 transition-transform duration-200', isOpen(item.id) ? 'rotate-180' : '']">
            <UiIcon name="chevron-down" :size="14" />
          </span>
        </button>
      </h3>
      <div v-if="isOpen(item.id)" :id="`accordion-panel-${item.id}`" role="region"
        :aria-labelledby="`accordion-trigger-${item.id}`"
        class="px-4 pb-3 text-[11px] leading-relaxed text-zinc-600 dark:text-zinc-400">
        {{ item.content }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import UiIcon, { type IconName } from './UiIcon.vue';

export interface AccordionItem {
  id: string;
  title: string;
  description?: string;
  content: string;
  icon?: IconName;
  defaultOpen?: boolean;
}

const props = withDefaults(
  defineProps<{
    items: AccordionItem[];
    allowMultiple?: boolean;
    defaultOpenIds?: string[];
  }>(),
  { allowMultiple: false }
);
const emit = defineEmits<{ (e: 'toggle', id: string, open: boolean): void }>();

const openIds = ref<string[]>(
  props.defaultOpenIds ?? props.items.filter((item) => item.defaultOpen).map((item) => item.id)
);

const isOpen = (id: string) => openIds.value.includes(id);

const toggle = (id: string) => {
  const wasOpen = isOpen(id);
  if (wasOpen) {
    openIds.value = openIds.value.filter((entry) => entry !== id);
  } else {
    openIds.value = props.allowMultiple ? [...openIds.value, id] : [id];
  }
  emit('toggle', id, !wasOpen);
};
</script>
