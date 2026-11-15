<template>
  <div data-zoom-control class="inline-flex items-center gap-0.5 rounded-lg border border-zinc-200 bg-white px-1 py-0.5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
    <template v-if="showUndoRedo">
      <button type="button" data-zoom-undo title="Undo" class="flex h-7 w-7 items-center justify-center rounded-md text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:hover:bg-zinc-800 dark:hover:text-zinc-100" @click="emit('undo')">
        <svg viewBox="0 0 20 20" fill="none" class="h-4 w-4" aria-hidden="true">
          <path d="M7 5 3.5 8.5 7 12" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
          <path d="M3.5 8.5H12a4.5 4.5 0 0 1 0 9h-1" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
        </svg>
      </button>
      <button type="button" data-zoom-redo title="Redo" class="flex h-7 w-7 items-center justify-center rounded-md text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:hover:bg-zinc-800 dark:hover:text-zinc-100" @click="emit('redo')">
        <svg viewBox="0 0 20 20" fill="none" class="h-4 w-4" aria-hidden="true">
          <path d="m13 5 3.5 3.5L13 12" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
          <path d="M16.5 8.5H8a4.5 4.5 0 0 0 0 9h1" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
        </svg>
      </button>
      <span class="mx-0.5 h-4 w-px bg-zinc-200 dark:bg-zinc-700" />
    </template>
    <template v-if="variant === 'stepper'">
      <button type="button" data-zoom-out title="Zoom out" :disabled="zoom <= min" class="flex h-7 w-7 items-center justify-center rounded-md text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-zinc-800 dark:hover:text-zinc-100" @click="change(zoom - step)">
        <svg viewBox="0 0 20 20" fill="none" class="h-4 w-4" aria-hidden="true"><path d="M5 10h10" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" /></svg>
      </button>
      <button type="button" data-zoom-value class="rounded px-1.5 py-0.5 text-xs font-medium text-zinc-700 tabular-nums dark:text-zinc-200">{{ zoom }}%</button>
      <button type="button" data-zoom-in title="Zoom in" :disabled="zoom >= max" class="flex h-7 w-7 items-center justify-center rounded-md text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-zinc-800 dark:hover:text-zinc-100" @click="change(zoom + step)">
        <svg viewBox="0 0 20 20" fill="none" class="h-4 w-4" aria-hidden="true"><path d="M10 5v10M5 10h10" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" /></svg>
      </button>
    </template>
    <template v-else-if="variant === 'dropdown'">
      <div class="relative">
        <button type="button" data-zoom-value class="rounded px-1.5 py-0.5 text-xs font-medium text-zinc-700 tabular-nums hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800" @click="open = !open">{{ zoom }}% <span aria-hidden="true">▾</span></button>
        <div v-if="open" data-zoom-menu class="absolute bottom-full right-0 mb-1 w-24 rounded-lg border border-zinc-200 bg-white py-1 shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
          <button
            v-for="preset in presets"
            :key="preset"
            type="button"
            :data-zoom-preset="preset"
            :class="['block w-full px-3 py-1 text-left text-xs tabular-nums hover:bg-zinc-50 dark:hover:bg-zinc-800', preset === zoom ? 'font-semibold text-blue-600 dark:text-blue-400' : 'text-zinc-700 dark:text-zinc-200']"
            @click="change(preset); open = false"
          >{{ preset }}%</button>
          <button v-if="showFit" type="button" data-zoom-fit class="block w-full border-t border-zinc-100 px-3 py-1 text-left text-xs text-zinc-500 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800" @click="emit('fit'); open = false">Fit</button>
        </div>
      </div>
    </template>
    <template v-else>
      <input data-zoom-slider type="range" :min="min" :max="max" :step="step" :value="zoom" class="h-1.5 w-24 cursor-pointer appearance-none rounded-full bg-zinc-200 accent-blue-600 dark:bg-zinc-700" aria-label="Zoom level" @input="change(Number(($event.target as HTMLInputElement).value))" />
      <button type="button" data-zoom-value class="rounded px-1.5 py-0.5 text-xs font-medium text-zinc-700 tabular-nums dark:text-zinc-200">{{ zoom }}%</button>
    </template>
    <button v-if="showFit && variant !== 'dropdown'" type="button" data-zoom-fit title="Fit to page" class="flex h-7 w-7 items-center justify-center rounded-md text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:hover:bg-zinc-800 dark:hover:text-zinc-100" @click="emit('fit')">
      <svg viewBox="0 0 20 20" fill="none" class="h-4 w-4" aria-hidden="true">
        <path d="M3 6V3h3M17 6V3h-3M3 14v3h3M17 14v3h-3" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

const props = withDefaults(
  defineProps<{
    value?: number;
    min?: number;
    max?: number;
    step?: number;
    variant?: 'stepper' | 'dropdown' | 'slider';
    presets?: number[];
    showFit?: boolean;
    showUndoRedo?: boolean;
  }>(),
  { value: 100, min: 10, max: 400, step: 10, variant: 'stepper', presets: () => [25, 50, 75, 100, 200], showFit: false, showUndoRedo: false },
);

const emit = defineEmits<{
  (e: 'zoom-change', value: number): void;
  (e: 'fit'): void;
  (e: 'undo'): void;
  (e: 'redo'): void;
}>();

const zoom = ref(props.value);
const open = ref(false);

watch(
  () => props.value,
  (next) => {
    zoom.value = next;
  },
);

const change = (next: number) => {
  const clamped = Math.min(props.max, Math.max(props.min, Math.round(next)));
  zoom.value = clamped;
  emit('zoom-change', clamped);
};
</script>
