<script setup lang="ts">
import { ref } from "vue";

export interface CancelReason {
  id: string;
  label: string;
}

export interface RetentionOffer {
  title?: string;
  description?: string;
  discountedPrice?: string;
  originalPrice?: string;
  periodLabel?: string;
}

export interface CancelRetentionFlowProps {
  title?: string;
  stepLabel?: string;
  reasonsLabel?: string;
  reasons?: CancelReason[];
  offer?: RetentionOffer | null;
  keepLabel?: string;
  confirmLabel?: string;
  class?: string;
}

const props = withDefaults(defineProps<CancelRetentionFlowProps>(), {
  title: "Cancel your plan",
  stepLabel: "Step",
  reasonsLabel: "Help us improve — why are you cancelling?",
  reasons: () => [
    { id: "price", label: "Too expensive" },
    { id: "features", label: "Missing features I need" },
    { id: "switching", label: "Switching to another tool" },
    { id: "pause", label: "Only needed it temporarily" },
  ],
  offer: () => ({
    title: "Before you go — 30% off for 3 months",
    description: "Stay on your current plan at a reduced price. Your data and integrations stay untouched.",
    discountedPrice: "$34.30",
    originalPrice: "$49.00",
    periodLabel: "/ month",
  }),
  keepLabel: "Keep my plan",
  confirmLabel: "Confirm cancellation",
  class: "",
});

const emit = defineEmits<{
  (e: "keep"): void;
  (e: "confirm-cancel", reason: string): void;
  (e: "step-change", step: 1 | 2): void;
}>();

const step = ref<1 | 2>(1);
const reason = ref("");

const goTo = (next: 1 | 2) => {
  step.value = next;
  emit("step-change", next);
};
</script>

<template>
  <div data-cancel-flow class="w-full rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900" :class="props.class">
    <div data-cancel-header class="mb-4 flex items-center justify-between">
      <p data-cancel-title class="text-base font-semibold text-zinc-900 dark:text-zinc-50">{{ props.title }}</p>
      <span data-cancel-step-indicator class="rounded-full bg-zinc-100 px-2.5 py-0.5 text-[11px] font-semibold text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">{{ props.stepLabel }} {{ step }} / 2</span>
    </div>

    <div v-if="step === 1" data-cancel-step1 class="space-y-3">
      <p data-cancel-reasons-label class="text-sm font-medium text-zinc-700 dark:text-zinc-200">{{ props.reasonsLabel }}</p>
      <div data-cancel-reasons class="grid gap-2">
        <label
          v-for="r in (Array.isArray(props.reasons) ? props.reasons : [])"
          :key="r.id"
          :data-cancel-reason-card="r.id"
          :for="`reason-${r.id}`"
          class="flex cursor-pointer items-center gap-3 rounded-lg border border-zinc-200 px-4 py-3 text-sm text-zinc-700 transition-colors hover:border-violet-300 hover:bg-violet-50/50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:border-violet-700 dark:hover:bg-violet-950/30"
        >
          <input v-model="reason" type="radio" name="cancel-reason" :data-cancel-reason="r.id" :id="`reason-${r.id}`" :value="r.id" class="h-4 w-4 accent-violet-600" />
          <span>{{ r.label }}</span>
        </label>
      </div>
      <div class="flex justify-end pt-2">
        <button type="button" data-cancel-next :disabled="!reason" class="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white transition-opacity hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-40" @click="reason && goTo(2)">Continue</button>
      </div>
    </div>

    <div v-else data-cancel-step2 class="space-y-4">
      <div v-if="props.offer" data-cancel-offer class="rounded-xl border border-violet-200 bg-violet-50/70 p-5 dark:border-violet-800 dark:bg-violet-950/40">
        <p data-cancel-offer-title class="text-base font-semibold text-violet-900 dark:text-violet-200">{{ props.offer.title || "" }}</p>
        <p data-cancel-offer-description class="mt-1 text-sm leading-5 text-violet-700 dark:text-violet-300">{{ props.offer.description || "" }}</p>
        <p data-cancel-offer-price class="mt-3 flex items-baseline gap-2">
          <span class="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{{ props.offer.discountedPrice || "" }}</span>
          <span class="text-sm text-zinc-400 line-through">{{ props.offer.originalPrice || "" }}</span>
          <span class="text-xs text-zinc-500 dark:text-zinc-400">{{ props.offer.periodLabel || "" }}</span>
        </p>
      </div>
      <div class="flex flex-col gap-2 sm:flex-row sm:justify-end">
        <button type="button" data-cancel-back class="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800" @click="goTo(1)">Back</button>
        <button type="button" data-cancel-confirm class="rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950/40" @click="emit('confirm-cancel', reason)">{{ props.confirmLabel }}</button>
        <button type="button" data-cancel-keep class="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-violet-500 dark:bg-violet-600 dark:hover:bg-violet-500" @click="emit('keep')">{{ props.keepLabel }}</button>
      </div>
    </div>
  </div>
</template>
