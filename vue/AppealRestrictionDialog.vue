<script setup lang="ts">
interface Props {
  open?: boolean;
  reasonTitle?: string;
  reasonDetail?: string;
  policyLabel?: string;
  appealLabel?: string;
  backLabel?: string;
}

const props = withDefaults(defineProps<Props>(), {
  open: true,
  reasonTitle: 'Unsafe Conduct',
  reasonDetail:
    'This content contains depictions, instructions for, or explanations of dangerous stunts by non-professionals.',
  policyLabel: 'Content Policy',
  appealLabel: 'Appeal',
  backLabel: 'Request another review',
});

const emit = defineEmits<{
  (e: 'appeal'): void;
  (e: 'close'): void;
  (e: 'back'): void;
}>();
</script>

<template>
  <div
    v-if="props.open"
    data-appeal-dialog
    role="dialog"
    aria-label="Request another review"
    class="w-full max-w-md overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-lg dark:border-zinc-700 dark:bg-zinc-900"
  >
    <div class="flex items-center justify-between px-5 pt-4">
      <button
        type="button"
        data-appeal-back
        aria-label="Go back"
        class="rounded p-1 text-zinc-500 transition-colors hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
        @click="emit('back')"
      >
        ←
      </button>
      <button
        type="button"
        data-appeal-close
        aria-label="Close"
        class="rounded p-1 text-zinc-500 transition-colors hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
        @click="emit('close')"
      >
        ✕
      </button>
    </div>

    <div class="px-5 pb-5 pt-2">
      <h3 data-appeal-title class="text-lg font-bold text-zinc-900 dark:text-zinc-50">
        {{ props.backLabel }}
      </h3>
      <p class="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
        If you disagree with the content restriction, you have 180 days to appeal.
      </p>

      <div data-appeal-reason class="mt-4 rounded-lg bg-zinc-50 px-4 py-3 dark:bg-zinc-800/60">
        <span class="text-xs font-bold text-zinc-900 dark:text-zinc-50">Reason</span>
        <p data-appeal-reason-title class="mt-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-200">
          {{ props.reasonTitle }}
        </p>
        <p data-appeal-reason-detail class="mt-1 text-[11px] leading-relaxed text-zinc-500 dark:text-zinc-400">
          {{ props.reasonDetail }}
        </p>
      </div>

      <div class="mt-4 flex items-center justify-between">
        <p class="text-xs text-zinc-500 dark:text-zinc-400">
          Read our
          <a href="#" class="font-semibold text-zinc-800 underline dark:text-zinc-200">{{ props.policyLabel }}</a>
        </p>
        <button
          type="button"
          data-appeal-submit
          class="rounded-md bg-rose-500 px-4 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-rose-400"
          @click="emit('appeal')"
        >
          {{ props.appealLabel }}
        </button>
      </div>
    </div>
  </div>
</template>
