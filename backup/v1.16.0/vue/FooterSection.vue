<template>
  <footer :class="['border-t border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950', $attrs.class]">
    <div class="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-10 md:flex-row md:gap-12">
      <div v-if="brand || tagline" class="md:w-56 md:shrink-0">
        <div v-if="brand" class="flex items-center gap-2">
          <span class="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-white">
            <UiIcon name="layers" :size="15" />
          </span>
          <span class="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{{ brand }}</span>
        </div>
        <p v-if="tagline" class="mt-3 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">{{ tagline }}</p>
      </div>

      <div v-if="columns.length" class="grid flex-1 grid-cols-2 gap-6 sm:grid-cols-3">
        <div v-for="column in columns" :key="column.title">
          <h3 class="text-[11px] font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">{{ column.title }}</h3>
          <ul class="mt-3 space-y-2">
            <li v-for="link in column.links" :key="link.label">
              <button type="button" @click="$emit('link-click', link)"
                class="rounded text-xs text-zinc-600 transition-colors hover:text-indigo-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:text-zinc-300 dark:hover:text-indigo-400">
                {{ link.label }}
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <div class="border-t border-zinc-100 dark:border-zinc-900">
      <div class="mx-auto flex max-w-5xl flex-col items-center justify-between gap-3 px-4 py-4 sm:flex-row">
        <p class="text-[11px] text-zinc-400 dark:text-zinc-500">{{ copyright || `© ${new Date().getFullYear()} ${brand || ''}`.trim() }}</p>
        <ul v-if="socials.length" class="flex items-center gap-1">
          <li v-for="social in socials" :key="social.label">
            <button type="button" :aria-label="social.label" :title="social.label"
              class="flex h-7 w-7 items-center justify-center rounded-md text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:hover:bg-zinc-800 dark:hover:text-zinc-200">
              <UiIcon :name="social.icon || 'globe'" :size="14" />
            </button>
          </li>
        </ul>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import UiIcon from './UiIcon.vue';

export interface FooterLink {
  label: string;
  href?: string;
}

export interface FooterColumn {
  title: string;
  links: FooterLink[];
}

withDefaults(
  defineProps<{
    brand?: string;
    tagline?: string;
    columns?: FooterColumn[];
    socials?: { label: string; icon?: string }[];
    copyright?: string;
  }>(),
  { columns: () => [], socials: () => [] }
);
defineEmits<{ (e: 'link-click', link: FooterLink): void }>();
</script>
