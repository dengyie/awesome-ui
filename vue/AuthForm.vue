<template>
  <div :class="$attrs.class"
    class="w-full max-w-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6">
    <div class="text-base font-semibold text-zinc-900 dark:text-zinc-100">
      {{ title || (isSignup ? 'Create your account' : 'Welcome back') }}
    </div>
    <div class="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
      {{ subtitle || (isSignup ? 'Start free, no card required.' : 'Sign in to continue to your workspace.') }}
    </div>

    <div v-if="providers.length" class="mt-5 space-y-2">
      <button v-for="provider in providers" :key="provider.name" type="button"
        class="flex w-full items-center justify-center gap-2 rounded-lg border border-zinc-200 dark:border-zinc-700 px-4 py-2 text-xs font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        @click="emit('provider', provider)">
        <img v-if="provider.icon" :src="provider.icon" alt="" class="h-4 w-4 shrink-0" />
        <span v-else
          class="flex h-4 w-4 shrink-0 items-center justify-center rounded bg-zinc-100 dark:bg-zinc-800 text-[10px] font-semibold text-zinc-500 dark:text-zinc-400">
          {{ providerFallback(provider.name) }}
        </span>
        <span>Continue with {{ provider.name }}</span>
      </button>
    </div>

    <div v-if="providers.length" class="my-5 flex items-center gap-3">
      <span class="h-px flex-1 bg-zinc-100 dark:bg-zinc-800" />
      <span class="text-[11px] text-zinc-400 dark:text-zinc-500">or</span>
      <span class="h-px flex-1 bg-zinc-100 dark:bg-zinc-800" />
    </div>

    <form :class="providers.length ? 'space-y-3' : 'mt-5 space-y-3'" novalidate @submit.prevent="handleSubmit">
      <label v-if="isSignup" class="block">
        <span class="mb-1 block text-[11px] font-medium text-zinc-600 dark:text-zinc-300">Name</span>
        <input v-model="name" type="text" name="name" autocomplete="name" placeholder="Ada Lovelace" :class="inputClass" />
      </label>

      <label class="block">
        <span class="mb-1 block text-[11px] font-medium text-zinc-600 dark:text-zinc-300">Email</span>
        <input v-model="email" type="email" name="email" autocomplete="email" placeholder="you@company.com"
          :class="inputClass" />
      </label>

      <label class="block">
        <span class="mb-1 block text-[11px] font-medium text-zinc-600 dark:text-zinc-300">Password</span>
        <input v-model="password" type="password" name="password"
          :autocomplete="isSignup ? 'new-password' : 'current-password'" placeholder="••••••••" :class="inputClass" />
      </label>

      <div v-if="error" role="alert" class="flex items-start gap-2 rounded-lg bg-red-50 dark:bg-red-950/40 px-3 py-2">
        <UiIcon name="alert-triangle" :size="14" class="mt-0.5 shrink-0 text-red-500" />
        <span class="text-[11px] leading-relaxed text-red-600 dark:text-red-400">{{ error }}</span>
      </div>

      <button type="submit" :disabled="loading"
        class="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-zinc-900">
        <UiIcon v-if="loading" name="loader" :size="14" class="animate-spin" />
        {{ submitText || (isSignup ? 'Create account' : 'Sign in') }}
      </button>
    </form>

    <button v-if="footerText" type="button"
      class="mt-4 w-full text-center text-[11px] text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
      @click="emit('footer')">
      {{ footerText }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import UiIcon from './UiIcon.vue';

export interface AuthProvider { name: string; icon?: string }
export interface AuthSubmitPayload { name?: string; email: string; password: string }

const props = withDefaults(defineProps<{
  mode?: 'signin' | 'signup';
  providers?: AuthProvider[];
  loading?: boolean;
  error?: string;
  title?: string;
  subtitle?: string;
  submitText?: string;
  footerText?: string;
}>(), { mode: 'signin', providers: () => [], loading: false });

const emit = defineEmits<{
  (e: 'submit', payload: AuthSubmitPayload): void;
  (e: 'provider', provider: AuthProvider): void;
  (e: 'footer'): void;
}>();

const name = ref('');
const email = ref('');
const password = ref('');
const isSignup = computed(() => props.mode === 'signup');
const providerFallback = (value: string) => (value || '?').trim().charAt(0).toUpperCase();

const inputClass =
  'w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:border-indigo-500 transition-colors';

const handleSubmit = () => {
  if (props.loading) return;
  emit('submit', { ...(isSignup.value ? { name: name.value } : {}), email: email.value, password: password.value });
};
</script>
