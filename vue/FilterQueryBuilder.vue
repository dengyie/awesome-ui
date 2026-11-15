<template>
  <div data-filter-query-builder class="w-full rounded-lg border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900">
    <div class="space-y-2">
      <div v-for="(row, index) in rows" :key="row.id" :data-filter-row="row.id" class="flex flex-wrap items-center gap-1.5">
        <span :class="['rounded px-2 py-1 text-xs font-medium', index === 0 ? 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400' : 'bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-300']">{{ row.conjunction }}</span>
        <select data-filter-field :value="row.field" class="rounded-md border border-zinc-200 bg-zinc-50 px-2 py-1 text-xs font-medium text-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200" @change="updateRow(row.id, { field: ($event.target as HTMLSelectElement).value, operator: 'equals' })">
          <option v-for="field in fields" :key="field.name" :value="field.name">{{ field.label }}</option>
        </select>
        <select data-filter-operator :value="row.operator" class="rounded-md border border-zinc-200 bg-zinc-50 px-2 py-1 font-mono text-xs text-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200" @change="updateRow(row.id, { operator: ($event.target as HTMLSelectElement).value })">
          <option v-for="op in operatorsFor(row.field)" :key="op" :value="op">{{ OPERATOR_GLYPH[op] || op }}</option>
        </select>
        <input type="text" data-filter-value :value="row.value" placeholder="Value" class="min-w-[100px] flex-1 rounded-md border border-transparent bg-zinc-50 px-2 py-1 text-xs text-zinc-800 placeholder:text-zinc-400 focus-visible:border-indigo-400 focus-visible:outline-none dark:bg-zinc-800 dark:text-zinc-100" @input="updateRow(row.id, { value: ($event.target as HTMLInputElement).value })" />
        <button type="button" data-filter-remove aria-label="Remove filter" class="h-5 w-5 shrink-0 rounded-full text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 focus-visible:outline-none dark:hover:bg-zinc-800" @click="emit('change', rows.filter((item) => item.id !== row.id))">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="mx-auto h-3 w-3"><path d="M18 6 6 18M6 6l12 12" /></svg>
        </button>
      </div>
      <p v-if="rows.length === 0" data-filter-empty class="py-1 text-xs text-zinc-400 dark:text-zinc-500">No filters applied.</p>
    </div>
    <div class="mt-3 flex items-center justify-between">
      <button type="button" data-filter-add :disabled="rows.length >= maxRows" class="rounded-md px-2 py-1 text-xs font-semibold text-indigo-600 transition-colors hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:text-indigo-400 dark:hover:bg-indigo-950/40" @click="addRow">
        {{ addLabel }}
      </button>
      <button v-if="rows.length" type="button" data-filter-clear class="text-xs font-medium text-zinc-500 underline-offset-2 transition-colors hover:text-zinc-700 hover:underline dark:text-zinc-400" @click="emit('change', []); emit('clear')">
        {{ clearLabel }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
export interface QueryFilterField {
  name: string;
  label: string;
  operators?: string[];
}

export interface QueryFilterRow {
  id: string;
  conjunction: 'where' | 'and' | 'or';
  field: string;
  operator: string;
  value: string;
}

const OPERATOR_GLYPH: Record<string, string> = {
  equals: '=',
  'not-equals': '<>',
  greater: '>',
  less: '<',
  contains: '~',
  gte: '>=',
  lte: '<=',
};

const props = withDefaults(
  defineProps<{
    fields?: QueryFilterField[];
    rows?: QueryFilterRow[];
    addLabel?: string;
    clearLabel?: string;
    maxRows?: number;
  }>(),
  { fields: () => [], rows: () => [], addLabel: '+ Add filter', clearLabel: 'Clear filters', maxRows: 8 },
);

const emit = defineEmits<{
  (e: 'change', rows: QueryFilterRow[]): void;
  (e: 'clear'): void;
}>();

const operatorsFor = (name: string) => props.fields.find((field) => field.name === name)?.operators || ['equals', 'not-equals', 'greater', 'less', 'contains', 'gte', 'lte'];

const updateRow = (id: string, patch: Partial<QueryFilterRow>) => {
  emit('change', props.rows.map((item) => (item.id === id ? { ...item, ...patch } : item)));
};

const addRow = () => {
  emit('change', [
    ...props.rows,
    { id: `f${Date.now()}`, conjunction: props.rows.length === 0 ? 'where' : 'and', field: props.fields[0]?.name || '', operator: 'equals', value: '' },
  ]);
};
</script>
