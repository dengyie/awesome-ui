<template>
  <div role="tablist" :aria-label="ariaLabel"
    :class="[variant === 'pills' ? 'inline-flex items-center gap-1 rounded-lg bg-zinc-100 p-1 dark:bg-zinc-800' : 'flex items-center gap-1 overflow-x-auto border-b border-zinc-200 dark:border-zinc-800', $attrs.class]">
    <button v-for="(tab, index) in tabs" :key="tab.id" :ref="(el) => setRef(tab.id, el)" type="button" role="tab"
      :id="`tab-${tab.id}`" :aria-selected="tab.id === current" :aria-controls="`panel-${tab.id}`"
      :tabindex="tab.id === current ? 0 : -1" :disabled="tab.disabled" @click="select(tab)"
      @keydown="move($event, index)"
      :class="['inline-flex items-center gap-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-40',
        variant === 'pills' ? 'rounded-md px-3 py-1.5' : 'border-b-2 px-3 py-2',
        variant === 'pills'
          ? (tab.id === current ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-900 dark:text-zinc-100' : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200')
          : (tab.id === current ? '-mb-px border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400' : '-mb-px border-transparent text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200')]">
      <UiIcon v-if="tab.icon" :name="tab.icon" :size="13" />
      <span>{{ tab.label }}</span>
      <span v-if="tab.badge !== undefined"
        class="rounded-full bg-zinc-100 px-1.5 text-[10px] tabular-nums text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">{{ tab.badge }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import UiIcon, { type IconName } from './UiIcon.vue';

export interface TabItem {
  id: string;
  label: string;
  icon?: IconName;
  badge?: string | number;
  disabled?: boolean;
}

const props = withDefaults(
  defineProps<{
    tabs: TabItem[];
    activeId?: string;
    defaultActiveId?: string;
    variant?: 'underline' | 'pills';
    ariaLabel?: string;
  }>(),
  { variant: 'underline', ariaLabel: 'Tabs' }
);
const emit = defineEmits<{ (e: 'change', id: string): void }>();

const internalId = ref(props.defaultActiveId ?? props.tabs[0]?.id ?? '');
const current = computed(() => props.activeId ?? internalId.value);
const refs: Record<string, HTMLButtonElement | null> = {};

const setRef = (id: string, el: unknown) => {
  refs[id] = (el as HTMLButtonElement) ?? null;
};

const select = (tab: TabItem) => {
  if (tab.disabled) return;
  if (props.activeId === undefined) internalId.value = tab.id;
  emit('change', tab.id);
};

const move = (event: KeyboardEvent, index: number) => {
  const keys = ['ArrowRight', 'ArrowLeft', 'Home', 'End'];
  if (!keys.includes(event.key)) return;
  event.preventDefault();
  const enabled = props.tabs.map((tab, i) => ({ tab, i })).filter((entry) => !entry.tab.disabled);
  if (enabled.length === 0) return;
  const position = enabled.findIndex((entry) => entry.i === index);
  let next = position;
  if (event.key === 'ArrowRight') next = (position + 1) % enabled.length;
  if (event.key === 'ArrowLeft') next = (position - 1 + enabled.length) % enabled.length;
  if (event.key === 'Home') next = 0;
  if (event.key === 'End') next = enabled.length - 1;
  const target = enabled[next];
  if (target) {
    select(target.tab);
    refs[target.tab.id]?.focus();
  }
};
</script>
