<script setup lang="ts">
export interface ConnectorItem {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  connected?: boolean;
}
interface Props {
  title?: string;
  connectors: ConnectorItem[];
  connectText?: string;
  connectedText?: string;
}
const props = withDefaults(defineProps<Props>(), {
  title: "Apps & Connectors",
  connectText: "Connect",
  connectedText: "Connected",
});
const emit = defineEmits<{ (e: "toggle", id: string, connected: boolean): void }>();

const connectedCount = props.connectors.filter((c) => c.connected).length;
</script>

<template>
  <div data-connector-grid class="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
    <div class="flex items-center justify-between">
      <p class="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{{ title }}</p>
      <span data-connector-count class="rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
        {{ connectedCount }}/{{ props.connectors.length }} connected
      </span>
    </div>
    <div class="mt-3 grid gap-3 sm:grid-cols-2">
      <div
        v-for="connector in props.connectors"
        :key="connector.id"
        :data-connector="connector.id"
        class="flex items-start justify-between gap-3 rounded-lg border px-3 py-3 transition-colors"
        :class="connector.connected
          ? 'border-indigo-200 bg-indigo-50/60 dark:border-indigo-800 dark:bg-indigo-950/40'
          : 'border-zinc-200 hover:border-zinc-300 dark:border-zinc-800 dark:hover:border-zinc-700'"
      >
        <div class="flex min-w-0 items-start gap-2.5">
          <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-zinc-100 text-base dark:bg-zinc-800" aria-hidden="true">{{ connector.icon || '🔌' }}</span>
          <div class="min-w-0">
            <p data-connector-name class="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-50">{{ connector.name }}</p>
            <p v-if="connector.description" data-connector-desc class="mt-0.5 line-clamp-2 text-xs text-zinc-500 dark:text-zinc-400">{{ connector.description }}</p>
          </div>
        </div>
        <button
          type="button"
          data-connector-toggle
          @click="emit('toggle', connector.id, !connector.connected)"
          class="shrink-0 rounded-md px-2.5 py-1.5 text-xs font-semibold transition-colors"
          :class="connector.connected
            ? 'border border-zinc-300 text-zinc-700 hover:border-zinc-400 dark:border-zinc-600 dark:text-zinc-200'
            : 'bg-indigo-600 text-white hover:bg-indigo-500'"
        >
          <span v-if="connector.connected" class="flex items-center gap-1">
            <svg viewBox="0 0 20 20" fill="none" class="h-3 w-3" aria-hidden="true"><path d="m4.5 10.5 3.5 3.5 7.5-8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" /></svg>
            {{ connectedText }}
          </span>
          <template v-else>{{ connectText }}</template>
        </button>
      </div>
    </div>
  </div>
</template>
