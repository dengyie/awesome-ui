<template>
  <div
    data-gantt-timeline
    role="table"
    :aria-label="columnLabel"
    :aria-rowcount="tasks.length"
    :class="`overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 ${className}`"
  >
    <div
      role="row"
      class="flex items-center border-b border-zinc-100 bg-zinc-50/60 dark:border-zinc-800 dark:bg-zinc-800/40"
    >
      <span
        role="columnheader"
        class="w-44 shrink-0 px-4 py-2 text-[10px] font-semibold uppercase tracking-wide text-zinc-400"
      >
        {{ rowLabel }}
      </span>
      <div class="relative flex min-w-0 flex-1">
        <span
          v-for="cell in cells"
          :key="cell"
          role="columnheader"
          class="min-w-0 flex-1 border-l border-zinc-100 px-1 py-2 text-center text-[10px] font-medium text-zinc-400 dark:border-zinc-800"
        >
          {{ cell + 1 }}
        </span>
      </div>
    </div>
    <p v-if="tasks.length === 0" class="px-4 py-6 text-center text-xs text-zinc-400">{{ emptyText }}</p>
    <template v-else>
      <div
        v-for="(task, index) in tasks"
        :key="`${task.label}-${index}`"
        role="row"
        :data-task-index="index"
        @click="handleClick(task, index)"
        :class="`flex items-stretch border-b border-zinc-50 last:border-b-0 dark:border-zinc-800/60 ${
          onTaskClick ? 'cursor-pointer transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/40' : ''
        }`"
      >
        <span
          role="cell"
          class="flex w-44 shrink-0 items-center py-2 text-xs font-medium text-zinc-700 dark:text-zinc-200"
          :style="{ paddingLeft: `${1 + (task.depth || 0) * 1.25}rem` }"
        >
          <span class="truncate">{{ task.label }}</span>
        </span>
        <div role="cell" class="relative min-w-0 flex-1 border-l border-zinc-100 dark:border-zinc-800">
          <span
            v-for="cell in cells"
            :key="cell"
            aria-hidden="true"
            class="absolute inset-y-0 border-l border-zinc-50 dark:border-zinc-800/60"
            :style="{ left: `${(cell / columns) * 100}%` }"
          />
          <span
            v-if="today !== undefined"
            aria-hidden="true"
            class="absolute inset-y-0 w-px bg-rose-400"
            :style="{ left: `${(Math.min(Math.max(today, 0), columns) / columns) * 100}%` }"
          />
          <div
            data-task-bar
            class="absolute top-1/2 flex h-4 -translate-y-1/2 items-center overflow-hidden rounded"
            :style="{
              left: `${offsetOf(task) * 100}%`,
              width: `calc(${widthOf(task) * 100}% - 4px)`,
            }"
          >
            <div class="relative h-full bg-indigo-500" :class="toneClass(task.tone)">
              <span
                v-if="task.progress !== undefined"
                class="absolute inset-y-0 left-0 bg-white/30"
                :style="{ width: `${Math.min(Math.max(task.progress, 0), 100)}%` }"
              />
            </div>
            <span class="absolute inset-0 flex items-center px-1.5 text-[10px] font-medium text-white">
              {{ task.progress !== undefined ? `${task.progress}%` : '' }}
            </span>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

export interface GanttTask {
  label: string;
  start: number;
  span: number;
  progress?: number;
  tone?: 'indigo' | 'emerald' | 'amber' | 'sky';
  depth?: number;
}

const props = withDefaults(
  defineProps<{
    tasks: GanttTask[];
    columns?: number;
    today?: number;
    columnLabel?: string;
    rowLabel?: string;
    emptyText?: string;
    onTaskClick?: (task: GanttTask, index: number) => void;
    className?: string;
  }>(),
  { columns: 10, columnLabel: 'Timeline', rowLabel: 'Name', emptyText: 'No tasks scheduled', className: '' }
);

const emit = defineEmits<{ (e: 'task-click', task: GanttTask, index: number): void }>();

const cells = computed(() => Array.from({ length: props.columns }, (_, index) => index));

const clampStart = (task: GanttTask) => Math.min(Math.max(task.start, 0), props.columns);
const offsetOf = (task: GanttTask) => clampStart(task) / props.columns;
const widthOf = (task: GanttTask) =>
  Math.min(Math.max(task.span, 0), props.columns - clampStart(task)) / props.columns;

const toneClass = (tone?: string) => {
  if (tone === 'emerald') return 'bg-emerald-500';
  if (tone === 'amber') return 'bg-amber-400';
  if (tone === 'sky') return 'bg-sky-500';
  return 'bg-indigo-500';
};

const handleClick = (task: GanttTask, index: number) => {
  props.onTaskClick?.(task, index);
  emit('task-click', task, index);
};
</script>
