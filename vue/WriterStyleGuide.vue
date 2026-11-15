<script setup lang="ts">
export interface WriterGuideEntry {
  id: string;
  title: string;
  description: string;
  minutes: number;
}

export interface WriterStyleGuideProps {
  entries?: WriterGuideEntry[];
  activeTab?: "company" | "team" | "my";
  class?: string;
}

const props = withDefaults(defineProps<WriterStyleGuideProps>(), {
  entries: () => [
    { id: "g1", title: "Don't use passive voice", description: "It dilutes meaning and bloats sentences.", minutes: 3 },
    { id: "g2", title: "Use contracted forms", description: "Write \"can't\" instead of \"cannot\" for a friendly tone.", minutes: 2 },
    { id: "g3", title: "Upper Kebab case for products", description: "Product names use Upper Kebab case.", minutes: 4 },
  ],
  activeTab: "company",
  class: "",
});
defineEmits(["tab-change", "entry-click"]);

const tabs: Array<{ id: "company" | "team" | "my"; label: string }> = [
  { id: "company", label: "Company" },
  { id: "team", label: "Team" },
  { id: "my", label: "My" },
];
</script>

<template>
  <div data-writer-style-guide class="w-full rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900" :class="props.class">
    <div data-writer-tabs class="flex items-center gap-1 border-b border-zinc-200 px-4 pt-3 dark:border-zinc-800">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        type="button"
        :data-writer-tab="tab.id"
        :class="['rounded-t-md px-3 py-2 text-xs font-medium transition-colors', props.activeTab === tab.id ? 'border-b-2 border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-b-2 border-transparent text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200']"
        @click="$emit('tab-change', tab.id)"
      >
        {{ tab.label }}
      </button>
    </div>
    <div class="p-4">
      <div data-writer-entries class="space-y-3">
        <button
          v-for="(entry, index) in props.entries"
          :key="entry.id"
          type="button"
          :data-writer-entry="entry.id"
          class="flex w-full items-start gap-3 rounded-lg p-2 text-left transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800"
          @click="$emit('entry-click', entry)"
        >
          <span class="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-[10px] font-semibold text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-300">{{ index + 1 }}</span>
          <span class="min-w-0 flex-1">
            <span data-writer-entry-title class="block text-xs font-medium text-zinc-900 dark:text-zinc-50">{{ entry.title }}</span>
            <span data-writer-entry-desc class="mt-0.5 block text-[11px] leading-relaxed text-zinc-500 dark:text-zinc-400">{{ entry.description }}</span>
          </span>
          <span data-writer-entry-minutes class="shrink-0 text-[10px] font-medium text-zinc-400 dark:text-zinc-500">{{ entry.minutes }} min</span>
        </button>
      </div>
      <button type="button" data-writer-add class="mt-3 w-full rounded-lg border border-dashed border-zinc-300 py-2 text-xs font-medium text-zinc-500 transition-colors hover:border-indigo-300 hover:text-indigo-600 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-indigo-700 dark:hover:text-indigo-400">
        + Add guideline
      </button>
    </div>
  </div>
</template>
