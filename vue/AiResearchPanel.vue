<script setup lang="ts">
import { computed } from 'vue';

export interface ResearchTemplate {
  id: string;
  title: string;
  description: string;
}

export interface AiResearchPanelProps {
  open?: boolean;
  title?: string;
  templates?: ResearchTemplate[];
  runLabel?: string;
  class?: string;
}

const props = withDefaults(defineProps<AiResearchPanelProps>(), {
  open: true,
  title: 'Research with AI',
  templates: () => [],
  runLabel: 'Run custom AI prompt',
});

const emit = defineEmits<{
  (e: 'run', template: ResearchTemplate): void;
  (e: 'run-custom'): void;
  (e: 'close'): void;
}>();

const visible = computed(() => props.templates);
</script>

<template>
  <aside
    v-if="props.open"
    data-ai-research-panel
    class="flex w-full max-w-sm flex-col rounded-xl border border-zinc-200 bg-white shadow-xl dark:border-zinc-800 dark:bg-zinc-900"
    :class="props.class"
  >
    <header class="flex items-center justify-between border-b border-zinc-100 px-4 py-3 dark:border-zinc-800">
      <h4 data-ai-research-title class="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{{ props.title }}</h4>
      <button
        type="button"
        data-ai-research-close
        aria-label="Close research panel"
        class="rounded p-1 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
        @click="emit('close')"
      >
        ✕
      </button>
    </header>
    <div data-ai-research-list class="flex-1 space-y-2.5 overflow-y-auto px-4 py-3">
      <p
        v-if="visible.length === 0"
        data-ai-research-empty
        class="py-6 text-center text-xs text-zinc-400 dark:text-zinc-500"
      >
        No research templates yet.
      </p>
      <div
        v-for="t in visible"
        :key="t.id"
        :data-research-card="t.id"
        class="rounded-lg border border-zinc-200 p-3 transition-colors hover:border-zinc-300 dark:border-zinc-700 dark:hover:border-zinc-600"
      >
        <p data-research-title class="text-xs font-semibold text-zinc-900 dark:text-zinc-50">{{ t.title }}</p>
        <p data-research-desc class="mt-1 line-clamp-2 text-[11px] leading-relaxed text-zinc-500 dark:text-zinc-400">
          {{ t.description }}
        </p>
        <button
          type="button"
          data-research-run
          class="mt-2.5 w-full rounded-md border border-zinc-200 px-2 py-1.5 text-[11px] font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
          @click="emit('run', t)"
        >
          Try it
        </button>
      </div>
    </div>
    <footer class="border-t border-zinc-100 px-4 py-3 dark:border-zinc-800">
      <button
        type="button"
        data-ai-research-custom
        class="w-full rounded-md bg-zinc-900 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
        @click="emit('run-custom')"
      >
        {{ props.runLabel }}
      </button>
    </footer>
  </aside>
</template>
