<script setup lang="ts">
export interface ImageMenuAction {
  id: string;
  label: string;
  icon?: string;
  danger?: boolean;
}

export interface ImageActionMenuProps {
  open?: boolean;
  actions?: ImageMenuAction[];
  class?: string;
}

const props = withDefaults(defineProps<ImageActionMenuProps>(), {
  open: true,
  actions: () => [],
});

const emit = defineEmits<{
  (e: 'action', action: ImageMenuAction): void;
  (e: 'close'): void;
}>();

const iconFor = (action: ImageMenuAction) =>
  action.icon ??
  (({ Fullscreen: '⛶', Vary: '↻', Edit: '✎', 'Make video': '▶', Download: '↓' } as Record<string, string>)[
    action.label
  ] ?? '•');
</script>

<template>
  <div
    v-if="props.open"
    data-image-action-menu
    class="w-56 overflow-hidden rounded-lg border border-zinc-200 bg-white py-1 shadow-lg dark:border-zinc-700 dark:bg-zinc-900"
    :class="props.class"
  >
    <p
      v-if="props.actions.length === 0"
      data-image-action-empty
      class="px-3 py-3 text-center text-xs text-zinc-400 dark:text-zinc-500"
    >
      No actions available.
    </p>
    <template v-else>
      <template v-for="(action, i) in props.actions" :key="action.id">
        <div v-if="i > 0 && action.id === 'download'" class="my-1 h-px bg-zinc-100 dark:bg-zinc-800" />
        <button
          type="button"
          :data-image-action="action.id"
          class="flex w-full items-center gap-2.5 px-3 py-2 text-left text-xs transition-colors"
          :class="
            action.danger
              ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40'
              : 'text-zinc-700 hover:bg-zinc-50 dark:text-zinc-200 dark:hover:bg-zinc-800'
          "
          @click="emit('action', action)"
        >
          <span aria-hidden="true" class="w-4 shrink-0 text-center text-zinc-400 dark:text-zinc-500">
            {{ iconFor(action) }}
          </span>
          <span data-image-action-label>{{ action.label }}</span>
        </button>
      </template>
    </template>
  </div>
</template>
