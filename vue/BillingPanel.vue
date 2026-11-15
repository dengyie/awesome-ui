<template>
  <div :class="`w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900 ${className}`">
    <div class="flex items-start justify-between gap-3">
      <div class="min-w-0">
        <p class="text-[11px] text-zinc-400">Upgrade to</p>
        <h3 class="text-base font-bold text-zinc-900 dark:text-zinc-50">{{ planName }}</h3>
      </div>
      <div v-if="onPeriodChange" role="group" aria-label="Billing period"
        class="flex shrink-0 rounded-lg border border-zinc-200 p-0.5 dark:border-zinc-700">
        <button v-for="p in periods" :key="p.id" type="button" :aria-pressed="period === p.id"
          @click="emit('period-change', p.id)"
          :class="`rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors ${
            period === p.id
              ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
              : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
          }`">
          {{ p.label }}
        </button>
      </div>
    </div>

    <p class="mt-3 flex items-baseline gap-1.5">
      <span class="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">{{ price }}</span>
      <span v-if="priceSuffix" class="text-xs text-zinc-400">{{ priceSuffix }}</span>
    </p>

    <ul v-if="features.length" class="mt-3 space-y-1.5">
      <li v-for="feature in features" :key="feature" class="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-300">
        <UiIcon name="check" :size="13" class="shrink-0 text-emerald-500" />
        {{ feature }}
      </li>
    </ul>

    <dl v-if="lineItems.length" class="mt-4 space-y-2 border-t border-zinc-100 pt-3 dark:border-zinc-800">
      <div v-for="item in lineItems" :key="item.label"
        :class="`flex items-center justify-between gap-4 ${
          item.emphasized
            ? 'border-t border-zinc-100 pt-2 font-semibold text-zinc-900 dark:border-zinc-800 dark:text-zinc-50'
            : 'text-zinc-500 dark:text-zinc-400'
        }`">
        <dt class="text-xs">{{ item.label }}</dt>
        <dd class="text-xs font-medium tabular-nums text-zinc-800 dark:text-zinc-200">{{ item.amount }}</dd>
      </div>
    </dl>

    <button type="button" @click="emit('cta')"
      class="mt-4 w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-zinc-900">
      {{ ctaLabel }}
    </button>

    <p v-if="note"
      class="mt-2.5 flex items-start gap-1.5 rounded-lg bg-sky-50 px-3 py-2 text-[11px] leading-relaxed text-sky-700 dark:bg-sky-950/60 dark:text-sky-300">
      <UiIcon name="info" :size="12" class="mt-0.5 shrink-0" />
      {{ note }}
    </p>
  </div>
</template>

<script setup lang="ts">
import UiIcon from './UiIcon.vue';

export interface BillingLineItem {
  label: string;
  amount: string;
  emphasized?: boolean;
}

const props = withDefaults(
  defineProps<{
    planName: string;
    period?: 'monthly' | 'annual';
    onPeriodChange?: unknown;
    price: string;
    priceSuffix?: string;
    features?: string[];
    lineItems?: BillingLineItem[];
    ctaLabel: string;
    note?: string;
    className?: string;
  }>(),
  { period: 'monthly', features: () => [], lineItems: () => [] }
);

const emit = defineEmits<{
  (e: 'period-change', period: 'monthly' | 'annual'): void;
  (e: 'cta'): void;
}>();

const periods: { id: 'monthly' | 'annual'; label: string }[] = [
  { id: 'monthly', label: 'Monthly' },
  { id: 'annual', label: 'Annual' },
];
void props;
</script>
