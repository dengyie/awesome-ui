<template>
  <div ref="rootRef" :class="['relative', $attrs.class]">
    <div
      :class="['flex items-center gap-2 rounded-lg border bg-white px-2.5 py-2 text-xs transition-colors dark:bg-zinc-900',
        open ? 'border-indigo-500 ring-2 ring-indigo-500/20 dark:border-indigo-400' : 'border-zinc-200 hover:border-zinc-300 dark:border-zinc-700 dark:hover:border-zinc-600']">
      <UiIcon name="search" :size="13" class="shrink-0 text-zinc-400" />
      <input role="combobox" :aria-expanded="open" :aria-controls="`${id}-listbox`" aria-autocomplete="list"
        :aria-label="placeholder" :value="query" :placeholder="placeholder"
        @input="onInput($event)" @keydown="onFieldKeyDown" @focus="open = true"
        class="w-full bg-transparent text-zinc-800 outline-none placeholder:text-zinc-400 dark:text-zinc-100" />
      <button v-if="query" type="button" aria-label="Clear"
        @click="query = ''; selected = null"
        class="shrink-0 rounded p-0.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800">
        <UiIcon name="x" :size="12" />
      </button>
    </div>
    <ul v-if="open" :id="`${id}-listbox`" role="listbox" :aria-label="placeholder"
      class="absolute z-30 mt-1.5 max-h-64 w-full overflow-y-auto rounded-lg border border-zinc-200 bg-white p-1 shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
      <li v-if="filtered.length === 0" role="option" aria-disabled="true" class="px-2.5 py-2 text-[11px] text-zinc-400">
        {{ emptyText }}
      </li>
      <li v-for="(option, index) in filtered" :key="option.value" :id="`${id}-option-${index}`" role="option"
        :aria-selected="selected === option.value" @mouseenter="active = index"
        @mousedown.prevent @click="choose(option)"
        :class="['flex cursor-pointer items-start gap-2 rounded-md px-2.5 py-1.5 text-xs', index === active ? 'bg-indigo-50 dark:bg-indigo-950/40' : '']">
        <UiIcon v-if="option.icon" :name="option.icon" :size="13" class="mt-0.5 shrink-0 text-zinc-400" />
        <span class="min-w-0 flex-1">
          <span class="block font-medium text-zinc-800 dark:text-zinc-100">{{ option.label }}</span>
          <span v-if="option.description" class="mt-0.5 block text-[10.5px] text-zinc-500 dark:text-zinc-400">{{ option.description }}</span>
        </span>
        <UiIcon v-if="selected === option.value" name="check" :size="13" class="mt-0.5 shrink-0 text-indigo-600 dark:text-indigo-400" />
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, useId, watch } from 'vue';
import UiIcon, { type IconName } from './UiIcon.vue';

export interface ComboBoxOption {
  value: string;
  label: string;
  description?: string;
  icon?: IconName;
}

const props = withDefaults(
  defineProps<{
    options: ComboBoxOption[];
    placeholder?: string;
    emptyText?: string;
  }>(),
  { placeholder: 'Search…', emptyText: 'No matches found.' }
);

const emit = defineEmits<{ (e: 'change', value: string): void }>();

const rootRef = ref<HTMLDivElement | null>(null);
const open = ref(false);
const query = ref('');
const active = ref(0);
const selected = ref<string | null>(null);
const id = useId();

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase();
  if (!q) return props.options;
  return props.options.filter(
    (option) =>
      option.label.toLowerCase().includes(q) ||
      (option.description ?? '').toLowerCase().includes(q)
  );
});

watch(query, () => {
  active.value = 0;
});

const choose = (option: ComboBoxOption) => {
  selected.value = option.value;
  query.value = option.label;
  open.value = false;
  emit('change', option.value);
};

const onInput = (event: Event) => {
  query.value = (event.target as HTMLInputElement).value;
  open.value = true;
};

const onFieldKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'ArrowDown') {
    event.preventDefault();
    open.value = true;
    active.value = Math.min(active.value + 1, filtered.value.length - 1);
  } else if (event.key === 'ArrowUp') {
    event.preventDefault();
    active.value = Math.max(active.value - 1, 0);
  } else if (event.key === 'Enter') {
    const option = filtered.value[active.value];
    if (option && open.value) {
      event.preventDefault();
      choose(option);
    }
  }
};

const onDocMouseDown = (event: MouseEvent) => {
  if (rootRef.value && !rootRef.value.contains(event.target as Node)) open.value = false;
};
const onDocKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') open.value = false;
};

onMounted(() => {
  document.addEventListener('mousedown', onDocMouseDown);
  document.addEventListener('keydown', onDocKeyDown);
});

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', onDocMouseDown);
  document.removeEventListener('keydown', onDocKeyDown);
});
</script>
