<template>
  <div data-service-status class="w-full rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
    <p class="text-sm font-bold text-zinc-900 dark:text-zinc-50">Services</p>
    <ul class="mt-2 space-y-1.5">
      <li v-for="service in services" :key="service.name" :data-service-row="service.name" :data-service-status="service.status">
        <button type="button" class="flex w-full items-center gap-2 rounded-md px-1 py-1 text-left transition-colors hover:bg-zinc-50 focus-visible:outline-none dark:hover:bg-zinc-800/60" @click="emit('service-click', service)">
          <span class="w-28 shrink-0 truncate text-xs font-medium text-zinc-800 dark:text-zinc-100">{{ service.name }}</span>
          <code class="shrink-0 rounded border border-zinc-200 bg-zinc-100 px-1.5 py-0.5 font-mono text-[11px] text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">{{ service.command }}</code>
          <span class="flex min-w-0 flex-1 items-center justify-end gap-1.5">
            <svg v-if="service.status === 'running'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="h-3.5 w-3.5 text-emerald-500"><path d="m5 12 4 4L19 6" /></svg>
            <svg v-else-if="service.status === 'starting'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-3.5 w-3.5 animate-spin text-sky-500"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
            <span v-else-if="service.status === 'stopped'" class="block h-2 w-2 rounded-full bg-zinc-400" />
            <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="h-3.5 w-3.5 text-rose-500"><path d="M18 6 6 18M6 6l12 12" /></svg>
            <span :class="['truncate text-[11px] font-medium', toneText(service.status)]">{{ toneLabel(service.status) }}</span>
            <span v-if="service.url" class="shrink-0 rounded bg-zinc-900 px-1.5 py-0.5 font-mono text-[10px] text-white dark:bg-zinc-100 dark:text-zinc-900">{{ service.url }}</span>
          </span>
        </button>
      </li>
    </ul>
    <div v-if="checks.length" class="mt-3 border-t border-zinc-200 pt-3 dark:border-zinc-800">
      <ul class="space-y-1">
        <li v-for="check in checks" :key="check.label" data-check-row class="flex items-start gap-1.5 text-[11px] text-zinc-600 dark:text-zinc-300">
          <svg v-if="check.passed" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="mt-0.5 h-3 w-3 shrink-0 text-emerald-500"><path d="m5 12 4 4L19 6" /></svg>
          <span v-else class="mt-1 block h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-400" />
          <span class="min-w-0 flex-1">
            <code class="rounded bg-zinc-100 px-1 font-mono text-zinc-800 dark:bg-zinc-800 dark:text-zinc-100">{{ check.label }}</code>
            <span v-if="check.detail" class="text-zinc-500 dark:text-zinc-400"> {{ check.detail }}</span>
          </span>
        </li>
      </ul>
    </div>
    <p v-if="durationLabel" class="mt-3 text-[11px] text-zinc-500 dark:text-zinc-400">{{ durationLabel }}</p>
  </div>
</template>

<script setup lang="ts">
export interface DevService {
  name: string;
  command: string;
  status: 'running' | 'stopped' | 'failed' | 'starting';
  url?: string;
}

export interface DevCheck {
  label: string;
  passed: boolean;
  detail?: string;
}

withDefaults(
  defineProps<{
    services: DevService[];
    checks?: DevCheck[];
    durationLabel?: string;
  }>(),
  { checks: () => [], durationLabel: '' },
);

const emit = defineEmits<{
  (e: 'service-click', service: DevService): void;
}>();

const TONE: Record<string, { text: string; tone: string }> = {
  running: { text: 'Running on', tone: 'text-emerald-600 dark:text-emerald-400' },
  starting: { text: 'Starting…', tone: 'text-sky-600 dark:text-sky-400' },
  stopped: { text: 'Stopped', tone: 'text-zinc-500' },
  failed: { text: 'Failed', tone: 'text-rose-600 dark:text-rose-400' },
};

const toneLabel = (status: string) => TONE[status]?.text || 'Stopped';
const toneText = (status: string) => TONE[status]?.tone || TONE.stopped.tone;
</script>
