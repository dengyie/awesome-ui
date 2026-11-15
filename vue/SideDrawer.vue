<template>
  <div v-if="isOpen" :class="className" class="fixed inset-0 z-50 flex">
    <div class="absolute inset-0 bg-zinc-950/40 backdrop-blur-[1px]" aria-hidden="true" @click="emit('close')" />
    <div
      role="dialog"
      aria-modal="true"
      :aria-label="title"
      :class="[
        'relative z-10 flex h-full w-full flex-col border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-900',
        SIZE_CLASS[size],
        side === 'right' ? 'ml-auto border-l' : 'mr-auto border-r',
      ]"
    >
      <header class="flex items-start gap-2 border-b border-zinc-100 px-4 py-3 dark:border-zinc-800">
        <div class="min-w-0 flex-1">
          <h2 class="truncate text-sm font-semibold text-zinc-800 dark:text-zinc-100">{{ title }}</h2>
          <p v-if="description" class="mt-0.5 text-[11px] leading-snug text-zinc-500 dark:text-zinc-400">
            {{ description }}
          </p>
        </div>
        <button
          type="button"
          aria-label="Close drawer"
          class="shrink-0 rounded-md p-1 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
          @click="emit('close')"
        >
          <UiIcon name="x" :size="14" />
        </button>
      </header>

      <div class="flex-1 overflow-y-auto px-4 py-3 text-xs leading-relaxed text-zinc-600 dark:text-zinc-300">
        <slot />
      </div>

      <footer v-if="$slots.footer" class="border-t border-zinc-100 px-4 py-3 dark:border-zinc-800">
        <slot name="footer" />
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, watch } from 'vue';
import UiIcon from './UiIcon.vue';

const SIZE_CLASS = {
  sm: 'max-w-xs',
  md: 'max-w-md',
  lg: 'max-w-xl',
} as const;

const props = withDefaults(
  defineProps<{
    isOpen: boolean;
    title: string;
    description?: string;
    side?: 'left' | 'right';
    size?: 'sm' | 'md' | 'lg';
    className?: string;
  }>(),
  { description: '', side: 'right', size: 'md', className: '' }
);

const emit = defineEmits<{ (e: 'close'): void }>();

function onKeyDown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    event.preventDefault();
    emit('close');
  }
}

watch(
  () => props.isOpen,
  (open) => {
    if (open) document.addEventListener('keydown', onKeyDown);
    else document.removeEventListener('keydown', onKeyDown);
  },
  { immediate: true }
);

onBeforeUnmount(() => document.removeEventListener('keydown', onKeyDown));
</script>
