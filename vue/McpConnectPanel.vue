<script setup lang="ts">
import { ref, computed, onUnmounted } from "vue";

export interface McpClientTab {
  id: string;
  label: string;
  mark?: string;
  steps: string[];
  snippet?: string;
}
interface Props {
  title?: string;
  description?: string;
  clients: McpClientTab[];
}
const props = withDefaults(defineProps<Props>(), {
  title: "Connection guide",
  description: "Connect to the MCP server to access workspace data directly from your preferred AI assistant.",
});
const emit = defineEmits<{
  (e: "copy", client: McpClientTab): void;
}>();

const active = ref(props.clients[0]?.id ?? "");
const copied = ref(false);
let copyTimer: ReturnType<typeof setTimeout> | undefined;
const client = computed(() => props.clients.find((c) => c.id === active.value) ?? props.clients[0]);

const select = (id: string) => {
  active.value = id;
  copied.value = false;
};
const copy = () => {
  copied.value = true;
  if (client.value) emit("copy", client.value);
  if (copyTimer) clearTimeout(copyTimer);
  copyTimer = setTimeout(() => { copied.value = false; }, 1600);
};
onUnmounted(() => { if (copyTimer) clearTimeout(copyTimer); });
</script>

<template>
  <div data-mcp-panel class="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
    <p data-mcp-title class="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{{ props.title }}</p>
    <p data-mcp-description class="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{{ props.description }}</p>

    <div data-mcp-tabs class="mt-3 flex gap-1 border-b border-zinc-200 dark:border-zinc-800">
      <button
        v-for="c in props.clients"
        :key="c.id"
        type="button"
        :data-mcp-tab="c.id"
        :aria-selected="c.id === client?.id"
        @click="select(c.id)"
        :class="c.id === client?.id
          ? '-mb-px flex items-center gap-1.5 border-b-2 border-teal-600 px-3 py-2 text-xs font-semibold text-teal-700 dark:border-teal-400 dark:text-teal-300'
          : '-mb-px flex items-center gap-1.5 border-b-2 border-transparent px-3 py-2 text-xs font-semibold text-zinc-500 transition-colors hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200'"
      >
        <span v-if="c.mark" aria-hidden="true">{{ c.mark }}</span>
        {{ c.label }}
      </button>
    </div>

    <ol data-mcp-steps class="mt-3 space-y-2">
      <li v-for="(step, i) in client?.steps || []" :key="i" data-mcp-step class="flex items-start gap-2 text-xs text-zinc-600 dark:text-zinc-300">
        <span class="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-teal-50 font-mono text-[10px] font-bold text-teal-700 dark:bg-teal-950/60 dark:text-teal-300">{{ i + 1 }}</span>
        <span class="min-w-0">{{ step }}</span>
      </li>
    </ol>

    <div v-if="client?.snippet" data-mcp-snippet class="mt-3">
      <div class="relative">
        <pre class="overflow-x-auto rounded-lg bg-zinc-950 p-3 font-mono text-[11px] leading-relaxed text-zinc-200"><code>{{ client.snippet }}</code></pre>
        <button
          type="button"
          data-mcp-copy
          @click="copy"
          class="absolute right-2 top-2 rounded-md border border-zinc-700 bg-zinc-900/90 px-2 py-1 text-[10px] font-semibold text-zinc-300 hover:border-teal-500 hover:text-teal-300"
        >
          {{ copied ? "Copied!" : "Copy" }}
        </button>
      </div>
    </div>
  </div>
</template>
