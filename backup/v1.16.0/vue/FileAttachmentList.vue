<template>
  <div v-if="files.length > 0" class="flex flex-wrap gap-2" :class="className">
    <div
      v-for="f in files"
      :key="f.id"
      class="flex items-center gap-2 pl-2 pr-1 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 text-xs text-zinc-700 dark:text-zinc-300"
    >
      <UiIcon :name="iconForType(f.type, f.name)" :size="14" class="text-zinc-400 shrink-0" />
      <span class="max-w-40 truncate font-medium">{{ f.name }}</span>
      <span v-if="formatFileSize(f.size)" class="text-[10px] font-mono text-zinc-400 shrink-0">{{ formatFileSize(f.size) }}</span>
      <button
        type="button"
        :aria-label="`Remove ${f.name}`"
        class="p-1 rounded-md text-zinc-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors shrink-0"
        @click="emit('remove', f.id)"
      >
        <UiIcon name="x" :size="12" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import UiIcon from "./UiIcon.vue";

export interface AttachmentItem {
  id: string | number;
  name: string;
  size?: number;
  type?: string;
}

withDefaults(
  defineProps<{
    files?: AttachmentItem[];
    className?: string;
  }>(),
  { files: () => [], className: "" }
);

const emit = defineEmits<{
  (e: "remove", id: string | number): void;
}>();

function formatFileSize(bytes?: number): string {
  if (bytes === undefined || bytes === null || Number.isNaN(bytes)) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function iconForType(type?: string, name?: string): string {
  if (type?.startsWith("image/")) return "image";
  const ext = name?.split(".").pop()?.toLowerCase() || "";
  if (["js", "ts", "tsx", "jsx", "py", "java", "go", "rs", "vue", "html", "css", "json", "sh"].includes(ext)) return "code";
  return "paperclip";
}
</script>
