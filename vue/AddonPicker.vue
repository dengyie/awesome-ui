<script setup lang="ts">
export interface AddonOption {
  id: string;
  label: string;
  price?: string;
  disabled?: boolean;
  contactInstead?: boolean;
}
interface Props {
  title?: string;
  options: AddonOption[];
  selectedIds?: string[];
  totalLabel?: string;
  totalText?: string;
}
const props = withDefaults(defineProps<Props>(), {
  title: "Add-ons",
  selectedIds: () => [],
  totalLabel: "Estimated total",
});
const emit = defineEmits<{ (e: "change", selectedIds: string[]): void }>();

const isChecked = (id: string) => props.selectedIds.includes(id);
const toggle = (option: AddonOption) => {
  if (option.disabled) return;
  const next = isChecked(option.id)
    ? props.selectedIds.filter((x) => x !== option.id)
    : [...props.selectedIds, option.id];
  emit("change", next);
};
</script>

<template>
  <div data-addon-picker class="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
    <p class="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{{ title }}</p>
    <div class="mt-3 space-y-2">
      <label
        v-for="option in options"
        :key="option.id"
        :data-addon-row="option.id"
        class="flex cursor-pointer items-center justify-between rounded-md border px-3 py-2.5 transition-colors"
        :class="[
          isChecked(option.id)
            ? 'border-indigo-300 bg-indigo-50 dark:border-indigo-700 dark:bg-indigo-950/50'
            : 'border-zinc-200 hover:border-zinc-300 dark:border-zinc-800 dark:hover:border-zinc-700',
          option.disabled ? 'cursor-not-allowed opacity-60' : '',
        ]"
        @click.prevent="toggle(option)"
      >
        <span class="flex items-center gap-3">
          <span
            data-addon-check
            role="checkbox"
            :aria-checked="isChecked(option.id)"
            class="flex h-5 w-5 items-center justify-center rounded border transition-colors"
            :class="isChecked(option.id)
              ? 'border-indigo-600 bg-indigo-600 text-white'
              : 'border-zinc-300 bg-white text-transparent dark:border-zinc-600 dark:bg-zinc-800'"
          >
            <svg viewBox="0 0 20 20" fill="none" class="h-3 w-3" aria-hidden="true"><path d="m4.5 10.5 3.5 3.5 7.5-8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" /></svg>
          </span>
          <span class="text-sm font-medium text-zinc-800 dark:text-zinc-100">{{ option.label }}</span>
        </span>
        <a v-if="option.contactInstead" href="#" data-addon-contact class="text-xs font-semibold text-indigo-600 hover:underline dark:text-indigo-400">Let's talk</a>
        <span v-else data-addon-price class="text-xs text-zinc-500 dark:text-zinc-400">{{ option.price }}</span>
      </label>
    </div>
    <div v-if="totalText" class="mt-3 flex items-center justify-between border-t border-zinc-100 pt-3 text-sm dark:border-zinc-800">
      <span class="text-zinc-600 dark:text-zinc-300">{{ totalLabel }}</span>
      <span data-addon-total class="font-semibold text-zinc-900 dark:text-zinc-50">{{ totalText }}</span>
    </div>
  </div>
</template>
