<script setup lang="ts">
interface BrandPromptRow {
  id: string;
  prompt: string;
  topic?: string;
  visibility: number;
  sentiment: number;
  position: number;
  mentions?: number;
}

interface Props {
  title?: string;
  rows?: BrandPromptRow[];
  quotaUsed?: number;
  quotaTotal?: number;
}
const props = withDefaults(defineProps<Props>(), {
  title: "Prompts",
  rows: () => [],
});
const emit = defineEmits<{
  (e: "add-prompt"): void;
  (e: "row-click", row: BrandPromptRow): void;
}>();

const sentimentClass = (score: number) =>
  score >= 70
    ? "text-emerald-600 dark:text-emerald-400"
    : score >= 50
      ? "text-amber-600 dark:text-amber-400"
      : "text-red-600 dark:text-red-400";
const hasQuota = () => typeof props.quotaUsed === "number" && typeof props.quotaTotal === "number";
</script>

<template>
  <div data-brand-prompt-table class="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
    <div class="flex items-center justify-between border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
      <div class="flex items-center gap-3">
        <h3 class="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{{ props.title }}</h3>
        <span
          v-if="hasQuota()"
          data-brand-quota
          class="rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
        >{{ props.quotaUsed }} / {{ props.quotaTotal }} prompts</span>
      </div>
      <button
        type="button"
        data-brand-add
        @click="emit('add-prompt')"
        class="rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-indigo-500"
      >
        + Add Prompt
      </button>
    </div>
    <p
      v-if="props.rows.length === 0"
      data-brand-empty
      class="px-4 py-8 text-center text-xs text-zinc-500 dark:text-zinc-400"
    >
      No prompts tracked yet — add your first brand prompt.
    </p>
    <table v-else class="w-full text-left text-xs">
      <thead>
        <tr class="border-b border-zinc-200 text-[11px] uppercase tracking-wide text-zinc-400 dark:border-zinc-800 dark:text-zinc-500">
          <th class="px-4 py-2 font-semibold">Prompt</th>
          <th class="px-3 py-2 font-semibold">Visibility</th>
          <th class="px-3 py-2 font-semibold">Sentiment</th>
          <th class="px-3 py-2 font-semibold">Position</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="row in props.rows"
          :key="row.id"
          :data-brand-row="row.id"
          @click="emit('row-click', row)"
          class="border-b border-zinc-100 transition-colors last:border-0 hover:bg-zinc-50 dark:border-zinc-800/60 dark:hover:bg-zinc-800/40"
        >
          <td class="max-w-xs truncate px-4 py-2.5 font-medium text-zinc-800 dark:text-zinc-100">{{ row.prompt }}</td>
          <td data-brand-visibility class="px-3 py-2.5 text-zinc-600 dark:text-zinc-300">{{ row.visibility }}%</td>
          <td data-brand-sentiment class="px-3 py-2.5 font-semibold" :class="sentimentClass(row.sentiment)">{{ row.sentiment }}</td>
          <td data-brand-position class="px-3 py-2.5 text-zinc-600 dark:text-zinc-300">#{{ row.position }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
