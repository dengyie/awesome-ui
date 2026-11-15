<template>
  <div class="w-full max-w-sm" data-otp-input>
    <h2 v-if="heading" class="text-lg font-bold text-zinc-900 dark:text-zinc-50">{{ heading }}</h2>
    <p v-if="subtext" class="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{{ subtext }}</p>

    <div :class="['flex gap-1.5', heading || subtext ? 'mt-4' : '']" data-otp-cells>
      <input
        v-for="(char, index) in chars"
        :key="index"
        :ref="(node) => { cellRefs[index] = node }"
        type="text"
        inputmode="numeric"
        maxlength="1"
        :value="char"
        :aria-label="`Digit ${index + 1}`"
        :data-otp-cell="index"
        :class="cellClass(Boolean(char))"
        @input="onInput(index, $event)"
        @keydown.backspace.prevent="onBackspace(index)"
        @paste="onPaste(index, $event)"
      />
    </div>

    <p v-if="status === 'error' && errorText" data-otp-error class="mt-3 flex items-center gap-1.5 text-xs font-medium text-rose-600 dark:text-rose-400">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-3.5 w-3.5">
        <path d="m10.29 3.86 1.58-2.75a1 1 0 0 1 1.74 0l1.58 2.75 3.18.55a1 1 0 0 1 .6 1.62l-2.2 2.5 2.2 2.5a1 1 0 0 1-.6 1.62l-3.18.55-1.58 2.75a1 1 0 0 1-1.74 0l-1.58-2.75-3.18-.55a1 1 0 0 1-.6-1.62l2.2-2.5-2.2-2.5a1 1 0 0 1 .6-1.62Z" />
        <path d="M12 9v4M12 17h.01" />
      </svg>
      {{ errorText }}
    </p>

    <button type="button" data-otp-continue class="mt-4 w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500">
      {{ continueLabel }}
    </button>

    <p v-if="resendHint" class="mt-3 text-center text-xs text-zinc-500 dark:text-zinc-400">
      <a href="#" data-otp-resend class="font-medium text-indigo-600 underline-offset-2 hover:underline dark:text-indigo-400">Resend code</a>
      · {{ resendHint }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

const props = withDefaults(
  defineProps<{
    length?: number;
    value?: string;
    heading?: string;
    subtext?: string;
    status?: 'idle' | 'error';
    errorText?: string;
    continueLabel?: string;
    resendHint?: string;
  }>(),
  { length: 6, value: '', heading: '', subtext: '', status: 'idle', errorText: '', continueLabel: 'Continue', resendHint: '' },
);

const emit = defineEmits<{
  (e: 'change', value: string): void;
  (e: 'complete', value: string): void;
}>();

const cellRefs = ref<HTMLInputElement[]>([]);
const chars = computed(() => Array.from({ length: props.length }, (_, i) => props.value[i] ?? ''));

const commit = (next: string) => {
  emit('change', next);
  if (next.length >= props.length) emit('complete', next.slice(0, props.length));
};

const setAt = (index: number, char: string) => {
  const digits = chars.value.slice();
  digits[index] = char;
  commit(digits.join('').slice(0, props.length));
};

const cellClass = (filled: boolean) =>
  `h-12 w-11 rounded-lg border text-center text-lg font-semibold tabular-nums transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
    props.status === 'error'
      ? 'border-rose-400 bg-rose-50/60 text-rose-700 dark:border-rose-500/70 dark:bg-rose-950/40 dark:text-rose-200'
      : filled
        ? 'border-zinc-300 bg-white text-zinc-900 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50'
        : 'border-zinc-300 bg-white text-zinc-400 placeholder:text-zinc-300 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-500'
  }`;

const onInput = (index: number, event: Event) => {
  const char = (event.target as HTMLInputElement).value.replace(/\D/g, '').slice(-1);
  if (!char) return;
  setAt(index, char);
  cellRefs.value[Math.min(index + 1, props.length - 1)]?.focus();
};

const onBackspace = (index: number) => {
  if (chars.value[index]) {
    setAt(index, '');
  } else if (index > 0) {
    setAt(index - 1, '');
    cellRefs.value[index - 1]?.focus();
  }
};

const onPaste = (index: number, event: ClipboardEvent) => {
  const pasted = event.clipboardData?.getData('text').replace(/\D/g, '').slice(0, props.length) ?? '';
  if (pasted.length > 1) {
    event.preventDefault();
    commit(pasted);
    cellRefs.value[Math.min(pasted.length, props.length - 1)]?.focus();
  }
};
</script>
