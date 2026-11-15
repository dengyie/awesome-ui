<template>
  <header data-page-header class="flex flex-col gap-3" :class="className">
    <div class="flex flex-wrap items-start justify-between gap-3">
      <div class="min-w-0">
        <div class="flex items-center gap-2">
          <h2 class="truncate text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">{{ title }}</h2>
          <span
            v-if="statusText"
            class="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
          >
            <span aria-hidden="true" class="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            {{ statusText }}
          </span>
        </div>
        <p v-if="description" class="mt-0.5 max-w-2xl text-xs text-zinc-500 dark:text-zinc-400">{{ description }}</p>
      </div>
      <div v-if="actions.length" class="flex shrink-0 flex-wrap items-center gap-2">
        <button
          v-for="action in actions"
          :key="action.label"
          type="button"
          :data-action-label="action.label"
          class="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2"
          :class="ACTION_VARIANT[action.variant || 'secondary']"
          @click="handleAction(action)"
        >
          <UiIcon v-if="action.icon" :name="action.icon" :size="13" />
          {{ action.label }}
        </button>
      </div>
    </div>
    <nav
      v-if="tabs.length"
      data-page-header-tabs
      class="flex flex-wrap items-center gap-1 border-b border-zinc-200 dark:border-zinc-800"
    >
      <button
        v-for="tab in tabs"
        :key="tab.label"
        type="button"
        :data-tab-label="tab.label"
        :aria-current="tab.label === activeTab ? 'page' : undefined"
        class="-mb-px flex items-center gap-1.5 border-b-2 px-3 py-2 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        :class="
          tab.label === activeTab
            ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
            : 'border-transparent text-zinc-500 hover:border-zinc-300 hover:text-zinc-800 dark:text-zinc-400 dark:hover:border-zinc-600 dark:hover:text-zinc-200'
        "
        @click="handleTab(tab)"
      >
        {{ tab.label }}
        <span
          v-if="tab.count !== undefined"
          class="rounded-full bg-zinc-100 px-1.5 py-px font-mono text-[9.5px] font-semibold text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
        >
          {{ tab.count }}
        </span>
      </button>
    </nav>
  </header>
</template>

<script setup lang="ts">
import UiIcon, { type IconName } from './UiIcon.vue';

export interface PageHeaderAction {
  label: string;
  variant?: 'primary' | 'secondary' | 'ghost';
  icon?: IconName;
}

export interface PageHeaderTab {
  label: string;
  count?: number;
}

const ACTION_VARIANT: Record<string, string> = {
  primary: 'bg-indigo-600 text-white hover:bg-indigo-500 focus-visible:ring-indigo-500',
  secondary:
    'border border-zinc-300 text-zinc-700 hover:bg-zinc-100 focus-visible:ring-zinc-400 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800',
  ghost:
    'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 focus-visible:ring-zinc-400 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200',
};

const props = withDefaults(
  defineProps<{
    title: string;
    description?: string;
    statusText?: string;
    actions?: PageHeaderAction[];
    tabs?: PageHeaderTab[];
    activeTab?: string;
    onAction?: (action: PageHeaderAction) => void;
    onTabChange?: (tab: PageHeaderTab) => void;
    className?: string;
  }>(),
  { description: '', statusText: '', actions: () => [], tabs: () => [], activeTab: '', className: '' },
);

const emit = defineEmits<{
  (e: 'action', action: PageHeaderAction): void;
  (e: 'tab-change', tab: PageHeaderTab): void;
}>();

const handleAction = (action: PageHeaderAction) => {
  props.onAction?.(action);
  emit('action', action);
};

const handleTab = (tab: PageHeaderTab) => {
  props.onTabChange?.(tab);
  emit('tab-change', tab);
};
</script>
