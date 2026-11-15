<script setup lang="ts">
export interface AudioNotePlayerProps {
  title?: string;
  duration?: string;
  playing?: boolean;
  waveform?: number[];
  class?: string;
}

const props = withDefaults(defineProps<AudioNotePlayerProps>(), {
  title: 'Homepage walkthrough notes',
  duration: '00:47',
  playing: false,
  waveform: () => [],
});

const emit = defineEmits<{
  (e: 'toggle-play'): void;
}>();

const bars = props.waveform.length
  ? props.waveform
  : Array.from({ length: 64 }, (_, i) => 25 + Math.round(Math.abs(Math.sin(i * 1.3)) * 75));
</script>

<template>
  <div
    data-audio-note-player
    class="w-full rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
    :class="props.class"
  >
    <div class="flex items-center gap-3">
      <button
        type="button"
        data-audio-note-toggle
        :aria-label="props.playing ? 'Pause note' : 'Play note'"
        class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-xs text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
        @click="emit('toggle-play')"
      >
        {{ props.playing ? '❚❚' : '▶' }}
      </button>
      <div data-audio-note-waveform class="flex h-8 min-w-0 flex-1 items-center gap-[2px]" aria-hidden="true">
        <span
          v-for="(h, i) in bars"
          :key="i"
          class="w-[3px] shrink-0 rounded-full"
          :class="props.playing && i < bars.length / 2 ? 'bg-emerald-500' : 'bg-zinc-300 dark:bg-zinc-600'"
          :style="{ height: Math.max(15, Math.min(100, h)) + '%' }"
        />
      </div>
      <span data-audio-note-duration class="shrink-0 font-mono text-[11px] text-zinc-400 dark:text-zinc-500">
        {{ props.duration }}
      </span>
    </div>
    <p data-audio-note-title class="mt-3 truncate text-xs font-medium text-zinc-900 dark:text-zinc-50">{{ props.title }}</p>
  </div>
</template>
