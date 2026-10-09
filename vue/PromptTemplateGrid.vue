<template>
  <div v-if="templates.length > 0" class="grid grid-cols-1 sm:grid-cols-2 gap-3" :class="className">
    <button
      v-for="t in templates"
      :key="t.id"
      type="button"
      class="group flex flex-col text-left p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-md transition-all"
      @click="emit('use', t)"
    >
      <div class="flex items-center gap-2 w-full">
        <span class="text-sm font-medium text-zinc-800 dark:text-zinc-200 truncate">{{ t.title }}</span>
        <span
          v-if="t.tag"
          class="ml-auto px-1.5 py-0.5 rounded text-[10px] font-medium bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 shrink-0"
        >
          {{ t.tag }}
        </span>
      </div>
      <div v-if="t.description" class="mt-1 text-xs text-zinc-400 dark:text-zinc-500 line-clamp-2">{{ t.description }}</div>
      <div class="mt-2 flex items-center gap-1 text-[11px] font-medium text-indigo-600 dark:text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity">
        <UiIcon name="arrow-right" :size="12" />
        Use template
      </div>
    </button>
  </div>
</template>

<script setup lang="ts">
import UiIcon from "./UiIcon.vue";

export interface PromptTemplate {
  id: string | number;
  title: string;
  description?: string;
  prompt: string;
  tag?: string;
}

withDefaults(
  defineProps<{
    templates?: PromptTemplate[];
    className?: string;
  }>(),
  { templates: () => [], className: "" }
);

const emit = defineEmits<{
  (e: "use", template: PromptTemplate): void;
}>();
</script>
