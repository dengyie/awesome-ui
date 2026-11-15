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
      class="relative overflow-hidden flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-lg text-sm text-zinc-800 dark:text-zinc-200 animate-in slide-in-from-right fade-in duration-200"
      role="alert"
      @mouseenter="pause(toast.id)"
      @mouseleave="resume(toast.id)"
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
      <span
        v-if="duration > 0"
        aria-hidden="true"
        class="absolute bottom-0 left-0 h-0.5 transition-[width] duration-100 ease-linear"
        :class="[typeMeta(toast.type).bar, remaining.get(toast.id) !== undefined ? '' : '']"
        :style="{ width: `${remaining.get(toast.id) ?? 100}%` }"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, watch, onUnmounted } from "vue";
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

const META: Record<string, { icon: string; color: string; bar: string }> = {
  success: { icon: "check-circle", color: "text-emerald-500", bar: "bg-emerald-500" },
  error: { icon: "circle-x", color: "text-rose-500", bar: "bg-rose-500" },
  warning: { icon: "alert-triangle", color: "text-amber-500", bar: "bg-amber-500" },
  info: { icon: "sparkles", color: "text-sky-500", bar: "bg-sky-500" },
};

function typeMeta(type?: string) {
  return META[type || "info"] || META.info;
}

interface ToastClock {
  started: number;
  /** Percent (0-100) remaining when the clock (re)started. */
  startPct: number;
  /** ms budget corresponding to startPct. */
  total: number;
  timer?: ReturnType<typeof setTimeout>;
  ticker?: ReturnType<typeof setInterval>;
}

const clocks = new Map<string | number, ToastClock>();
const remaining = reactive(new Map<string | number, number>());

function stopClock(id: string | number) {
  const clock = clocks.get(id);
  if (clock) {
    if (clock.timer) clearTimeout(clock.timer);
    if (clock.ticker) clearInterval(clock.ticker);
    clocks.delete(id);
  }
}

function startClock(id: string | number) {
  const clock = clocks.get(id);
  if (!clock || clock.total <= 0 || props.duration <= 0) return;
  const started = Date.now();
  clock.started = started;
  clock.timer = setTimeout(() => {
    remaining.set(id, 0);
    stopClock(id);
    emit("dismiss", id);
  }, clock.total);
  clock.ticker = setInterval(() => {
    const elapsed = Date.now() - started;
    remaining.set(id, Math.max(0, clock.startPct * (1 - elapsed / clock.total)));
  }, 100);
}

function pause(id: string | number) {
  const clock = clocks.get(id);
  if (!clock) return;
  if (clock.timer) clearTimeout(clock.timer);
  if (clock.ticker) clearInterval(clock.ticker);
  const elapsed = Date.now() - clock.started;
  const nextPct = Math.max(0, clock.startPct * (1 - elapsed / clock.total));
  clock.startPct = nextPct;
  clock.total = Math.max(0, clock.total - elapsed);
  remaining.set(id, nextPct);
}

function resume(id: string | number) {
  startClock(id);
}

watch(
  () => props.toasts.map((t) => t.id).join(","),
  () => {
    if (props.duration <= 0) {
      for (const id of [...clocks.keys()]) stopClock(id);
      return;
    }
    const alive = new Set(props.toasts.map((t) => t.id));
    for (const id of [...clocks.keys()]) {
      if (!alive.has(id)) stopClock(id);
    }
    for (const t of props.toasts) {
      if (!clocks.has(t.id)) {
        clocks.set(t.id, { started: Date.now(), startPct: 100, total: props.duration });
        remaining.set(t.id, 100);
        startClock(t.id);
      }
    }
  },
  { immediate: true }
);

onUnmounted(() => {
  for (const id of [...clocks.keys()]) stopClock(id);
});
</script>
