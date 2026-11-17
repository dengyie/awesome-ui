<script setup lang="ts">
import { computed } from "vue";

export interface LogoItem {
  name: string;
  src?: string;
}

export interface LogoCloudProps {
  kicker?: string;
  logos?: LogoItem[];
  class?: string;
}

const props = withDefaults(defineProps<LogoCloudProps>(), {
  kicker: "Trusted by teams at",
  logos: () => [
    { name: "Acme Corp" },
    { name: "Globex" },
    { name: "Initech" },
    { name: "Umbrella" },
    { name: "Stark Industries" },
    { name: "Wayne Enterprises" },
  ],
  class: "",
});

const list = computed(() => (Array.isArray(props.logos) ? props.logos : []));
</script>

<template>
  <div data-logocloud class="w-full rounded-xl border border-zinc-200 bg-zinc-50/60 p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/60" :class="props.class">
    <p v-if="props.kicker" data-logocloud-kicker class="mb-4 text-center text-xs font-medium uppercase tracking-widest text-zinc-400 dark:text-zinc-500">{{ props.kicker }}</p>
    <div data-logocloud-grid class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      <div v-for="logo in list" :key="logo.name" :data-logocloud-item="logo.name" class="group flex h-14 items-center justify-center rounded-lg border border-zinc-100 bg-white px-4 transition-colors dark:border-zinc-800 dark:bg-zinc-900">
        <img v-if="logo.src" :src="logo.src" :alt="logo.name || 'logo'" loading="lazy" class="max-h-7 w-auto object-contain" />
        <span v-else :data-logocloud-name="logo.name" class="text-sm font-semibold tracking-tight text-zinc-400 transition-colors group-hover:text-zinc-600 dark:text-zinc-600 dark:group-hover:text-zinc-300">{{ logo.name }}</span>
      </div>
    </div>
  </div>
</template>
