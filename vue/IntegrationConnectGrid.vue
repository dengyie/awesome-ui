<script setup lang="ts">
import { computed, ref } from "vue";

export interface IntegrationService {
  id: string;
  name: string;
  category?: string;
  connected?: boolean;
}

export interface IntegrationConnectGridProps {
  title?: string;
  description?: string;
  integrations?: IntegrationService[];
  connectLabel?: string;
  disconnectLabel?: string;
  class?: string;
}

const props = withDefaults(defineProps<IntegrationConnectGridProps>(), {
  title: "Integrations",
  description: "Connect third-party services to extend your workspace.",
  integrations: () => [
    { id: "gh", name: "GitHub", category: "Code", connected: true },
    { id: "sl", name: "Slack", category: "Chat", connected: true },
    { id: "li", name: "Linear", category: "Code", connected: false },
    { id: "no", name: "Notion", category: "Docs", connected: false },
    { id: "fg", name: "Figma", category: "Design", connected: false },
    { id: "sn", name: "Sentry", category: "Monitoring", connected: true },
  ],
  connectLabel: "Connect",
  disconnectLabel: "Disconnect",
  class: "",
});

const emit = defineEmits<{
  (e: "integration-toggle", integration: IntegrationService, connected: boolean): void;
}>();

const CATEGORY_ALL = "All";
const category = ref(CATEGORY_ALL);
const all = computed(() => (Array.isArray(props.integrations) ? props.integrations : []));
const categories = computed(() => [CATEGORY_ALL, ...new Set(all.value.map((it) => it.category).filter(Boolean))]);
const visible = computed(() => (category.value === CATEGORY_ALL ? all.value : all.value.filter((it) => it.category === category.value)));

const toggle = (integration: IntegrationService) => {
  integration.connected = !integration.connected;
  emit("integration-toggle", integration, integration.connected);
};
</script>

<template>
  <div data-integration-grid class="w-full rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900" :class="props.class">
    <div data-integration-header class="mb-4">
      <p data-integration-title class="text-base font-semibold text-zinc-900 dark:text-zinc-50">{{ props.title }}</p>
      <p data-integration-description class="mt-1 text-sm leading-5 text-zinc-500 dark:text-zinc-400">{{ props.description }}</p>
      <div data-integration-tabs class="mt-3 flex flex-wrap gap-2">
        <button
          v-for="cat in categories"
          :key="cat"
          type="button"
          :data-integration-tab="cat"
          class="rounded-full border px-3 py-1 text-xs font-medium transition-colors"
          :class="cat === category
            ? 'border-violet-500 bg-violet-50 text-violet-700 dark:border-violet-600 dark:bg-violet-950/40 dark:text-violet-300'
            : 'border-zinc-200 text-zinc-500 hover:text-zinc-700 dark:border-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200'"
          @click="category = cat"
        >
          {{ cat }}
        </button>
      </div>
    </div>
    <div data-integration-cards class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <div v-for="it in visible" :key="it.id" :data-integration-card="it.id" class="flex flex-col gap-3 rounded-xl border border-zinc-200 bg-white p-4 transition-shadow hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div class="flex items-center gap-3">
          <span :data-integration-logo="it.name" aria-hidden="true" class="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-100 text-sm font-bold text-zinc-500 dark:bg-zinc-800 dark:text-zinc-300">{{ (it.name || "?").slice(0, 1).toUpperCase() }}</span>
          <div class="min-w-0">
            <p :data-integration-name="it.name" class="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-50">{{ it.name }}</p>
            <p :data-integration-category="it.category || ''" class="text-[11px] text-zinc-400 dark:text-zinc-500">{{ it.category || "" }}</p>
          </div>
        </div>
        <div class="flex items-center justify-between">
          <span v-if="it.connected" data-integration-state="connected" class="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400"><span class="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden="true"></span>Connected</span>
          <span v-else data-integration-state="not-connected" class="inline-flex items-center rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] font-semibold text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">Not connected</span>
          <button
            type="button"
            :data-integration-action="it.id"
            class="rounded-md border px-3 py-1.5 text-xs font-semibold transition-colors"
            :class="it.connected
              ? 'border-zinc-200 text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800'
              : 'border-violet-300 bg-violet-600 text-white hover:bg-violet-500 dark:border-violet-600 dark:bg-violet-600 dark:hover:bg-violet-500'"
            @click="toggle(it)"
          >
            {{ it.connected ? props.disconnectLabel : props.connectLabel }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
