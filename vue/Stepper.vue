<template>
  <ol :class="['flex items-start', $attrs.class]">
    <li v-for="(step, index) in steps" :key="step.id" :class="['flex min-w-0', index === steps.length - 1 ? 'flex-none' : 'flex-1']">
      <div class="flex flex-col items-center gap-1.5 text-center">
        <button type="button" :disabled="!clickable(step, index)"
          :aria-current="statusFor(step, index) === 'current' ? 'step' : undefined"
          @click="clickable(step, index) && emit('step-click', step, index)"
          :class="['flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:cursor-default', CIRCLE[statusFor(step, index)].cls]">
          <UiIcon v-if="CIRCLE[statusFor(step, index)].icon" :name="CIRCLE[statusFor(step, index)].icon!" :size="12" />
          <template v-else>{{ index + 1 }}</template>
        </button>
        <div class="max-w-28">
          <p :class="['text-[11px] font-medium leading-tight', statusFor(step, index) === 'upcoming' ? 'text-zinc-400 dark:text-zinc-500' : 'text-zinc-800 dark:text-zinc-100']">
            {{ step.label }}
          </p>
          <p v-if="step.description" class="mt-0.5 text-[10px] leading-tight text-zinc-400 dark:text-zinc-500">{{ step.description }}</p>
        </div>
      </div>
      <span v-if="index !== steps.length - 1" aria-hidden="true"
        :class="['mt-3.5 h-0.5 flex-1 rounded mr-2 ml-2', statusFor(step, index) === 'complete' ? 'bg-indigo-600' : 'bg-zinc-200 dark:bg-zinc-800']"></span>
    </li>
  </ol>
</template>

<script setup lang="ts">
import UiIcon, { type IconName } from './UiIcon.vue';

export type StepperStatus = 'complete' | 'current' | 'upcoming' | 'error';

export interface StepperStep {
  id: string;
  label: string;
  description?: string;
  status?: StepperStatus;
}

const props = withDefaults(
  defineProps<{
    steps: StepperStep[];
    current?: number;
  }>(),
  { current: 1 }
);

const emit = defineEmits<{ (e: 'step-click', step: StepperStep, index: number): void }>();

const CIRCLE: Record<StepperStatus, { cls: string; icon?: IconName }> = {
  complete: { cls: 'bg-indigo-600 text-white', icon: 'check' },
  current: { cls: 'border-2 border-indigo-600 text-indigo-600 dark:text-indigo-400' },
  upcoming: { cls: 'border border-zinc-300 text-zinc-400 dark:border-zinc-700' },
  error: { cls: 'bg-rose-500 text-white', icon: 'x' },
};

const statusFor = (step: StepperStep, index: number): StepperStatus =>
  step.status ?? (index + 1 < props.current ? 'complete' : index + 1 === props.current ? 'current' : 'upcoming');

const clickable = (step: StepperStep, index: number) => statusFor(step, index) !== 'upcoming';
</script>
