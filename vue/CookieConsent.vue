<template>
  <div class="w-full max-w-lg rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900" data-cookie-consent role="dialog" :aria-label="title">
    <h2 class="text-base font-bold text-zinc-900 dark:text-zinc-50">{{ title }}</h2>
    <p class="mt-1.5 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
      {{ description }}
      <a href="#" class="font-medium text-indigo-600 underline underline-offset-2 dark:text-indigo-400">{{ policyLabel }}</a>
    </p>

    <div class="mt-4 space-y-2">
      <details
        v-for="category in ordered"
        :key="category.id"
        class="group rounded-lg border border-zinc-200 bg-zinc-50/60 dark:border-zinc-800 dark:bg-zinc-800/50"
        :data-consent-category="category.id"
      >
        <summary class="flex cursor-pointer list-none items-center gap-2.5 px-3 py-2.5 text-xs font-semibold text-zinc-800 dark:text-zinc-100 [&::-webkit-details-marker]:hidden">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-3.5 w-3.5 shrink-0 text-zinc-400 transition-transform group-open:rotate-180">
            <path d="m6 9 6 6 6-6" />
          </svg>
          {{ category.label }}
          <span class="ml-auto shrink-0 text-[10px] font-medium text-zinc-400">{{ category.alwaysActive ? 'Always Active' : '' }}</span>
          <span v-if="!category.alwaysActive" class="flex h-4 w-7 shrink-0 items-center rounded-full bg-indigo-600 px-0.5" data-consent-toggle aria-hidden="true">
            <span class="ml-auto flex h-3 w-3 items-center justify-center rounded-full bg-white">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" class="h-2 w-2 text-indigo-600">
                <path d="m5 12 4 4L19 6" />
              </svg>
            </span>
          </span>
        </summary>
        <div class="border-t border-zinc-200 px-3 py-2.5 text-xs leading-relaxed text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
          {{ category.description || 'Used to deliver core functionality.' }}
          <p v-if="category.cookies?.length" class="mt-1.5 text-[10px] font-mono text-zinc-400">{{ category.cookies.join(', ') }}</p>
        </div>
      </details>
    </div>

    <div class="mt-4 flex items-center justify-end gap-2" data-consent-actions>
      <button
        v-if="rejectLabel"
        type="button"
        data-consent-reject
        class="rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-semibold text-zinc-600 transition-colors hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
        @click="confirm(alwaysIds)"
      >
        {{ rejectLabel }}
      </button>
      <button
        type="button"
        data-consent-accept
        class="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-indigo-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        @click="confirm(allIds)"
      >
        {{ acceptLabel }}
      </button>
      <button
        type="button"
        data-consent-save
        class="rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-semibold text-zinc-600 transition-colors hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
        @click="confirm(alwaysIds)"
      >
        {{ saveLabel }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

export interface ConsentCategory {
  id: string;
  label: string;
  description?: string;
  alwaysActive?: boolean;
  cookies?: string[];
}

const props = withDefaults(
  defineProps<{
    title?: string;
    description?: string;
    policyLabel?: string;
    categories?: ConsentCategory[];
    acceptLabel?: string;
    rejectLabel?: string;
    saveLabel?: string;
  }>(),
  {
    title: 'Choose how we use your personal information',
    description: 'We use cookies to personalize content, run analytics and improve your experience.',
    policyLabel: 'Privacy Policy',
    categories: () => [],
    acceptLabel: 'Accept All',
    rejectLabel: 'Reject All',
    saveLabel: 'Confirm',
  },
);

const emit = defineEmits<{
  (e: 'confirm', accepted: string[]): void;
}>();

const ordered = computed(() => [...props.categories.filter((c) => c.alwaysActive), ...props.categories.filter((c) => !c.alwaysActive)]);
const allIds = computed(() => props.categories.map((c) => c.id));
const alwaysIds = computed(() => props.categories.filter((c) => c.alwaysActive).map((c) => c.id));

const confirm = (accepted: string[]) => emit('confirm', accepted);
</script>
