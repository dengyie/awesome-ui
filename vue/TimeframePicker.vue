<template>
  <div data-timeframe-picker role="group" aria-label="Timeframe" class="flex flex-wrap items-center gap-2" :class="className">
    <div class="flex items-center overflow-hidden rounded-lg border border-zinc-300 bg-white dark:border-zinc-700 dark:bg-zinc-900">
      <button
        v-for="preset in presets"
        :key="preset"
        type="button"
        :data-preset="preset"
        :aria-pressed="preset === current ? 'true' : 'false'"
        :disabled="disabled"
        class="px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-500"
        :class="[
          preset === current
            ? 'bg-indigo-600 text-white'
            : 'text-zinc-600 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-800/60',
          disabled ? 'cursor-not-allowed opacity-50' : '',
        ]"
        @click="handleChange(preset)"
      >
        {{ preset }}
      </button>
    </div>
    <div class="flex items-center overflow-hidden rounded-lg border border-zinc-300 bg-white dark:border-zinc-700 dark:bg-zinc-900">
      <button
        type="button"
        data-step="-1"
        aria-label="Previous period"
        :disabled="disabled"
        class="px-2 py-1.5 text-zinc-500 transition-colors hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-500 dark:text-zinc-400 dark:hover:bg-zinc-800/60"
        @click="handleStep(-1)"
      >
        <UiIcon name="chevron-left" :size="13" />
      </button>
      <span
        v-if="rangeLabel"
        class="flex items-center gap-1.5 border-x border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-700 dark:border-zinc-800 dark:text-zinc-200"
      >
        <UiIcon name="calendar" :size="12" class="text-zinc-400" />
        {{ rangeLabel }}
      </span>
      <button
        type="button"
        data-step="1"
        aria-label="Next period"
        :disabled="disabled"
        class="px-2 py-1.5 text-zinc-500 transition-colors hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-500 dark:text-zinc-400 dark:hover:bg-zinc-800/60"
        @click="handleStep(1)"
      >
        <UiIcon name="chevron-right" :size="13" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import UiIcon from './UiIcon.vue';

const props = withDefaults(
  defineProps<{
    presets?: string[];
    value?: string;
    rangeLabel?: string;
    disabled?: boolean;
    onChange?: (value: string) => void;
    onStep?: (direction: -1 | 1, value: string) => void;
    className?: string;
  }>(),
  {
    presets: () => ['Today', '7d', '30d', '90d', '12mo'],
    value: '',
    rangeLabel: '',
    disabled: false,
    className: '',
  },
);

const emit = defineEmits<{
  (e: 'change', value: string): void;
  (e: 'step', direction: -1 | 1, value: string): void;
}>();

const current = computed(() => props.value || props.presets[0] || '');

const handleChange = (preset: string) => {
  props.onChange?.(preset);
  emit('change', preset);
};

const handleStep = (direction: -1 | 1) => {
  props.onStep?.(direction, current.value);
  emit('step', direction, current.value);
};
</script>
