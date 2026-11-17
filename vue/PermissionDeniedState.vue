<script setup lang="ts">
export interface PermissionDeniedStateProps {
  title?: string;
  description?: string;
  ctaLabel?: string;
  contactLabel?: string;
  contactHref?: string;
  class?: string;
}

const props = withDefaults(defineProps<PermissionDeniedStateProps>(), {
  title: "You don’t have access to this page",
  description: "This space is restricted. Request access and a workspace admin will review your request.",
  ctaLabel: "Request access",
  contactLabel: "or contact a workspace admin",
  contactHref: "#",
  class: "",
});

const emit = defineEmits<{
  (e: "request-access"): void;
}>();
</script>

<template>
  <div data-denied-state class="flex w-full flex-col items-center justify-center gap-4 rounded-xl border border-zinc-200 bg-white px-6 py-14 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900" :class="props.class">
    <div data-denied-illustration aria-hidden="true" class="flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-100 text-3xl dark:bg-zinc-800">🔒</div>
    <div class="space-y-1.5">
      <p data-denied-title class="text-base font-semibold text-zinc-900 dark:text-zinc-50">{{ props.title }}</p>
      <p data-denied-description class="mx-auto max-w-md text-sm leading-5 text-zinc-500 dark:text-zinc-400">{{ props.description }}</p>
    </div>
    <button type="button" data-denied-cta class="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-violet-500" @click="emit('request-access')">{{ props.ctaLabel }}</button>
    <a v-if="props.contactLabel" data-denied-contact :href="props.contactHref" class="text-xs font-medium text-zinc-500 underline-offset-2 hover:underline dark:text-zinc-400">{{ props.contactLabel }}</a>
  </div>
</template>
