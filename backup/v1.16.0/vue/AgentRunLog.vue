<template>
  <div :class="$attrs.class" class="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
    <div class="flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800 px-4 py-2.5">
      <UiIcon name="terminal" :size="14" class="text-zinc-400 dark:text-zinc-500" />
      <span class="text-xs font-medium text-zinc-700 dark:text-zinc-200">{{ title }}</span>
      <span class="ml-auto text-[11px] text-zinc-400 dark:text-zinc-500">{{ doneCount }}/{{ steps.length }}</span>
    </div>
    <ol class="px-4 py-3">
      <li v-for="(step, index) in steps" :key="step.id" class="relative pl-6">
        <span v-if="index !== steps.length - 1" aria-hidden="true"
          class="absolute left-[6px] top-5 bottom-0 w-px bg-zinc-200 dark:bg-zinc-700" />
        <span class="absolute left-0 top-1"><UiIcon :name="statusIcon(step.status)" :size="14" :class="statusClass(step.status)" /></span>
        <div class="pb-3">
          <button type="button" :aria-expanded="step.detail ? expanded.has(step.id) : undefined"
            :class="['flex w-full items-center gap-2 text-left', step.detail ? 'cursor-pointer' : 'cursor-default']"
            @click="step.detail && toggle(step.id)">
            <span :class="['text-xs', step.status === 'pending' ? 'text-zinc-400 dark:text-zinc-500' : 'text-zinc-700 dark:text-zinc-200']">{{ step.label }}</span>
            <span v-if="step.durationMs !== undefined" class="text-[11px] tabular-nums text-zinc-400 dark:text-zinc-500">{{ formatDuration(step.durationMs) }}</span>
            <span v-if="step.detail" class="ml-auto text-zinc-400 dark:text-zinc-500">
              <UiIcon :name="expanded.has(step.id) ? 'chevron-up' : 'chevron-down'" :size="12" />
            </span>
          </button>
          <pre v-if="step.detail && expanded.has(step.id)"
            class="mt-2 max-h-48 overflow-auto rounded-lg bg-zinc-950 px-3 py-2 font-mono text-[11px] leading-relaxed text-zinc-300">{{ step.detail }}</pre>
        </div>
      </li>
    </ol>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import UiIcon from './UiIcon.vue';

export type AgentRunStatus = 'pending' | 'running' | 'done' | 'error';
export interface AgentRunStep { id: string; label: string; status: AgentRunStatus; detail?: string; durationMs?: number }

const props = withDefaults(defineProps<{
  steps: AgentRunStep[];
  title?: string;
  autoExpandRunning?: boolean;
}>(), { title: 'Execution log', autoExpandRunning: true });

const expanded = ref(new Set<string>(
  props.autoExpandRunning ? props.steps.filter((s) => s.status === 'running' && s.detail).map((s) => s.id) : []
));

const doneCount = computed(() => props.steps.filter((s) => s.status === 'done').length);

const statusIcon = (status: AgentRunStatus) =>
  status === 'running' ? 'loader' : status === 'done' ? 'check-circle' : status === 'error' ? 'circle-x' : 'clock';
const statusClass = (status: AgentRunStatus) =>
  status === 'running' ? 'animate-spin text-indigo-500' : status === 'done' ? 'text-emerald-500' : status === 'error' ? 'text-red-500' : 'text-zinc-400 dark:text-zinc-500';
const formatDuration = (ms?: number) => (typeof ms !== 'number' ? '' : ms >= 1000 ? `${(ms / 1000).toFixed(1)}s` : `${ms}ms`);
const toggle = (id: string) => {
  const next = new Set(expanded.value);
  next.has(id) ? next.delete(id) : next.add(id);
  expanded.value = next;
};
</script>
