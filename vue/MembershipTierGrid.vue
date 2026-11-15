<script setup lang="ts">
export interface MembershipTier {
  id: string;
  name: string;
  price: string;
  period?: string;
  image?: string;
  description?: string;
  perks?: string[];
  badge?: string;
  limited?: number;
  highlighted?: boolean;
  ctaText?: string;
}
interface Props {
  title?: string;
  subtitle?: string;
  tiers: MembershipTier[];
}
const props = withDefaults(defineProps<Props>(), {
  title: "Get more from this creator",
  subtitle: "Upgrade to access exclusive benefits.",
});
const emit = defineEmits<{ (e: "select", tier: MembershipTier): void }>();

const gridClass = () =>
  props.tiers.length >= 3 ? "md:grid-cols-3" : props.tiers.length === 2 ? "md:grid-cols-2" : "";
</script>

<template>
  <div data-membership-grid>
    <div class="text-center">
      <h3 data-membership-title class="text-xl font-bold text-zinc-900 dark:text-zinc-50">{{ title }}</h3>
      <p class="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{{ subtitle }}</p>
    </div>
    <div class="mt-6 grid gap-5" :class="gridClass()">
      <div
        v-for="tier in tiers"
        :key="tier.id"
        :data-membership-tier="tier.id"
        class="overflow-hidden rounded-xl border bg-white dark:bg-zinc-900"
        :class="tier.highlighted ? 'border-zinc-900 dark:border-zinc-100' : 'border-zinc-200 dark:border-zinc-800'"
      >
        <img v-if="tier.image" :src="tier.image" :alt="tier.name" class="h-36 w-full object-cover" />
        <div class="p-5">
          <div class="flex items-center justify-between">
            <span class="text-base font-semibold text-zinc-900 dark:text-zinc-50">{{ tier.name }}</span>
            <span
              v-if="tier.badge"
              class="rounded-full bg-zinc-900 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white dark:bg-zinc-100 dark:text-zinc-900"
            >
              {{ tier.badge }}
            </span>
          </div>
          <div class="mt-1 flex items-baseline gap-1">
            <span data-membership-price class="text-xl font-bold text-zinc-900 dark:text-zinc-50">{{ tier.price }}</span>
            <span class="text-xs text-zinc-500 dark:text-zinc-400">/ {{ tier.period || "month" }}</span>
          </div>
          <p v-if="tier.limited !== undefined" data-membership-limited class="mt-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
            Limited ({{ tier.limited }} remaining)
          </p>
          <button
            type="button"
            data-membership-cta
            class="mt-3 w-full rounded-md px-3 py-2 text-sm font-semibold transition-colors"
            :class="tier.highlighted
              ? 'bg-zinc-900 text-white hover:bg-zinc-700 dark:bg-white dark:text-zinc-900'
              : 'border border-zinc-300 text-zinc-800 hover:border-zinc-500 dark:border-zinc-700 dark:text-zinc-100'"
            @click="emit('select', tier)"
          >
            {{ tier.ctaText || "Start 7-day free trial" }}
          </button>
          <p v-if="tier.description" class="mt-3 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">{{ tier.description }}</p>
          <ul v-if="tier.perks && tier.perks.length" data-membership-perks class="mt-3 space-y-1.5">
            <li v-for="perk in tier.perks" :key="perk" class="flex items-start gap-2 text-xs text-zinc-700 dark:text-zinc-300">
              <span class="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-400 dark:bg-zinc-600" />
              {{ perk }}
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>
