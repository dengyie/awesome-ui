<script setup lang="ts">
export interface ModelPricing {
  inputPerMillion?: number;
  outputPerMillion?: number;
}

interface Props {
  modelName: string;
  modelId?: string;
  pricing?: ModelPricing;
  currency?: string;
}

const props = withDefaults(defineProps<Props>(), {
  modelId: '',
  pricing: () => ({}),
  currency: 'USD',
});

const emit = defineEmits<{
  (e: 'copy-id', modelId: string): void;
}>();

const fmtPrice = (value: number | undefined) =>
  typeof value === 'number' ? `$ ${value.toFixed(2)} / million tokens` : '—';
</script>

<template>
  <div
    data-model-pricing-card
    class="w-full rounded-lg border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900"
  >
    <h4 data-model-pricing-name class="font-mono text-sm font-bold text-zinc-900 dark:text-zinc-50">
      {{ props.modelName }}
    </h4>
    <dl class="mt-3 space-y-2.5 text-xs">
      <div class="flex items-center justify-between gap-3 border-b border-zinc-100 pb-2.5 dark:border-zinc-800">
        <dt class="shrink-0 text-zinc-500 dark:text-zinc-400">Model ID</dt>
        <dd data-model-pricing-id class="flex min-w-0 items-center gap-1.5 font-mono text-zinc-800 dark:text-zinc-200">
          <span class="truncate">{{ props.modelId || '—' }}</span>
          <button
            v-if="props.modelId"
            type="button"
            data-model-pricing-copy
            aria-label="Copy model ID"
            class="shrink-0 rounded p-0.5 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
            @click="emit('copy-id', props.modelId)"
          >
            ⧉
          </button>
        </dd>
      </div>
      <div data-model-pricing-input class="flex items-center justify-between gap-3 border-b border-zinc-100 pb-2.5 dark:border-zinc-800">
        <dt class="text-zinc-500 dark:text-zinc-400">Input pricing</dt>
        <dd class="font-mono tabular-nums text-zinc-800 dark:text-zinc-200">
          {{ fmtPrice(props.pricing?.inputPerMillion) }}
        </dd>
      </div>
      <div data-model-pricing-output class="flex items-center justify-between gap-3">
        <dt class="text-zinc-500 dark:text-zinc-400">Output pricing</dt>
        <dd class="font-mono tabular-nums text-zinc-800 dark:text-zinc-200">
          {{ fmtPrice(props.pricing?.outputPerMillion) }}
        </dd>
      </div>
    </dl>
  </div>
</template>
