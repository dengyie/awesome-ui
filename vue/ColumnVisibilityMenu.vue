<template>
  <div data-column-visibility-menu class="w-64 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
    <div class="flex items-center justify-between border-b border-zinc-100 px-3 py-2.5 dark:border-zinc-800">
      <p data-column-count class="text-sm text-zinc-500 dark:text-zinc-400">
        Showing <span class="font-semibold text-zinc-800 dark:text-zinc-100">{{ visibleCount }}</span> of {{ columns.length }}
      </p>
      <button type="button" data-column-reset class="text-xs font-medium text-indigo-600 hover:underline dark:text-indigo-400" @click="emit('reset')">{{ resetLabel }}</button>
    </div>
    <ul class="max-h-72 overflow-y-auto py-1">
      <li v-for="(column, index) in columns" :key="column.id" :data-column-row="column.id" :data-column-visible="isVisible(column) ? 'true' : 'false'">
        <div :class="['flex items-center gap-2 px-3 py-1.5', column.locked ? 'opacity-60' : '']">
          <span v-if="showReorderHandles && !column.locked" class="flex shrink-0 flex-col text-zinc-300 dark:text-zinc-600" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="currentColor" class="h-3 w-3"><circle cx="9" cy="6" r="1.5" /><circle cx="15" cy="6" r="1.5" /><circle cx="9" cy="12" r="1.5" /><circle cx="15" cy="12" r="1.5" /><circle cx="9" cy="18" r="1.5" /><circle cx="15" cy="18" r="1.5" /></svg>
          </span>
          <svg v-if="column.locked" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-3.5 w-3.5 shrink-0 text-zinc-400"><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></svg>
          <span class="min-w-0 flex-1 truncate text-xs font-medium text-zinc-700 dark:text-zinc-200">{{ column.label }}</span>
          <button type="button" data-column-toggle :aria-label="`${isVisible(column) ? 'Hide' : 'Show'} ${column.label}`" :disabled="column.locked" :class="['shrink-0 rounded p-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500', isVisible(column) ? 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800' : 'text-zinc-300 hover:bg-zinc-50 dark:text-zinc-600']" @click="toggle(column)">
            <svg v-if="isVisible(column)" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-3.5 w-3.5"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>
            <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-3.5 w-3.5"><path d="M2 12s3.5-7 10-7c2 0 3.7.6 5.1 1.5M22 12s-3.5 7-10 7c-2 0-3.7-.6-5.1-1.5" /><path d="m4 4 16 16" /></svg>
          </button>
          <span v-if="showReorderHandles && !column.locked" class="flex shrink-0 flex-col">
            <button type="button" data-column-up :aria-label="`Move ${column.label} up`" class="rounded p-0.5 text-zinc-300 hover:bg-zinc-100 hover:text-zinc-500 focus-visible:outline-none dark:hover:bg-zinc-800" @click="emit('reorder', index, index - 1)">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-2.5 w-2.5"><path d="m18 15-6-6-6 6" /></svg>
            </button>
            <button type="button" data-column-down :aria-label="`Move ${column.label} down`" class="rounded p-0.5 text-zinc-300 hover:bg-zinc-100 hover:text-zinc-500 focus-visible:outline-none dark:hover:bg-zinc-800" @click="emit('reorder', index, index + 1)">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-2.5 w-2.5"><path d="m6 9 6 6 6-6" /></svg>
            </button>
          </span>
        </div>
      </li>
    </ul>
    <div v-if="applyMode === 'apply-button'" class="border-t border-zinc-100 p-2 dark:border-zinc-800">
      <button type="button" data-column-apply class="w-full rounded-lg bg-zinc-900 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-white" @click="emit('apply', [...draft])">
        {{ applyLabel }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';

export interface ColumnDef {
  id: string;
  label: string;
  locked?: boolean;
  hidden?: boolean;
}

const props = withDefaults(
  defineProps<{
    columns: ColumnDef[];
    visibleIds?: string[];
    showReorderHandles?: boolean;
    applyMode?: 'instant' | 'apply-button';
    resetLabel?: string;
    applyLabel?: string;
  }>(),
  { visibleIds: () => [], showReorderHandles: true, applyMode: 'instant', resetLabel: 'Reset to default', applyLabel: 'Apply' },
);

const emit = defineEmits<{
  (e: 'toggle', id: string, visible: boolean): void;
  (e: 'reorder', from: number, to: number): void;
  (e: 'reset'): void;
  (e: 'apply', visibleIds: string[]): void;
}>();

const draft = ref(new Set<string>(props.visibleIds.length ? props.visibleIds : props.columns.filter((c) => !c.hidden).map((c) => c.id)));

watch(
  () => props.visibleIds,
  (ids) => {
    if (ids.length) draft.value = new Set(ids);
  },
);

const isVisible = (column: ColumnDef) => {
  if (column.locked) return true;
  if (props.applyMode === 'apply-button') return draft.value.has(column.id);
  return props.visibleIds.length ? props.visibleIds.includes(column.id) : !column.hidden;
};

const visibleCount = computed(() => props.columns.filter((c) => isVisible(c)).length);

const toggle = (column: ColumnDef) => {
  if (column.locked) return;
  const nextVisible = !isVisible(column);
  if (props.applyMode === 'apply-button') {
    const next = new Set(draft.value);
    if (nextVisible) next.add(column.id);
    else next.delete(column.id);
    draft.value = next;
  } else {
    const next = props.visibleIds.includes(column.id)
      ? props.visibleIds.filter((id) => id !== column.id)
      : [...props.visibleIds, column.id];
    emit('apply', next);
  }
  emit('toggle', column.id, nextVisible);
};
</script>
