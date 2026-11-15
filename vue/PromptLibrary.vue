<template>
  <div class="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900" :class="$attrs.class">
    <div class="flex flex-col gap-2 border-b border-zinc-100 p-3 dark:border-zinc-800 sm:flex-row sm:items-center">
      <div class="flex items-center gap-1.5 text-zinc-800 dark:text-zinc-100">
        <UiIcon name="sparkles" :size="14" class="text-indigo-600 dark:text-indigo-400" />
        <h3 class="text-xs font-semibold">Prompt library</h3>
        <span class="rounded-full bg-zinc-100 px-1.5 py-0.5 text-[10px] font-medium tabular-nums text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">{{ visible.length }}</span>
      </div>
      <div v-if="searchable" class="relative sm:ml-auto sm:w-56">
        <UiIcon name="search" :size="12" class="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-zinc-400" />
        <input type="search" v-model="query" placeholder="Search prompts…" aria-label="Search prompts"
          class="w-full rounded-lg border border-zinc-200 bg-white py-1 pl-6 pr-2 text-[11px] text-zinc-700 placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200" />
      </div>
    </div>

    <div class="flex flex-wrap gap-1 border-b border-zinc-100 px-3 py-2 dark:border-zinc-800">
      <button v-for="category in categoryOptions" :key="category" type="button" :aria-pressed="activeCategory === category"
        @click="activeCategory = category"
        :class="['rounded-full px-2 py-0.5 text-[10px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500',
          activeCategory === category ? 'bg-indigo-600 text-white' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700']">
        {{ category === 'all' ? 'All' : category }}
      </button>
    </div>

    <p v-if="visible.length === 0" class="px-3 py-8 text-center text-[11px] text-zinc-400">No prompts match your filters.</p>
    <ul v-else class="grid gap-2 p-3 sm:grid-cols-2">
      <li v-for="prompt in visible" :key="prompt.id"
        class="group flex flex-col rounded-lg border border-zinc-200 p-3 transition-colors hover:border-indigo-300 dark:border-zinc-700 dark:hover:border-indigo-700">
        <div class="flex items-start gap-1.5">
          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-1.5">
              <span class="truncate text-[11px] font-semibold text-zinc-800 dark:text-zinc-100">{{ prompt.title }}</span>
              <span v-if="prompt.category" class="shrink-0 rounded bg-indigo-50 px-1 py-0.5 text-[9px] font-medium text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">{{ prompt.category }}</span>
            </div>
            <p v-if="prompt.description" class="mt-0.5 line-clamp-2 text-[10px] leading-relaxed text-zinc-500 dark:text-zinc-400">{{ prompt.description }}</p>
          </div>
          <button type="button" :aria-label="prompt.favorite ? `Unfavorite ${prompt.title}` : `Favorite ${prompt.title}`"
            :aria-pressed="!!prompt.favorite" @click="$emit('toggle-favorite', prompt)"
            :class="['shrink-0 rounded p-0.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500',
              prompt.favorite ? 'text-amber-500' : 'text-zinc-300 hover:text-amber-500 dark:text-zinc-600 dark:hover:text-amber-400']">
            <UiIcon name="star" :size="13" />
          </button>
        </div>

        <p class="mt-2 line-clamp-2 rounded bg-zinc-50 px-2 py-1.5 font-mono text-[10px] leading-relaxed text-zinc-500 dark:bg-zinc-950 dark:text-zinc-400">{{ prompt.prompt }}</p>

        <div class="mt-2 flex items-center justify-between">
          <div class="flex flex-wrap gap-1">
            <span v-for="tag in (prompt.tags || []).slice(0, 3)" :key="tag" class="rounded bg-zinc-100 px-1 py-0.5 text-[9px] text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">{{ tag }}</span>
          </div>
          <button type="button" @click="$emit('use', prompt)"
            class="inline-flex items-center gap-1 rounded-md bg-indigo-600 px-2 py-1 text-[10px] font-medium text-white transition-colors hover:bg-indigo-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500">
            Use
            <UiIcon name="arrow-right" :size="10" />
          </button>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import UiIcon from './UiIcon.vue';

export interface PromptItem {
  id: string;
  title: string;
  description?: string;
  prompt: string;
  category?: string;
  tags?: string[];
  favorite?: boolean;
}

const props = withDefaults(
  defineProps<{
    prompts?: PromptItem[];
    categories?: string[];
    searchable?: boolean;
  }>(),
  { prompts: () => [], categories: () => [], searchable: true }
);
defineEmits<{ (e: 'use', prompt: PromptItem): void; (e: 'toggle-favorite', prompt: PromptItem): void }>();

const query = ref('');
const activeCategory = ref('all');

const categoryOptions = computed(() => {
  const seen = new Set<string>(props.categories);
  for (const prompt of props.prompts) if (prompt.category) seen.add(prompt.category);
  return ['all', ...Array.from(seen)];
});

const visible = computed(() => {
  const needle = query.value.trim().toLowerCase();
  return props.prompts.filter((prompt) => {
    const inCategory = activeCategory.value === 'all' || prompt.category === activeCategory.value;
    if (!inCategory) return false;
    if (!needle) return true;
    return [prompt.title, prompt.description, prompt.prompt, ...(prompt.tags || [])]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
      .includes(needle);
  });
});
</script>
