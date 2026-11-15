<script setup lang="ts">
export type QaRating = 'good' | 'acceptable' | 'poor';

export interface QaTestRow {
  id: string;
  question: string;
  answered?: boolean;
  rating?: QaRating;
}

interface Props {
  rows?: QaTestRow[];
  title?: string;
}

const props = withDefaults(defineProps<Props>(), {
  rows: () => [],
  title: 'QA tests',
});

const emit = defineEmits<{
  (e: 'row-check', row: QaTestRow, checked: boolean): void;
  (e: 'row-select', row: QaTestRow): void;
}>();

import { ref } from 'vue';

const checked = ref<Record<string, boolean>>({});

const toggle = (row: QaTestRow) => {
  const next = !checked.value[row.id];
  checked.value = { ...checked.value, [row.id]: next };
  emit('row-check', row, next);
};

const answeredCount = props.rows.filter((r) => r.answered !== false).length;

const ratingChip: Record<string, string> = {
  good: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300',
  acceptable: 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300',
  poor: 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300',
};

const ratingLabel: Record<string, string> = {
  good: 'Good',
  acceptable: 'Acceptable',
  poor: 'Poor',
};
</script>

<template>
  <div
    data-qa-test-table
    class="w-full overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
  >
    <div class="flex items-center gap-2 border-b border-zinc-100 px-4 py-2.5 dark:border-zinc-800">
      <span class="text-xs font-semibold text-zinc-700 dark:text-zinc-200">{{ props.title }}</span>
      <span class="ml-auto text-[11px] tabular-nums text-zinc-400 dark:text-zinc-500">
        {{ props.rows.length }} questions
      </span>
      <span class="text-[11px] tabular-nums text-emerald-600 dark:text-emerald-400">
        {{ answeredCount }} answered
      </span>
    </div>
    <table data-qa-rows class="w-full text-left">
      <thead>
        <tr class="border-b border-zinc-100 text-[10px] uppercase tracking-wider text-zinc-400 dark:border-zinc-800 dark:text-zinc-500">
          <th class="w-10 py-2 pl-4 font-medium"></th>
          <th class="py-2 pr-3 font-medium">Question</th>
          <th class="py-2 pr-3 text-center font-medium">Answer status</th>
          <th class="py-2 pr-4 font-medium">Answer rating</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="row in props.rows"
          :key="row.id"
          :data-qa-row="row.id"
          class="cursor-pointer border-b border-zinc-50 text-xs transition-colors hover:bg-zinc-50 dark:border-zinc-800/60 dark:hover:bg-zinc-800/60"
          @click="emit('row-select', row)"
        >
          <td class="py-2.5 pl-4">
            <input
              type="checkbox"
              data-qa-check
              :aria-label="'Select ' + row.question"
              :checked="!!checked[row.id]"
              @click.stop
              @change="toggle(row)"
              class="h-3.5 w-3.5 cursor-pointer accent-emerald-600"
            />
          </td>
          <td data-qa-question class="max-w-72 truncate py-2.5 pr-3 text-zinc-800 dark:text-zinc-100">
            {{ row.question }}
          </td>
          <td class="py-2.5 pr-3 text-center">
            <span v-if="row.answered !== false" data-qa-status class="text-emerald-500">✓</span>
            <span v-else data-qa-status class="text-zinc-300 dark:text-zinc-600">—</span>
          </td>
          <td class="py-2.5 pr-4">
            <span
              v-if="row.rating"
              :data-qa-rating="row.rating"
              class="inline rounded-full px-2 py-0.5 text-[10px] font-semibold"
              :class="ratingChip[row.rating]"
            >
              {{ ratingLabel[row.rating] }}
            </span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
