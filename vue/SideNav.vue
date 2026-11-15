<template>
  <nav
    data-side-nav
    :aria-label="heading || 'Side navigation'"
    class="flex flex-col gap-4 rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900"
    :class="className"
  >
    <p v-if="heading" class="px-2.5 text-[10px] font-semibold uppercase tracking-wide text-zinc-400">{{ heading }}</p>
    <div v-for="(group, groupIndex) in groups" :key="group.title || groupIndex" class="flex flex-col gap-0.5">
      <p v-if="group.title" class="px-2.5 pb-1 text-[10px] font-semibold uppercase tracking-wide text-zinc-400">{{ group.title }}</p>
      <button
        v-for="entry in group.items"
        :key="entry.id"
        type="button"
        :data-nav-id="entry.id"
        :aria-current="entry.id === activeId ? 'page' : undefined"
        class="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        :class="
          entry.id === activeId
            ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
            : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/60 dark:hover:text-zinc-200'
        "
        @click="handleNavigate(entry)"
      >
        <UiIcon
          v-if="entry.icon"
          :name="entry.icon"
          :size="14"
          :class="entry.id === activeId ? 'text-indigo-500' : 'text-zinc-400'"
        />
        <span class="min-w-0 flex-1 truncate">{{ entry.label }}</span>
        <span
          v-if="entry.count !== undefined"
          class="rounded-full px-1.5 py-px font-mono text-[9.5px] font-semibold"
          :class="
            entry.count > 0
              ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
              : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400'
          "
        >
          {{ entry.count }}
        </span>
      </button>
    </div>
  </nav>
</template>

<script setup lang="ts">
import UiIcon, { type IconName } from './UiIcon.vue';

export interface SideNavEntry {
  id: string;
  label: string;
  icon?: IconName;
  count?: number;
}

export interface SideNavGroup {
  title?: string;
  items: SideNavEntry[];
}

const props = withDefaults(
  defineProps<{
    groups?: SideNavGroup[];
    activeId?: string;
    heading?: string;
    onNavigate?: (id: string, entry: SideNavEntry) => void;
    className?: string;
  }>(),
  { groups: () => [], activeId: '', heading: '', className: '' },
);

const emit = defineEmits<{
  (e: 'navigate', id: string, entry: SideNavEntry): void;
}>();

const handleNavigate = (entry: SideNavEntry) => {
  props.onNavigate?.(entry.id, entry);
  emit('navigate', entry.id, entry);
};
</script>
