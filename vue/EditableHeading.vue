<template>
  <div data-editable-heading>
    <div v-if="breadcrumb" class="mb-1 text-xs text-zinc-400" v-html="breadcrumb" />
    <input
      v-if="editing"
      data-heading-input
      type="text"
      :value="draft"
      :class="['w-full rounded-md border-2 border-teal-500 bg-yellow-50 px-2 py-1 font-semibold text-zinc-900 outline-none dark:bg-yellow-950/40 dark:text-zinc-50', size === 'lg' ? 'text-2xl' : 'text-base']"
      @input="draft = ($event.target as HTMLInputElement).value"
      @blur="commit"
      @keydown.enter="commit"
      @keydown.escape="cancel"
    />
    <button
      v-else
      type="button"
      data-heading-display
      title="Click to rename"
      :class="['-mx-2 w-full rounded-md px-2 py-1 text-left font-semibold text-zinc-900 transition-colors hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 dark:text-zinc-50 dark:hover:bg-zinc-800', size === 'lg' ? 'text-2xl' : 'text-base']"
      @click="draft = current; editing = true"
    >{{ current }}</button>
    <div v-if="meta" class="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400" v-html="meta" />
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

const props = withDefaults(
  defineProps<{
    value?: string;
    defaultValue?: string;
    breadcrumb?: string;
    meta?: string;
    size?: 'md' | 'lg';
  }>(),
  { value: undefined, defaultValue: 'Untitled', breadcrumb: '', meta: '', size: 'lg' as const },
);

const emit = defineEmits<{
  (e: 'change', value: string): void;
}>();

const current = ref(props.value ?? props.defaultValue);
const editing = ref(false);
const draft = ref(current.value);

watch(
  () => props.value,
  (next) => {
    if (next !== undefined) current.value = next;
  },
);

const commit = () => {
  const next = draft.value.trim() || current.value;
  const changed = next !== current.value;
  current.value = next;
  editing.value = false;
  if (changed) emit('change', next);
};

const cancel = () => {
  draft.value = current.value;
  editing.value = false;
};
</script>
