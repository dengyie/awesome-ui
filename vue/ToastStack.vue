<template>
  <div
    v-if="toasts.length > 0"
    class="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-80 max-w-[calc(100vw-2rem)]"
    :class="className"
    aria-live="polite"
  >
    <div
      v-for="toast in toasts"
      :key="toast.id"
      class="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-lg text-sm text-zinc-800 dark:text-zinc-200 animate-in slide-in-from-right fade-in duration-200"
      role="alert"
    >
      <UiIcon :name="typeMeta(toast.type).icon" :size="16" class="shrink-0" :class="typeMeta(toast.type).color" />
      <span class="flex-1 min-w-0">{{ toast.message }}</span>
      <button
        type="button"
        class="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors shrink-0"
        aria-label="Dismiss"
        @click="emit('dismiss', toast.id)"
      >
        <UiIcon name="x" :size="14" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { watch, onUnmounted } from "vue";
import UiIcon from "./UiIcon.vue";

export interface ToastItem {
  id: string | number;
  message: string;
  type?: "success" | "error" | "warning" | "info";
}

const props = withDefaults(
  defineProps<{
    toasts?: ToastItem[];
    duration?: number;
    className?: string;
  }>(),
  { toasts: () => [], duration: 4000, className: "" }
);

const emit = defineEmits<{
  (e: "dismiss", id: string | number): void;
}>();

const META: Record<string, { icon: string; color: string }> = {
  success: { icon: "check-circle", color: "text-emerald-500" },
  error: { icon: "circle-x", color: "text-rose-500" },
  warning: { icon: "alert-triangle", color: "text-amber-500" },
  info: { icon: "sparkles", color: "text-sky-500" },
};

function typeMeta(type?: string) {
  return META[type || "info"] || META.info;
}

const timers = new Map<string | number, ReturnType<typeof setTimeout>>();

watch(
  () => props.toasts.map((t) => t.id).join(","),
  () => {
    if (props.duration <= 0) {
      for (const timer of timers.values()) clearTimeout(timer);
      timers.clear();
      return;
    }
    const alive = new Set(props.toasts.map((t) => t.id));
    for (const [id, timer] of timers) {
      if (!alive.has(id)) {
        clearTimeout(timer);
        timers.delete(id);
      }
    }
    for (const t of props.toasts) {
      if (!timers.has(t.id)) {
        timers.set(t.id, setTimeout(() => emit("dismiss", t.id), props.duration));
      }
    }
  },
  { immediate: true }
);

onUnmounted(() => {
  for (const timer of timers.values()) clearTimeout(timer);
  timers.clear();
});
</script>
