<script setup lang="ts">
export interface AiNoteAnswerProps {
  question?: string;
  answer?: string;
  sources?: string[];
  waveform?: number[];
  class?: string;
}

const props = withDefaults(defineProps<AiNoteAnswerProps>(), {
  question: 'What improvements should I prioritize for Homepage?',
  answer: '',
  sources: () => [],
  waveform: () => [],
});

const emit = defineEmits<{
  (e: 'play'): void;
  (e: 'copy'): void;
  (e: 'source-click', source: string): void;
}>();

const bars = props.waveform.length
  ? props.waveform
  : Array.from({ length: 48 }, (_, i) => 30 + Math.round(Math.abs(Math.sin(i * 1.7)) * 70));
</script>

<template>
  <div
    data-note-answer-card
    class="w-full rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
    :class="props.class"
  >
    <div
      data-note-answer-question
      class="flex items-center gap-3 rounded-lg bg-zinc-50 px-3 py-2.5 dark:bg-zinc-800/60"
    >
      <button
        type="button"
        data-note-answer-play
        aria-label="Play question audio"
        class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-[10px] text-white dark:bg-zinc-100 dark:text-zinc-900"
        @click="emit('play')"
      >
        ▶
      </button>
      <div data-note-answer-waveform class="flex h-6 min-w-0 flex-1 items-center gap-[2px]" aria-hidden="true">
        <span
          v-for="(h, i) in bars"
          :key="i"
          class="w-[3px] shrink-0 rounded-full bg-zinc-300 dark:bg-zinc-600"
          :style="{ height: Math.max(15, Math.min(100, h)) + '%' }"
        />
      </div>
    </div>
    <p data-note-answer-question-text class="mt-2 text-xs text-zinc-500 dark:text-zinc-400">{{ props.question }}</p>
    <p data-note-answer-text class="mt-3 text-[13px] leading-relaxed text-zinc-800 dark:text-zinc-200">{{ props.answer }}</p>
    <div v-if="props.sources.length > 0" data-note-answer-sources class="mt-4">
      <div class="flex items-center gap-3">
        <span class="text-[11px] font-medium text-zinc-400 dark:text-zinc-500">Other sources</span>
        <span class="h-px flex-1 bg-zinc-100 dark:bg-zinc-800" />
      </div>
      <button
        v-for="source in props.sources"
        :key="source"
        type="button"
        data-note-answer-source
        class="mt-2 flex w-full items-center gap-1.5 truncate text-left text-xs text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
        @click="emit('source-click', source)"
      >
        <span aria-hidden="true" class="shrink-0">↗</span>
        <span class="truncate">{{ source }}</span>
      </button>
    </div>
    <div class="mt-4">
      <button
        type="button"
        data-note-answer-copy
        class="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
        @click="emit('copy')"
      >
        <span aria-hidden="true">⧉</span>
        Copy
      </button>
    </div>
  </div>
</template>
