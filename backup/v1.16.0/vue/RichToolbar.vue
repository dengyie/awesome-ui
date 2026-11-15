<template>
  <div role="toolbar" aria-label="Formatting"
    class="flex flex-wrap items-center gap-1 rounded-lg border border-zinc-200 bg-white p-1 dark:border-zinc-800 dark:bg-zinc-900"
    :class="$attrs.class">
    <template v-for="(group, groupIndex) in groups" :key="group.id">
      <span v-if="groupIndex > 0" aria-hidden="true" class="mx-0.5 h-5 w-px shrink-0 bg-zinc-200 dark:bg-zinc-700" />
      <div role="group" :aria-label="group.label || group.id" class="flex items-center gap-0.5">
        <button v-for="item in group.items" :key="item.id" type="button"
          :aria-label="item.label" :aria-pressed="item.active ? true : undefined"
          :title="item.shortcut ? `${item.label} (${item.shortcut})` : item.label" :disabled="item.disabled"
          :class="['flex h-7 min-w-7 items-center justify-center rounded-md px-1.5 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-40',
            item.active ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400' : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800']"
          @click="$emit('action', item.id)">
          <span v-if="item.text" class="font-semibold leading-none">{{ item.text }}</span>
          <UiIcon v-else :name="item.icon || 'square'" :size="15" />
        </button>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import UiIcon from './UiIcon.vue';

export interface RichToolbarItem {
  id: string;
  label: string;
  icon?: string;
  text?: string;
  shortcut?: string;
  active?: boolean;
  disabled?: boolean;
}

export interface RichToolbarGroup {
  id: string;
  label?: string;
  items: RichToolbarItem[];
}

withDefaults(defineProps<{ groups?: RichToolbarGroup[] }>(), { groups: () => [] });
defineEmits<{ (e: 'action', id: string): void }>();
</script>
