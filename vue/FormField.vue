<template>
  <div
    data-form-field
    :class="`flex flex-col gap-1.5 ${className}`"
    :aria-invalid="error ? 'true' : undefined"
  >
    <label
      :for="htmlFor"
      class="flex items-center gap-1.5 text-sm font-medium text-zinc-800 dark:text-zinc-200"
    >
      <span v-if="required" aria-hidden="true" class="text-rose-500">*</span>
      {{ label }}
      <span v-if="optional" class="text-xs font-normal text-zinc-400">(Optional)</span>
    </label>
    <slot />
    <p
      v-if="error"
      class="flex items-center gap-1 text-xs font-medium text-rose-600 dark:text-rose-400"
    >
      <UiIcon name="alert-triangle" :size="12" />
      {{ error }}
    </p>
    <p v-else-if="hint" class="text-xs text-zinc-400">{{ hint }}</p>
    <p v-if="counter" class="self-end text-xs tabular-nums text-zinc-400">
      {{ counter.value }}/{{ counter.max }}
    </p>
    <p v-if="helperFooter" class="text-xs text-zinc-400">{{ helperFooter }}</p>
  </div>
</template>

<script setup lang="ts">
import UiIcon from './UiIcon.vue';

export interface FormFieldCounter {
  value: number;
  max: number;
}

withDefaults(
  defineProps<{
    label: string;
    htmlFor?: string;
    required?: boolean;
    optional?: boolean;
    hint?: string;
    error?: string;
    counter?: FormFieldCounter;
    helperFooter?: string;
    className?: string;
  }>(),
  { required: false, optional: false, className: '' }
);
</script>
