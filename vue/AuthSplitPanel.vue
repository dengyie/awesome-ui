<template>
  <div data-auth-split class="grid min-h-[480px] md:grid-cols-2">
    <div
      v-if="mediaSide === 'left'"
      data-auth-media
      :class="['relative hidden md:flex flex-col items-center justify-center overflow-hidden', mediaBackground === 'cover' ? 'bg-zinc-900' : 'bg-zinc-100 dark:bg-zinc-800']"
    >
      <div v-if="media" class="mb-4 max-h-64 max-w-full [&>img]:max-h-64 [&>img]:object-cover" v-html="media" />
      <p v-if="mediaTitle" :class="['px-8 text-center text-2xl font-bold', mediaBackground === 'cover' ? 'text-white' : 'text-zinc-900 dark:text-zinc-50']">{{ mediaTitle }}</p>
      <p v-if="mediaSubtitle" :class="['mt-2 max-w-xs px-8 text-center text-sm leading-relaxed', mediaBackground === 'cover' ? 'text-zinc-300' : 'text-zinc-500 dark:text-zinc-400']">{{ mediaSubtitle }}</p>
    </div>
    <div class="flex flex-col justify-center px-6 py-10 sm:px-12">
      <div class="mx-auto w-full max-w-md">
        <slot />
        <div v-if="footerLinks.length" class="mt-8 flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-blue-600 dark:text-blue-400">
          <a v-for="link in footerLinks" :key="link.label" :href="link.href" class="hover:underline">{{ link.label }}</a>
        </div>
      </div>
    </div>
    <div
      v-if="mediaSide === 'right'"
      data-auth-media
      :class="['relative hidden md:flex flex-col items-center justify-center overflow-hidden', mediaBackground === 'cover' ? 'bg-zinc-900' : 'bg-zinc-100 dark:bg-zinc-800']"
    >
      <div v-if="media" class="mb-4 max-h-64 max-w-full [&>img]:max-h-64 [&>img]:object-cover" v-html="media" />
      <p v-if="mediaTitle" :class="['px-8 text-center text-2xl font-bold', mediaBackground === 'cover' ? 'text-white' : 'text-zinc-900 dark:text-zinc-50']">{{ mediaTitle }}</p>
      <p v-if="mediaSubtitle" :class="['mt-2 max-w-xs px-8 text-center text-sm leading-relaxed', mediaBackground === 'cover' ? 'text-zinc-300' : 'text-zinc-500 dark:text-zinc-400']">{{ mediaSubtitle }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    media?: string;
    mediaSide?: 'left' | 'right';
    mediaTitle?: string;
    mediaSubtitle?: string;
    mediaBackground?: 'tinted' | 'cover';
    footerLinks?: { label: string; href: string }[];
  }>(),
  { media: '', mediaSide: 'left', mediaTitle: '', mediaSubtitle: '', mediaBackground: 'tinted', footerLinks: () => [] },
);
</script>
