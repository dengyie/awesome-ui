<script setup lang="ts">
import { ref, computed } from "vue";

interface Props {
  title?: string;
  billToOptions?: string[];
  defaultBillTo?: string;
  currencies?: string[];
  defaultCurrency?: string;
  balance?: number;
  currencySymbol?: string;
  quickAmounts?: number[];
  minAmount?: number;
  confirmLabel?: string;
  cancelLabel?: string;
  defaultOpen?: boolean;
}
const props = withDefaults(defineProps<Props>(), {
  title: "Top up balance",
  billToOptions: () => ["Acme Inc."],
  defaultBillTo: undefined,
  currencies: () => ["USD", "EUR", "SGD"],
  defaultCurrency: undefined,
  balance: 0,
  currencySymbol: "$",
  quickAmounts: () => [50, 100, 250, 500],
  minAmount: 10,
  confirmLabel: "Confirm top-up",
  cancelLabel: "Cancel",
  defaultOpen: false,
});

const emit = defineEmits<{
  (e: "confirm", detail: { billTo: string; currency: string; amount: number }): void;
  (e: "cancel"): void;
}>();

const open = ref(props.defaultOpen);
const billTo = ref(props.defaultBillTo ?? props.billToOptions[0] ?? "");
const currency = ref(props.defaultCurrency ?? props.currencies[0] ?? "USD");
const amount = ref("");
const error = ref<string | null>(null);
const confirmed = ref<{ billTo: string; currency: string; amount: number } | null>(null);

const parsed = computed(() => Number.parseFloat(amount.value));
const valid = computed(() => Number.isFinite(parsed.value) && parsed.value >= props.minAmount);

const reset = () => {
  amount.value = "";
  error.value = null;
  confirmed.value = null;
};

const close = () => {
  open.value = false;
  reset();
};

const handleConfirm = () => {
  if (!valid.value) {
    error.value = `Minimum top-up is ${props.currencySymbol}${props.minAmount.toFixed(2)}`;
    return;
  }
  const detail = { billTo: billTo.value, currency: currency.value, amount: parsed.value };
  confirmed.value = detail;
  emit("confirm", detail);
};

const handleCancel = () => {
  emit("cancel");
  close();
};

const overlayClick = (e: MouseEvent) => {
  if (e.target === e.currentTarget) close();
};

const summary = computed(() => (props.balance + (valid.value ? parsed.value : 0)).toFixed(2));
</script>

<template>
  <div data-topup-balance-dialog>
    <button
      type="button"
      data-topup-open
      class="rounded-md bg-indigo-600 px-3 py-1.5 text-[11px] font-semibold text-white transition-colors hover:bg-indigo-500"
      @click="open = true"
    >
      {{ props.title }}
    </button>

    <div
      v-if="open"
      data-topup-overlay
      class="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/50 p-4"
      @click="overlayClick"
    >
      <div
        data-topup-panel
        role="dialog"
        aria-modal="true"
        :aria-label="props.title"
        class="w-full max-w-sm rounded-xl border border-zinc-200 bg-white p-4 shadow-xl dark:border-zinc-800 dark:bg-zinc-900"
      >
        <template v-if="confirmed">
          <p data-topup-confirmed class="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
            Top-up confirmed
          </p>
          <p class="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            {{ props.currencySymbol }}{{ confirmed.amount.toFixed(2) }} {{ confirmed.currency }} billed to
            {{ confirmed.billTo }}.
          </p>
          <div class="mt-3 flex justify-end">
            <button
              type="button"
              data-topup-done
              class="rounded-md bg-zinc-900 px-3 py-1.5 text-[11px] font-semibold text-white dark:bg-zinc-100 dark:text-zinc-900"
              @click="close"
            >
              Done
            </button>
          </div>
        </template>

        <template v-else>
          <div class="flex items-center justify-between">
            <p data-topup-title class="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{{ props.title }}</p>
            <button
              type="button"
              data-topup-close
              aria-label="Close"
              class="rounded p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
              @click="close"
            >
              ✕
            </button>
          </div>

          <label class="mt-3 block">
            <span class="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">Bill to</span>
            <select
              v-model="billTo"
              data-topup-billto
              class="mt-1 w-full rounded-md border border-zinc-200 bg-white px-2 py-1.5 text-xs text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
            >
              <option v-for="o in props.billToOptions" :key="o" :value="o">{{ o }}</option>
            </select>
          </label>

          <label class="mt-2 block">
            <span class="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">Currency</span>
            <select
              v-model="currency"
              data-topup-currency
              class="mt-1 w-full rounded-md border border-zinc-200 bg-white px-2 py-1.5 text-xs text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
            >
              <option v-for="c in props.currencies" :key="c" :value="c">{{ c }}</option>
            </select>
          </label>

          <label class="mt-2 block">
            <span class="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">Amount</span>
            <div
              class="mt-1 flex items-center gap-1 rounded-md border border-zinc-200 bg-white px-2 py-1.5 focus-within:border-indigo-400 dark:border-zinc-700 dark:bg-zinc-900"
            >
              <span class="text-xs text-zinc-400">{{ props.currencySymbol }}</span>
              <input
                v-model="amount"
                data-topup-amount
                type="number"
                inputmode="decimal"
                :min="props.minAmount"
                placeholder="0.00"
                class="min-w-0 flex-1 bg-transparent text-xs text-zinc-700 outline-none placeholder:text-zinc-400 dark:text-zinc-200"
                @input="error = null"
              />
            </div>
          </label>

          <div data-topup-quick class="mt-2 flex flex-wrap gap-1.5">
            <button
              v-for="q in props.quickAmounts"
              :key="q"
              type="button"
              :data-topup-quick-amount="q"
              class="rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors"
              :class="
                Number.parseFloat(amount) === q
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400'
                  : 'border-zinc-200 text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800'
              "
              @click="amount = String(q); error = null"
            >
              {{ props.currencySymbol }}{{ q }}
            </button>
          </div>

          <p
            data-topup-summary
            class="mt-3 flex items-center justify-between border-t border-zinc-100 pt-2 text-xs dark:border-zinc-800"
          >
            <span class="text-zinc-500 dark:text-zinc-400">New balance after top-up</span>
            <span data-topup-summary-value class="font-mono font-semibold text-zinc-900 dark:text-zinc-50">
              {{ props.currencySymbol }}{{ summary }}
            </span>
          </p>

          <p
            v-if="error"
            data-topup-error
            role="alert"
            class="mt-2 text-[11px] font-medium text-rose-600 dark:text-rose-400"
          >
            {{ error }}
          </p>

          <div class="mt-3 flex items-center justify-end gap-2">
            <button
              type="button"
              data-topup-cancel
              class="rounded-md border border-zinc-200 px-3 py-1.5 text-[11px] font-semibold text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
              @click="handleCancel"
            >
              {{ props.cancelLabel }}
            </button>
            <button
              type="button"
              data-topup-confirm
              class="rounded-md bg-indigo-600 px-3 py-1.5 text-[11px] font-semibold text-white transition-colors hover:bg-indigo-500"
              @click="handleConfirm"
            >
              {{ props.confirmLabel }}
            </button>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>
