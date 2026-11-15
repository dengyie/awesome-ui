<script setup lang="ts">
export interface PersonaPreset {
  id: string;
  name: string;
  description?: string;
  emoji?: string;
  temperature?: number;
  selected?: boolean;
}
interface Props {
  title?: string;
  presets: PersonaPreset[];
}
const props = withDefaults(defineProps<Props>(), {
  title: "Persona presets",
});
const emit = defineEmits<{ (e: "select", preset: PersonaPreset): void }>();

const GRADIENTS = [
  "from-indigo-500 to-purple-500",
  "from-sky-500 to-cyan-400",
  "from-amber-400 to-orange-500",
  "from-emerald-400 to-teal-500",
  "from-rose-400 to-pink-500",
  "from-violet-500 to-fuchsia-500",
];
</script>

<template>
  <div data-persona-grid class="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
    <p class="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{{ title }}</p>
    <div class="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
      <button
        v-for="(preset, i) in props.presets"
        :key="preset.id"
        type="button"
        :data-persona-card="preset.id"
        @click="emit('select', preset)"
        class="group relative rounded-lg border p-3 text-left transition-all"
        :class="preset.selected
          ? 'border-indigo-500 ring-2 ring-indigo-200 dark:ring-indigo-900'
          : 'border-zinc-200 hover:border-zinc-300 hover:shadow-sm dark:border-zinc-800 dark:hover:border-zinc-700'"
      >
        <span v-if="preset.selected" data-persona-check class="absolute right-2 top-2 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-600 text-white">
          <svg viewBox="0 0 20 20" fill="none" class="h-2.5 w-2.5" aria-hidden="true"><path d="m4.5 10.5 3.5 3.5 7.5-8" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" /></svg>
        </span>
        <span
          data-persona-emoji
          aria-hidden="true"
          class="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br text-lg text-white"
          :class="GRADIENTS[i % GRADIENTS.length]"
        >
          {{ preset.emoji || '🤖' }}
        </span>
        <p data-persona-name class="mt-2 truncate text-sm font-semibold text-zinc-900 dark:text-zinc-50">{{ preset.name }}</p>
        <p v-if="preset.description" data-persona-desc class="mt-0.5 line-clamp-2 text-[11px] leading-snug text-zinc-500 dark:text-zinc-400">{{ preset.description }}</p>
        <span v-if="typeof preset.temperature === 'number'" data-persona-temp class="mt-1.5 inline-block rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-[10px] text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">temp {{ preset.temperature }}</span>
      </button>
    </div>
  </div>
</template>
