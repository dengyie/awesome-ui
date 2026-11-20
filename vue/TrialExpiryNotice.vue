<script setup lang="ts">
import { computed } from "vue";

interface Props {
  planName?: string;
  daysLeft?: number;
  tone?: "expiring" | "urgent" | "auto";
  losingFeatures?: string[];
  keepingFeatures?: string[];
  expiresOn?: string;
  extendLabel?: string;
  upgradeLabel?: string;
}
const props = withDefaults(defineProps<Props>(), {
  planName: "Pro",
  daysLeft: 0,
  tone: "auto",
  losingFeatures: () => [],
  keepingFeatures: () => [],
  expiresOn: undefined,
  extendLabel: "Extend trial",
  upgradeLabel: "Upgrade now",
});

const emit = defineEmits<{
  (e: "extend"): void;
  (e: "upgrade"): void;
}>();

const resolved = computed<"expiring" | "urgent">(() =>
  props.tone === "auto" ? (props.daysLeft <= 3 ? "urgent" : "expiring") : props.tone,
);

const palette = computed(() =>
  resolved.value === "urgent"
    ? {
        wrap: "border-red-200 bg-red-50 dark:border-red-900/60 dark:bg-red-950/40",
        icon: "bg-red-100 text-red-600 dark:bg-red-900/60 dark:text-red-300",
        title: "text-red-900 dark:text-red-100",
        body: "text-red-700/90 dark:text-red-200/80",
        big: "text-red-600 dark:text-red-300",
        primary: "bg-red-600 hover:bg-red-700 text-white",
        secondary: "border-red-300 text-red-700 hover:bg-red-100 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-900/40",
      }
    : {
        wrap: "border-amber-200 bg-amber-50 dark:border-amber-900/60 dark:bg-amber-950/40",
        icon: "bg-amber-100 text-amber-600 dark:bg-amber-900/60 dark:text-amber-300",
        title: "text-amber-900 dark:text-amber-100",
        body: "text-amber-700/90 dark:text-amber-200/80",
        big: "text-amber-600 dark:text-amber-300",
        primary: "bg-amber-500 hover:bg-amber-600 text-white",
        secondary: "border-amber-300 text-amber-700 hover:bg-amber-100 dark:border-amber-800 dark:text-amber-300 dark:hover:bg-amber-900/40",
      },
);

const titleText = computed(() =>
  props.daysLeft > 0
    ? `Your free ${props.planName} trial expires in ${props.daysLeft} day${props.daysLeft === 1 ? "" : "s"}.`
    : `Your free ${props.planName} trial has expired.`,
);
const subText = computed(() =>
  resolved.value === "urgent"
    ? "Act now to keep your workspace running without interruption."
    : "After the trial ends, paid features below will be locked.",
);
</script>

<template>
  <div
    data-trial-expiry-notice
    class="rounded-xl border p-4"
    :class="palette.wrap"
    role="alert"
  >
    <div class="flex items-start gap-3">
      <div
        class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg"
        :class="palette.icon"
        aria-hidden="true"
      >
        ⏳
      </div>
      <div class="min-w-0 flex-1">
        <p data-trial-expiry-title class="text-sm font-semibold" :class="palette.title">{{ titleText }}</p>
        <p data-trial-expiry-sub class="mt-0.5 text-xs" :class="palette.body">
          {{ props.expiresOn ? `Deadline: ${props.expiresOn}. ` : '' }}{{ subText }}
        </p>
        <p class="mt-1 flex items-baseline gap-1">
          <span data-trial-expiry-days class="font-mono text-3xl font-bold" :class="palette.big">
            {{ Math.max(props.daysLeft, 0) }}
          </span>
          <span class="text-xs font-medium" :class="palette.body">days left</span>
        </p>

        <ul v-if="props.losingFeatures.length" data-trial-expiry-losing class="mt-2 space-y-1">
          <li v-for="f in props.losingFeatures" :key="f" class="flex items-start gap-1.5 text-xs" :class="palette.body">
            <span aria-hidden="true">🔒</span>
            <span class="line-through decoration-current/60">{{ f }}</span>
          </li>
        </ul>
        <ul v-if="props.keepingFeatures.length" data-trial-expiry-keeping class="mt-1.5 space-y-1">
          <li v-for="f in props.keepingFeatures" :key="f" class="flex items-start gap-1.5 text-xs" :class="palette.body">
            <span aria-hidden="true">✅</span>
            {{ f }}
          </li>
        </ul>
      </div>
    </div>

    <div class="mt-3 flex flex-wrap gap-2 pl-[52px]">
      <button
        type="button"
        data-trial-expiry-upgrade
        class="rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors"
        :class="palette.primary"
        @click="emit('upgrade')"
      >
        {{ props.upgradeLabel }}
      </button>
      <button
        type="button"
        data-trial-expiry-extend
        class="rounded-lg border px-3.5 py-2 text-xs font-semibold transition-colors"
        :class="palette.secondary"
        @click="emit('extend')"
      >
        {{ props.extendLabel }}
      </button>
    </div>
  </div>
</template>
