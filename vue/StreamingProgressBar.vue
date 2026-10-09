<template>
  <div class="w-full" :class="className">
    <div v-if="label || !indeterminate" class="flex items-center justify-between mb-1 text-[11px] font-mono text-zinc-400">
      <span class="truncate">{{ label }}</span>
      <span v-if="!indeterminate" class="tabular-nums shrink-0">{{ Math.round(clamped!) }}%</span>
    </div>
    <div
      role="progressbar"
      :aria-valuemin="0"
      :aria-valuemax="100"
      :aria-valuenow="indeterminate ? undefined : Math.round(clamped!)"
      :aria-label="label || 'Progress'"
      class="h-1 w-full rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden"
    >
      <div v-if="indeterminate" class="h-full w-1/3 rounded-full animate-pulse" :class="barColor" />
      <div v-else class="h-full rounded-full transition-all duration-300" :class="barColor" :style="{ width: `${clamped}%` }" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = withDefaults(
  defineProps<{
    value?: number | null;
    label?: string;
    status?: "streaming" | "done" | "error";
    className?: string;
  }>(),
  { value: null, status: "streaming", className: "" }
);

const clamped = computed(() =>
  props.value === null || props.value === undefined ? null : Math.min(100, Math.max(0, props.value))
);
const indeterminate = computed(() => clamped.value === null);

const STATUS_BAR: Record<string, string> = {
  streaming: "bg-indigo-500",
  done: "bg-emerald-500",
  error: "bg-rose-500",
};
const barColor = computed(() => STATUS_BAR[props.status] || STATUS_BAR.streaming);
</script>
