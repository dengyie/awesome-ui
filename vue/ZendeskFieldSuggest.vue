<script setup lang="ts">
export interface ZendeskSuggestedField {
  id: string;
  label: string;
  value: string;
  confidence: number;
}

export interface ZendeskFieldSuggestProps {
  fields?: ZendeskSuggestedField[];
  class?: string;
}

const props = withDefaults(defineProps<ZendeskFieldSuggestProps>(), {
  fields: () => [
    { id: "f1", label: "Priority", value: "Urgent", confidence: 0.94 },
    { id: "f2", label: "Type", value: "Incident", confidence: 0.87 },
    { id: "f3", label: "Group", value: "Payments", confidence: 0.72 },
  ],
  class: "",
});
defineEmits(["apply", "dismiss"]);
</script>

<template>
  <div data-zendesk-field-suggest class="w-full rounded-xl border border-amber-200 bg-amber-50 p-3 shadow-sm dark:border-amber-800 dark:bg-amber-950/40" :class="props.class">
    <p data-zendesk-suggest-label class="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-300">
      <span aria-hidden="true">✦</span>
      Suggested fields
    </p>
    <div data-zendesk-suggest-fields class="mt-2 flex flex-wrap gap-1.5">
      <button
        v-for="field in props.fields"
        :key="field.id"
        type="button"
        :data-zendesk-suggest-field="field.id"
        class="inline-flex items-center gap-1.5 rounded-full border border-amber-300 bg-white px-2.5 py-1 text-[11px] font-medium text-zinc-800 transition-colors hover:border-amber-400 hover:bg-amber-100 dark:border-amber-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-amber-900/40"
        @click="$emit('apply', field)"
      >
        <span class="text-zinc-500 dark:text-zinc-400">{{ field.label }}:</span>
        <span>{{ field.value }}</span>
        <span class="font-mono text-[9px] text-amber-600 dark:text-amber-400">{{ Math.round(field.confidence * 100) }}%</span>
      </button>
    </div>
    <div class="mt-2.5 flex items-center justify-end gap-2">
      <button type="button" data-zendesk-suggest-dismiss class="rounded-md px-2.5 py-1 text-[11px] font-medium text-zinc-500 transition-colors hover:bg-amber-100 hover:text-zinc-700 dark:text-zinc-400 dark:hover:bg-amber-900/40" @click="$emit('dismiss')">
        Ignore
      </button>
    </div>
  </div>
</template>
