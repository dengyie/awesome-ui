<template>
  <div class="grid gap-6 md:grid-cols-3 items-start" :class="$attrs.class">
    <div v-for="plan in plans" :key="plan.name" :class="['relative flex flex-col rounded-2xl border p-6 transition-shadow',
      plan.highlighted ? 'border-indigo-600 bg-white dark:bg-zinc-900 ring-2 ring-indigo-600 shadow-sm' : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:shadow-sm']">
      <span v-if="plan.highlighted" class="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-indigo-600 px-3 py-1 text-[11px] font-medium text-white">{{ plan.badge || 'Most popular' }}</span>
      <div class="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{{ plan.name }}</div>
      <div v-if="plan.description" class="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{{ plan.description }}</div>
      <div class="mt-5 flex items-baseline gap-1">
        <span class="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">{{ plan.price }}</span>
        <span class="text-xs text-zinc-400 dark:text-zinc-500">/{{ plan.period || 'mo' }}</span>
      </div>
      <ul class="mt-5 space-y-2.5 flex-1">
        <li v-for="feature in plan.features" :key="feature" class="flex items-start gap-2 text-xs text-zinc-600 dark:text-zinc-300">
          <UiIcon name="check" :size="14" class="mt-0.5 shrink-0 text-emerald-500" />
          <span>{{ feature }}</span>
        </li>
      </ul>
      <button type="button" :class="['mt-6 w-full rounded-lg px-4 py-2 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-zinc-900',
        plan.highlighted ? 'bg-indigo-600 text-white hover:bg-indigo-500' : 'border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800']"
        @click="$emit('select', plan)">{{ plan.ctaText || 'Get started' }}</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import UiIcon from './UiIcon.vue';

export interface PricingPlan {
  name: string;
  price: string | number;
  period?: string;
  description?: string;
  features: string[];
  highlighted?: boolean;
  badge?: string;
  ctaText?: string;
}

withDefaults(defineProps<{ plans: PricingPlan[] }>(), { plans: () => [] });
defineEmits<{ (e: 'select', plan: PricingPlan): void }>();
</script>
