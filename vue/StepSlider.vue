<template>
  <div class="w-full">
    <p v-if="label" class="mb-2 text-xs font-medium text-zinc-800 dark:text-zinc-200">{{ label }}</p>
    <div role="slider" :tabindex="disabled ? -1 : 0" :aria-label="label || 'Step slider'"
      :aria-valuemin="0" :aria-valuemax="lastIndex" :aria-valuenow="value" :aria-valuetext="steps[value]"
      :aria-disabled="disabled || undefined"
      @keydown="onKeydown" class="group relative flex cursor-pointer items-center pb-1 focus-visible:outline-none">
      <span aria-hidden="true"
        class="absolute left-0 right-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-zinc-200 dark:bg-zinc-700"></span>
      <span aria-hidden="true"
        class="absolute left-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-indigo-600 transition-[width] duration-150"
        :style="{ width: `${ratio * 100}%` }"></span>
      <button v-for="(step, index) in steps" :key="step + index" type="button" :disabled="disabled"
        :aria-label="step" :aria-pressed="index === value"
        @click.stop="emit('change', index, step)"
        class="relative z-10 flex flex-1 flex-col items-center focus-visible:outline-none">
        <span :class="`h-3 w-3 rounded-full border-2 transition-colors ${
          index <= value
            ? 'border-indigo-600 bg-indigo-600'
            : index >= highlightIndex
              ? 'border-indigo-300 bg-white dark:border-indigo-700 dark:bg-zinc-900'
              : 'border-zinc-300 bg-white dark:border-zinc-600 dark:bg-zinc-900'
        } ${disabled ? 'opacity-50' : ''}`"></span>
        <span :class="`mt-1.5 whitespace-nowrap font-mono text-[10px] ${
          index === value ? 'font-semibold text-indigo-600 dark:text-indigo-400' : 'text-zinc-400'
        }`">
          {{ step }}
        </span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    steps: string[];
    value?: number;
    highlightFrom?: number;
    label?: string;
    disabled?: boolean;
    className?: string;
  }>(),
  { value: 0, disabled: false }
);

const emit = defineEmits<{
  (e: 'change', index: number, step: string): void;
}>();

const lastIndex = computed(() => props.steps.length - 1);
const ratio = computed(() => (props.steps.length > 1 ? props.value / lastIndex.value : 0));
const highlightIndex = computed(() =>
  props.highlightFrom === undefined ? props.steps.length : props.highlightFrom
);

const onKeydown = (event: KeyboardEvent) => {
  if (props.disabled) return;
  if (event.key === 'ArrowRight' && props.value < lastIndex.value) emit('change', props.value + 1, props.steps[props.value + 1]);
  if (event.key === 'ArrowLeft' && props.value > 0) emit('change', props.value - 1, props.steps[props.value - 1]);
  if (event.key === 'Home') emit('change', 0, props.steps[0]);
  if (event.key === 'End') emit('change', lastIndex.value, props.steps[lastIndex.value]);
};
</script>
