<script setup lang="ts">
import { computed } from 'vue';

export interface ApiKeyRow {
  id: string;
  name: string;
  preview: string;
  created?: string;
  status?: 'active' | 'revoked';
}

export interface ApiKeyTableProps {
  title?: string;
  keys?: ApiKeyRow[];
  createLabel?: string;
  class?: string;
}

const props = withDefaults(defineProps<ApiKeyTableProps>(), {
  title: 'API keys',
  keys: () => [],
  createLabel: 'Create new secret key',
});

const emit = defineEmits<{
  (e: 'create'): void;
  (e: 'copy', row: ApiKeyRow): void;
  (e: 'revoke', row: ApiKeyRow): void;
}>();

const activeCount = computed(() => props.keys.filter((k) => k.status !== 'revoked').length);
const meta = (row: ApiKeyRow) => (row.created ? `${row.preview} · created ${row.created}` : row.preview);
</script>

<template>
  <div
    data-api-key-table
    class="w-full rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
    :class="props.class"
  >
    <div class="flex items-center justify-between border-b border-zinc-100 px-4 py-3 dark:border-zinc-800">
      <h4 class="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
        {{ props.title }}
        <span
          data-api-key-count
          class="ml-1 rounded-full bg-zinc-100 px-1.5 py-0.5 text-[10px] font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
        >
          {{ activeCount }} active
        </span>
      </h4>
      <button
        type="button"
        data-api-key-create
        class="rounded-md bg-emerald-600 px-2.5 py-1.5 text-[11px] font-semibold text-white transition-colors hover:bg-emerald-500"
        @click="emit('create')"
      >
        + {{ props.createLabel }}
      </button>
    </div>
    <div data-api-key-list class="divide-y divide-zinc-100 dark:divide-zinc-800">
      <p
        v-if="props.keys.length === 0"
        data-api-key-empty
        class="px-4 py-6 text-center text-xs text-zinc-400 dark:text-zinc-500"
      >
        No API keys yet.
      </p>
      <div
        v-for="k in props.keys"
        :key="k.id"
        :data-api-key-row="k.id"
        class="flex items-center gap-3 px-4 py-2.5"
      >
        <div class="min-w-0 flex-1">
          <div class="flex items-center gap-2">
            <p data-api-key-name class="truncate text-xs font-medium text-zinc-900 dark:text-zinc-50">{{ k.name }}</p>
            <span
              data-api-key-status
              class="rounded-full px-1.5 py-0.5 text-[10px] font-medium"
              :class="
                k.status === 'revoked'
                  ? 'bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400'
                  : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400'
              "
            >
              {{ k.status === 'revoked' ? 'Revoked' : 'Active' }}
            </span>
          </div>
          <p data-api-key-preview class="mt-0.5 truncate font-mono text-[11px] text-zinc-400 dark:text-zinc-500">
            {{ meta(k) }}
          </p>
        </div>
        <div v-if="k.status !== 'revoked'" class="flex shrink-0 items-center gap-1.5">
          <button
            type="button"
            data-api-key-copy
            class="rounded border border-zinc-200 px-2 py-1 text-[11px] font-medium text-zinc-600 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
            @click="emit('copy', k)"
          >
            Copy
          </button>
          <button
            type="button"
            data-api-key-revoke
            class="rounded border border-red-200 px-2 py-1 text-[11px] font-medium text-red-500 transition-colors hover:bg-red-50 dark:border-red-900/60 dark:hover:bg-red-950/40"
            @click="emit('revoke', k)"
          >
            Revoke
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
