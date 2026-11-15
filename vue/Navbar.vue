<template>
  <div ref="rootRef" :class="['relative', $attrs.class]">
    <nav class="flex items-center gap-6 border-b border-zinc-200 bg-white px-5 py-3 dark:border-zinc-800 dark:bg-zinc-900">
      <span class="text-sm font-black text-zinc-900 dark:text-zinc-50">{{ brand }}</span>
      <div class="flex items-center gap-1">
        <div v-for="menu in menus" :key="menu.id" class="relative">
          <button type="button" :aria-expanded="openMenu === menu.id" aria-haspopup="true"
            @click="openMenu = openMenu === menu.id ? null : menu.id"
            :class="['inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500',
              openMenu === menu.id
                ? 'bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50'
                : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100']">
            {{ menu.label }}
            <UiIcon name="chevron-down" :size="12"
              :class="['shrink-0 text-zinc-400 transition-transform duration-200', openMenu === menu.id ? 'rotate-180' : '']" />
          </button>
          <div v-if="openMenu === menu.id"
            class="absolute left-0 top-full z-30 mt-2 flex gap-6 rounded-xl border border-zinc-200 bg-white p-4 shadow-xl dark:border-zinc-700 dark:bg-zinc-900">
            <div v-for="(column, columnIndex) in menu.columns" :key="column.heading ?? columnIndex" class="min-w-36 space-y-1">
              <p v-if="column.heading" class="px-2 pb-1 text-[10px] font-semibold uppercase tracking-wide text-zinc-400">{{ column.heading }}</p>
              <a v-for="link in column.links" :key="link.id ?? link.label" :href="link.href ?? '#'"
                class="flex items-center gap-2 rounded-md px-2 py-1.5 text-xs text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100">
                <UiIcon v-if="link.icon" :name="link.icon" :size="13" class="shrink-0 text-zinc-400" />
                <span class="flex-1">{{ link.label }}</span>
                <span v-if="link.badge != null"
                  class="rounded-full bg-indigo-50 px-1.5 py-0.5 text-[9.5px] font-semibold text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-300">
                  {{ link.badge }}
                </span>
              </a>
            </div>
          </div>
        </div>
        <a v-for="link in links" :key="link.id ?? link.label" :href="link.href ?? '#'"
          class="rounded-md px-2.5 py-1.5 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100">
          {{ link.label }}
        </a>
      </div>
      <div class="ml-auto flex items-center gap-2">
        <button v-if="ctaText" type="button" @click="emit('cta')"
          class="rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-indigo-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500">
          {{ ctaText }}
        </button>
      </div>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';
import UiIcon, { type IconName } from './UiIcon.vue';

export interface NavbarLink {
  id?: string;
  label: string;
  href?: string;
  icon?: IconName;
  badge?: string | number;
}

export interface NavbarMenu {
  id: string;
  label: string;
  columns: { heading?: string; links: NavbarLink[] }[];
}

withDefaults(
  defineProps<{
    brand: string;
    links?: NavbarLink[];
    menus?: NavbarMenu[];
    ctaText?: string;
  }>(),
  { links: () => [], menus: () => [] }
);

const emit = defineEmits<{ (e: 'cta'): void }>();

const openMenu = ref<string | null>(null);
const rootRef = ref<HTMLDivElement | null>(null);

const onDocMouseDown = (event: MouseEvent) => {
  if (rootRef.value && !rootRef.value.contains(event.target as Node)) openMenu.value = null;
};
const onDocKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') openMenu.value = null;
};

onMounted(() => {
  document.addEventListener('mousedown', onDocMouseDown);
  document.addEventListener('keydown', onDocKeyDown);
});

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', onDocMouseDown);
  document.removeEventListener('keydown', onDocKeyDown);
});
</script>
