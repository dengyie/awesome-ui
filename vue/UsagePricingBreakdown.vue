<script setup lang="ts">
import { computed } from "vue";

export interface UsageTier {
  range: string;
  unit?: string;
  usage: number;
  unitPrice: number;
}

export interface UsagePricingBreakdownProps {
  title?: string;
  currency?: string;
  tiers?: UsageTier[];
  footerNote?: string;
  class?: string;
}

const props = withDefaults(defineProps<UsagePricingBreakdownProps>(), {
  title: "Usage this cycle",
  currency: "USD",
  tiers: () => [
    { range: "First 10,000", unit: "requests", usage: 9420, unitPrice: 0.002 },
    { range: "10,001 – 50,000", unit: "requests", usage: 18340, unitPrice: 0.0012 },
    { range: "50,001 – 200,000", unit: "requests", usage: 0, unitPrice: 0.0008 },
  ],
  footerNote: "Estimated charges based on metered usage to date.",
  class: "",
});

const rows = computed(() => {
  const tiers = Array.isArray(props.tiers) ? props.tiers : [];
  let total = 0;
  const out = tiers.map((tier, index) => {
    const usage = Math.max(0, Number.parseFloat(String(tier.usage ?? 0)) || 0);
    const unitPrice = Math.max(0, Number.parseFloat(String(tier.unitPrice ?? 0)) || 0);
    const subtotal = usage * unitPrice;
    total += subtotal;
    return { tier, index, usage, unitPrice, subtotal, current: usage > 0 };
  });
  return { rows: out, total: total.toFixed(2) };
});
</script>

<template>
  <div data-pricing-breakdown class="w-full rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900" :class="props.class">
    <div data-pricing-header class="flex items-center justify-between border-b border-zinc-100 px-5 py-4 dark:border-zinc-800">
      <p data-pricing-title class="text-base font-semibold text-zinc-900 dark:text-zinc-50">{{ props.title }}</p>
      <span data-pricing-currency class="rounded-full bg-zinc-100 px-2.5 py-0.5 text-[11px] font-semibold text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">{{ props.currency }}</span>
    </div>
    <table data-pricing-table-body class="w-full text-left text-xs">
      <thead>
        <tr class="border-b border-zinc-100 text-[11px] font-semibold uppercase tracking-wide text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
          <th class="px-5 py-2.5 font-semibold">Tier</th>
          <th class="px-2 py-2.5 text-right font-semibold">Usage</th>
          <th class="px-2 py-2.5 text-right font-semibold">Unit price</th>
          <th class="px-5 py-2.5 text-right font-semibold">Subtotal</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="row in rows.rows"
          :key="row.index"
          :data-pricing-tier="row.index"
          class="border-b border-zinc-50 transition-colors last:border-b-0 dark:border-zinc-800/60"
          :class="row.current ? 'bg-violet-50/60 dark:bg-violet-950/30' : ''"
        >
          <td :data-pricing-range="row.tier.range" class="whitespace-nowrap px-5 py-3 font-medium text-zinc-800 dark:text-zinc-100">
            {{ row.tier.range }} <span class="ml-1 text-[11px] font-normal text-zinc-400">{{ row.tier.unit || "" }}</span>
          </td>
          <td :data-pricing-usage="row.usage" class="px-2 py-3 text-right font-mono text-zinc-700 dark:text-zinc-200">{{ row.usage.toLocaleString() }}</td>
          <td :data-pricing-unit-price="row.unitPrice" class="px-2 py-3 text-right font-mono text-zinc-500 dark:text-zinc-400">{{ props.currency }} {{ row.unitPrice.toFixed(4) }}</td>
          <td :data-pricing-subtotal="row.subtotal.toFixed(2)" class="px-5 py-3 text-right font-mono font-semibold" :class="row.current ? 'text-violet-700 dark:text-violet-300' : 'text-zinc-400 dark:text-zinc-500'">
            {{ props.currency }} {{ row.subtotal.toFixed(2) }}
          </td>
        </tr>
      </tbody>
    </table>
    <div data-pricing-footer class="flex items-center justify-between border-t border-zinc-100 px-5 py-4 dark:border-zinc-800">
      <div>
        <p data-pricing-total-label class="text-sm font-medium text-zinc-600 dark:text-zinc-300">Estimated total</p>
        <p v-if="props.footerNote" data-pricing-note class="mt-2 text-[11px] leading-4 text-zinc-400 dark:text-zinc-500">{{ props.footerNote }}</p>
      </div>
      <span data-pricing-total-value class="font-mono text-lg font-bold text-zinc-900 dark:text-zinc-50">{{ props.currency }} {{ rows.total }}</span>
    </div>
  </div>
</template>
