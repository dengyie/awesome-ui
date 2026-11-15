<script setup lang="ts">
export interface PromptPerformanceRow {
  id: string;
  prompt: string;
  visibility: string;
  sentiment: string;
  position: string;
  mentions: string;
  trend?: 'up' | 'down' | 'flat';
}

export interface PromptPerformanceTableProps {
  title?: string;
  exportLabel?: string;
  rows?: PromptPerformanceRow[];
  class?: string;
}

const props = withDefaults(defineProps<PromptPerformanceTableProps>(), {
  title: 'Prompt performance',
  exportLabel: 'Export',
  rows: () => [],
});

const emit = defineEmits<{
  (e: 'export'): void;
  (e: 'row-click', row: PromptPerformanceRow): void;
}>();
</script>

<template>
  <div
    data-prompt-performance-table
    class="w-full overflow-hidden rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
    :class="props.class"
  >
    <div class="flex items-center justify-between border-b border-zinc-100 px-4 py-3 dark:border-zinc-800">
      <h4 data-prompt-performance-title class="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{{ props.title }}</h4>
      <button
        type="button"
        data-prompt-performance-export
        class="rounded border border-zinc-200 px-2 py-1 text-[11px] font-medium text-zinc-600 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
        @click="emit('export')"
      >
        {{ props.exportLabel }}
      </button>
    </div>
    <p
      v-if="props.rows.length === 0"
      data-prompt-performance-empty
      class="px-4 py-6 text-center text-xs text-zinc-400 dark:text-zinc-500"
    >
      No tracked prompts yet.
    </p>
    <table v-else data-prompt-performance-list class="w-full text-left text-xs">
      <thead>
        <tr class="border-b border-zinc-100 text-[10px] uppercase tracking-wide text-zinc-400 dark:border-zinc-800 dark:text-zinc-500">
          <th class="px-4 py-2 font-medium">Prompt</th>
          <th class="px-3 py-2 font-medium">Visibility</th>
          <th class="px-3 py-2 font-medium">Sentiment</th>
          <th class="px-3 py-2 font-medium">Position</th>
          <th class="px-4 py-2 text-right font-medium">Mentions</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-zinc-100 dark:divide-zinc-800">
        <tr
          v-for="row in props.rows"
          :key="row.id"
          :data-prompt-row="row.id"
          class="cursor-pointer transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/60"
          @click="emit('row-click', row)"
        >
          <td data-prompt-row-prompt class="max-w-[220px] truncate px-4 py-2.5 font-medium text-zinc-900 dark:text-zinc-50">
            {{ row.prompt }}
          </td>
          <td data-prompt-row-visibility class="px-3 py-2.5 text-zinc-600 dark:text-zinc-300">{{ row.visibility }}</td>
          <td data-prompt-row-sentiment class="px-3 py-2.5 text-zinc-600 dark:text-zinc-300">
            {{ row.sentiment }}
            <span v-if="row.trend === 'up'" aria-hidden="true" class="text-emerald-500">▲</span>
            <span v-else-if="row.trend === 'down'" aria-hidden="true" class="text-red-500">▼</span>
            <span v-else aria-hidden="true" class="text-zinc-400">—</span>
          </td>
          <td data-prompt-row-position class="px-3 py-2.5 text-zinc-600 dark:text-zinc-300">{{ row.position }}</td>
          <td data-prompt-row-mentions class="px-4 py-2.5 text-right text-zinc-600 dark:text-zinc-300">{{ row.mentions }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
