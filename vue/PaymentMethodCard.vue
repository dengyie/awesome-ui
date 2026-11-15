<template>
  <div data-payment-card class="w-full rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
    <div class="flex items-center gap-3">
      <span data-payment-brand :class="['flex h-8 w-12 shrink-0 items-center justify-center rounded-md text-[11px] font-black tracking-wide', brandTone]">{{ brandLabel }}</span>
      <div class="min-w-0 flex-1">
        <p data-payment-number class="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
          Ending in {{ last4 }}<span v-if="amount" class="ml-2 font-normal text-zinc-500 dark:text-zinc-400">{{ amount }}</span>
        </p>
        <p v-if="exp" class="text-xs text-zinc-400 dark:text-zinc-500">Exp. {{ exp }}</p>
      </div>
      <button type="button" data-payment-change class="shrink-0 text-xs font-semibold uppercase tracking-wide text-indigo-600 hover:underline dark:text-indigo-400" @click="emit('change')">{{ changeLabel }}</button>
    </div>
    <div v-if="holder" class="mt-3 border-t border-zinc-100 pt-3 dark:border-zinc-800">
      <p class="text-[10px] font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">{{ holderLabel }}</p>
      <p class="mt-0.5 text-xs text-zinc-700 dark:text-zinc-200">{{ holder }}</p>
    </div>
    <button v-if="showAddNew" type="button" data-payment-add class="mt-3 text-xs font-medium text-zinc-500 underline-offset-2 hover:text-zinc-700 hover:underline dark:text-zinc-400 dark:hover:text-zinc-200" @click="emit('add-new')">{{ addNewLabel }}</button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const BRAND_LABEL: Record<string, string> = { visa: 'VISA', mastercard: 'MC', amex: 'AMEX' };
const BRAND_TONE: Record<string, string> = {
  visa: 'bg-blue-700 text-white',
  mastercard: 'bg-zinc-900 text-white',
  amex: 'bg-sky-600 text-white',
};

const props = withDefaults(
  defineProps<{
    brand: 'visa' | 'mastercard' | 'amex' | string;
    last4: string;
    exp?: string;
    amount?: string;
    holderLabel?: string;
    holder?: string;
    showAddNew?: boolean;
    changeLabel?: string;
    addNewLabel?: string;
  }>(),
  { holderLabel: 'Billing address', showAddNew: true, changeLabel: 'Change', addNewLabel: '+ Add new payment' },
);

const emit = defineEmits<{
  (e: 'change'): void;
  (e: 'add-new'): void;
}>();

const key = computed(() => String(props.brand).toLowerCase());
const brandLabel = computed(() => BRAND_LABEL[key.value] || String(props.brand).slice(0, 4).toUpperCase());
const brandTone = computed(() => BRAND_TONE[key.value] || 'bg-zinc-700 text-white');
</script>
