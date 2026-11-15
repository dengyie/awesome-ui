<template>
  <div data-auth-gate class="mx-auto w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-6 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
    <p data-auth-gate-title class="text-lg font-semibold leading-snug text-zinc-900 dark:text-zinc-50">{{ title }}</p>
    <div class="mt-5 space-y-2.5">
      <button
        v-for="provider in providers"
        :key="provider.id"
        type="button"
        :data-auth-provider="provider.id"
        :class="['w-full rounded-full px-4 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500', toneClass(provider.tone)]"
        @click="emit('provider', provider.id)"
      >{{ provider.label }}</button>
    </div>
    <div class="my-4 flex items-center gap-3">
      <span class="h-px flex-1 bg-zinc-200 dark:bg-zinc-700" />
      <span class="text-xs text-zinc-400">{{ dividerText }}</span>
      <span class="h-px flex-1 bg-zinc-200 dark:bg-zinc-700" />
    </div>
    <button
      v-if="secondaryAction"
      type="button"
      data-auth-secondary
      class="w-full rounded-full border border-zinc-300 px-4 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
      @click="secondaryAction.onClick?.()"
    >{{ secondaryAction.label }}</button>
    <button
      type="button"
      data-auth-skip
      class="mt-4 text-sm text-zinc-500 underline-offset-2 transition-colors hover:text-zinc-800 hover:underline dark:text-zinc-400 dark:hover:text-zinc-200"
      @click="emit('skip')"
    >{{ skipLabel }}</button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

export interface AuthGateProvider {
  id: string;
  label: string;
  tone?: 'white' | 'brand' | 'dark';
}

const props = withDefaults(
  defineProps<{
    title: string;
    providers?: AuthGateProvider[];
    secondaryAction?: { label: string; onClick?: () => void };
    dividerText?: string;
    skipLabel?: string;
  }>(),
  {
    providers: () => [
      { id: 'google', label: 'Continue with Google', tone: 'white' as const },
      { id: 'facebook', label: 'Continue with Facebook', tone: 'brand' as const },
      { id: 'apple', label: 'Continue with Apple', tone: 'dark' as const },
    ],
    secondaryAction: undefined,
    dividerText: 'or',
    skipLabel: 'Not now',
  },
);

const emit = defineEmits<{
  (e: 'provider', id: string): void;
  (e: 'skip'): void;
}>();

const providers = computed(() => props.providers);

const TONE_CLASS: Record<string, string> = {
  white: 'border border-zinc-300 bg-white text-zinc-800 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100',
  brand: 'bg-[#1877F2] text-white hover:bg-[#166fe0]',
  dark: 'bg-zinc-900 text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900',
};

const toneClass = (tone?: string) => TONE_CLASS[tone || 'white'];
</script>
