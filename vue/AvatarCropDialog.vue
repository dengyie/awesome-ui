<script setup lang="ts">
import { ref, computed } from "vue";

interface Props {
  title?: string;
  hint?: string;
  initials?: string;
  avatarUrl?: string;
  defaultZoom?: number;
  minZoom?: number;
  maxZoom?: number;
  confirmLabel?: string;
  cancelLabel?: string;
  defaultOpen?: boolean;
}
const props = withDefaults(defineProps<Props>(), {
  title: "Avatar preview",
  hint: "For best results, upload images of at least 1000×1000 pixels.",
  initials: "AS",
  avatarUrl: "",
  defaultZoom: 50,
  minZoom: 0,
  maxZoom: 100,
  confirmLabel: "Save",
  cancelLabel: "Cancel",
  defaultOpen: false,
});

const emit = defineEmits<{
  (e: "confirm", detail: { zoom: number }): void;
  (e: "cancel"): void;
}>();

const open = ref(props.defaultOpen);
const zoom = ref(props.defaultZoom);
const saved = ref<number | null>(null);

const step = (delta: number) => {
  const next = zoom.value + delta;
  zoom.value = Math.min(props.maxZoom, Math.max(props.minZoom, next));
};

const close = () => {
  open.value = false;
  saved.value = null;
  zoom.value = props.defaultZoom;
};

const handleConfirm = () => {
  saved.value = zoom.value;
  emit("confirm", { zoom: zoom.value });
};

const handleCancel = () => {
  emit("cancel");
  close();
};

const overlayClick = (e: MouseEvent) => {
  if (e.target === e.currentTarget) close();
};

const scale = computed(() => (0.8 + (zoom.value / 100) * 0.6).toFixed(2));
</script>

<template>
  <div data-avatar-crop-dialog>
    <button
      type="button"
      data-avatar-crop-open
      class="rounded-md bg-indigo-600 px-3 py-1.5 text-[11px] font-semibold text-white transition-colors hover:bg-indigo-500"
      @click="open = true"
    >
      {{ props.title }}
    </button>

    <div
      v-if="open"
      data-avatar-crop-overlay
      class="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/50 p-4"
      @click="overlayClick"
    >
      <div
        data-avatar-crop-panel
        role="dialog"
        aria-modal="true"
        :aria-label="props.title"
        class="w-full max-w-sm rounded-xl border border-zinc-200 bg-white p-4 shadow-xl dark:border-zinc-800 dark:bg-zinc-900"
      >
        <template v-if="saved !== null">
          <p data-avatar-crop-saved class="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
            Avatar updated
          </p>
          <p class="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            Your new profile picture has been saved.
          </p>
          <div class="mt-3 flex justify-end">
            <button
              type="button"
              data-avatar-crop-done
              class="rounded-md bg-zinc-900 px-3 py-1.5 text-[11px] font-semibold text-white dark:bg-zinc-100 dark:text-zinc-900"
              @click="close"
            >
              Done
            </button>
          </div>
        </template>

        <template v-else>
          <div class="flex items-center justify-between">
            <p data-avatar-crop-title class="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{{ props.title }}</p>
            <button
              type="button"
              data-avatar-crop-close
              aria-label="Close"
              class="rounded p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
              @click="close"
            >
              ✕
            </button>
          </div>

          <p class="mt-1 text-[11px] text-zinc-500 dark:text-zinc-400">{{ props.hint }}</p>

          <div data-avatar-crop-preview class="mt-3 flex justify-center">
            <div class="flex h-40 w-40 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-zinc-100 shadow-inner dark:border-zinc-800 dark:bg-zinc-800">
              <img
                v-if="props.avatarUrl"
                :src="props.avatarUrl"
                alt=""
                :style="{ transform: `scale(${scale})` }"
                class="h-full w-full object-cover"
              />
              <span
                v-else
                :style="{ transform: `scale(${scale})` }"
                class="flex h-full w-full items-center justify-center rounded-full bg-indigo-100 text-2xl font-semibold text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400"
              >
                {{ props.initials }}
              </span>
            </div>
          </div>

          <div data-avatar-crop-zoom-row class="mt-3 flex items-center gap-2">
            <button
              type="button"
              data-avatar-crop-zoom-out
              aria-label="Zoom out"
              class="h-6 w-6 rounded border border-zinc-200 text-xs font-semibold text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
              @click="step(-10)"
            >
              −
            </button>
            <input
              v-model.number="zoom"
              data-avatar-crop-zoom
              type="range"
              :min="props.minZoom"
              :max="props.maxZoom"
              aria-label="Zoom"
              class="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-zinc-200 accent-indigo-600 dark:bg-zinc-700"
            />
            <button
              type="button"
              data-avatar-crop-zoom-in
              aria-label="Zoom in"
              class="h-6 w-6 rounded border border-zinc-200 text-xs font-semibold text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
              @click="step(10)"
            >
              +
            </button>
          </div>

          <div class="mt-3 flex items-center justify-end gap-2">
            <button
              type="button"
              data-avatar-crop-cancel
              class="rounded-md border border-zinc-200 px-3 py-1.5 text-[11px] font-semibold text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
              @click="handleCancel"
            >
              {{ props.cancelLabel }}
            </button>
            <button
              type="button"
              data-avatar-crop-confirm
              class="rounded-md bg-indigo-600 px-3 py-1.5 text-[11px] font-semibold text-white transition-colors hover:bg-indigo-500"
              @click="handleConfirm"
            >
              {{ props.confirmLabel }}
            </button>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>
