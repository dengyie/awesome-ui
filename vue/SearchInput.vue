<template>
  <div
    :class="['flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-2.5 py-2 text-xs transition-colors focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-zinc-600', $attrs.class]">
    <UiIcon name="search" :size="13" class="shrink-0 text-zinc-400" />
    <input ref="inputRef" type="text" role="searchbox" :aria-label="placeholder" :value="current"
      :placeholder="placeholder" @input="update(($event.target as HTMLInputElement).value)"
      @keydown="onKeyDown"
      class="w-full bg-transparent text-zinc-800 outline-none placeholder:text-zinc-400 dark:text-zinc-100" />
    <UiIcon v-if="loading" name="loader" :size="13" class="shrink-0 animate-spin text-zinc-400" />
    <button v-else-if="current" type="button" aria-label="Clear search"
      @click="update(''); emit('clear'); inputRef?.focus()"
      class="shrink-0 rounded p-0.5 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800">
      <UiIcon name="x" :size="12" />
    </button>
    <kbd v-else-if="shortcut"
      class="shrink-0 rounded border border-zinc-200 bg-zinc-50 px-1.5 py-0.5 font-mono text-[9.5px] text-zinc-400 dark:border-zinc-700 dark:bg-zinc-800">
      {{ shortcut }}
    </kbd>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import UiIcon from './UiIcon.vue';

const props = withDefaults(
  defineProps<{
    value?: string;
    defaultValue?: string;
    placeholder?: string;
    shortcut?: string;
    loading?: boolean;
    autoFocus?: boolean;
  }>(),
  { defaultValue: '', placeholder: 'Search…', loading: false, autoFocus: false }
);

const emit = defineEmits<{
  (e: 'change', value: string): void;
  (e: 'search', value: string): void;
  (e: 'clear'): void;
}>();

const inputRef = ref<HTMLInputElement | null>(null);
const inner = ref(props.defaultValue);
const controlled = computed(() => props.value !== undefined);
const current = computed(() => (controlled.value ? (props.value as string) : inner.value));

const update = (next: string) => {
  if (!controlled.value) inner.value = next;
  emit('change', next);
};

const onKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Enter') emit('search', current.value);
  if (event.key === 'Escape' && current.value) {
    update('');
    emit('clear');
  }
};

onMounted(() => {
  if (props.autoFocus) inputRef.value?.focus();
});
</script>
