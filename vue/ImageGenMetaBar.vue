<script setup lang="ts">
export interface ImageGenMetaBarProps {
  model?: string;
  jobId?: string;
  duration?: string;
  cost?: string;
  class?: string;
}

const props = withDefaults(defineProps<ImageGenMetaBarProps>(), {
  model: "openai/gpt-image-2",
  jobId: "# 019f1ba4",
  duration: "169.0s",
  cost: "$ 0.211",
  class: "",
});
</script>

<template>
  <div data-image-gen-meta class="relative w-full border-t border-zinc-200 bg-white px-2.5 py-1.5 dark:border-zinc-800 dark:bg-zinc-900" :class="props.class">
    <span data-image-gen-model class="absolute left-2 bottom-11 inline-flex items-center rounded bg-zinc-900/70 px-1.5 py-0.5 text-[10px] font-medium text-zinc-100 backdrop-blur dark:bg-zinc-950/70">{{ props.model }}</span>
    <div class="flex items-center gap-2 text-[10px] font-mono text-zinc-500 dark:text-zinc-400">
      <span data-image-gen-job>{{ props.jobId }}</span>
      <span data-image-gen-clock aria-hidden="true" class="text-zinc-300 dark:text-zinc-600">◷</span>
      <span data-image-gen-duration>{{ props.duration }}</span>
      <span class="ml-auto" />
      <span data-image-gen-cost class="font-medium text-zinc-600 dark:text-zinc-300">{{ props.cost }}</span>
    </div>
  </div>
</template>
