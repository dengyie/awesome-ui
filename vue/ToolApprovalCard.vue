<template>
  <div
    class="rounded-xl border bg-white dark:bg-zinc-900 overflow-hidden"
    :class="[isHigh ? 'border-amber-300 dark:border-amber-700/60' : 'border-zinc-200 dark:border-zinc-700', className]"
  >
    <div class="flex items-center gap-2.5 px-3.5 py-2.5">
      <span
        class="p-1.5 rounded-lg shrink-0"
        :class="isHigh
          ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400'
          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400'"
      >
        <UiIcon :name="isHigh ? 'lock' : 'tool'" :size="15" />
      </span>
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2 text-sm font-medium text-zinc-800 dark:text-zinc-200">
          <span class="font-mono truncate">{{ toolName }}</span>
          <span
            v-if="isHigh"
            class="px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 shrink-0"
          >
            high risk
          </span>
        </div>
        <div v-if="description" class="text-xs text-zinc-500 dark:text-zinc-400 truncate">{{ description }}</div>
      </div>
    </div>

    <pre
      v-if="argsText"
      class="mx-3.5 mb-2.5 max-h-40 overflow-auto rounded-lg bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-100 dark:border-zinc-800 px-3 py-2 text-xs font-mono text-zinc-600 dark:text-zinc-400 whitespace-pre-wrap break-words"
    >{{ argsText }}</pre>

    <div class="flex items-center gap-2 px-3.5 pb-3">
      <template v-if="status === 'pending'">
        <button
          type="button"
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition-colors"
          @click="emit('approve')"
        >
          <UiIcon name="check" :size="13" />
          Approve
        </button>
        <button
          type="button"
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-medium transition-colors"
          @click="emit('reject')"
        >
          <UiIcon name="x" :size="13" />
          Reject
        </button>
      </template>
      <span
        v-else
        class="flex items-center gap-1.5 text-xs font-medium"
        :class="status === 'approved' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'"
      >
        <UiIcon :name="status === 'approved' ? 'check-circle' : 'circle-x'" :size="14" />
        {{ status === 'approved' ? 'Approved' : 'Rejected' }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import UiIcon from "./UiIcon.vue";

const props = withDefaults(
  defineProps<{
    toolName: string;
    description?: string;
    args?: Record<string, unknown> | string;
    risk?: "low" | "high";
    status?: "pending" | "approved" | "rejected";
    className?: string;
  }>(),
  { risk: "low", status: "pending", className: "" }
);

const emit = defineEmits<{
  (e: "approve"): void;
  (e: "reject"): void;
}>();

const isHigh = computed(() => props.risk === "high");
const argsText = computed(() =>
  typeof props.args === "string" ? props.args : props.args ? JSON.stringify(props.args, null, 2) : ""
);
</script>
