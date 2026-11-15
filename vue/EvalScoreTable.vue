<script setup lang="ts">
export type EvalScoreTone = 'pass' | 'warn' | 'fail';

export interface EvalRun {
  id: string;
  name: string;
  score: number;
  grader?: string;
  tone?: EvalScoreTone;
}

export interface EvalCriteria {
  id: string;
  title: string;
  description: string;
}

interface Props {
  runs?: EvalRun[];
  criteria?: EvalCriteria[];
  title?: string;
  showAddCriteria?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  runs: () => [],
  criteria: () => [],
  title: 'Evaluation report',
  showAddCriteria: false,
});

const emit = defineEmits<{
  (e: 'run-select', run: EvalRun): void;
  (e: 'add-criteria'): void;
}>();

const toneClasses = (tone?: EvalScoreTone) => {
  switch (tone) {
    case 'warn':
      return 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300';
    case 'fail':
      return 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300';
    default:
      return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300';
  }
};

const toneBar = (tone?: EvalScoreTone) => {
  switch (tone) {
    case 'warn':
      return 'bg-amber-500';
    case 'fail':
      return 'bg-red-500';
    default:
      return 'bg-emerald-500';
  }
};
</script>

<template>
  <div
    data-eval-score-table
    class="w-full overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
  >
    <div class="flex items-center gap-2 border-b border-zinc-100 px-4 py-2.5 dark:border-zinc-800">
      <span class="text-xs font-semibold text-zinc-700 dark:text-zinc-200">{{ props.title }}</span>
      <span class="ml-auto text-[11px] text-zinc-400 dark:text-zinc-500">{{ props.runs.length }} runs</span>
    </div>

    <div class="px-4 py-3">
      <table data-eval-runs class="w-full text-left">
        <thead>
          <tr class="border-b border-zinc-100 text-[10px] uppercase tracking-wider text-zinc-400 dark:border-zinc-800 dark:text-zinc-500">
            <th class="py-1.5 pr-3 font-medium">Run</th>
            <th class="py-1.5 pr-3 font-medium">Score</th>
            <th class="py-1.5 font-medium">Grader</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="run in props.runs"
            :key="run.id"
            :data-eval-run="run.id"
            class="cursor-pointer border-b border-zinc-50 text-xs transition-colors hover:bg-zinc-50 dark:border-zinc-800/60 dark:hover:bg-zinc-800/60"
            @click="emit('run-select', run)"
          >
            <td class="py-2 pr-3 font-medium text-zinc-800 dark:text-zinc-100">{{ run.name }}</td>
            <td class="py-2 pr-3">
              <span class="flex items-center gap-2">
                <span
                  data-eval-score
                  class="rounded-md px-2 py-0.5 text-[11px] font-semibold tabular-nums"
                  :class="toneClasses(run.tone)"
                >{{ run.score }}%</span>
                <span class="h-1.5 w-20 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                  <span
                    data-eval-score-bar
                    class="block h-full rounded-full"
                    :class="toneBar(run.tone)"
                    :style="{ width: `${Math.min(Math.max(run.score, 0), 100)}%` }"
                  ></span>
                </span>
              </span>
            </td>
            <td class="py-2 text-zinc-500 dark:text-zinc-400">{{ run.grader ?? '—' }}</td>
          </tr>
        </tbody>
      </table>

      <div v-if="props.criteria.length > 0" data-eval-criteria class="mt-4 grid gap-3 sm:grid-cols-2">
        <div
          v-for="c in props.criteria"
          :key="c.id"
          :data-eval-criterion="c.id"
          class="rounded-lg border border-zinc-200 p-3 dark:border-zinc-700"
        >
          <p class="text-xs font-semibold text-zinc-800 dark:text-zinc-100">{{ c.title }}</p>
          <p class="mt-1 text-[11px] leading-relaxed text-zinc-500 dark:text-zinc-400">{{ c.description }}</p>
        </div>
      </div>

      <button
        v-if="props.showAddCriteria"
        type="button"
        data-eval-add-criteria
        class="mt-3 flex w-full flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed border-zinc-300 py-3 text-xs font-medium text-zinc-500 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800/60"
        @click="emit('add-criteria')"
      >
        <span class="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-100 text-sm dark:bg-zinc-800">+</span>
        Add criteria
      </button>
    </div>
  </div>
</template>
