<script setup lang="ts">
export interface CheckoutLineItem {
  id: string;
  label: string;
  amount: string;
  muted?: boolean;
  strikethrough?: boolean;
}
interface Props {
  title?: string;
  planName?: string;
  billingPeriod?: "monthly" | "annual";
  seats?: number;
  minSeats?: number;
  maxSeats?: number;
  lineItems: CheckoutLineItem[];
  totalLabel?: string;
  total: string;
  totalNote?: string;
  discountLabel?: string;
  discount?: string;
  confirmText?: string;
  processing?: boolean;
  terms?: string;
}
const props = withDefaults(defineProps<Props>(), {
  title: "Upgrade to the Teams plan",
  planName: "Teams",
  billingPeriod: "annual",
  minSeats: 1,
  maxSeats: 99,
  totalLabel: "Total billed today",
  confirmText: "Confirm upgrade",
  processing: false,
});
const emit = defineEmits<{
  (e: "billing-period-change", period: "monthly" | "annual"): void;
  (e: "seats-change", seats: number): void;
  (e: "confirm"): void;
}>();

const clampSeats = (n: number) => Math.min(props.maxSeats, Math.max(props.minSeats, n));
const hasSeats = () => props.seats !== undefined;
</script>

<template>
  <div data-upgrade-checkout class="grid gap-6 rounded-xl border border-zinc-200 bg-white p-6 md:grid-cols-[1.2fr_1fr] dark:border-zinc-800 dark:bg-zinc-900">
    <div>
      <h3 data-checkout-title class="text-xl font-bold text-zinc-900 dark:text-zinc-50">{{ title }}</h3>

      <p class="mt-5 text-sm font-semibold text-zinc-900 dark:text-zinc-100">Billing cadence</p>
      <div class="mt-2 inline-flex rounded-lg border border-zinc-200 p-0.5 dark:border-zinc-700">
        <button
          v-for="period in (['monthly', 'annual'] as const)"
          :key="period"
          type="button"
          :data-checkout-period="period"
          class="rounded-md px-3 py-1.5 text-xs font-medium capitalize transition-colors"
          :class="billingPeriod === period
            ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
            : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200'"
          @click="emit('billing-period-change', period)"
        >
          {{ period === "annual" ? "Annual plan" : "Monthly plan" }}
        </button>
      </div>

      <template v-if="hasSeats()">
        <p class="mt-5 text-sm font-semibold text-zinc-900 dark:text-zinc-100">Seats</p>
        <div data-checkout-seats class="mt-2 flex items-center gap-3">
          <button
            type="button"
            data-checkout-seat-minus
            title="Fewer seats"
            :disabled="(seats as number) <= minSeats"
            class="flex h-8 w-8 items-center justify-center rounded-md border border-zinc-300 text-zinc-600 hover:border-zinc-400 disabled:opacity-40 dark:border-zinc-700 dark:text-zinc-300"
            @click="emit('seats-change', clampSeats((seats as number) - 1))"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" class="h-4 w-4" aria-hidden="true"><path d="M5.5 9.25h9v1.5h-9v-1.5Z" /></svg>
          </button>
          <span data-checkout-seat-count class="min-w-8 text-center text-sm font-semibold text-zinc-900 dark:text-zinc-50">{{ seats }}</span>
          <button
            type="button"
            data-checkout-seat-plus
            title="More seats"
            :disabled="(seats as number) >= maxSeats"
            class="flex h-8 w-8 items-center justify-center rounded-md border border-zinc-300 text-zinc-600 hover:border-zinc-400 disabled:opacity-40 dark:border-zinc-700 dark:text-zinc-300"
            @click="emit('seats-change', clampSeats((seats as number) + 1))"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" class="h-4 w-4" aria-hidden="true"><path d="M9.25 5.5h1.5v3.75h3.75v1.5h-3.75v3.75h-1.5v-3.75H5.5v-1.5h3.75V5.5Z" /></svg>
          </button>
          <span class="text-xs text-zinc-500 dark:text-zinc-400">{{ planName }} plan · {{ billingPeriod === "annual" ? "billed annually" : "billed monthly" }}</span>
        </div>
      </template>
    </div>

    <div data-checkout-summary class="rounded-lg bg-zinc-50 p-4 dark:bg-zinc-800/60">
      <div class="space-y-2.5">
        <div v-for="item in lineItems" :key="item.id" class="flex items-center justify-between text-sm">
          <span class="text-zinc-600 dark:text-zinc-300">{{ item.label }}</span>
          <span
            class="font-medium"
            :class="[item.strikethrough ? 'text-zinc-400 line-through' : 'text-zinc-900 dark:text-zinc-50', item.muted ? 'text-zinc-400 dark:text-zinc-500' : '']"
          >
            {{ item.amount }}
          </span>
        </div>
      </div>
      <div class="mt-3 border-t border-zinc-200 pt-3 dark:border-zinc-700">
        <div class="flex items-center justify-between text-sm font-semibold">
          <span class="text-zinc-900 dark:text-zinc-50">{{ totalLabel }}</span>
          <span data-checkout-total class="text-zinc-900 dark:text-zinc-50">{{ total }}</span>
        </div>
        <div v-if="discount" class="mt-1 flex items-center justify-between text-xs">
          <span class="text-emerald-600 dark:text-emerald-400">{{ discountLabel || "Discount" }}</span>
          <span data-checkout-discount class="font-medium text-emerald-600 dark:text-emerald-400">{{ discount }}</span>
        </div>
        <p v-if="totalNote" class="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{{ totalNote }}</p>
      </div>
      <p v-if="terms" class="mt-3 text-[11px] leading-relaxed text-zinc-500 dark:text-zinc-400">{{ terms }}</p>
      <button
        type="button"
        data-checkout-confirm
        :disabled="processing"
        class="mt-4 w-full rounded-md bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-500 disabled:opacity-60"
        @click="emit('confirm')"
      >
        {{ processing ? "Processing…" : confirmText }}
      </button>
    </div>
  </div>
</template>
