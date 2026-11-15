<template>
  <aside :class="`flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 ${className}`">
    <header class="flex items-center justify-between border-b border-zinc-100 px-4 py-3 dark:border-zinc-800">
      <h3 class="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{{ title }}</h3>
      <UiIcon name="sparkles" :size="14" class="text-amber-500" />
    </header>

    <p v-if="!entries.length" class="px-4 py-6 text-center text-xs text-zinc-400">{{ emptyText }}</p>
    <ol v-else class="flex-1 space-y-3 divide-y divide-zinc-50 overflow-y-auto px-4 py-3 dark:divide-zinc-800/60">
      <li v-for="entry in entries" :key="entry.id">
        <div :role="onSelect ? 'button' : undefined" :tabindex="onSelect ? 0 : undefined" class="text-left"
          @click="emit('select', entry)">
          <h4 class="text-xs font-semibold leading-snug text-zinc-800 dark:text-zinc-200">
            <span v-if="entry.badge"
              :class="`mr-1.5 inline-block rounded-full px-1.5 py-px align-middle font-medium text-[9.5px] ${TONE[entry.badgeTone || 'rose']}`">
              {{ entry.badge }}
            </span>
            {{ entry.title }}
          </h4>
          <p v-if="entry.detail" class="mt-1 text-[11px] leading-relaxed text-zinc-500 dark:text-zinc-400">{{ entry.detail }}</p>
        </div>
      </li>
    </ol>

    <footer v-if="footerLink" class="border-t border-zinc-100 text-center dark:border-zinc-800">
      <button type="button" @click="emit('footer-click')"
        class="w-full px-4 py-2.5 text-[11px] font-medium text-indigo-600 transition-colors hover:bg-indigo-50 hover:underline dark:text-indigo-400 dark:hover:bg-indigo-950/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-500">
        {{ footerLink }}
      </button>
    </footer>
  </aside>
</template>

<script setup lang="ts">
import UiIcon from './UiIcon.vue';

export interface ChangelogEntry {
  id: string | number;
  badge?: string;
  badgeTone?: 'rose' | 'emerald' | 'indigo' | 'amber';
  title: string;
  detail?: string;
}

withDefaults(
  defineProps<{
    title?: string;
    entries?: ChangelogEntry[];
    onSelect?: unknown;
    footerLink?: string;
    emptyText?: string;
    className?: string;
  }>(),
  { title: 'Latest updates', entries: () => [], emptyText: 'No updates yet' }
);

const emit = defineEmits<{
  (e: 'select', entry: ChangelogEntry): void;
  (e: 'footer-click'): void;
}>();

const TONE: Record<string, string> = {
  rose: 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300',
  emerald: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300',
  indigo: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300',
  amber: 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300',
};
</script>
