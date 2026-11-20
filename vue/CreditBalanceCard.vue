<script setup lang="ts">
import { ref, computed } from "vue";

interface Props {
  balance?: number;
  unit?: string;
  plan?: string;
  currency?: string;
  warnBelow?: number;
  buyLabel?: string;
  couponLabel?: string;
}
const props = withDefaults(defineProps<Props>(), {
  balance: 0,
  unit: "credits",
  plan: "Current plan",
  currency: "",
  warnBelow: undefined,
  buyLabel: "Buy More Credits",
  couponLabel: "Apply Coupon",
});

const emit = defineEmits<{
  (e: "buy"): void;
  (e: "coupon"): void;
}>();

const pulse = ref(false);
const flagPulse = () => {
  pulse.value = true;
  window.setTimeout(() => {
    pulse.value = false;
  }, 600);
};

const low = computed(() => typeof props.warnBelow === "number" && props.balance < props.warnBelow);
const formatted = computed(() => props.balance.toFixed(2));

const onBuy = () => {
  flagPulse();
  emit("buy");
};
const onCoupon = () => {
  flagPulse();
  emit("coupon");
};
</script>

<template>
  <div
    data-credit-balance-card
    class="rounded-xl border bg-white p-4 dark:bg-zinc-900"
    :class="low ? 'border-amber-300 dark:border-amber-500/60' : 'border-zinc-200 dark:border-zinc-800'"
  >
    <div class="flex flex-wrap items-center justify-between gap-2">
      <p data-credit-balance-title class="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Credit Balance</p>
      <span
        data-credit-balance-plan
        class="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-medium"
        :class="
          low
            ? 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400'
            : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300'
        "
      >
        <span class="h-1.5 w-1.5 rounded-full" :class="low ? 'bg-amber-500' : 'bg-emerald-500'" aria-hidden="true" />
        {{ props.plan }}
      </span>
    </div>

    <p class="mt-2 flex items-baseline gap-2">
      <span
        data-credit-balance-value
        class="font-mono text-3xl font-semibold tracking-tight"
        :class="low ? 'text-amber-600 dark:text-amber-400' : 'text-zinc-900 dark:text-zinc-50'"
      >
        {{ props.currency }}{{ formatted }}
      </span>
      <span data-credit-balance-unit class="text-xs text-zinc-500 dark:text-zinc-400">{{ props.unit }}</span>
    </p>

    <p
      v-if="low"
      data-credit-balance-warning
      class="mt-1 text-[11px] font-medium text-amber-600 dark:text-amber-400"
    >
      Balance is running low — top up to avoid interruptions.
    </p>

    <div class="mt-3 flex flex-wrap items-center gap-2">
      <button
        type="button"
        data-credit-balance-buy
        class="rounded-md bg-emerald-600 px-3 py-1.5 text-[11px] font-semibold text-white transition-all hover:bg-emerald-500"
        :class="pulse ? 'ring-2 ring-emerald-300 ring-offset-1' : ''"
        @click="onBuy"
      >
        {{ props.buyLabel }}
      </button>
      <button
        type="button"
        data-credit-balance-coupon
        class="rounded-md border border-zinc-200 px-3 py-1.5 text-[11px] font-semibold text-zinc-600 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
        @click="onCoupon"
      >
        {{ props.couponLabel }}
      </button>
    </div>
  </div>
</template>
