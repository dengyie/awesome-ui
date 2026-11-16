<script setup lang="ts">
export type ChangelogTagTone = "sky" | "emerald" | "amber" | "violet";

export interface ChangelogEntry {
  id: string;
  date: string;
  tag: string;
  tone?: ChangelogTagTone;
  title: string;
  body: string;
  likes?: number;
  views?: number;
}

export interface ChangelogTimelineProps {
  title?: string;
  subtitle?: string;
  searchPlaceholder?: string;
  filterLabel?: string;
  entries?: ChangelogEntry[];
  class?: string;
}
const props = withDefaults(defineProps<ChangelogTimelineProps>(), {
  title: "Changelog",
  subtitle: "Follow up on the latest improvements and updates.",
  searchPlaceholder: "Search entries...",
  filterLabel: "Filters",
  entries: () => [
    {
      id: "c1",
      date: "Nov 15, 2026",
      tag: "Improved",
      tone: "sky",
      title: "Dashboard widgets now reflow smoothly on every screen size",
      body: "The home grid previously felt cramped on narrower viewports. We shipped a layout pass that makes widget reads 40% faster and keeps the most important metric pinned in view — no more unnecessary scrolling. Thanks to everyone who sent feedback!",
      likes: 24,
      views: 1832,
    },
    {
      id: "c2",
      date: "Nov 12, 2026",
      tag: "New",
      tone: "emerald",
      title: "Skip the onboarding tour when you return",
      body: "Most of you already know your way around, and returning on a new device shouldn't mean retaking the product tour. The first-run checklist now collapses into a single card and can be reopened any time from Help.",
      likes: 61,
      views: 2914,
    },
    {
      id: "c3",
      date: "Nov 8, 2026",
      tag: "Fixed",
      tone: "amber",
      title: "CSV export no longer drops trailing rows",
      body: "Exports with exactly 1000 rows were truncated by an off-by-one pagination guard. Full rows now land in the file, and the download toast confirms the row count.",
      likes: 12,
      views: 764,
    },
  ],
  class: "",
});
const emit = defineEmits(["entry-click"]);

const TONE_STYLES: Record<ChangelogTagTone, string> = {
  sky: "bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300",
  emerald: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300",
  amber: "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300",
  violet: "bg-violet-50 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300",
};
const toneFor = (tone?: ChangelogTagTone) => TONE_STYLES[tone ?? "sky"];
</script>

<template>
  <div data-changelog class="w-full rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900" :class="props.class">
    <div data-changelog-header class="px-5 pb-3 pt-5">
      <p data-changelog-title class="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">{{ props.title }}</p>
      <p data-changelog-subtitle class="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{{ props.subtitle }}</p>
    </div>
    <div data-changelog-controls class="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-100 px-5 pb-3 dark:border-zinc-800">
      <label data-changelog-search class="flex w-full max-w-sm items-center gap-2 rounded-lg border border-zinc-200 px-3 py-1.5 text-sm text-zinc-400 transition-colors focus-within:border-zinc-400 dark:border-zinc-700 dark:focus-within:border-zinc-500">
        <span aria-hidden="true">⌕</span>
        <input type="text" :placeholder="props.searchPlaceholder" class="w-full bg-transparent text-zinc-800 outline-none placeholder:text-zinc-400 dark:text-zinc-100 dark:placeholder:text-zinc-500" />
      </label>
      <button data-changelog-filter type="button" class="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800">
        <span aria-hidden="true">⚙</span> {{ props.filterLabel }} <span class="text-zinc-400" aria-hidden="true">▾</span>
      </button>
    </div>
    <ol data-changelog-list class="flex flex-col px-5">
      <li
        v-for="(entry, i) in props.entries"
        :key="entry.id"
        :data-changelog-entry="entry.id"
        tabindex="0"
        :class="[
          'grid cursor-pointer grid-cols-[7rem_1fr] gap-4 py-4 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/40',
          i < props.entries.length - 1 ? 'border-b border-zinc-100 dark:border-zinc-800' : '',
        ]"
        @click="emit('entry-click', entry)"
      >
        <div class="text-xs text-zinc-500 dark:text-zinc-400">
          <time :data-changelog-date="entry.date">{{ entry.date }}</time>
        </div>
        <article>
          <span :data-changelog-tag="entry.tag" class="inline-block rounded-full px-2 py-0.5 text-[11px] font-medium" :class="toneFor(entry.tone)">
            {{ entry.tag }}
          </span>
          <h3 :data-changelog-entry-title="entry.title" class="mt-1.5 text-base font-semibold text-zinc-900 dark:text-zinc-50">{{ entry.title }}</h3>
          <p :data-changelog-entry-body="entry.title" class="mt-1 text-sm leading-6 text-zinc-600 dark:text-zinc-300">{{ entry.body }}</p>
          <div :data-changelog-meta="entry.title" class="mt-2 flex items-center gap-3 text-xs text-zinc-400 dark:text-zinc-500">
            <span :data-changelog-likes="entry.likes ?? 0" class="inline-flex items-center gap-1">♡ {{ entry.likes ?? 0 }}</span>
            <span :data-changelog-views="entry.views ?? 0" class="inline-flex items-center gap-1">👁 {{ entry.views ?? 0 }}</span>
            <span class="inline-flex items-center gap-1" aria-hidden="true">🔗 Share</span>
          </div>
        </article>
      </li>
    </ol>
  </div>
</template>
