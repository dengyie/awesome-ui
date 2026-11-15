<script setup lang="ts">
export type ContentReviewStatus = 'valid' | 'error';

export interface ContentReviewRow {
  id: string;
  text: string;
  tags?: string[];
  extraTags?: number;
  time?: string;
  status: ContentReviewStatus;
}

interface Props {
  rows?: ContentReviewRow[];
  title?: string;
  draftsLabel?: string;
  scheduleLabel?: string;
}

const props = withDefaults(defineProps<Props>(), {
  rows: () => [],
  title: 'Review content',
  draftsLabel: 'Save as Drafts',
  scheduleLabel: 'Schedule Posts',
});

const emit = defineEmits<{
  (e: 'row-select', row: ContentReviewRow): void;
  (e: 'save-drafts'): void;
  (e: 'schedule'): void;
}>();

const errors = props.rows.filter((r) => r.status === 'error').length;
const valid = props.rows.length - errors;
</script>

<template>
  <div
    data-content-review
    class="w-full overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
  >
    <div class="flex flex-col items-center gap-1 border-b border-zinc-100 px-4 py-3 dark:border-zinc-800">
      <span class="text-sm font-semibold text-zinc-800 dark:text-zinc-100">{{ props.title }}</span>
      <span class="flex items-center gap-3 text-[11px] text-zinc-500 dark:text-zinc-400">
        <span data-review-valid-count class="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
          ✓ {{ valid }} valid
        </span>
        <span data-review-error-count class="flex items-center gap-1 text-red-500 dark:text-red-400">
          ⚠ {{ errors }} {{ errors === 1 ? 'error' : 'errors' }}
        </span>
      </span>
    </div>

    <table data-review-table class="w-full text-left">
      <thead>
        <tr class="border-b border-zinc-100 text-[10px] uppercase tracking-wider text-zinc-400 dark:border-zinc-800 dark:text-zinc-500">
          <th class="w-10 py-2 pl-4 font-medium">#</th>
          <th class="py-2 pr-3 font-medium">Text</th>
          <th class="py-2 pr-3 font-medium">Tags</th>
          <th class="py-2 pr-3 font-medium">Posting time</th>
          <th class="py-2 pr-4 font-medium">Status</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(row, index) in props.rows"
          :key="row.id"
          :data-review-row="row.id"
          class="cursor-pointer border-b border-zinc-50 text-xs transition-colors hover:bg-zinc-50 dark:border-zinc-800/60 dark:hover:bg-zinc-800/60"
          @click="emit('row-select', row)"
        >
          <td class="py-2.5 pl-4 tabular-nums text-zinc-400 dark:text-zinc-500">{{ index + 1 }}</td>
          <td data-review-text class="max-w-48 truncate py-2.5 pr-3 text-zinc-800 dark:text-zinc-100">
            {{ row.text }}
          </td>
          <td class="py-2.5 pr-3">
            <span class="flex items-center gap-1">
              <span
                v-for="tag in (row.tags ?? []).slice(0, 1)"
                :key="tag"
                data-review-tag
                class="inline rounded bg-sky-100 px-1.5 py-0.5 text-[10px] font-medium text-sky-700 dark:bg-sky-950/60 dark:text-sky-300"
              >
                {{ tag }}
              </span>
              <span
                v-if="typeof row.extraTags === 'number' && row.extraTags > 0"
                data-review-extra-tags
                class="text-[10px] text-zinc-400 dark:text-zinc-500"
              >+{{ row.extraTags }}</span>
            </span>
          </td>
          <td class="py-2.5 pr-3 text-zinc-500 dark:text-zinc-400">{{ row.time ?? 'Add to Queue' }}</td>
          <td class="py-2.5 pr-4">
            <span :aria-label="row.status">
              <span v-if="row.status === 'valid'" data-review-status class="text-emerald-500">✓</span>
              <span v-else data-review-status class="text-red-500">⚠</span>
            </span>
          </td>
        </tr>
      </tbody>
    </table>

    <div class="flex items-center justify-end gap-2 border-t border-zinc-100 px-4 py-3 dark:border-zinc-800">
      <button
        type="button"
        data-review-drafts
        class="rounded-md border border-zinc-300 px-3 py-1.5 text-xs font-semibold text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-800"
        @click="emit('save-drafts')"
      >
        {{ props.draftsLabel }}
      </button>
      <button
        type="button"
        data-review-schedule
        class="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-emerald-500"
        @click="emit('schedule')"
      >
        {{ props.scheduleLabel }}
      </button>
    </div>
  </div>
</template>
