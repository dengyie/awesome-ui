<template>
  <div
    class="flex flex-col items-center rounded-2xl border border-zinc-200 bg-white px-6 py-8 dark:border-zinc-800 dark:bg-zinc-900"
    :class="$attrs.class">
    <div class="relative flex h-28 w-28 items-center justify-center">
      <span aria-hidden="true" :class="['absolute inset-0 rounded-full', meta.ring, animated ? 'animate-ping' : 'opacity-0']" />
      <span aria-hidden="true" :class="['absolute inset-3 rounded-full', meta.ring, 'opacity-60']" />
      <span aria-hidden="true" :class="['absolute inset-6 rounded-full transition-colors', innerTone]" />
      <button type="button" @click="$emit('toggle')" :aria-label="state === 'idle' ? 'Start voice mode' : 'Stop voice mode'"
        :aria-pressed="state !== 'idle'"
        :class="['relative flex h-16 w-16 items-center justify-center rounded-full shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-zinc-900', meta.orb]">
        <UiIcon :name="state === 'idle' ? 'mic' : 'square'" :size="24" />
      </button>
    </div>

    <div class="mt-4 flex h-6 items-end gap-1" aria-hidden="true">
      <span v-for="index in 9" :key="index"
        :class="['w-1 rounded-full', animated ? 'animate-[voice-bar_0.9s_ease-in-out_infinite_alternate] bg-indigo-500' : 'h-1 bg-zinc-300 dark:bg-zinc-700']"
        :style="animated ? { animationDelay: `${((index - 1) * 0.07).toFixed(2)}s` } : undefined" />
    </div>

    <p class="mt-3 text-sm font-medium text-zinc-800 dark:text-zinc-100">{{ meta.label }}</p>
    <p class="mt-0.5 text-[11px] text-zinc-400 dark:text-zinc-500">{{ meta.hint }}</p>

    <p v-if="transcript" class="mt-4 max-w-sm text-center text-xs leading-relaxed text-zinc-600 dark:text-zinc-300">“{{ transcript }}”</p>
    <p v-if="reply" class="mt-2 max-w-sm text-center text-xs leading-relaxed text-indigo-600 dark:text-indigo-400">{{ reply }}</p>

    <button v-if="showEnd" type="button" @click="$emit('end')"
      class="mt-6 inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 px-3 py-1.5 text-[11px] font-medium text-zinc-600 transition-colors hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800">
      <UiIcon name="x" :size="12" />
      End voice session
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import UiIcon from './UiIcon.vue';

export type VoiceModeState = 'idle' | 'listening' | 'thinking' | 'speaking';

const props = withDefaults(
  defineProps<{
    state?: VoiceModeState;
    transcript?: string;
    reply?: string;
    showEnd?: boolean;
  }>(),
  { state: 'idle', showEnd: true }
);
defineEmits<{ (e: 'toggle'): void; (e: 'end'): void }>();

const STATE_META: Record<VoiceModeState, { label: string; hint: string; ring: string; orb: string }> = {
  idle: { label: 'Tap to speak', hint: 'Voice mode is ready', ring: 'bg-zinc-200/60 dark:bg-zinc-700/40', orb: 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-300' },
  listening: { label: 'Listening…', hint: 'Speak now — tap again to stop', ring: 'bg-indigo-400/40', orb: 'bg-indigo-600 text-white' },
  thinking: { label: 'Thinking…', hint: 'Working on a response', ring: 'bg-amber-400/40', orb: 'bg-amber-500 text-white' },
  speaking: { label: 'Speaking…', hint: 'Tap to interrupt', ring: 'bg-emerald-400/40', orb: 'bg-emerald-500 text-white' },
};

const meta = computed(() => STATE_META[props.state]);
const animated = computed(() => props.state === 'listening' || props.state === 'speaking');
const innerTone = computed(() => {
  if (props.state === 'thinking') return 'animate-pulse bg-amber-400/50';
  if (props.state === 'listening') return 'bg-indigo-400/40';
  if (props.state === 'speaking') return 'bg-emerald-400/40';
  return 'bg-zinc-200/50 dark:bg-zinc-700/40';
});
</script>
