<template>
  <div data-pipeline-list class="w-full divide-y divide-zinc-200 rounded-lg border border-zinc-200 bg-white dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-900">
    <div v-for="group in groups" :key="group.id" :data-pipeline-group="group.id">
      <button type="button" data-pipeline-group-header class="flex w-full items-center gap-2.5 px-4 py-3 text-left transition-colors hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:hover:bg-zinc-800/60" @click="toggle(group.id)">
        <svg v-if="isRunning(group)" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-4 w-4 shrink-0 animate-spin text-sky-500"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
        <span v-else class="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-dashed border-zinc-400" />
        <span class="min-w-0 flex-1">
          <span class="block text-sm font-bold text-zinc-900 dark:text-zinc-50">{{ group.title }}</span>
          <span v-if="group.currentStep" class="block truncate text-xs text-zinc-500 dark:text-zinc-400">{{ group.currentStep }}</span>
        </span>
        <span v-if="showDuration" class="shrink-0 font-mono text-xs text-zinc-500 dark:text-zinc-400">{{ durationLabel(groupDuration(group)) }}</span>
        <svg v-if="collapsible" :class="['h-3.5 w-3.5 shrink-0 text-zinc-400 transition-transform', expanded.has(group.id) ? 'rotate-90' : '']" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 18 6-6-6-6" /></svg>
      </button>
      <div v-if="expanded.has(group.id)" class="mx-3 mb-3 rounded-md bg-zinc-50 px-3 py-1.5 dark:bg-zinc-800/60">
        <button v-for="stage in group.stages" :key="stage.id" type="button" :data-pipeline-stage="stage.id" :data-stage-status="stage.status" class="flex w-full items-center justify-between gap-2 border-b border-zinc-200 py-2 text-left last:border-b-0 focus-visible:outline-none dark:border-zinc-700/60" @click="emit('stage-click', stage)">
          <span class="truncate text-xs font-medium text-zinc-800 dark:text-zinc-100">{{ stage.label }}</span>
          <span class="flex shrink-0 items-center gap-2 font-mono text-[11px]">
            <span v-if="showDuration && stage.durationMs != null" class="text-zinc-400">{{ durationLabel(stage.durationMs) }}</span>
            <span :class="STAGE_STATUS[stage.status]?.tone">{{ STAGE_STATUS[stage.status]?.text || 'Pending' }}</span>
          </span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

export interface PipelineStage {
  id: string;
  label: string;
  status: 'pending' | 'running' | 'success' | 'failed';
  durationMs?: number;
}

export interface PipelineGroup {
  id: string;
  title: string;
  currentStep?: string;
  stages: PipelineStage[];
}

const STAGE_STATUS: Record<string, { text: string; tone: string }> = {
  pending: { text: 'Pending', tone: 'text-zinc-400' },
  running: { text: 'Running', tone: 'text-sky-600 dark:text-sky-400' },
  success: { text: 'Completed', tone: 'text-emerald-600 dark:text-emerald-400' },
  failed: { text: 'Failed', tone: 'text-rose-600 dark:text-rose-400' },
};

const props = withDefaults(
  defineProps<{
    groups: PipelineGroup[];
    defaultExpanded?: string[];
    showDuration?: boolean;
    collapsible?: boolean;
  }>(),
  { defaultExpanded: () => [], showDuration: true, collapsible: true },
);

const emit = defineEmits<{
  (e: 'stage-click', stage: PipelineStage): void;
}>();

const expanded = ref(new Set(props.defaultExpanded));

const toggle = (id: string) => {
  if (!props.collapsible) return;
  const next = new Set(expanded.value);
  if (next.has(id)) next.delete(id);
  else next.add(id);
  expanded.value = next;
};

const isRunning = (group: PipelineGroup) => group.stages.some((stage) => stage.status === 'running');
const groupDuration = (group: PipelineGroup) => group.stages.reduce((sum, stage) => sum + (stage.durationMs || 0), 0) || undefined;

const durationLabel = (ms?: number) => {
  if (ms == null) return '';
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(ms % 1000 === 0 ? 0 : 1)}s`;
  return `${Math.floor(ms / 60000)}m ${Math.round((ms % 60000) / 1000)}s`;
};
</script>
