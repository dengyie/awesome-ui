<template>
  <div class="relative inline-block text-xs font-sans select-none" :class="className">
    <button
      type="button"
      @click="showPopover = !showPopover"
      @blur="onBlur"
      class="flex items-center gap-2 px-2.5 py-1 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 hover:bg-zinc-50 dark:hover:bg-zinc-800/80 transition-colors shadow-sm"
      aria-label="Context Window Usage"
      :aria-expanded="showPopover"
    >
      <UiIcon name="cpu" :size="14" class="text-zinc-500 dark:text-zinc-400 shrink-0" />
      <span
        v-if="modelName && !compact"
        class="font-mono text-zinc-700 dark:text-zinc-300 font-medium truncate max-w-[120px]"
      >
        {{ modelName }}
      </span>
      <div class="w-16 h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden shrink-0">
        <div
          class="h-full transition-all duration-300"
          :class="barColor"
          :style="{ width: `${percentage}%` }"
        ></div>
      </div>
      <span class="font-mono text-[11px] font-semibold text-zinc-700 dark:text-zinc-300">
        {{ percentage }}%
      </span>
    </button>

    <div
      v-if="showPopover"
      class="absolute right-0 bottom-full mb-2 w-64 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xl z-30 animate-in fade-in zoom-in-95 duration-150"
    >
      <div class="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
        <span class="font-semibold text-zinc-800 dark:text-zinc-200">Context Window</span>
        <span class="font-mono text-[11px] text-zinc-500">
          {{ formatNumber(safeUsed) }} / {{ formatNumber(safeMax) }}
        </span>
      </div>

      <div v-if="modelName" class="pt-2 text-[11px] text-zinc-500 flex justify-between">
        <span>Model</span>
        <span class="font-mono text-zinc-700 dark:text-zinc-300 font-medium">{{ modelName }}</span>
      </div>

      <div v-if="breakdown && breakdown.length > 0" class="pt-2.5 space-y-1.5">
        <div class="text-[10px] uppercase font-semibold text-zinc-400 tracking-wider">Breakdown</div>
        <div
          v-for="(item, idx) in breakdown"
          :key="idx"
          class="flex items-center justify-between text-[11px]"
        >
          <span class="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400">
            <span class="w-2 h-2 rounded-full" :class="item.colorClass || 'bg-zinc-400'"></span>
            {{ item.label }}
          </span>
          <span class="font-mono text-zinc-700 dark:text-zinc-300">
            {{ formatNumber(item.count) }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import UiIcon from "./UiIcon.vue";

export interface ContextUsageTokenBreakdown {
  label: string;
  count: number;
  colorClass?: string;
}

const props = withDefaults(
  defineProps<{
    usedTokens: number;
    maxTokens: number;
    modelName?: string;
    breakdown?: ContextUsageTokenBreakdown[];
    compact?: boolean;
    className?: string;
  }>(),
  {
    compact: false,
    className: "",
    breakdown: () => [],
  }
);

const showPopover = ref(false);

const safeMax = computed(() => Math.max(1, props.maxTokens));
const safeUsed = computed(() => Math.max(0, props.usedTokens));
const percentage = computed(() =>
  Math.min(100, Math.round((safeUsed.value / safeMax.value) * 100))
);

const barColor = computed(() => {
  if (percentage.value >= 90) return "bg-rose-500";
  if (percentage.value >= 70) return "bg-amber-500";
  return "bg-emerald-500";
});

function formatNumber(num: number): string {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}k`;
  return String(num);
}

function onBlur() {
  setTimeout(() => {
    showPopover.value = false;
  }, 200);
}
</script>
