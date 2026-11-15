<template>
  <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center p-4"
    @mousedown="onBackdrop">
    <div aria-hidden="true" class="absolute inset-0 bg-zinc-950/50 backdrop-blur-[2px]"></div>
    <div ref="panelRef" role="dialog" aria-modal="true" :aria-label="title"
      class="relative w-full max-w-md overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-700 dark:bg-zinc-900">
      <div class="flex items-start justify-between gap-3 px-5 pt-4">
        <div class="min-w-0">
          <h2 class="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{{ title }}</h2>
          <p v-if="description" class="mt-1 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">{{ description }}</p>
        </div>
        <button v-if="showClose" type="button" aria-label="Close" @click="emit('close')"
          class="shrink-0 rounded-md p-1 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:hover:bg-zinc-800">
          <UiIcon name="x" :size="14" />
        </button>
      </div>
      <div v-if="$slots.default" class="px-5 py-4 text-xs text-zinc-600 dark:text-zinc-400">
        <slot />
      </div>
      <div v-if="$slots.footer" class="flex items-center justify-end gap-2 border-t border-zinc-100 bg-zinc-50 px-5 py-3 dark:border-zinc-800 dark:bg-zinc-950/50">
        <slot name="footer" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';
import UiIcon from './UiIcon.vue';

const props = withDefaults(
  defineProps<{
    open: boolean;
    title: string;
    description?: string;
    dismissible?: boolean;
    showClose?: boolean;
  }>(),
  { dismissible: true, showClose: true }
);

const emit = defineEmits<{ (e: 'close'): void }>();

const panelRef = ref<HTMLDivElement | null>(null);

const onBackdrop = (event: MouseEvent) => {
  if (props.dismissible && panelRef.value && !panelRef.value.contains(event.target as Node)) emit('close');
};

const onKey = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && props.dismissible && props.open) emit('close');
};

onMounted(() => document.addEventListener('keydown', onKey));
onBeforeUnmount(() => document.removeEventListener('keydown', onKey));
</script>
