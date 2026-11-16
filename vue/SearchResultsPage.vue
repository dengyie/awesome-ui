<script setup lang="ts">
import { ref } from "vue";

export interface SearchResultEntry {
  id: string;
  title: string;
  space: string;
  type: string;
  author: string;
  updated: string;
  snippet: string;
}

export interface SearchResultsPageProps {
  query?: string;
  filterSelects?: { id: string; label: string; options?: string[] }[];
  relatedSearches?: string[];
  results?: SearchResultEntry[];
  class?: string;
}

const props = withDefaults(defineProps<SearchResultsPageProps>(), {
  query: "brainstorming",
  filterSelects: () => [
    { id: "updated", label: "Last updated", options: ["Last updated", "Created", "Relevance"] },
    { id: "type", label: "Type", options: ["Type", "Page", "Blog", "File"] },
    { id: "contributor", label: "Contributor", options: ["Contributor", "Anyone", "Me"] },
  ],
  relatedSearches: () => ["brainstorming techniques", "brainstorming ideas", "brainstorming strategies", "brainstorming sessions", "brainstorming methods", "brainstorming activities"],
  results: () => [
    {
      id: "s1",
      title: "Design",
      space: "Confluence",
      type: "Page",
      author: "Design",
      updated: "Updated 8 days ago",
      snippet: "…Welcome to your design team space! You're in the space overview. It's what visitors first see, like a landing page for your space · Click ✏️ Edit to customize your overview · A space contains pages. Create…",
    },
    {
      id: "s2",
      title: "Sam Design Guideline Document",
      space: "Confluence",
      type: "Page",
      author: "Sam Lee",
      updated: "Updated 21 hours ago",
      snippet: "…Purpose · This document ensures visual consistency, usability, and brand alignment across all NimbusTech products and platforms. · Typography · Primary Font: Inter · Headings: Bold, sentence case · Body Text:…",
    },
    {
      id: "s3",
      title: "Template - How-to guide",
      space: "Confluence",
      type: "Page",
      author: "Sam Lee",
      updated: "Updated 23 hours ago",
      snippet: "…Instructions · Highlight important information in a panel like this one. To edit this panel's color or style, select one of the options in the menu. · Related articles…",
    },
    {
      id: "s4",
      title: "Template - Design Systems",
      space: "Confluence",
      type: "Page",
      author: "Design",
      updated: "Updated 8 days ago",
      snippet: "…This template is brought to you by InVision, a digital product design platform. · Design · Getting started · Design principles · Principle one · Principle two · Principle three · Visual language · Color…",
    },
    {
      id: "s5",
      title: "Overview",
      space: "Confluence",
      type: "Page",
      author: "John Smith",
      updated: "Updated 8 days ago",
      snippet: "…Use this overview to onboard new teammates: mission, current projects, rituals and links to the most-used templates and guidelines…",
    },
  ],
  class: "",
});

const emit = defineEmits(["search-submit", "filter-change", "related-click", "result-click"]);

const term = ref(props.query);
const picked = ref<Record<string, string>>(Object.fromEntries(props.filterSelects.map((f) => [f.id, f.label])));

const submit = () => emit("search-submit", term.value);
</script>

<template>
  <div data-srchres class="w-full rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900" :class="props.class">
    <div data-srchres-topbar class="flex items-center gap-3 border-b border-zinc-200 px-5 py-3 dark:border-zinc-800">
      <div class="flex flex-1 items-center gap-2 rounded-lg border border-zinc-300 px-3 py-1.5 focus-within:ring-2 focus-within:ring-blue-500/40 dark:border-zinc-600">
        <span aria-hidden="true" class="text-zinc-400">⌕</span>
        <input data-srchres-input v-model="term" type="text" class="w-full bg-transparent text-sm text-zinc-800 outline-none dark:text-zinc-100" aria-label="Search" @keydown.enter="submit" />
      </div>
      <button data-srchres-submit type="button" class="rounded-lg bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-blue-700" @click="submit">Search</button>
    </div>

    <div data-srchres-filters class="flex flex-wrap items-center gap-2 border-b border-zinc-200 px-5 py-3 dark:border-zinc-800">
      <select
        v-for="f in props.filterSelects"
        :key="f.id"
        :data-srchres-filter="f.id"
        v-model="picked[f.id]"
        class="rounded-lg border border-zinc-300 bg-white px-2.5 py-1.5 text-xs font-medium text-zinc-600 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
        @change="emit('filter-change', f.id, picked[f.id])"
      >
        <option v-for="o in f.options ?? [f.label]" :key="o" :value="o">{{ o }}</option>
      </select>
      <span class="ml-auto text-xs text-zinc-400 dark:text-zinc-500">{{ props.results.length }} results</span>
    </div>

    <div class="px-5 py-4">
      <p data-srchres-related-heading class="text-sm font-bold text-zinc-900 dark:text-zinc-50">Related searches</p>
      <div data-srchres-related class="mt-3 grid gap-2 sm:grid-cols-2">
        <button
          v-for="rs in props.relatedSearches"
          :key="rs"
          :data-srchres-related-chip="rs"
          type="button"
          class="flex items-center gap-2 rounded-full bg-zinc-100 px-4 py-2 text-left text-sm text-zinc-700 transition-colors hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
          @click="emit('related-click', rs)"
        >
          <span aria-hidden="true" class="text-zinc-400">⌕</span>
          <span class="truncate">{{ rs }}</span>
        </button>
      </div>

      <div data-srchres-results class="mt-6 space-y-6">
        <article v-for="r in props.results" :key="r.id" :data-srchres-result="r.id" class="group">
          <button type="button" class="block w-full text-left" @click="emit('result-click', r)">
            <h3 :data-srchres-result-title="r.id" class="text-base font-semibold text-blue-600 group-hover:underline dark:text-blue-400">{{ r.title }}</h3>
          </button>
          <p class="mt-1 flex flex-wrap items-center gap-x-1.5 text-xs text-zinc-500 dark:text-zinc-400">
            <span :data-srchres-result-space="r.id" class="font-medium">{{ r.space }}</span>
            <span aria-hidden="true">•</span>
            <span>{{ r.type }}</span>
            <span aria-hidden="true">•</span>
            <span>{{ r.author }}</span>
            <span aria-hidden="true">•</span>
            <span>{{ r.updated }}</span>
          </p>
          <p class="mt-1.5 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">{{ r.snippet }}</p>
        </article>
      </div>
    </div>
  </div>
</template>
