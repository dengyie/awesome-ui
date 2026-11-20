<script setup lang="ts">
import { ref, computed } from "vue";

export interface BillingAddress {
  country: string;
  address1: string;
  address2?: string;
  city: string;
  state?: string;
  zip: string;
}
interface Props {
  title?: string;
  countries?: string[];
  labels?: { address1?: string; address2?: string; city?: string; state?: string; zip?: string };
  defaultValue?: Partial<BillingAddress>;
  submitLabel?: string;
  showOptional?: boolean;
}
const props = withDefaults(defineProps<Props>(), {
  title: "Billing details",
  countries: () => ["United States", "Singapore", "United Kingdom", "Germany", "Japan"],
  labels: () => ({}),
  defaultValue: () => ({}),
  submitLabel: "Continue to next step",
  showOptional: true,
});
const emit = defineEmits<{
  (e: "submit", address: BillingAddress): void;
}>();

const DEFAULT_COUNTRIES = props.countries;
const country = ref(props.defaultValue.country ?? DEFAULT_COUNTRIES[0] ?? "");
const address1 = ref(props.defaultValue.address1 ?? "");
const address2 = ref(props.defaultValue.address2 ?? "");
const city = ref(props.defaultValue.city ?? "");
const state = ref(props.defaultValue.state ?? "");
const zip = ref(props.defaultValue.zip ?? "");
const submitted = ref<BillingAddress | null>(null);

const valid = computed(() => address1.value.trim() !== "" && city.value.trim() !== "" && zip.value.trim() !== "");

const handleSubmit = () => {
  if (!valid.value) return;
  const address: BillingAddress = {
    country: country.value,
    address1: address1.value,
    address2: address2.value || undefined,
    city: city.value,
    state: state.value || undefined,
    zip: zip.value,
  };
  submitted.value = address;
  emit("submit", address);
};
</script>

<template>
  <div data-billing-address-form class="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
    <p data-billing-address-title class="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{{ props.title }}</p>

    <label data-billing-country-wrap class="mt-3 flex items-center gap-2">
      <span class="w-24 shrink-0 text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">Country</span>
      <select
        data-billing-country
        v-model="country"
        class="min-w-0 flex-1 rounded-md border border-zinc-200 bg-white px-2 py-1.5 text-xs text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
      >
        <option v-for="c in props.countries" :key="c" :value="c">{{ c }}</option>
      </select>
    </label>

    <label data-billing-field-wrap class="mt-2 flex items-center gap-2">
      <span class="w-24 shrink-0 text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">{{ props.labels.address1 ?? "Address line 1" }}</span>
      <input
        data-billing-address1
        v-model="address1"
        placeholder="Street address"
        class="min-w-0 flex-1 rounded-md border border-zinc-200 bg-white px-2 py-1.5 text-xs text-zinc-700 placeholder:text-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
      />
    </label>

    <label v-if="props.showOptional" data-billing-field-wrap class="mt-2 flex items-center gap-2">
      <span class="w-24 shrink-0 text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">{{ props.labels.address2 ?? "Address line 2" }}</span>
      <span class="text-[10px] text-zinc-400 dark:text-zinc-500">optional</span>
      <input
        data-billing-address2
        v-model="address2"
        placeholder="Apt, suite, unit"
        class="min-w-0 flex-1 rounded-md border border-zinc-200 bg-white px-2 py-1.5 text-xs text-zinc-700 placeholder:text-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
      />
    </label>

    <div class="mt-2 grid grid-cols-2 gap-2">
      <label data-billing-city-wrap class="flex items-center gap-2">
        <span class="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">{{ props.labels.city ?? "City" }}</span>
        <input
          data-billing-city
          v-model="city"
          class="min-w-0 flex-1 rounded-md border border-zinc-200 bg-white px-2 py-1.5 text-xs text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
        />
      </label>
      <label data-billing-zip-wrap class="flex items-center gap-2">
        <span class="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">{{ props.labels.zip ?? "ZIP" }}</span>
        <input
          data-billing-zip
          v-model="zip"
          class="min-w-0 flex-1 rounded-md border border-zinc-200 bg-white px-2 py-1.5 text-xs text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
        />
      </label>
    </div>

    <label v-if="props.showOptional" data-billing-state-wrap class="mt-2 flex items-center gap-2">
      <span class="w-24 shrink-0 text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">{{ props.labels.state ?? "State" }}</span>
      <span class="text-[10px] text-zinc-400 dark:text-zinc-500">optional</span>
      <input
        data-billing-state
        v-model="state"
        class="min-w-0 flex-1 rounded-md border border-zinc-200 bg-white px-2 py-1.5 text-xs text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
      />
    </label>

    <div class="mt-3 flex items-center justify-between">
      <span v-if="submitted" data-billing-address-saved class="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
        Saved {{ submitted.city }}, {{ submitted.country }}
      </span>
      <span v-else data-billing-address-hint class="text-[11px] text-zinc-400 dark:text-zinc-500">Address, city and ZIP are required.</span>
      <button
        type="button"
        data-billing-address-submit
        :disabled="!valid"
        @click="handleSubmit"
        class="rounded-md bg-indigo-600 px-3 py-1.5 text-[11px] font-semibold text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {{ props.submitLabel }}
      </button>
    </div>
  </div>
</template>
