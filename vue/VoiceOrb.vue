<script setup lang="ts">
export type VoiceOrbState = "listening" | "speaking" | "thinking" | "idle";

interface Props {
  state?: VoiceOrbState;
  label?: string;
  hint?: string;
  size?: "sm" | "md" | "lg";
  showControls?: boolean;
  muted?: boolean;
}
const props = withDefaults(defineProps<Props>(), {
  state: "idle",
  size: "md",
  showControls: true,
  muted: false,
});
const emit = defineEmits<{
  (e: "toggle-mute"): void;
  (e: "end"): void;
}>();

const SIZE_CLASS: Record<string, string> = {
  sm: "h-20 w-20",
  md: "h-36 w-36",
  lg: "h-56 w-56",
};
const STATE_RING: Record<VoiceOrbState, string> = {
  listening: "bg-gradient-to-br from-sky-400 via-indigo-500 to-violet-600 animate-pulse",
  speaking: "bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600 animate-pulse",
  thinking: "bg-gradient-to-br from-amber-300 via-orange-400 to-rose-500 animate-pulse",
  idle: "bg-gradient-to-br from-zinc-300 to-zinc-400 dark:from-zinc-600 dark:to-zinc-700",
};
const STATE_LABEL: Record<VoiceOrbState, string> = {
  listening: "Listening…",
  speaking: "Speaking…",
  thinking: "Thinking…",
  idle: "Tap to talk",
};
const BARS = [10, 18, 26, 34, 26, 18, 10];
const displayLabel = () => props.label ?? STATE_LABEL[props.state];
</script>

<template>
  <div data-voice-orb class="flex flex-col items-center gap-4">
    <div class="flex flex-col items-center gap-3">
      <div
        data-voice-orb-disc
        :data-orb-state="props.state"
        :class="`${SIZE_CLASS[props.size]} rounded-full ${STATE_RING[props.state]} shadow-lg shadow-indigo-500/20`"
      ></div>
      <div v-if="props.state !== 'idle'" data-voice-orb-wave class="flex h-8 items-end gap-1" aria-hidden="true">
        <span
          v-for="(h, i) in BARS"
          :key="i"
          class="w-1 rounded-full"
          :class="props.state === 'idle' ? 'bg-zinc-300 dark:bg-zinc-600' : 'bg-indigo-500 dark:bg-indigo-400'"
          :style="{ height: h + 'px' }"
        ></span>
      </div>
      <p data-voice-orb-label class="text-sm font-semibold text-zinc-800 dark:text-zinc-100">{{ displayLabel() }}</p>
      <p v-if="hint" class="text-xs text-zinc-500 dark:text-zinc-400">{{ hint }}</p>
    </div>
    <div v-if="props.showControls" class="flex items-center gap-3">
      <button
        type="button"
        data-voice-orb-mute
        :aria-pressed="props.muted"
        @click="emit('toggle-mute')"
        :class="props.muted
          ? 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300'
          : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700'"
        class="flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition-colors"
      >
        {{ props.muted ? "Unmute" : "Mute" }}
      </button>
      <button
        type="button"
        data-voice-orb-end
        @click="emit('end')"
        class="rounded-full bg-red-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-red-500"
      >
        End call
      </button>
    </div>
  </div>
</template>
