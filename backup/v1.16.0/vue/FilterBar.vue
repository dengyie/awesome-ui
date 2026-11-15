<template>
  <div ref="rootRef" :class="['flex flex-wrap items-center gap-1.5', $attrs.class]">
    <div v-for="filter in filters" :key="filter.id" class="relative">
      <button type="button" :aria-expanded="openId === filter.id" aria-haspopup="true"
        @click="openId = openId === filter.id ? null : filter.id"
        :class="['inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500',
          (localSelected[filter.id] || []).length > 0
            ? 'border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-900 dark:bg-indigo-950/40 dark:text-indigo-300'
            : 'border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-zinc-600']">
        <span>{{ filter.label }}</span>
        <span v-if="(localSelected[filter.id] || []).length > 0"
          class="rounded-full bg-indigo-600 px-1 text-[9px] tabular-nums text-white">{{ (localSelected[filter.id] || []).length }}</span>
        <UiIcon name="chevron-down" :size="11" :class="openId === filter.id ? 'rotate-180 transition-transform' : 'transition-transform'" />
      </button>

      <div v-if="openId === filter.id"
        class="absolute left-0 top-full z-20 mt-1 w-48 rounded-lg border border-zinc-200 bg-white p-1 shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
        <button v-for="option in filter.options" :key="option.value" type="button"
          :aria-pressed="(localSelected[filter.id] || []).includes(option.value)"
          @click="toggleOption(filter.id, option.value)"
          class="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-[11px] text-zinc-600 transition-colors hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:text-zinc-300 dark:hover:bg-zinc-800">
          <span
            :class="['flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded border',
              (localSelected[filter.id] || []).includes(option.value)
                ? 'border-indigo-600 bg-indigo-600 text-white'
                : 'border-zinc-300 dark:border-zinc-600']">
            <UiIcon v-if="(localSelected[filter.id] || []).includes(option.value)" name="check" :size="9" :stroke-width="3" />
          </span>
          <span class="min-w-0 flex-1 truncate">{{ option.label }}</span>
          <span v-if="option.count !== undefined" class="shrink-0 tabular-nums text-[10px] text-zinc-400">{{ option.count }}</span>
        </button>
      </div>
    </div>

    <button v-if="activeCount > 0" type="button" @click="clearAll"
      class="inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-medium text-zinc-500 transition-colors hover:text-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:text-zinc-400 dark:hover:text-zinc-100">
      <UiIcon name="x" :size="11" />
      Clear all
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import UiIcon from './UiIcon.vue';

export interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

export interface FilterDefinition {
  id: string;
  label: string;
  options: FilterOption[];
}

const props = withDefaults(
  defineProps<{
    filters: FilterDefinition[];
    selected?: Record<string, string[]>;
  }>(),
  { selected: () => ({}) }
);
const emit = defineEmits<{ (e: 'change', selected: Record<string, string[]>): void; (e: 'clear'): void }>();

const rootRef = ref<HTMLDivElement | null>(null);
const openId = ref<string | null>(null);
const localSelected = ref<Record<string, string[]>>({ ...props.selected });

watch(
  () => props.selected,
  (value) => {
    localSelected.value = { ...(value ?? {}) };
  },
  { deep: true }
);

const activeCount = computed(() =>
  Object.values(localSelected.value).reduce((total, values) => total + values.length, 0)
);

const commit = (next: Record<string, string[]>) => {
  localSelected.value = next;
  emit('change', next);
};

const toggleOption = (filterId: string, value: string) => {
  const values = localSelected.value[filterId] ?? [];
  const nextValues = values.includes(value) ? values.filter((entry) => entry !== value) : [...values, value];
  const next = { ...localSelected.value };
  if (nextValues.length > 0) next[filterId] = nextValues;
  else delete next[filterId];
  commit(next);
};

const clearAll = () => {
  commit({});
  emit('clear');
};

const onPointerDown = (event: MouseEvent) => {
  if (rootRef.value && !rootRef.value.contains(event.target as Node)) openId.value = null;
};
const onKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') openId.value = null;
};

onMounted(() => {
  document.addEventListener('mousedown', onPointerDown);
  document.addEventListener('keydown', onKeyDown);
});
onBeforeUnmount(() => {
  document.removeEventListener('mousedown', onPointerDown);
  document.removeEventListener('keydown', onKeyDown);
});
</script>
