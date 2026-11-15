<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
    role="dialog"
    aria-modal="true"
    :aria-label="title"
    @click="!loading && emit('cancel')"
  >
    <div
      :class="className"
      class="w-full max-w-sm rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-5 shadow-2xl"
      @click.stop
    >
      <div class="flex items-start gap-3">
        <span :class="['flex h-9 w-9 shrink-0 items-center justify-center rounded-full', tone.chip]">
          <UiIcon :name="tone.icon" :size="18" />
        </span>
        <div class="min-w-0 pt-0.5">
          <h2 class="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{{ title }}</h2>
          <p v-if="description" class="mt-1 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
            {{ description }}
          </p>
        </div>
      </div>

      <div v-if="requireText" class="mt-4">
        <label class="mb-1.5 block text-[11px] text-zinc-500 dark:text-zinc-400">
          Type <span class="font-mono font-semibold text-zinc-700 dark:text-zinc-200">{{ requireText }}</span> to confirm
        </label>
        <input
          ref="inputRef"
          v-model="typed"
          type="text"
          :placeholder="requireText"
          class="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-2.5 py-1.5 font-mono text-xs text-zinc-800 dark:text-zinc-200 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div class="mt-5 flex justify-end gap-2">
        <button
          type="button"
          :disabled="loading"
          class="rounded-lg border border-zinc-200 dark:border-zinc-700 px-3 py-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-300 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:opacity-50"
          @click="emit('cancel')"
        >
          {{ cancelText }}
        </button>
        <button
          type="button"
          :disabled="!canConfirm"
          :class="tone.button"
          class="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-zinc-900 disabled:cursor-not-allowed disabled:opacity-50"
          @click="canConfirm && emit('confirm')"
        >
          <UiIcon v-if="loading" name="loader" :size="12" class="animate-spin" />
          {{ confirmText }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, nextTick, onMounted, onUnmounted } from "vue";
import UiIcon from "./UiIcon.vue";

type Tone = "danger" | "warning" | "default";

const TONE_META: Record<Tone, { chip: string; button: string; icon: string }> = {
  danger: {
    chip: "bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400",
    button: "bg-red-600 hover:bg-red-500 focus-visible:ring-red-500",
    icon: "alert-triangle",
  },
  warning: {
    chip: "bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400",
    button: "bg-amber-500 hover:bg-amber-400 focus-visible:ring-amber-500",
    icon: "alert-triangle",
  },
  default: {
    chip: "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400",
    button: "bg-indigo-600 hover:bg-indigo-500 focus-visible:ring-indigo-500",
    icon: "info",
  },
};

const props = withDefaults(
  defineProps<{
    isOpen: boolean;
    title: string;
    description?: string;
    confirmText?: string;
    cancelText?: string;
    tone?: Tone;
    requireText?: string;
    loading?: boolean;
    className?: string;
  }>(),
  {
    confirmText: "Confirm",
    cancelText: "Cancel",
    tone: "default",
    loading: false,
    className: "",
  }
);

const emit = defineEmits<{
  (e: "confirm"): void;
  (e: "cancel"): void;
}>();

const typed = ref("");
const inputRef = ref<HTMLInputElement | null>(null);

const tone = computed(() => TONE_META[props.tone] ?? TONE_META.default);
const blocked = computed(() => Boolean(props.requireText) && typed.value !== props.requireText);
const canConfirm = computed(() => !blocked.value && !props.loading);

watch(
  () => props.isOpen,
  async (open) => {
    typed.value = "";
    if (open && props.requireText) {
      await nextTick();
      inputRef.value?.focus();
    }
  }
);

function onKey(e: KeyboardEvent) {
  if (!props.isOpen) return;
  if (e.key === "Escape") {
    e.preventDefault();
    emit("cancel");
  }
}

onMounted(() => document.addEventListener("keydown", onKey));
onUnmounted(() => document.removeEventListener("keydown", onKey));
</script>
