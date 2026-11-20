<script setup lang="ts">
import { ref, computed } from "vue";

export type FallbackHealth = "healthy" | "degraded" | "down";
export interface FallbackEntry {
  id: string;
  model: string;
  provider?: string;
  health?: FallbackHealth;
  condition?: string;
  latency?: string;
}
interface Props {
  title?: string;
  description?: string;
  entries?: FallbackEntry[];
  primaryId?: string;
}
const props = withDefaults(defineProps<Props>(), {
  title: "Model fallback chain",
  description: "Requests try the primary model first, then walk down the chain when a fallback condition triggers.",
  entries: () => [],
});
const emit = defineEmits<{
  (e: "reorder", ids: string[]): void;
}>();

const ids = ref<string[]>(props.entries.map((e) => e.id));
const moveFlash = ref<string | null>(null);
let flashTimer: ReturnType<typeof setTimeout> | undefined;

const ordered = computed(() =>
  ids.value
    .map((id) => props.entries.find((e) => e.id === id))
    .filter((e) => Boolean(e))
);
const activePrimary = computed(() => props.primaryId ?? ordered.value[0]?.id);

const move = (id: string, dir: number) => {
  const idx = ids.value.indexOf(id);
  const next = idx + dir;
  if (idx < 0 || next < 0 || next >= ids.value.length) return;
  const list = [...ids.value];
  list.splice(idx, 1);
  list.splice(next, 0, id);
  ids.value = list;
  moveFlash.value = id;
  if (flashTimer) clearTimeout(flashTimer);
  flashTimer = setTimeout(() => (moveFlash.value = null), 1200);
  emit("reorder", list);
};
</script>

<template>
  <div data-fallback-list class="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
    <p data-fallback-title class="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{{ props.title }}</p>
    <p data-fallback-description class="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{{ props.description }}</p>

    <div data-fallback-rows class="mt-3 space-y-2">
      <div
        v-for="(entry, i) in ordered"
        :key="entry.id"
        :data-fallback-row="entry.id"
        :class="`flex items-center gap-2.5 rounded-lg border px-3 py-2 ${
          entry.id === activePrimary
            ? 'border-indigo-200 bg-indigo-50/60 dark:border-indigo-500/30 dark:bg-indigo-500/10'
            : 'border-zinc-200 dark:border-zinc-700'
        }`"
      >
        <span data-fallback-rank class="w-4 text-center font-mono text-[11px] text-zinc-400 dark:text-zinc-500">{{ i + 1 }}</span>
        <span
          class="h-2 w-2 shrink-0 rounded-full"
          :title="entry.health === 'down' ? 'Down' : entry.health === 'degraded' ? 'Degraded' : 'Healthy'"
          :class="entry.health === 'down' ? 'bg-rose-500' : entry.health === 'degraded' ? 'bg-amber-500' : 'bg-emerald-500'"
        />
        <div class="min-w-0 flex-1">
          <div class="flex items-center gap-2">
            <span data-fallback-model class="truncate text-xs font-semibold text-zinc-800 dark:text-zinc-100">{{ entry.model }}</span>
            <span
              v-if="entry.id === activePrimary"
              data-fallback-primary
              class="rounded-full bg-indigo-600 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-white"
            >
              Primary
            </span>
            <span v-if="moveFlash === entry.id" data-fallback-moved class="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400">
              order updated
            </span>
          </div>
          <p class="mt-0.5 truncate text-[11px] text-zinc-500 dark:text-zinc-400">
            {{ entry.provider ? entry.provider + " · " : "" }}{{ entry.condition ?? "fallback" }}{{ entry.latency ? " · " + entry.latency : "" }}
          </p>
        </div>
        <div class="flex shrink-0 flex-col gap-0.5">
          <button
            type="button"
            data-fallback-up
            title="Promote"
            :aria-label="'Promote ' + entry.model"
            :disabled="i === 0"
            @click="move(entry.id, -1)"
            class="rounded border border-zinc-200 px-1.5 text-[10px] leading-4 text-zinc-500 disabled:opacity-30 hover:border-zinc-300 hover:text-zinc-700 dark:border-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
          >
            ↑
          </button>
          <button
            type="button"
            data-fallback-down
            title="Demote"
            :aria-label="'Demote ' + entry.model"
            :disabled="i === ordered.length - 1"
            @click="move(entry.id, 1)"
            class="rounded border border-zinc-200 px-1.5 text-[10px] leading-4 text-zinc-500 disabled:opacity-30 hover:border-zinc-300 hover:text-zinc-700 dark:border-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
          >
            ↓
          </button>
        </div>
      </div>
      <p
        v-if="ordered.length === 0"
        data-fallback-empty
        class="rounded-lg border border-dashed border-zinc-200 px-3 py-4 text-center text-xs text-zinc-400 dark:border-zinc-700 dark:text-zinc-500"
      >
        No models in the fallback chain
      </p>
    </div>
  </div>
</template>
