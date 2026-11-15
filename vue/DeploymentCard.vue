<template>
  <div data-deployment-card class="w-full rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
    <div class="flex items-start justify-between gap-3">
      <div class="min-w-0">
        <div class="flex items-center gap-2">
          <p class="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-50">{{ deployId }}</p>
          <span :class="['inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium', tone.pill]">
            <span :class="['h-1.5 w-1.5 rounded-full', tone.dot]" />
            {{ tone.label }}
          </span>
        </div>
        <p class="mt-1 truncate font-mono text-xs text-zinc-500 dark:text-zinc-400">
          {{ commit.sha }}<span v-if="commit.message" class="text-zinc-700 dark:text-zinc-200"> {{ commit.message }}</span>
        </p>
        <p class="mt-0.5 text-[11px] text-zinc-400 dark:text-zinc-500">{{ [source, createdAt].filter(Boolean).join(' · ') }}</p>
      </div>
      <div class="flex shrink-0 items-center gap-2">
        <button v-if="!terminal && cancelLabel" type="button" data-deploy-cancel class="rounded-lg border border-rose-300 px-3 py-1.5 text-xs font-semibold text-rose-600 transition-colors hover:bg-rose-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 dark:border-rose-500/60 dark:text-rose-400 dark:hover:bg-rose-950/40" @click="emit('cancel')">
          {{ cancelLabel }}
        </button>
        <button v-if="terminal && url" type="button" data-deploy-visit class="rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-white" @click="emit('visit', url)">
          {{ visitLabel }} ↗
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

export interface DeployCommit {
  sha: string;
  message?: string;
  branch?: string;
  author?: string;
}

const STATUS_TONE: Record<string, { pill: string; dot: string; label: string }> = {
  queued: { pill: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300', dot: 'bg-zinc-400', label: 'Queued' },
  building: { pill: 'bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300', dot: 'bg-sky-500 animate-pulse', label: 'Building' },
  live: { pill: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300', dot: 'bg-emerald-500', label: 'Live' },
  failed: { pill: 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300', dot: 'bg-rose-500', label: 'Failed' },
  canceled: { pill: 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400', dot: 'bg-zinc-400', label: 'Canceled' },
};

const props = withDefaults(
  defineProps<{
    deployId: string;
    status: 'queued' | 'building' | 'live' | 'failed' | 'canceled';
    commit: DeployCommit;
    createdAt: string;
    source?: string;
    url?: string;
    cancelLabel?: string;
    visitLabel?: string;
  }>(),
  { source: '', url: '', cancelLabel: 'Cancel deploy', visitLabel: 'Visit' },
);

const emit = defineEmits<{
  (e: 'cancel'): void;
  (e: 'visit', url: string): void;
}>();

const tone = computed(() => STATUS_TONE[props.status] || STATUS_TONE.queued);
const terminal = computed(() => props.status === 'live' || props.status === 'failed' || props.status === 'canceled');
</script>
