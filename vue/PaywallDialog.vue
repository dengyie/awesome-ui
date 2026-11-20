<script setup lang="ts">
import { ref } from "vue";

export interface PaywallPlan {
  id: string;
  name: string;
  price: string;
  period?: string;
  originalPrice?: string;
  badge?: string;
  features: string[];
  featured?: boolean;
}
interface Props {
  title?: string;
  description?: string;
  glyph?: string;
  plans?: PaywallPlan[];
  cadences?: string[];
  defaultCadence?: string;
  cadenceNote?: Record<string, string>;
  cadencePrices?: Record<string, Record<string, string>>;
  ctaLabel?: string;
  discountBadge?: string;
  defaultOpen?: boolean;
}
const props = withDefaults(defineProps<Props>(), {
  title: "Upgrade to continue",
  description:
    "You've reached the limit of the free plan. Upgrade to unlock this feature.",
  glyph: "🔒",
  plans: () => [],
  cadences: () => ["Monthly", "Yearly"],
  defaultCadence: undefined,
  cadenceNote: () => ({}),
  cadencePrices: () => ({}),
  ctaLabel: "Upgrade now",
  discountBadge: undefined,
  defaultOpen: false,
});

const emit = defineEmits<{
  (e: "upgrade", plan: PaywallPlan): void;
  (e: "dismiss"): void;
}>();

const cadenceList = ref(props.cadences.length ? props.cadences : ["Monthly"]);
const cadence = ref(
  props.defaultCadence && cadenceList.value.includes(props.defaultCadence)
    ? props.defaultCadence
    : cadenceList.value[0],
);
const open = ref(props.defaultOpen);

const priceFor = (plan: PaywallPlan) => props.cadencePrices[plan.id]?.[cadence.value] ?? plan.price;
const cols = Math.min(props.plans.length, 3) || 1;

const pickPlan = (plan: PaywallPlan) => emit("upgrade", plan);
const confirm = () => {
  const featured = props.plans.find((p) => p.featured) ?? props.plans[0];
  if (featured) emit("upgrade", featured);
};
const dismiss = () => {
  open.value = false;
  emit("dismiss");
};
</script>

<template>
  <div
    v-if="open"
    data-paywall-dialog
    role="dialog"
    aria-modal="true"
    :aria-label="props.title"
    class="fixed inset-0 z-50 flex items-center justify-center p-4"
  >
    <div data-paywall-overlay class="absolute inset-0 bg-zinc-950/60 backdrop-blur-sm" @click="dismiss" />

    <div
      data-paywall-panel
      class="relative w-full max-w-lg overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-700 dark:bg-zinc-900"
    >
      <span
        v-if="props.discountBadge"
        data-paywall-discount
        class="absolute right-4 top-4 z-10 rotate-3 rounded-full bg-amber-400 px-2.5 py-1 text-[11px] font-bold text-amber-950 shadow"
      >
        {{ props.discountBadge }}
      </span>

      <div class="flex flex-col items-center px-6 pb-6 pt-8 text-center">
        <div
          data-paywall-glyph
          class="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-100 text-2xl dark:bg-violet-950/60"
          aria-hidden="true"
        >
          {{ props.glyph }}
        </div>
        <h2 data-paywall-title class="mt-3 text-lg font-semibold text-zinc-900 dark:text-zinc-50">{{ props.title }}</h2>
        <p data-paywall-description class="mt-1 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
          {{ props.description }}
        </p>

        <div
          v-if="cadenceList.length > 1"
          data-paywall-cadence
          role="tablist"
          aria-label="Billing cadence"
          class="mt-4 flex items-center rounded-lg border border-zinc-200 bg-zinc-100 p-0.5 dark:border-zinc-700 dark:bg-zinc-800"
        >
          <button
            v-for="c in cadenceList"
            :key="c"
            type="button"
            role="tab"
            :aria-selected="c === cadence"
            :data-paywall-cadence-option="c"
            class="rounded-md px-3 py-1 text-xs font-medium transition-colors"
            :class="
              c === cadence
                ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-zinc-50'
                : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400'
            "
            @click="cadence = c"
          >
            {{ c }}
            <span
              v-if="props.cadenceNote[c]"
              class="ml-1 rounded-full bg-emerald-100 px-1.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
            >
              {{ props.cadenceNote[c] }}
            </span>
          </button>
        </div>

        <div
          data-paywall-plans
          class="mt-4 grid w-full gap-2"
          :style="{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }"
        >
          <button
            v-for="plan in props.plans"
            :key="plan.id"
            type="button"
            :data-paywall-plan="plan.id"
            class="relative rounded-xl border p-3 text-left transition-colors"
            :class="
              plan.featured
                ? 'border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900'
                : 'border-zinc-200 bg-white text-zinc-900 hover:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:hover:border-zinc-500'
            "
            @click="pickPlan(plan)"
          >
            <span
              v-if="plan.badge"
              class="absolute -top-2 left-3 rounded-full px-2 py-0.5 text-[10px] font-semibold"
              :class="
                plan.featured
                  ? 'bg-violet-600 text-white'
                  : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300'
              "
            >
              {{ plan.badge }}
            </span>
            <p class="text-xs font-semibold">{{ plan.name }}</p>
            <p class="mt-1">
              <span class="font-mono text-lg font-bold">{{ priceFor(plan) }}</span>
              <span
                class="ml-0.5 text-[11px]"
                :class="plan.featured ? 'text-zinc-300 dark:text-zinc-600' : 'text-zinc-400'"
              >
                {{ plan.period ?? '' }}
              </span>
            </p>
            <p
              v-if="plan.originalPrice"
              class="text-[11px] line-through text-zinc-400 dark:text-zinc-500"
            >
              {{ plan.originalPrice }}
            </p>
            <ul
              class="mt-2 space-y-1"
              :class="plan.featured ? 'text-zinc-200 dark:text-zinc-700' : 'text-zinc-500 dark:text-zinc-400'"
            >
              <li v-for="f in plan.features" :key="f" class="flex items-start gap-1 text-[11px] leading-snug">
                <span aria-hidden="true" :class="plan.featured ? 'text-emerald-400' : 'text-emerald-500'">✓</span>
                {{ f }}
              </li>
            </ul>
          </button>
        </div>

        <button
          type="button"
          data-paywall-cta
          class="mt-4 w-full rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-violet-700"
          @click="confirm"
        >
          {{ props.ctaLabel }} · {{ cadence }}
        </button>
        <button
          type="button"
          data-paywall-dismiss
          class="mt-2 text-xs text-zinc-400 underline-offset-2 hover:text-zinc-600 hover:underline dark:text-zinc-500 dark:hover:text-zinc-300"
          @click="dismiss"
        >
          Maybe later
        </button>
      </div>
    </div>
  </div>
</template>
