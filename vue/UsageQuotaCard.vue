<template>
  <div v-if="banner" data-quota-banner class="flex w-full items-center justify-between gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 dark:border-emerald-500/40 dark:bg-emerald-950/40">
    <p class="min-w-0 text-xs text-emerald-900 dark:text-emerald-200">{{ summary }}</p>
    <button type="button" data-quota-cta class="shrink-0 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-emerald-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500" @click="emit('cta')">
      {{ ctaLabel }}
    </button>
  </div>
  <div v-else data-quota-card class="w-full rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-800/60">
    <p v-if="label" class="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">{{ label }}</p>
    <p class="mt-1 text-sm font-bold tabular-nums text-zinc-900 dark:text-zinc-50">{{ summary || valueLabel }}</p>
    <div v-if="total" class="mt-2 h-1.5 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
      <div class="h-full rounded-full bg-sky-500 transition-all" :style="{ width: `${percent}%` }" />
    </div>
    <p v-if="upgradeLine" class="mt-1.5 text-[11px] text-zinc-500 dark:text-zinc-400">{{ upgradeLine }}</p>
    <button
      type="button"
      data-quota-cta
      :class="['mt-3 w-full rounded-lg px-3 py-2 text-xs font-semibold text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500', ctaTone === 'dark' ? 'bg-zinc-900 hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-white' : 'bg-indigo-600 hover:bg-indigo-500']"
      @click="emit('cta')"
    >
      {{ ctaLabel }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    label?: string;
    used?: number;
    total?: number;
    unit?: string;
    summary?: string;
    upgradeLine?: string;
    ctaLabel?: string;
    ctaTone?: 'dark' | 'primary';
    banner?: boolean;
  }>(),
  { label: 'Credits Remaining', used: 0, total: 0, unit: '', summary: '', upgradeLine: 'Upgrade for unlimited use', ctaLabel: 'Upgrade', ctaTone: 'dark', banner: false },
);

const emit = defineEmits<{ (e: 'cta'): void }>();

const percent = computed(() => (props.total > 0 ? Math.round(((props.total - props.used) / props.total) * 100) : 0));
const valueLabel = computed(
  () => `${props.used}${props.unit ? ` ${props.unit}` : ''}${props.total ? ` of ${props.total}${props.unit ? ` ${props.unit}` : ''}` : ''}`,
);
</script>
