<script setup lang="ts">
interface Props {
  planName?: string;
  daysLeft: number;
  message?: string;
  ctaText?: string;
  tone?: "indigo" | "amber";
  dismissible?: boolean;
}
const props = withDefaults(defineProps<Props>(), {
  planName: "Pro",
  message: "",
  ctaText: "Upgrade now",
  tone: "indigo",
  dismissible: false,
});
const emit = defineEmits<{ (e: "cta"): void; (e: "dismiss"): void }>();
const urgent = props.daysLeft <= 3;
const messageText = () => props.message || `Your ${props.planName} trial ends soon — upgrade to keep ${props.planName} features.`;
</script>

<template>
  <div
    data-trial-banner
    class="flex flex-wrap items-center gap-3 rounded-lg border px-4 py-3"
    :class="tone === 'amber'
      ? 'border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/40'
      : 'border-indigo-200 bg-indigo-50 dark:border-indigo-900 dark:bg-indigo-950/40'"
  >
    <span
      data-trial-days
      class="rounded-full px-2.5 py-1 text-xs font-bold text-white"
      :class="[tone === 'amber' ? 'bg-amber-500' : 'bg-indigo-600', urgent ? 'animate-pulse' : '']"
    >
      {{ daysLeft }} {{ daysLeft === 1 ? "day" : "days" }} left
    </span>
    <span data-trial-message class="flex-1 text-sm text-zinc-800 dark:text-zinc-100">{{ messageText() }}</span>
    <button
      type="button"
      data-trial-cta
      class="rounded-md bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
      @click="emit('cta')"
    >
      {{ ctaText }}
    </button>
    <button
      v-if="dismissible"
      type="button"
      data-trial-dismiss
      title="Dismiss"
      class="flex h-6 w-6 items-center justify-center rounded-full text-zinc-400 hover:bg-zinc-200 hover:text-zinc-700 dark:hover:bg-zinc-800"
      @click="emit('dismiss')"
    >
      <svg viewBox="0 0 20 20" fill="none" class="h-3 w-3" aria-hidden="true"><path d="m5 5 10 10M15 5 5 15" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" /></svg>
    </button>
  </div>
</template>
