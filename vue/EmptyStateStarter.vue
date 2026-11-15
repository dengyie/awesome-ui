<template>
  <div
    data-empty-starter
    :class="['flex flex-col items-center justify-center text-center', shellClass, padClass]"
  >
    <div v-if="illustration" data-empty-illustration :class="['mb-3 flex items-center justify-center', size === 'sm' ? 'text-3xl' : 'text-5xl']" aria-hidden="true" v-html="illustration" />
    <p data-empty-title :class="['font-semibold text-zinc-900 dark:text-zinc-50', size === 'sm' ? 'text-sm' : 'text-xl']">{{ title }}</p>
    <p v-if="description" :class="['mt-1 max-w-xs leading-relaxed text-zinc-500 dark:text-zinc-400', size === 'sm' ? 'text-xs' : 'text-sm']">{{ description }}</p>
    <button
      v-if="actionLabel"
      type="button"
      data-empty-action
      :class="['mt-4 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500', actionClass]"
      @click="emit('action')"
    >{{ actionLabel }}</button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    illustration?: string;
    title: string;
    description?: string;
    actionLabel?: string;
    variant?: 'plain' | 'dashed' | 'card';
    size?: 'md' | 'sm';
    actionVariant?: 'solid' | 'outline' | 'link';
  }>(),
  { illustration: '', description: '', actionLabel: '', variant: 'plain', size: 'md', actionVariant: 'solid' },
);

const emit = defineEmits<{
  (e: 'action'): void;
}>();

const shellClass = computed(() => {
  if (props.variant === 'dashed') return 'rounded-lg border-2 border-dashed border-zinc-300 dark:border-zinc-700';
  if (props.variant === 'card') return 'rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900';
  return '';
});

const padClass = computed(() => (props.variant !== 'plain' ? (props.size === 'sm' ? 'p-5' : 'p-8') : ''));

const ACTION_CLASS: Record<string, string> = {
  solid: 'rounded-full bg-zinc-900 px-4 py-2 text-xs font-medium text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300',
  outline: 'rounded-md border border-zinc-300 px-4 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800',
  link: 'text-sm font-medium text-blue-600 hover:underline dark:text-blue-400',
};

const actionClass = computed(() => ACTION_CLASS[props.actionVariant] || ACTION_CLASS.solid);
</script>
