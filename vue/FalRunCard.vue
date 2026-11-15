<script setup lang="ts">
export interface FalRunCardProps {
  type?: string;
  models?: number;
  time?: string;
  prompt?: string;
  aspect?: string;
  cost?: string;
  costTone?: "green" | "zinc";
  class?: string;
  onDuplicate?: () => void;
  onRerun?: () => void;
  onDelete?: () => void;
}

const props = withDefaults(defineProps<FalRunCardProps>(), {
  type: "Text To Image",
  models: 4,
  time: "22 minutes ago",
  prompt: "a calm, morning, beach scenery",
  aspect: "1:1",
  cost: "$0.241",
  costTone: "green",
  class: "",
});
defineEmits(["duplicate", "rerun", "delete"]);
</script>

<template>
  <div data-fal-run-card class="w-full rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900" :class="props.class">
    <div class="flex items-center justify-between gap-2">
      <span data-fal-run-type class="inline-flex items-center gap-1.5 rounded-md border border-purple-200 bg-purple-50 px-2 py-1 text-[11px] font-medium text-purple-600 dark:border-purple-800 dark:bg-purple-950/40 dark:text-purple-300">
        <span aria-hidden="true">⌨</span>
        {{ props.type }}
        <span aria-hidden="true" class="text-purple-300 dark:text-purple-700">▸</span>
      </span>
      <button type="button" data-fal-run-bookmark aria-label="Bookmark run" class="text-zinc-400 transition-colors hover:text-zinc-600 dark:hover:text-zinc-200">⚑</button>
    </div>
    <p data-fal-run-meta class="mt-2 text-[11px] text-zinc-500 dark:text-zinc-400">
      <span data-fal-run-models>{{ props.models }} models</span>
      <span class="mx-1.5">·</span>
      <span data-fal-run-time>{{ props.time }}</span>
    </p>
    <div class="mt-3">
      <p class="text-[11px] font-medium text-zinc-400 dark:text-zinc-500">Prompt</p>
      <p data-fal-run-prompt class="mt-1 text-sm leading-relaxed text-zinc-800 dark:text-zinc-200">{{ props.prompt }}</p>
    </div>
    <div data-fal-run-rows class="mt-3 space-y-1.5">
      <div class="flex items-center justify-between text-xs">
        <span class="text-zinc-500 dark:text-zinc-400">Aspect Ratio:</span>
        <span data-fal-run-aspect class="rounded border border-zinc-200 px-1.5 py-0.5 font-mono text-[10px] text-zinc-600 dark:border-zinc-700 dark:text-zinc-300">{{ props.aspect }}</span>
      </div>
      <div class="flex items-center justify-between text-xs">
        <span class="text-zinc-500 dark:text-zinc-400">Total Cost:</span>
        <span data-fal-run-cost :class="['font-mono text-[11px] font-medium', props.costTone === 'green' ? 'text-emerald-500' : 'text-zinc-600 dark:text-zinc-300']">{{ props.cost }}</span>
      </div>
    </div>
    <div data-fal-run-actions class="mt-4 flex items-center justify-between border-t border-zinc-100 pt-3 dark:border-zinc-800">
      <div class="flex items-center gap-1">
        <button type="button" data-fal-run-duplicate aria-label="Duplicate run" class="flex h-8 w-8 items-center justify-center rounded-md text-sm text-zinc-400 transition-colors hover:bg-zinc-50 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-200" @click="$emit('duplicate')">⧉</button>
        <button type="button" data-fal-run-rerun aria-label="Rerun run" class="flex h-8 w-8 items-center justify-center rounded-md text-sm text-zinc-400 transition-colors hover:bg-zinc-50 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-200" @click="$emit('rerun')">↻</button>
        <button type="button" data-fal-run-delete aria-label="Delete run" class="flex h-8 w-8 items-center justify-center rounded-md text-sm text-zinc-400 transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/40" @click="$emit('delete')">🗑</button>
      </div>
      <button type="button" data-fal-run-share aria-label="Share run" class="flex h-8 w-8 items-center justify-center rounded-md text-sm text-zinc-400 transition-colors hover:bg-zinc-50 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-200">⇗</button>
    </div>
  </div>
</template>
