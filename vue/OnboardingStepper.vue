<template>
  <div data-onboarding-stepper class="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900" :class="className">
    <ol class="flex flex-wrap items-center gap-1.5 text-xs" aria-label="Setup steps">
      <li v-for="(step, index) in steps" :key="step" class="flex items-center gap-1.5">
        <span v-if="index > 0" aria-hidden="true" class="text-zinc-300 dark:text-zinc-700">&gt;</span>
        <button
          type="button"
          :data-step-index="index"
          :aria-current="index === active ? 'step' : undefined"
          class="rounded-md px-2 py-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          :class="index === active ? 'border-b-2 border-indigo-500 font-semibold text-zinc-900 dark:text-zinc-50' : index < active ? 'text-zinc-500 dark:text-zinc-400' : 'text-zinc-400'"
          @click="emit('step-click', index)"
        >
          {{ step }}
        </button>
      </li>
    </ol>
    <div class="mt-2 h-1 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
      <div
        data-stepper-progress
        class="h-full rounded-full bg-indigo-500 transition-all duration-300"
        :style="{ width: `${((active + 1) / steps.length) * 100}%` }"
      />
    </div>

    <div v-if="segments.length" class="mt-4">
      <p class="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{{ title }}</p>
      <div role="tablist" :aria-label="title" class="mt-2 inline-flex rounded-lg bg-zinc-100 p-1 dark:bg-zinc-800">
        <button
          v-for="(seg, index) in segments"
          :key="seg.label"
          type="button"
          role="tab"
          :aria-selected="index === activeSegment"
          :data-segment-index="index"
          class="rounded-md px-3 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          :class="index === activeSegment ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-900 dark:text-zinc-50' : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200'"
          @click="activeSegment = index"
        >
          {{ seg.label }}
        </button>
      </div>
      <div v-if="currentSegment" data-segment-description class="mt-3 rounded-lg border border-zinc-200 p-3 dark:border-zinc-800">
        <p class="text-xs leading-relaxed text-zinc-600 dark:text-zinc-300">{{ currentSegment.description }}</p>
        <ul v-if="currentSegment.examples?.length" class="mt-3 space-y-2">
          <li
            v-for="(example, index) in currentSegment.examples"
            :key="`${example.label}-${index}`"
            class="flex items-center justify-between gap-3 text-xs"
          >
            <span class="flex min-w-0 items-center gap-2 text-zinc-700 dark:text-zinc-200">
              <span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-[10px] font-bold text-zinc-500 dark:bg-zinc-800 dark:text-zinc-300">{{ index + 1 }}</span>
              <span class="truncate">{{ example.label }}</span>
            </span>
            <span class="shrink-0 font-medium tabular-nums text-zinc-900 dark:text-zinc-50">{{ example.value }}</span>
          </li>
        </ul>
      </div>
    </div>

    <button
      type="button"
      data-stepper-continue
      class="mt-5 w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
      @click="emit('continue')"
    >
      {{ continueLabel }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

export interface StepperSegment {
  label: string;
  description: string;
  examples?: { label: string; value: string }[];
}

const props = withDefaults(
  defineProps<{
    steps?: string[];
    current?: number;
    segments?: StepperSegment[];
    title?: string;
    continueLabel?: string;
    className?: string;
  }>(),
  { steps: () => [], current: 0, segments: () => [], title: 'Transaction types', continueLabel: 'Continue', className: '' },
);

const emit = defineEmits<{
  (e: 'step-click', index: number): void;
  (e: 'continue'): void;
}>();

const activeSegment = ref(0);
const active = computed(() => Math.min(Math.max(props.current, 0), Math.max(props.steps.length - 1, 0)));
const currentSegment = computed(() => props.segments[Math.min(activeSegment.value, Math.max(props.segments.length - 1, 0))]);
</script>
