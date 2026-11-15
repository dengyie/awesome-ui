<template>
  <div :class="$attrs.class" class="relative">
    <div class="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
      <table class="w-full text-xs">
        <thead class="bg-zinc-50 dark:bg-zinc-900/60">
          <tr>
            <th v-if="selectable" class="w-10 px-3 py-2">
              <input type="checkbox" :checked="allSelected" @change="toggleAll" aria-label="Select all rows"
                class="h-3.5 w-3.5 rounded border-zinc-300 dark:border-zinc-600 accent-indigo-600" />
            </th>
            <th v-for="column in columns" :key="column.key" :style="column.width ? { width: column.width } : undefined"
              :class="['px-3 py-2 font-medium text-zinc-500 dark:text-zinc-400', alignClass(column.align)]">
              <button type="button" @click="toggleSort(column.key)"
                class="inline-flex items-center gap-1 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors">
                {{ column.label }}
                <span class="text-zinc-300 dark:text-zinc-600">
                  <UiIcon :name="sortIcon(column.key)" :size="11" />
                </span>
              </button>
            </th>
            <th v-if="actions.length" class="w-20 px-3 py-2" />
          </tr>
        </thead>
        <tbody class="divide-y divide-zinc-100 dark:divide-zinc-800">
          <tr v-if="sortedRows.length === 0">
            <td :colspan="columns.length + (selectable ? 1 : 0) + (actions.length ? 1 : 0)"
              class="px-3 py-10 text-center text-zinc-400 dark:text-zinc-500">{{ emptyText }}</td>
          </tr>
          <tr v-for="(row, index) in sortedRows" :key="index" class="group hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
            <td v-if="selectable" class="px-3 py-2">
              <input type="checkbox" :checked="selected.has(index)" @change="toggleRow(index)"
                :aria-label="`Select row ${index + 1}`" class="h-3.5 w-3.5 rounded border-zinc-300 dark:border-zinc-600 accent-indigo-600" />
            </td>
            <td v-for="column in columns" :key="column.key"
              :class="['px-3 py-2 text-zinc-700 dark:text-zinc-200', alignClass(column.align), column.align === 'right' ? 'tabular-nums' : '']">
              {{ row[column.key] ?? '—' }}
            </td>
            <td v-if="actions.length" class="px-3 py-2">
              <div class="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button v-for="action in actions" :key="action.label" type="button" :aria-label="action.label" :title="action.label"
                  class="rounded p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-700 dark:hover:text-zinc-200 transition-colors"
                  @click="action.onClick(row)">
                  <UiIcon :name="action.icon || 'more-horizontal'" :size="14" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="selectable && selected.size > 0"
      class="fixed bottom-6 left-1/2 z-20 flex -translate-x-1/2 items-center gap-3 rounded-full border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-2 shadow-lg">
      <span class="text-xs font-medium text-zinc-700 dark:text-zinc-200">{{ selected.size }} selected</span>
      <div class="flex items-center gap-1">
        <button v-for="action in actions" :key="action.label" type="button"
          class="rounded-full px-2.5 py-1 text-xs text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-700 transition-colors"
          @click="runBatch(action)">{{ action.label }}</button>
      </div>
      <button type="button" aria-label="Clear selection" class="rounded-full p-1 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700"
        @click="selected = new Set()">
        <UiIcon name="x" :size="13" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, reactive } from 'vue';
import UiIcon from './UiIcon.vue';

export interface DataTableColumn { key: string; label: string; align?: 'left' | 'center' | 'right'; width?: string }
export type DataTableRow = Record<string, string | number | boolean | null | undefined>;
export interface DataTableAction { label: string; icon?: string; onClick: (row: DataTableRow) => void }

const props = withDefaults(defineProps<{
  columns: DataTableColumn[];
  rows: DataTableRow[];
  selectable?: boolean;
  onSort?: (key: string, direction: 'asc' | 'desc') => void;
  actions?: DataTableAction[];
  emptyText?: string;
}>(), { selectable: false, actions: () => [], emptyText: 'No results' });

const sortKey = ref<string | null>(null);
const sortDir = ref<'asc' | 'desc'>('asc');
const selected = ref(new Set<number>());

const alignClass = (align?: DataTableColumn['align']) =>
  align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left';

const sortedRows = computed(() => {
  if (props.onSort || !sortKey.value) return props.rows;
  const key = sortKey.value;
  const dir = sortDir.value === 'asc' ? 1 : -1;
  return [...props.rows].sort((a, b) => {
    const av = a[key]; const bv = b[key];
    if (av === bv) return 0;
    return (String(av ?? '') > String(bv ?? '') ? 1 : -1) * dir;
  });
});

const allSelected = computed(() => sortedRows.value.length > 0 && selected.value.size === sortedRows.value.length);

const toggleSort = (key: string) => {
  const nextDir = sortKey.value === key && sortDir.value === 'asc' ? 'desc' : 'asc';
  sortKey.value = key; sortDir.value = nextDir; props.onSort?.(key, nextDir);
};
const sortIcon = (key: string) => (sortKey.value === key ? (sortDir.value === 'asc' ? 'arrow-up' : 'arrow-down') : 'chevron-down');
const toggleAll = () => { selected.value = allSelected.value ? new Set() : new Set(sortedRows.value.map((_, i) => i)); };
const toggleRow = (index: number) => {
  const next = new Set(selected.value);
  next.has(index) ? next.delete(index) : next.add(index);
  selected.value = next;
};
const runBatch = (action: DataTableAction) => {
  selected.value.forEach((index) => action.onClick(sortedRows.value[index]));
  selected.value = new Set();
};
</script>
