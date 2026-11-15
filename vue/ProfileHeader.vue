<template>
  <div :class="`overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 ${className}`">
    <div :class="`relative h-28 bg-gradient-to-r ${coverClass}`">
      <span class="absolute right-3 top-3 rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur">
        Pro
      </span>
    </div>

    <div class="px-5 pb-4">
      <div class="-mt-8 mb-3 flex items-end justify-between">
        <img v-if="avatarUrl" :src="avatarUrl" :alt="name"
          class="h-16 w-16 rounded-full border-4 border-white object-cover dark:border-zinc-900" />
        <span v-else
          class="flex h-16 w-16 items-center justify-center rounded-full border-4 border-white bg-indigo-100 text-lg font-bold text-indigo-600 dark:border-zinc-900 dark:bg-indigo-950/60 dark:text-indigo-300">
          {{ initialsFallback }}
        </span>
        <div class="flex items-center gap-1.5">
          <button v-for="action in actions" :key="action.label" type="button" @click="emit('action', action.label)"
            :class="`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-zinc-900 ${ACTION_VARIANT[action.variant || 'secondary']}`">
            {{ action.label }}
          </button>
        </div>
      </div>

      <h2 class="text-lg font-bold text-zinc-900 dark:text-zinc-50">{{ name }}</h2>
      <p v-if="handle" class="text-xs text-zinc-400">@{{ handle }}</p>
      <p v-if="headline" class="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{{ headline }}</p>

      <p v-if="statusText" class="mt-2 flex items-center gap-1.5 text-[11px] text-zinc-500 dark:text-zinc-400">
        <span aria-hidden="true" :class="`h-1.5 w-1.5 rounded-full ${statusTone === 'ok' ? 'bg-emerald-500' : 'bg-zinc-400'}`"></span>
        {{ statusText }}
      </p>

      <dl v-if="stats.length" class="mt-3 flex flex-wrap gap-x-5 gap-y-1">
        <div v-for="stat in stats" :key="stat.label" class="flex items-baseline gap-1">
          <dt class="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{{ stat.value }}</dt>
          <dd class="text-[11px] text-zinc-400">{{ stat.label }}</dd>
        </div>
      </dl>

      <nav v-if="tabs.length" aria-label="Profile sections"
        class="-mb-px mt-4 flex gap-1 overflow-x-auto border-b border-zinc-100 dark:border-zinc-800">
        <button v-for="tab in tabs" :key="tab" type="button"
          :aria-current="tab === activeTab ?? tabs[0] ? 'page' : undefined" @click="emit('tab-change', tab)"
          :class="`whitespace-nowrap border-b-2 px-3 py-2 text-xs font-medium transition-colors focus-visible:outline-none ${
            tab === (activeTab ?? tabs[0])
              ? 'border-indigo-600 text-zinc-900 dark:border-indigo-400 dark:text-zinc-50'
              : 'border-transparent text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'
          }`">
          {{ tab }}
        </button>
      </nav>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

export interface ProfileStat {
  label: string;
  value: string | number;
}

export interface ProfileHeaderAction {
  label: string;
  variant?: 'primary' | 'secondary' | 'ghost';
}

const props = withDefaults(
  defineProps<{
    name: string;
    handle?: string;
    headline?: string;
    avatarUrl?: string;
    initials?: string;
    coverClass?: string;
    stats?: ProfileStat[];
    actions?: ProfileHeaderAction[];
    statusText?: string;
    statusTone?: 'ok' | 'away';
    tabs?: string[];
    activeTab?: string;
    className?: string;
  }>(),
  { coverClass: 'from-indigo-500 via-violet-500 to-sky-400', stats: () => [], actions: () => [], statusTone: 'ok', tabs: () => [] }
);

const emit = defineEmits<{
  (e: 'tab-change', tab: string): void;
  (e: 'action', label: string): void;
}>();

const ACTION_VARIANT: Record<string, string> = {
  primary: 'bg-indigo-600 text-white hover:bg-indigo-500 focus-visible:ring-indigo-500',
  secondary: 'border border-zinc-200 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800 focus-visible:ring-zinc-400',
  ghost: 'text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800 focus-visible:ring-zinc-400',
};

const initialsFallback = computed(() =>
  ((props.initials || props.name || '?').trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join('') || '?').toUpperCase()
);
</script>
