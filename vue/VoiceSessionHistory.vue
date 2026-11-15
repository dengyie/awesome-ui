<script setup lang="ts">
import { computed } from 'vue';

export interface VoiceSession {
  id: string;
  title: string;
  date?: string;
  duration?: string;
  status?: 'completed' | 'failed' | 'in-progress';
}

export interface VoiceSessionHistoryProps {
  title?: string;
  sessions?: VoiceSession[];
  emptyLabel?: string;
  class?: string;
}

const props = withDefaults(defineProps<VoiceSessionHistoryProps>(), {
  title: 'History',
  sessions: () => [],
  emptyLabel: 'No sessions yet.',
});

const emit = defineEmits<{
  (e: 'select', session: VoiceSession): void;
  (e: 'play', session: VoiceSession): void;
}>();

const activeCount = computed(() => props.sessions.filter((s) => s.status !== 'failed').length);
const meta = (s: VoiceSession) => [s.date, s.duration].filter(Boolean).join(' · ');
const statusLabel = (s: VoiceSession) =>
  s.status === 'failed' ? 'Failed' : s.status === 'in-progress' ? 'Running' : 'Completed';
</script>

<template>
  <div
    data-voice-history
    class="w-full rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
    :class="props.class"
  >
    <div class="flex items-center justify-between border-b border-zinc-100 px-4 py-3 dark:border-zinc-800">
      <h4 class="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
        {{ props.title }}
        <span
          data-voice-history-count
          class="ml-1 rounded-full bg-zinc-100 px-1.5 py-0.5 text-[10px] font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
        >
          {{ activeCount }}
        </span>
      </h4>
    </div>
    <div data-voice-history-list class="divide-y divide-zinc-100 dark:divide-zinc-800">
      <p
        v-if="props.sessions.length === 0"
        data-voice-history-empty
        class="px-4 py-6 text-center text-xs text-zinc-400 dark:text-zinc-500"
      >
        {{ props.emptyLabel }}
      </p>
      <div
        v-for="s in props.sessions"
        :key="s.id"
        :data-voice-session="s.id"
        class="flex items-center gap-3 px-4 py-2.5"
        @click="emit('select', s)"
      >
        <div class="min-w-0 flex-1">
          <p data-voice-session-title class="truncate text-xs font-medium text-zinc-900 dark:text-zinc-50">{{ s.title }}</p>
          <p data-voice-session-meta class="mt-0.5 truncate text-[11px] text-zinc-400 dark:text-zinc-500">{{ meta(s) }}</p>
        </div>
        <span
          data-voice-session-status
          class="shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-medium"
          :class="
            s.status === 'failed'
              ? 'bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400'
              : s.status === 'in-progress'
                ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400'
                : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400'
          "
        >
          {{ statusLabel(s) }}
        </span>
        <button
          type="button"
          data-voice-session-play
          :aria-label="`Play ${s.title}`"
          class="shrink-0 rounded p-1 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
          @click.stop="emit('play', s)"
        >
          ▶
        </button>
      </div>
    </div>
  </div>
</template>
