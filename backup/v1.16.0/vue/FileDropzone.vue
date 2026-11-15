<template>
  <div :class="className">
    <div
      role="button"
      :tabindex="disabled ? -1 : 0"
      :aria-label="hint || 'Drop files here or browse'"
      :aria-disabled="disabled || undefined"
      :class="[
        'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-7 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500',
        dragging
          ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30'
          : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600',
        disabled ? 'cursor-not-allowed opacity-60' : '',
      ]"
      @click="openPicker"
      @keydown.enter.prevent="openPicker"
      @keydown.space.prevent="openPicker"
      @dragover.prevent="!disabled && (dragging = true)"
      @dragleave="dragging = false"
      @drop.prevent="onDrop"
    >
      <span class="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400">
        <UiIcon name="upload" :size="16" />
      </span>
      <p class="text-xs font-medium text-zinc-700 dark:text-zinc-200">
        Drag & drop {{ multiple ? 'files' : 'a file' }} here, or
        <span class="text-indigo-600 dark:text-indigo-400">browse</span>
      </p>
      <p class="text-[11px] text-zinc-400">{{ hintText }}</p>
      <input
        ref="inputRef"
        type="file"
        hidden
        :accept="accept"
        :multiple="multiple"
        :disabled="disabled"
        @change="onChange"
      />
    </div>

    <p v-if="error" role="alert" class="mt-2 flex items-center gap-1.5 text-[11px] text-red-600 dark:text-red-400">
      <UiIcon name="alert-triangle" :size="12" />
      {{ error }}
    </p>

    <ul v-if="files.length" class="mt-3 space-y-1.5">
      <li
        v-for="(file, index) in files"
        :key="file.id ?? `${file.name}-${index}`"
        class="flex items-center gap-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-2.5 py-1.5"
      >
        <span class="shrink-0 text-zinc-400">
          <UiIcon :name="fileIcon(file)" :size="14" />
        </span>
        <span class="min-w-0 flex-1">
          <span class="block truncate text-[11px] font-medium text-zinc-800 dark:text-zinc-200">{{ file.name }}</span>
          <span class="block text-[10px] tabular-nums text-zinc-400">{{ formatBytes(file.size) }}</span>
        </span>
        <button
          type="button"
          :aria-label="`Remove ${file.name}`"
          class="shrink-0 rounded-md p-1 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
          @click.stop="emit('remove', file, index)"
        >
          <UiIcon name="x" :size="12" />
        </button>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import UiIcon from './UiIcon.vue';

export interface DropzoneFile {
  id?: string | number;
  name: string;
  size: number;
  type?: string;
}

export interface RejectedFile {
  name: string;
  reason: 'type' | 'size';
}

const props = withDefaults(
  defineProps<{
    files?: DropzoneFile[];
    accept?: string;
    multiple?: boolean;
    maxSizeMb?: number;
    hint?: string;
    disabled?: boolean;
    className?: string;
  }>(),
  { files: () => [], multiple: true, disabled: false, className: '' }
);

const emit = defineEmits<{
  (e: 'files', files: File[]): void;
  (e: 'reject', rejected: RejectedFile[]): void;
  (e: 'remove', file: DropzoneFile, index: number): void;
}>();

const inputRef = ref<HTMLInputElement | null>(null);
const dragging = ref(false);
const error = ref<string | null>(null);

const hintText = computed(() => {
  const parts = [props.accept ? `Accepts ${props.accept}` : null, props.maxSizeMb ? `up to ${props.maxSizeMb} MB` : null];
  return props.hint || parts.filter(Boolean).join(' · ') || 'Any file type';
});

const formatBytes = (bytes: number) => {
  if (!bytes) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const exp = Math.min(units.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)));
  const value = bytes / 1024 ** exp;
  return `${value >= 10 || exp === 0 ? Math.round(value) : value.toFixed(1)} ${units[exp]}`;
};

const matchesAccept = (file: { name: string; type?: string }) => {
  if (!props.accept) return true;
  return props.accept
    .split(',')
    .map((token) => token.trim().toLowerCase())
    .filter(Boolean)
    .some((token) => {
      if (token.startsWith('.')) return file.name.toLowerCase().endsWith(token);
      if (token.endsWith('/*')) return Boolean(file.type && file.type.toLowerCase().startsWith(token.slice(0, -1)));
      return file.type?.toLowerCase() === token;
    });
};

const fileIcon = (file: DropzoneFile) => {
  if (file.type?.startsWith('image/')) return 'image';
  if (/\.(ts|tsx|js|jsx|py|go|rs|json|css|html)$/i.test(file.name)) return 'code';
  return 'paperclip';
};

function handleFiles(incoming: FileList | File[] | null) {
  const list = Array.from(incoming || []);
  if (!list.length) return;

  const rejected: RejectedFile[] = [];
  const accepted = list.filter((file) => {
    if (!matchesAccept(file)) {
      rejected.push({ name: file.name, reason: 'type' });
      return false;
    }
    if (props.maxSizeMb && file.size > props.maxSizeMb * 1024 * 1024) {
      rejected.push({ name: file.name, reason: 'size' });
      return false;
    }
    return true;
  });

  if (rejected.length) {
    const first = rejected[0];
    error.value =
      first.reason === 'size' ? `${first.name} is larger than ${props.maxSizeMb} MB` : `${first.name} is not an accepted file type`;
    emit('reject', rejected);
  } else {
    error.value = null;
  }

  if (accepted.length) emit('files', props.multiple ? accepted : accepted.slice(0, 1));
}

const openPicker = () => {
  if (!props.disabled) inputRef.value?.click();
};

function onDrop(event: DragEvent) {
  dragging.value = false;
  if (props.disabled) return;
  handleFiles(event.dataTransfer?.files ?? null);
}

function onChange(event: Event) {
  const input = event.target as HTMLInputElement;
  handleFiles(input.files);
  input.value = '';
}
</script>
