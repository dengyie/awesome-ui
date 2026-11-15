<template>
  <span :class="['group relative inline-flex', $attrs.class]" :aria-describedby="id">
    <slot />
    <span :id="id" role="tooltip"
      :class="['pointer-events-none absolute z-30 whitespace-nowrap rounded-md bg-zinc-900 px-2 py-1 text-[10px] font-medium text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100 dark:bg-zinc-100 dark:text-zinc-900', SIDE_CLASS[side]]">
      {{ content }}
    </span>
  </span>
</template>

<script setup lang="ts">
import { useId } from 'vue';

export type TooltipSide = 'top' | 'bottom' | 'left' | 'right';

const props = withDefaults(
  defineProps<{
    content: string;
    side?: TooltipSide;
  }>(),
  { side: 'top' }
);

const SIDE_CLASS: Record<TooltipSide, string> = {
  top: 'bottom-full left-1/2 mb-1.5 -translate-x-1/2',
  bottom: 'top-full left-1/2 mt-1.5 -translate-x-1/2',
  left: 'right-full top-1/2 mr-1.5 -translate-y-1/2',
  right: 'left-full top-1/2 ml-1.5 -translate-y-1/2',
};

const id = useId();
</script>
