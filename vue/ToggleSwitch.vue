<template>
  <span v-if="!label && !description" :class="['inline-flex', $attrs.class]">
    <button type="button" role="switch" :aria-checked="checked" :aria-label="label" :disabled="disabled"
      @click="emit('change', !checked)"
      :class="['relative inline-flex shrink-0 items-center rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-zinc-900 disabled:cursor-not-allowed disabled:opacity-40',
        checked ? 'bg-indigo-600' : 'bg-zinc-300 dark:bg-zinc-700', track]">
      <span :class="['inline-block transform rounded-full bg-white shadow transition-transform duration-200', checked ? shift : 'translate-x-0.5', knob]"></span>
    </button>
  </span>
  <label v-else :class="['flex items-start gap-2.5', disabled ? 'opacity-60' : '', $attrs.class]">
    <button type="button" role="switch" :aria-checked="checked" :aria-label="label" :disabled="disabled"
      @click="emit('change', !checked)"
      :class="['relative inline-flex shrink-0 items-center rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-zinc-900 disabled:cursor-not-allowed disabled:opacity-40',
        checked ? 'bg-indigo-600' : 'bg-zinc-300 dark:bg-zinc-700', track]">
      <span :class="['inline-block transform rounded-full bg-white shadow transition-transform duration-200', checked ? shift : 'translate-x-0.5', knob]"></span>
    </button>
    <span class="min-w-0">
      <span v-if="label" class="block text-xs font-medium text-zinc-800 dark:text-zinc-100">{{ label }}</span>
      <span v-if="description" class="mt-0.5 block text-[10.5px] leading-relaxed text-zinc-500 dark:text-zinc-400">{{ description }}</span>
    </span>
  </label>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    checked: boolean;
    label?: string;
    description?: string;
    disabled?: boolean;
    size?: 'sm' | 'md';
  }>(),
  { disabled: false, size: 'md' }
);

const emit = defineEmits<{ (e: 'change', checked: boolean): void }>();

const track = computed(() => (props.size === 'sm' ? 'h-4 w-8' : 'h-5 w-9'));
const knob = computed(() => (props.size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'));
const shift = computed(() => (props.size === 'sm' ? 'translate-x-4' : 'translate-x-4'));
</script>
