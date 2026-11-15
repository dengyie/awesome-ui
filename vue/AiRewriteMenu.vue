<script setup lang="ts">
export interface RewriteAction {
  id: string;
  label: string;
  badge?: string;
}

export interface AiRewriteMenuProps {
  open?: boolean;
  triggerLabel?: string;
  actions?: RewriteAction[];
  class?: string;
}

const props = withDefaults(defineProps<AiRewriteMenuProps>(), {
  open: false,
  triggerLabel: 'Rewrite',
  actions: () => [],
});

const emit = defineEmits<{
  (e: 'select', action: RewriteAction): void;
  (e: 'toggle'): void;
}>();
</script>

<template>
  <div data-rewrite-menu-root class="relative inline-block" :class="props.class">
    <button
      type="button"
      data-rewrite-trigger
      :aria-expanded="props.open"
      class="flex items-center gap-1.5 rounded-md border border-zinc-200 bg-white px-2.5 py-1.5 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
      @click="emit('toggle')"
    >
      <span aria-hidden="true" class="text-indigo-500">✦</span>
      {{ props.triggerLabel }}
      <span aria-hidden="true" class="text-zinc-400">▾</span>
    </button>
    <div
      v-if="props.open && props.actions.length > 0"
      data-rewrite-menu
      class="absolute bottom-full left-0 z-10 mb-2 w-60 overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-lg dark:border-zinc-700 dark:bg-zinc-900"
    >
      <button
        v-for="action in props.actions"
        :key="action.id"
        type="button"
        :data-rewrite-item="action.id"
        class="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-xs text-zinc-700 transition-colors hover:bg-zinc-50 dark:text-zinc-200 dark:hover:bg-zinc-800"
        @click="emit('select', action)"
      >
        <span data-rewrite-item-label>{{ action.label }}</span>
        <span
          v-if="action.badge"
          data-rewrite-item-badge
          class="inline-flex shrink-0 items-center gap-1 rounded-full bg-indigo-50 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-300"
        >
          <span aria-hidden="true">↑</span>
          {{ action.badge }}
        </span>
      </button>
    </div>
  </div>
</template>
