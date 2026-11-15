<template>
  <button v-if="onClick" type="button" @click="emit('click')"
    :class="[CLS, 'cursor-pointer transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500']">
    <UiIcon v-if="icon" :name="icon" :size="size === 'sm' ? 10 : 11" class="shrink-0 opacity-70" />
    <span class="truncate">{{ label }}</span>
    <button v-if="removable" type="button" :aria-label="`Remove ${label}`" @click.stop="emit('remove')"
      class="-mr-0.5 shrink-0 rounded-full p-0.5 transition-colors hover:bg-black/10 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-current dark:hover:bg-white/10">
      <UiIcon name="x" :size="size === 'sm' ? 9 : 10" />
    </button>
  </button>
  <span v-else :class="[CLS]">
    <UiIcon v-if="icon" :name="icon" :size="size === 'sm' ? 10 : 11" class="shrink-0 opacity-70" />
    <span class="truncate">{{ label }}</span>
    <button v-if="removable" type="button" :aria-label="`Remove ${label}`" @click.stop="emit('remove')"
      class="-mr-0.5 shrink-0 rounded-full p-0.5 transition-colors hover:bg-black/10 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-current dark:hover:bg-white/10">
      <UiIcon name="x" :size="size === 'sm' ? 9 : 10" />
    </button>
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import UiIcon, { type IconName } from './UiIcon.vue';

export type TagTone = 'neutral' | 'indigo' | 'emerald' | 'amber' | 'rose' | 'sky';

const props = withDefaults(
  defineProps<{
    label: string;
    tone?: TagTone;
    size?: 'sm' | 'md';
    icon?: IconName;
    removable?: boolean;
  }>(),
  { tone: 'neutral', size: 'md', removable: false }
);

const emit = defineEmits<{ (e: 'remove'): void; (e: 'click'): void }>();

const TONE: Record<TagTone, string> = {
  neutral: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300',
  indigo: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300',
  emerald: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300',
  amber: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300',
  rose: 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300',
  sky: 'bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300',
};

const CLS = computed(
  () =>
    `inline-flex max-w-full items-center gap-1 rounded-full font-medium ${TONE[props.tone]} ${
      props.size === 'sm' ? 'px-1.5 py-0.5 text-[9.5px]' : 'px-2 py-0.5 text-[10.5px]'
    }`
);
</script>
