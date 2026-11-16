<script setup lang="ts">
import { ref } from "vue";

export interface VideoChapter {
  id: string;
  label: string;
  timestamp: string;
}

export interface VideoThumbnail {
  id: string;
  src?: string;
  gradient?: string;
}

export interface VideoProjectSettingsProps {
  panelTitle?: string;
  panelEmptyText?: string;
  chapters?: VideoChapter[];
  addChapterLabel?: string;
  titleLabel?: string;
  titleValue?: string;
  descriptionLabel?: string;
  descriptionValue?: string;
  thumbnailLabel?: string;
  thumbnails?: VideoThumbnail[];
  selectedThumbnailId?: string;
  storageUsed?: string;
  storageTotal?: string;
  class?: string;
}

const props = withDefaults(defineProps<VideoProjectSettingsProps>(), {
  panelTitle: "Chapters",
  panelEmptyText: "Add chapters so your viewers can find specific parts of your video",
  chapters: () => [],
  addChapterLabel: "Add a chapter",
  titleLabel: "Title",
  titleValue: "Video project",
  descriptionLabel: "Description",
  descriptionValue: "",
  thumbnailLabel: "Thumbnail",
  thumbnails: () => [
    { id: "t1", gradient: "bg-gradient-to-br from-violet-400 via-fuchsia-400 to-rose-400 dark:from-violet-700 dark:via-fuchsia-700 dark:to-rose-700" },
    { id: "t2", gradient: "bg-gradient-to-br from-sky-400 via-cyan-400 to-emerald-400 dark:from-sky-700 dark:via-cyan-700 dark:to-emerald-700" },
  ],
  selectedThumbnailId: "t1",
  storageUsed: "31MB",
  storageTotal: "7TB",
  class: "",
});
const emit = defineEmits(["add-chapter", "title-change", "description-change", "thumbnail-select"]);

const selectedId = ref(props.selectedThumbnailId);
const titleText = ref(props.titleValue);
const descriptionText = ref(props.descriptionValue);
const thumbCls = (thumb: VideoThumbnail) => {
  const selected = thumb.id === selectedId.value;
  return `${thumb.gradient ?? "bg-zinc-300 dark:bg-zinc-700"} ${selected ? "ring-2 ring-zinc-900 ring-offset-2 dark:ring-white dark:ring-offset-zinc-900" : "opacity-80 hover:opacity-100"}`;
};
</script>

<template>
  <div data-video-settings class="flex w-full overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900" :class="props.class">
    <!-- chapters side panel -->
    <aside data-video-chapters class="flex w-64 shrink-0 flex-col border-r border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950/60">
      <div class="flex items-center justify-between px-4 py-3">
        <div class="flex items-center gap-2">
          <button data-video-back type="button" aria-label="Back" class="text-zinc-400 transition-colors hover:text-zinc-600 dark:hover:text-zinc-200">←</button>
          <span class="text-sm font-bold text-zinc-900 dark:text-zinc-50">{{ props.panelTitle }}</span>
        </div>
        <button data-video-close type="button" aria-label="Close panel" class="text-zinc-400 transition-colors hover:text-zinc-600 dark:hover:text-zinc-200">✕</button>
      </div>
      <div class="mx-4 flex items-center justify-center rounded-lg bg-zinc-200/70 py-3 text-lg dark:bg-zinc-800/70" aria-hidden="true">🔖</div>
      <div data-video-chapters-body class="flex-1 px-4 py-3">
        <p v-if="props.chapters.length === 0" data-video-chapters-empty class="text-xs leading-5 text-zinc-500 dark:text-zinc-400">{{ props.panelEmptyText }}</p>
        <ul v-else data-video-chapter-list class="space-y-2">
          <li
            v-for="chapter in props.chapters"
            :key="chapter.id"
            :data-video-chapter="chapter.id"
            class="flex items-center justify-between rounded-lg bg-white px-3 py-2 text-xs shadow-sm dark:bg-zinc-900"
          >
            <span class="font-medium text-zinc-800 dark:text-zinc-100">{{ chapter.label }}</span>
            <span class="font-mono text-zinc-400 dark:text-zinc-500">{{ chapter.timestamp }}</span>
          </li>
        </ul>
      </div>
      <button
        data-video-add-chapter
        type="button"
        class="mx-4 mb-4 rounded-lg border border-dashed border-zinc-300 px-3 py-2 text-xs font-semibold text-zinc-600 transition-colors hover:border-zinc-400 hover:text-zinc-800 dark:border-zinc-600 dark:text-zinc-300 dark:hover:border-zinc-400 dark:hover:text-zinc-100"
        @click="emit('add-chapter')"
      >
        ＋ {{ props.addChapterLabel }}
      </button>
    </aside>

    <!-- main form -->
    <div data-video-form class="flex-1 space-y-5 p-6">
      <div data-video-field-title>
        <label data-video-title-label class="mb-1.5 block text-xs font-semibold text-zinc-500 dark:text-zinc-400" for="video-title-input">{{ props.titleLabel }}</label>
        <input
          id="video-title-input"
          data-video-title-input
          v-model="titleText"
          type="text"
          class="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-950/60 dark:text-zinc-50"
          @input="emit('title-change', titleText)"
        />
      </div>

      <div data-video-field-description>
        <label data-video-description-label class="mb-1.5 block text-xs font-semibold text-zinc-500 dark:text-zinc-400" for="video-description-input">{{ props.descriptionLabel }}</label>
        <textarea
          id="video-description-input"
          data-video-description-input
          v-model="descriptionText"
          rows="3"
          class="w-full resize-none rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-950/60 dark:text-zinc-50"
          @input="emit('description-change', descriptionText)"
        ></textarea>
      </div>

      <div data-video-field-thumbnail>
        <span data-video-thumbnail-label class="mb-1.5 block text-xs font-semibold text-zinc-500 dark:text-zinc-400">{{ props.thumbnailLabel }}</span>
        <div data-video-thumbnails class="flex items-center gap-3">
          <button
            data-video-thumbnail-add
            type="button"
            aria-label="Upload thumbnail"
            class="flex h-16 w-24 items-center justify-center rounded-lg border border-dashed border-zinc-300 text-lg text-zinc-400 transition-colors hover:border-zinc-400 hover:text-zinc-600 dark:border-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300"
          >
            ＋
          </button>
          <button
            v-for="thumb in props.thumbnails"
            :key="thumb.id"
            :data-video-thumbnail="thumb.id"
            type="button"
            class="h-16 w-24 overflow-hidden rounded-lg transition-all"
            :class="thumbCls(thumb)"
            :aria-label="`Thumbnail ${thumb.id}`"
            @click="selectedId = thumb.id; emit('thumbnail-select', thumb)"
          ></button>
        </div>
      </div>

      <div data-video-storage class="flex items-center">
        <span data-video-storage-badge class="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
          💾 {{ props.storageUsed }} / {{ props.storageTotal }}
        </span>
      </div>
    </div>
  </div>
</template>
