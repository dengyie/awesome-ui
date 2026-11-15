<template>
  <div
    v-if="content || isThinking || steps.length"
    :class="[
      'my-3 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/40 text-xs overflow-hidden transition-all',
      className
    ]"
  >
    <!-- Header Bar -->
    <button
      type="button"
      :aria-expanded="isExpanded"
      @click="isExpanded = !isExpanded"
      class="w-full flex items-center justify-between px-3.5 py-2.5 hover:bg-zinc-100/50 dark:hover:bg-zinc-800/40 text-zinc-500 dark:text-zinc-400 font-medium transition-colors select-none text-left"
    >
      <div class="flex items-center gap-2">
        <UiIcon name="sparkles" :size="14" :class="isThinking ? 'text-amber-500 animate-spin' : 'text-zinc-400'" />
        <span>
          {{ isThinking ? 'Deeply thinking...' : durationSeconds ? `Thought for ${durationSeconds}s` : 'Thought process' }}
        </span>
      </div>
      <UiIcon name="chevron-down" :size="14" :class="['transition-transform duration-200', isExpanded ? 'rotate-180' : '']" />
    </button>

    <!-- Collapsed summary row -->
    <div v-if="!isExpanded && steps.length" class="px-3.5 pb-2.5 -mt-0.5 flex items-center gap-1.5 text-[11px] text-zinc-400 dark:text-zinc-500">
      <template v-if="runningStep">
        <span class="inline-block h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
        <span class="truncate">{{ runningStep.label }}</span>
      </template>
      <template v-else>
        <span class="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
        <span class="truncate">{{ steps[steps.length - 1].label }}</span>
        <span v-if="steps[steps.length - 1].durationMs !== undefined" class="tabular-nums">
          {{ formatDuration(steps[steps.length - 1].durationMs) }}
        </span>
      </template>
    </div>

    <!-- Content -->
    <div v-if="isExpanded" class="border-t border-zinc-200/50 dark:border-zinc-800/50 bg-white/40 dark:bg-zinc-950/20">
      <ol v-if="steps.length" class="px-4 pt-3 pb-1">
        <li v-for="(step, index) in steps" :key="step.id" class="relative pl-5">
          <span v-if="index !== steps.length - 1" aria-hidden="true"
            class="absolute left-[5px] top-4 bottom-0 w-px bg-zinc-200 dark:bg-zinc-700" />
          <span class="absolute left-0 top-1.5">
            <span v-if="step.durationMs !== undefined" class="block h-[11px] w-[11px] rounded-full bg-emerald-500" />
            <span v-else class="block h-[11px] w-[11px] rounded-full border-2 border-amber-400 animate-pulse" />
          </span>
          <div class="pb-2.5 flex items-center gap-2">
            <span :class="['truncate', step.durationMs !== undefined ? 'text-zinc-600 dark:text-zinc-300' : 'text-zinc-400 dark:text-zinc-500']">
              {{ step.label }}
            </span>
            <span v-if="step.durationMs !== undefined" class="ml-auto shrink-0 tabular-nums text-[10px] text-zinc-400 dark:text-zinc-500">
              {{ formatDuration(step.durationMs) }}
            </span>
          </div>
        </li>
      </ol>
      <div
        :class="['px-4 py-3 text-zinc-600 dark:text-zinc-400 leading-relaxed font-mono whitespace-pre-wrap text-[13px]',
          steps.length ? 'border-t border-zinc-200/50 dark:border-zinc-800/50' : '']"
      >
        <span v-if="!content" class="italic text-zinc-400">Processing thoughts...</span>
        <span v-else>{{ content }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import UiIcon from './UiIcon.vue';

export interface ThinkingStep {
  id: string;
  label: string;
  durationMs?: number;
}

const props = withDefaults(
  defineProps<{
    content: string;
    isThinking?: boolean;
    durationSeconds?: number;
    steps?: ThinkingStep[];
    defaultExpanded?: boolean;
    className?: string;
  }>(),
  {
    isThinking: false,
    steps: () => [],
    defaultExpanded: false,
    className: ''
  }
);

const isExpanded = ref(props.defaultExpanded || props.isThinking);

const runningStep = computed(() => props.steps.find((step) => step.durationMs === undefined));

const formatDuration = (ms?: number) => {
  if (typeof ms !== 'number') return '';
  return ms >= 1000 ? `${(ms / 1000).toFixed(1)}s` : `${ms}ms`;
};
</script>
