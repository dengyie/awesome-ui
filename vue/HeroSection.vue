<template>
  <section :class="['flex flex-col', align === 'center' ? 'items-center text-center' : 'items-start text-left', $attrs.class]">
    <span v-if="eyebrow"
      class="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-[11px] font-medium text-indigo-700 dark:border-indigo-900 dark:bg-indigo-950/40 dark:text-indigo-300">
      <UiIcon name="sparkles" :size="12" />
      {{ eyebrow }}
    </span>

    <h1 class="mt-4 max-w-2xl text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl dark:text-zinc-50">{{ title }}</h1>

    <p v-if="description"
      :class="['mt-3 max-w-xl text-sm leading-relaxed text-zinc-500 dark:text-zinc-400', align === 'center' ? 'mx-auto' : '']">
      {{ description }}
    </p>

    <div v-if="primaryCta || secondaryCta"
      :class="['mt-6 flex flex-wrap items-center gap-2', align === 'center' ? 'justify-center' : '']">
      <button v-if="primaryCta" type="button" @click="$emit('primary')"
        class="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-indigo-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-zinc-950">
        {{ primaryCta }}
      </button>
      <button v-if="secondaryCta" type="button" @click="$emit('secondary')"
        class="rounded-lg border border-zinc-200 px-4 py-2 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800">
        {{ secondaryCta }}
      </button>
    </div>

    <ul v-if="highlights.length" :class="['mt-6 flex flex-wrap gap-x-4 gap-y-2', align === 'center' ? 'justify-center' : '']">
      <li v-for="item in highlights" :key="item" class="flex items-center gap-1.5 text-[11px] text-zinc-500 dark:text-zinc-400">
        <UiIcon name="check" :size="13" class="shrink-0 text-emerald-500" />
        {{ item }}
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
import UiIcon from './UiIcon.vue';

withDefaults(
  defineProps<{
    eyebrow?: string;
    title: string;
    description?: string;
    primaryCta?: string;
    secondaryCta?: string;
    highlights?: string[];
    align?: 'left' | 'center';
  }>(),
  { highlights: () => [], align: 'center' }
);
defineEmits<{ (e: 'primary'): void; (e: 'secondary'): void }>();
</script>
