<script setup lang="ts">
export interface FineTuneJob {
  id: string;
  model: string;
  status: "queued" | "training" | "completed" | "failed";
  progress?: number;
  cost?: string;
  eta?: string;
  baseModel?: string;
}
interface Props {
  title?: string;
  jobs: FineTuneJob[];
  newText?: string;
}
const props = withDefaults(defineProps<Props>(), {
  title: "Fine-tuning jobs",
  newText: "New fine-tune",
});
const emit = defineEmits<{
  (e: "new"): void;
  (e: "cancel", job: FineTuneJob): void;
}>();

const STATUS_STYLE: Record<string, { chip: string; label: string }> = {
  queued: { chip: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300", label: "Queued" },
  training: { chip: "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300", label: "Training" },
  completed: { chip: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300", label: "Completed" },
  failed: { chip: "bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-300", label: "Failed" },
};
const isActive = (status: string) => status === "queued" || status === "training";
</script>

<template>
  <div data-finetune-list class="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
    <div class="flex items-center justify-between">
      <p class="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{{ title }}</p>
      <button type="button" data-finetune-new @click="emit('new')" class="rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-indigo-500">{{ newText }}</button>
    </div>
    <div class="mt-3 space-y-2">
      <div
        v-for="job in props.jobs"
        :key="job.id"
        :data-finetune-job="job.id"
        class="rounded-lg border border-zinc-200 px-3 py-2.5 transition-colors hover:border-zinc-300 dark:border-zinc-800 dark:hover:border-zinc-700"
      >
        <div class="flex items-center justify-between gap-2">
          <p class="flex min-w-0 items-center gap-2">
            <code data-finetune-model class="truncate font-mono text-sm font-semibold text-zinc-900 dark:text-zinc-50">{{ job.model }}</code>
            <span v-if="job.baseModel" class="truncate text-[11px] text-zinc-400 dark:text-zinc-500">from {{ job.baseModel }}</span>
          </p>
          <span :data-finetune-status="job.status" class="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold" :class="(STATUS_STYLE[job.status] || STATUS_STYLE.queued).chip">{{ (STATUS_STYLE[job.status] || STATUS_STYLE.queued).label }}</span>
        </div>
        <p v-if="job.cost || job.eta" class="mt-1 flex items-center gap-2 text-[11px] text-zinc-500 dark:text-zinc-400">
          <span v-if="job.cost" data-finetune-cost>{{ job.cost }}</span>
          <span v-if="job.cost && job.eta" aria-hidden="true">·</span>
          <span v-if="job.eta" data-finetune-eta>ETA {{ job.eta }}</span>
        </p>
        <div v-if="job.status === 'training'" class="mt-2 flex items-center gap-2">
          <div data-finetune-progress class="h-1.5 flex-1 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
            <div class="h-full rounded-full bg-indigo-600 transition-all" :style="{ width: (job.progress ?? 0) + '%' }"></div>
          </div>
          <span class="w-8 text-right font-mono text-[10px] text-zinc-500 dark:text-zinc-400">{{ job.progress ?? 0 }}%</span>
        </div>
        <div v-if="isActive(job.status)" class="mt-2 flex justify-end">
          <button type="button" data-finetune-cancel @click="emit('cancel', job)" class="text-[11px] font-semibold text-red-600 hover:underline dark:text-red-400">Cancel job</button>
        </div>
      </div>
      <div v-if="props.jobs.length === 0" data-finetune-empty class="rounded-lg border border-dashed border-zinc-300 px-3 py-6 text-center text-xs text-zinc-400 dark:border-zinc-700">
        No fine-tuning jobs yet.
      </div>
    </div>
  </div>
</template>
