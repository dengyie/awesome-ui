<script setup lang="ts">
export interface AiSuggestionCardProps {
  message?: string;
  chips?: string[];
  class?: string;
}

const props = withDefaults(defineProps<AiSuggestionCardProps>(), {
  message: "Looking ahead to tomorrow in Tokyo. Want a quick rundown of the plan and a weather check?",
  chips: () => ["Weather for tomorrow", "Summarize tomorrow", "View Senso-ji details"],
  class: "",
});
defineEmits(["chip-click", "close"]);
</script>

<template>
  <div data-ai-suggestion-card class="w-full rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900" :class="props.class">
    <div class="flex items-start gap-3">
      <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-sm text-zinc-50 dark:bg-zinc-50 dark:text-zinc-900">✦</span>
      <p data-ai-suggestion-message class="flex-1 text-sm font-medium leading-relaxed text-zinc-900 dark:text-zinc-50">{{ props.message }}</p>
      <button
        type="button"
        data-ai-suggestion-close
        aria-label="Dismiss suggestion"
        class="-mr-1 -mt-1 rounded-md p-1 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
        @click="$emit('close')"
      >
        ✕
      </button>
    </div>
    <div v-if="props.chips.length" class="mt-3 flex flex-wrap gap-2">
      <button
        v-for="chip in props.chips"
        :key="chip"
        type="button"
        data-ai-suggestion-chip
        class="rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800/60 dark:text-zinc-200 dark:hover:bg-zinc-800"
        @click="$emit('chip-click', chip)"
      >
        {{ chip }}
      </button>
    </div>
  </div>
</template>
