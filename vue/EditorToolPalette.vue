<template>
  <div
    data-tool-palette
    role="toolbar"
    :aria-orientation="orientation"
    :class="['inline-flex gap-0.5 rounded-xl border border-zinc-200 bg-white p-1 shadow-lg dark:border-zinc-800 dark:bg-zinc-900', vertical ? 'flex-col items-center' : 'items-center']"
  >
    <button
      v-for="tool in tools"
      :key="tool.id"
      type="button"
      :data-tool="tool.id"
      :title="tool.label"
      :disabled="tool.disabled"
      :class="['relative flex h-9 w-9 items-center justify-center rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-40', tool.id === activeId ? 'bg-blue-500 text-white' : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-50']"
      @click="!tool.disabled && emit('select', tool.id)"
    >
      <span class="pointer-events-none flex h-5 w-5 items-center justify-center [&>svg]:h-5 [&>svg]:w-5" v-html="tool.icon" />
      <span
        v-if="showKbdHints && tool.kbd"
        :class="['absolute -right-0.5 -top-0.5 rounded px-1 text-[9px] font-semibold leading-tight', tool.id === activeId ? 'bg-white/90 text-blue-600' : 'bg-zinc-100 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500']"
      >{{ tool.kbd }}</span>
      <span v-if="tool.id === activeId && activeCount != null && activeCount > 0" data-tool-badge class="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full bg-blue-600 px-1.5 text-[9px] font-semibold leading-tight text-white">{{ activeCount }}</span>
      <span class="sr-only">{{ tool.label }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">
export interface PaletteTool {
  id: string;
  icon: string;
  label: string;
  kbd?: string;
  badge?: number;
  disabled?: boolean;
}

withDefaults(
  defineProps<{
    tools: PaletteTool[];
    orientation?: 'horizontal' | 'vertical';
    activeId?: string | null;
    activeCount?: number;
    showKbdHints?: boolean;
  }>(),
  { orientation: 'horizontal', activeId: null, activeCount: undefined, showKbdHints: true },
);

const emit = defineEmits<{
  (e: 'select', id: string): void;
}>();
</script>
