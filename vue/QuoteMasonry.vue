<template>
  <div v-if="quotes.length" data-quote-masonry class="columns-1 gap-4 sm:columns-2 lg:columns-3 [column-fill:balance]" :class="className">
    <figure
      v-for="(card, index) in quotes"
      :key="`${card.name}-${index}`"
      :data-quote-index="index"
      class="mb-4 break-inside-avoid rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900"
    >
      <span v-if="card.marked !== false" aria-hidden="true" class="block text-3xl font-black leading-none text-zinc-200 dark:text-zinc-700">&ldquo;</span>
      <blockquote class="text-sm leading-relaxed text-zinc-700 dark:text-zinc-200" :class="card.marked !== false ? '-mt-2' : ''">
        {{ card.quote }}
      </blockquote>
      <figcaption class="mt-4 flex items-end justify-between gap-3 border-t border-zinc-100 pt-3 dark:border-zinc-800">
        <span class="min-w-0">
          <span class="block truncate text-xs font-semibold uppercase tracking-wide text-zinc-900 dark:text-zinc-50">{{ card.name }}</span>
          <span v-if="card.role || card.company" class="mt-0.5 block truncate text-[11px] text-zinc-400">
            {{ [card.role, card.company].filter(Boolean).join(' · ') }}
          </span>
        </span>
        <span
          v-if="card.company"
          class="shrink-0 rounded-md bg-zinc-100 px-2 py-1 font-mono text-[10px] font-bold uppercase text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
        >
          {{ card.company }}
        </span>
      </figcaption>
    </figure>
  </div>
</template>

<script setup lang="ts">
export interface QuoteCard {
  quote: string;
  name: string;
  role?: string;
  company?: string;
  marked?: boolean;
}

withDefaults(
  defineProps<{
    quotes?: QuoteCard[];
    className?: string;
  }>(),
  { quotes: () => [], className: '' },
);
</script>
