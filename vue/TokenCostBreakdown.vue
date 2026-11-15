<script setup lang="ts">
export interface TokenCostSegment {
  id: string;
  label: string;
  amountUsd: number;
  color?: string;
}

export interface TokenUsageRow {
  id: string;
  label: string;
  tokens: number;
  percent: number;
  barColor?: string;
}

interface Props {
  segments?: TokenCostSegment[];
  usageRows?: TokenUsageRow[];
  title?: string;
  spendUsed?: number;
  spendTotal?: number;
}

const props = withDefaults(defineProps<Props>(), {
  segments: () => [],
  usageRows: () => [],
  title: 'Spend breakdown',
  spendUsed: undefined,
  spendTotal: undefined,
});

const emit = defineEmits<{
  (e: 'segment-select', segment: TokenCostSegment): void;
}>();

const defaultColors = ['bg-zinc-500', 'bg-emerald-500', 'bg-amber-500', 'bg-sky-500', 'bg-violet-500', 'bg-rose-500'];

const segColor = (segment: TokenCostSegment, index: number) => segment.color ?? defaultColors[index % defaultColors.length];

const fmtUsd = (usd: number) =>
  usd >= 100 ? `$${usd.toFixed(0)}` : usd >= 1 ? `$${usd.toFixed(2)}` : `$${usd.toFixed(3)}`;

const fmtTokens = (tokens: number) => tokens.toLocaleString('en-US');

const totalUsd = props.segments.reduce((sum, s) => sum + s.amountUsd, 0);
const used = typeof props.spendUsed === 'number' ? props.spendUsed : totalUsd;
const percent =
  typeof props.spendTotal === 'number' && props.spendTotal > 0 ? Math.min((used / props.spendTotal) * 100, 100) : 100;
</script>

<template>
  <div
    data-token-cost
    class="w-full rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
  >
    <div class="flex items-center justify-between">
      <span class="text-xs font-semibold text-zinc-700 dark:text-zinc-200">{{ props.title }}</span>
      <span class="text-[11px] tabular-nums text-zinc-400 dark:text-zinc-500">
        {{ typeof props.spendTotal === 'number' ? `${fmtUsd(used)} of ${fmtUsd(props.spendTotal)}` : fmtUsd(totalUsd) }}
      </span>
    </div>

    <div data-token-cost-bar class="mt-3 flex h-2.5 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
      <span
        v-for="(segment, index) in props.segments"
        :key="segment.id"
        :data-token-cost-segment="segment.id"
        class="h-full cursor-pointer"
        :class="segColor(segment, index)"
        :style="{ width: `${totalUsd > 0 ? (segment.amountUsd / totalUsd) * percent : 0}%` }"
        @click="emit('segment-select', segment)"
      ></span>
    </div>

    <div data-token-cost-legend class="mt-3 space-y-1.5">
      <div v-for="(segment, index) in props.segments" :key="segment.id" class="flex items-center gap-2 text-xs">
        <span class="h-2 w-2 shrink-0 rounded-sm" :class="segColor(segment, index)"></span>
        <span class="min-w-0 flex-1 truncate text-zinc-700 dark:text-zinc-200">{{ segment.label }}</span>
        <span class="font-medium tabular-nums text-zinc-800 dark:text-zinc-100">{{ fmtUsd(segment.amountUsd) }}</span>
        <span class="w-12 text-right tabular-nums text-zinc-400 dark:text-zinc-500">
          {{ totalUsd > 0 ? `${Math.round((segment.amountUsd / totalUsd) * 100)}%` : '—' }}
        </span>
      </div>
    </div>

    <div
      v-if="props.usageRows.length > 0"
      data-token-usage
      class="mt-4 space-y-2.5 border-t border-zinc-100 pt-3 dark:border-zinc-800"
    >
      <p class="text-[10px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">Token usage</p>
      <div v-for="row in props.usageRows" :key="row.id" :data-token-usage-row="row.id">
        <div class="flex items-center justify-between text-xs">
          <span class="text-zinc-700 dark:text-zinc-200">{{ row.label }}</span>
          <span class="tabular-nums text-zinc-500 dark:text-zinc-400">{{ fmtTokens(row.tokens) }} ({{ row.percent }}%)</span>
        </div>
        <div class="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
          <div
            data-token-usage-bar
            class="h-full rounded-full"
            :class="row.barColor ?? 'bg-sky-500'"
            :style="{ width: `${Math.min(Math.max(row.percent, 0), 100)}%` }"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>
