<template>
  <div data-shortcut-sheet class="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
    <div class="flex items-center justify-between">
      <p class="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{{ title }}</p>
      <input
        v-if="searchable"
        data-shortcut-search
        type="text"
        :value="query"
        placeholder="Search…"
        class="w-32 rounded-md border border-zinc-200 bg-white px-2 py-1 text-xs text-zinc-700 placeholder:text-zinc-400 focus:border-indigo-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
        @input="query = ($event.target as HTMLInputElement).value"
      />
    </div>
    <div :class="['mt-2 grid gap-x-6', columns === 2 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1']">
      <div v-for="[section, entries] in sections" :key="section || 'default'" :data-shortcut-section="section || undefined" :class="columns === 2 ? 'sm:col-span-1' : ''">
        <p v-if="section" class="mt-2 text-[11px] font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">{{ section }}</p>
        <ul class="mt-1 space-y-0.5">
          <li
            v-for="entry in entries"
            :key="entry.id"
            :data-shortcut-row="entry.id"
            class="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-zinc-50 dark:hover:bg-zinc-800"
          >
            <span v-if="entry.icon" class="shrink-0 text-zinc-400 [&>svg]:h-4 [&>svg]:w-4" v-html="entry.icon" />
            <span class="min-w-0 flex-1 text-xs text-zinc-700 dark:text-zinc-200">
              {{ entry.label }}<code v-if="entry.hint" class="ml-1 rounded bg-indigo-50 px-1 font-mono text-[10px] text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-300">{{ entry.hint }}</code>
            </span>
            <span class="flex shrink-0 items-center gap-1">
              <kbd
                v-for="(key, i) in entry.keys"
                :key="`${entry.id}-${i}`"
                class="inline-flex min-w-[24px] items-center justify-center rounded-md border border-zinc-300 bg-zinc-50 px-1.5 py-0.5 text-[11px] font-medium text-zinc-600 shadow-[0_1px_0_0_rgba(0,0,0,0.06)] dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
              >{{ key }}</kbd>
            </span>
          </li>
        </ul>
      </div>
    </div>
    <p v-if="!sections.length" data-shortcut-empty class="py-6 text-center text-xs text-zinc-400">No shortcuts match “{{ query }}”.</p>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

export interface ShortcutEntry {
  id: string;
  icon?: string;
  label: string;
  hint?: string;
  keys: string[];
  section?: string;
}

const props = withDefaults(
  defineProps<{
    shortcuts: ShortcutEntry[];
    columns?: 1 | 2;
    title?: string;
    searchable?: boolean;
  }>(),
  { columns: 2, title: 'Shortcuts', searchable: false },
);

const query = ref('');

const sections = computed(() => {
  const needle = query.value.trim().toLowerCase();
  const filtered = needle
    ? props.shortcuts.filter((entry) => `${entry.label} ${entry.hint || ''} ${entry.keys.join(' ')}`.toLowerCase().includes(needle))
    : props.shortcuts;
  const map = new Map<string, ShortcutEntry[]>();
  for (const entry of filtered) {
    const key = entry.section || '';
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(entry);
  }
  return Array.from(map.entries());
});
</script>
