<template>
  <ol v-if="steps.length > 0" class="relative space-y-4" :class="className">
    <li v-for="(step, i) in steps" :key="step.id" class="relative flex gap-3">
      <span
        v-if="i < steps.length - 1"
        aria-hidden="true"
        class="absolute left-[13px] top-7 bottom-[-16px] w-px"
        :class="step.status === 'done' ? 'bg-emerald-300 dark:bg-emerald-800' : 'bg-zinc-200 dark:bg-zinc-700'"
      />
      <span
        class="relative z-10 flex items-center justify-center w-7 h-7 rounded-full shrink-0"
        :class="statusMeta(step.status).cls"
      >
        <UiIcon :name="statusMeta(step.status).icon" :size="15" :class="statusMeta(step.status).pulse ? 'animate-spin' : ''" />
      </span>
      <div class="flex-1 min-w-0 pb-1">
        <div class="flex items-center gap-2">
          <span
            class="text-sm font-medium"
            :class="step.status === 'pending' ? 'text-zinc-400 dark:text-zinc-500' : 'text-zinc-800 dark:text-zinc-200'"
          >
            {{ step.title }}
          </span>
          <span v-if="step.duration" class="text-[10px] font-mono text-zinc-400">{{ step.duration }}</span>
        </div>
        <div v-if="step.description" class="mt-0.5 text-xs text-zinc-400 dark:text-zinc-500">{{ step.description }}</div>
      </div>
    </li>
  </ol>
</template>

<script setup lang="ts">
import UiIcon from "./UiIcon.vue";

export interface AgentStep {
  id: string | number;
  title: string;
  description?: string;
  status: "pending" | "running" | "done" | "error";
  duration?: string;
}

withDefaults(
  defineProps<{
    steps?: AgentStep[];
    className?: string;
  }>(),
  { steps: () => [], className: "" }
);

const STATUS_META: Record<string, { icon: string; cls: string; pulse?: boolean }> = {
  pending: { icon: "clock", cls: "text-zinc-300 dark:text-zinc-600 bg-zinc-100 dark:bg-zinc-800" },
  running: { icon: "loader", cls: "text-indigo-500 bg-indigo-100 dark:bg-indigo-950/60", pulse: true },
  done: { icon: "check-circle", cls: "text-emerald-500 bg-emerald-100 dark:bg-emerald-950/60" },
  error: { icon: "circle-x", cls: "text-rose-500 bg-rose-100 dark:bg-rose-950/60" },
};

function statusMeta(status: string) {
  return STATUS_META[status] || STATUS_META.pending;
}
</script>
