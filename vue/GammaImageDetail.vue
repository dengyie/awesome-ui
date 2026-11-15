<script setup lang="ts">
export interface GammaImageDetailProps {
  title?: string;
  preview?: string;
  prompt?: string;
  liked?: boolean;
  class?: string;
}

const props = withDefaults(defineProps<GammaImageDetailProps>(), {
  title: "AI images",
  preview: "",
  prompt: "Generate the following image: Mobile-first social media carousel content slide with professional creative aesthetic.",
  liked: false,
  class: "",
});
defineEmits(["download", "zoom", "delete", "like", "dislike"]);
</script>

<template>
  <div data-gamma-image-detail class="w-full rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900" :class="props.class">
    <div class="flex items-center justify-between">
      <h3 data-gamma-detail-title class="text-base font-semibold text-zinc-900 dark:text-zinc-50">{{ props.title }}</h3>
      <button type="button" data-gamma-detail-close aria-label="Close detail" class="text-zinc-400 transition-colors hover:text-zinc-600 dark:hover:text-zinc-200">✕</button>
    </div>
    <div data-gamma-detail-preview class="mt-3 flex items-center justify-center overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-800" style="min-height: 160px">
      <img v-if="props.preview" :src="props.preview" :alt="props.title" class="max-h-64 w-auto object-cover" />
      <span v-else aria-hidden="true" class="text-3xl text-zinc-300 dark:text-zinc-600">🖼</span>
    </div>
    <div data-gamma-detail-toolbar class="mt-3 flex items-center justify-between">
      <div class="flex items-center gap-1">
        <button type="button" data-gamma-detail-download aria-label="Download image" class="flex h-8 w-8 items-center justify-center rounded-md text-sm text-zinc-500 transition-colors hover:bg-zinc-50 hover:text-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200" @click="$emit('download')">↓</button>
        <button type="button" data-gamma-detail-zoom aria-label="Zoom image" class="flex h-8 w-8 items-center justify-center rounded-md text-sm text-zinc-500 transition-colors hover:bg-zinc-50 hover:text-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200" @click="$emit('zoom')">🔍</button>
        <button type="button" data-gamma-detail-delete aria-label="Delete image" class="flex h-8 w-8 items-center justify-center rounded-md text-sm text-zinc-500 transition-colors hover:bg-red-50 hover:text-red-500 dark:text-zinc-400 dark:hover:bg-red-950/40" @click="$emit('delete')">🗑</button>
      </div>
      <div class="flex items-center gap-1">
        <button type="button" data-gamma-detail-dislike aria-label="Dislike image" class="flex h-8 w-8 items-center justify-center rounded-md text-sm text-zinc-500 transition-colors hover:bg-zinc-50 hover:text-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200" @click="$emit('dislike')">👎</button>
        <button type="button" data-gamma-detail-like :aria-pressed="props.liked" aria-label="Like image" :class="['flex h-8 w-8 items-center justify-center rounded-md text-sm transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800', props.liked ? 'text-rose-500' : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200']" @click="$emit('like')">👍</button>
      </div>
    </div>
    <div class="mt-3">
      <p class="text-[11px] font-medium text-zinc-400 dark:text-zinc-500">Prompt</p>
      <p data-gamma-detail-prompt class="mt-1.5 rounded-lg border border-zinc-200 p-3 text-xs leading-relaxed text-zinc-700 dark:border-zinc-700 dark:text-zinc-300">{{ props.prompt }}</p>
    </div>
  </div>
</template>
