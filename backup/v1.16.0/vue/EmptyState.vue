<template>
  <div class="flex flex-col items-center justify-center text-center px-6 py-12" :class="className">
    <div class="p-3 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 mb-4">
      <UiIcon :name="icon" :size="24" />
    </div>
    <div class="text-sm font-semibold text-zinc-800 dark:text-zinc-200">{{ title }}</div>
    <div v-if="description" class="mt-1 text-xs text-zinc-400 dark:text-zinc-500 max-w-xs">{{ description }}</div>
    <button
      v-if="actionLabel"
      type="button"
      class="mt-4 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-colors"
      @click="emit('action')"
    >
      {{ actionLabel }}
    </button>
  </div>
</template>

<script setup lang="ts">
import UiIcon from "./UiIcon.vue";

withDefaults(
  defineProps<{
    icon?: string;
    title: string;
    description?: string;
    actionLabel?: string;
    className?: string;
  }>(),
  { icon: "sparkles", className: "" }
);

const emit = defineEmits<{
  (e: "action"): void;
}>();
</script>
