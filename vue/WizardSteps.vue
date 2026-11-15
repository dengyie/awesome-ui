<template>
  <div v-if="variant === 'bar'" data-wizard-steps role="group" aria-label="Wizard progress" :class="`flex flex-col gap-2 ${className}`">
    <p class="flex flex-wrap items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400">
      <span class="font-semibold text-zinc-900 dark:text-zinc-50">{{ current + 1 }} of {{ steps.length }} steps</span>
      <template v-if="nextStep">
        <span aria-hidden="true" class="text-zinc-300 dark:text-zinc-700">|</span>
        <span>Next: {{ nextStep.label }}</span>
      </template>
    </p>
    <div
      role="progressbar"
      :aria-valuemin="0"
      :aria-valuemax="steps.length"
      :aria-valuenow="current + 1"
      class="h-2 overflow-hidden rounded-full bg-violet-100 dark:bg-violet-950/50"
    >
      <div class="h-full rounded-full bg-violet-600 transition-all duration-300" :style="{ width: `${progress}%` }" />
    </div>
  </div>
  <ol v-else data-wizard-steps :class="`flex flex-col ${className}`">
    <li
      v-for="(step, index) in steps"
      :key="`${step.label}-${index}`"
      class="relative flex gap-3 pb-4 last:pb-0"
    >
      <span
        v-if="index < steps.length - 1"
        aria-hidden="true"
        :class="`absolute left-[13px] top-7 bottom-0 w-px ${index < current ? 'bg-emerald-500' : 'bg-zinc-200 dark:bg-zinc-700'}`"
      />
      <button
        type="button"
        :data-step-index="index"
        :disabled="!interactive(index)"
        :aria-current="index === current ? 'step' : undefined"
        @click="handleClick(index)"
        :class="`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-[11px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
          index < current
            ? 'border-emerald-500 bg-emerald-500 text-white'
            : index === current
              ? 'border-zinc-900 bg-zinc-900 text-white dark:border-zinc-50 dark:bg-zinc-50 dark:text-zinc-900'
              : 'border-zinc-300 bg-white text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400'
        } ${interactive(index) ? 'cursor-pointer' : 'cursor-default'}`"
      >
        <UiIcon v-if="index < current" name="check" :size="13" />
        <template v-else>{{ index + 1 }}</template>
      </button>
      <span class="min-w-0 pt-1">
        <span
          :class="`block truncate text-sm font-medium ${
            index === current
              ? 'text-zinc-900 dark:text-zinc-50'
              : index < current
                ? 'text-zinc-700 dark:text-zinc-300'
                : 'text-zinc-500 dark:text-zinc-400'
          }`"
        >
          {{ step.label }}
          <span v-if="step.optional" class="ml-1.5 text-xs font-normal text-zinc-400">(Optional)</span>
        </span>
        <span v-if="step.hint" class="mt-0.5 block truncate text-xs text-zinc-400">{{ step.hint }}</span>
      </span>
    </li>
    <li v-if="nextLabel" class="pt-1 pl-10 text-xs text-zinc-400">{{ nextLabel }}</li>
  </ol>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import UiIcon from './UiIcon.vue';

export interface WizardStep {
  label: string;
  hint?: string;
  optional?: boolean;
}

const props = withDefaults(
  defineProps<{
    steps: WizardStep[];
    current: number;
    variant?: 'vertical' | 'bar';
    nextLabel?: string;
    onStepClick?: (index: number) => void;
    className?: string;
  }>(),
  { variant: 'vertical', className: '' }
);

const emit = defineEmits<{ (e: 'step-click', index: number): void }>();

const nextStep = computed(() => props.steps[props.current + 1]);
const progress = computed(() =>
  props.steps.length ? Math.round(((props.current + 1) / props.steps.length) * 100) : 0
);
const interactive = (index: number) =>
  typeof props.onStepClick === 'function' && index <= props.current;

const handleClick = (index: number) => {
  props.onStepClick?.(index);
  emit('step-click', index);
};
</script>
