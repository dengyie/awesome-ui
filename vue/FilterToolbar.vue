<template>
  <div data-filter-toolbar role="toolbar" aria-label="List filters" class="flex flex-wrap items-center gap-2 rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900" :class="className">
    <span
      v-for="(chip, index) in chips"
      :key="`${chip.label}-${index}`"
      :data-filter-chip="index"
      class="flex items-center gap-1.5 rounded-full border border-zinc-300 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
    >
      {{ chip.label }}
      <span
        v-if="chip.value"
        class="rounded-full px-2 py-0.5 text-[10px] font-semibold"
        :class="valueTone[chip.valueTone ?? 'indigo']"
      >
        {{ chip.value }}
      </span>
      <UiIcon v-else name="chevron-down" :size="12" class="text-zinc-400" />
      <button
        v-if="chip.removable && chip.value"
        type="button"
        :data-chip-remove="index"
        :aria-label="`Remove ${chip.label} filter`"
        class="ml-0.5 rounded-full p-0.5 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:hover:bg-zinc-800"
        @click="emit('chip-remove', index, chip)"
      >
        <UiIcon name="x" :size="11" />
      </button>
    </span>
    <span class="relative ml-auto min-w-[140px] flex-1 sm:max-w-xs">
      <UiIcon name="search" :size="13" class="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400" />
      <input
        type="search"
        data-toolbar-search
        :value="searchValue"
        :placeholder="searchPlaceholder"
        class="w-full rounded-lg border border-zinc-300 bg-white py-1.5 pl-8 pr-3 text-xs text-zinc-900 placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
        @input="emit('search', ($event.target as HTMLInputElement).value)"
      />
    </span>
    <span v-if="view" data-view-toggle role="group" aria-label="View mode" class="flex overflow-hidden rounded-lg border border-zinc-300 dark:border-zinc-700">
      <button
        v-for="mode in (['list', 'grid'] as const)"
        :key="mode"
        type="button"
        :data-view-mode="mode"
        :aria-pressed="view === mode"
        class="flex h-7 w-8 items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-500"
        :class="view === mode ? 'bg-indigo-600 text-white' : 'bg-white text-zinc-400 hover:bg-zinc-50 dark:bg-zinc-900 dark:hover:bg-zinc-800'"
        @click="emit('view-change', mode)"
      >
        <UiIcon :name="(mode === 'list' ? 'more-horizontal' : 'square') as IconName" :size="13" />
      </button>
    </span>
    <button
      v-if="actionLabel"
      type="button"
      data-toolbar-action
      class="flex items-center gap-1.5 rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-white"
      @click="emit('action')"
    >
      <UiIcon name="plus" :size="12" />
      {{ actionLabel }}
    </button>
  </div>
</template>

<script setup lang="ts">
import UiIcon, { type IconName } from './UiIcon.vue';

export interface FilterChip {
  label: string;
  value?: string;
  valueTone?: 'rose' | 'emerald' | 'amber' | 'indigo';
  removable?: boolean;
}

withDefaults(
  defineProps<{
    chips?: FilterChip[];
    searchValue?: string;
    searchPlaceholder?: string;
    view?: 'list' | 'grid' | '';
    actionLabel?: string;
    className?: string;
  }>(),
  { chips: () => [], searchValue: '', searchPlaceholder: 'Search…', view: 'list' as const, actionLabel: '', className: '' },
);

const emit = defineEmits<{
  (e: 'chip-remove', index: number, chip: FilterChip): void;
  (e: 'search', value: string): void;
  (e: 'view-change', view: 'list' | 'grid'): void;
  (e: 'action'): void;
}>();

const valueTone: Record<string, string> = {
  rose: 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300',
  emerald: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300',
  amber: 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300',
  indigo: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300',
};
</script>
