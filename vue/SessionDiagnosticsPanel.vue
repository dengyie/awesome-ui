<script setup lang="ts">
import { ref, computed } from "vue";

export interface SessionDevice {
  label: string;
  value: string;
  emoji: string;
}

export interface QualityWindow {
  start: number;
  width: number;
  level: "good" | "poor" | "bad";
}

export interface QualityTrack {
  id: string;
  label: string;
  emoji: string;
  windows: QualityWindow[];
}

export interface DiagEvent {
  id: string;
  no: number;
  message: string;
  time: string;
}

export interface SessionDiagnosticsPanelProps {
  title?: string;
  devices?: SessionDevice[];
  tracks?: QualityTrack[];
  events?: DiagEvent[];
  class?: string;
}

const props = withDefaults(defineProps<SessionDiagnosticsPanelProps>(), {
  title: "Events Timeline",
  devices: () => [
    { label: "Browser", value: "Chrome 126.0.0.0", emoji: "🌐" },
    { label: "Operating system", value: "Mac OS", emoji: "💻" },
  ],
  tracks: () => [
    { id: "camera", label: "Camera", emoji: "📷", windows: [{ start: 0, width: 100, level: "good" }] },
    { id: "microphone", label: "Microphone", emoji: "🎙", windows: [{ start: 0, width: 100, level: "good" }] },
    { id: "screenshare", label: "Screenshare", emoji: "🖥", windows: [{ start: 0, width: 100, level: "good" }] },
    { id: "network", label: "Poor Network", emoji: "📶", windows: [{ start: 20, width: 12, level: "bad" }, { start: 55, width: 8, level: "poor" }] },
  ],
  events: () => [
    { id: "e1", no: 1, message: 'organizationId: "244198"', time: "6/25/2024, 4:10:24 PM" },
    { id: "e2", no: 2, message: 'clientId: "c43b3dfc-62e9-43f6-887f-d07c6ac9eddb"', time: "6/25/2024, 4:10:26 PM" },
    { id: "e3", no: 3, message: 'roomSessionId: "bdc6cb01-24a4-4132-b23a-8ad28d049a76"', time: "6/25/2024, 4:16:23 PM" },
    { id: "e4", no: 4, message: 'displayName: "Alex Smith"', time: "6/25/2024, 4:10:24 PM" },
    { id: "e5", no: 5, message: 'userRole: "owner"', time: "6/25/2024, 4:10:26 PM" },
  ],
  class: "",
});

const emit = defineEmits(["event-click", "search"]);

const query = ref("");

const filtered = computed(() =>
  props.events.filter((e) => e.message.toLowerCase().includes(query.value.toLowerCase()))
);

const LEVEL_CLS: Record<string, string> = {
  good: "bg-emerald-400 dark:bg-emerald-500",
  poor: "bg-amber-400 dark:bg-amber-500",
  bad: "bg-rose-400 dark:bg-rose-500",
};

const onInput = (e: Event) => {
  query.value = (e.target as HTMLInputElement).value;
  emit("search", query.value);
};
</script>

<template>
  <div data-sdiag class="w-full rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900 sm:p-6" :class="props.class">
    <div data-sdiag-devices class="grid gap-4 sm:grid-cols-2">
      <div v-for="d in props.devices" :key="d.label" :data-sdiag-device="d.label" class="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
        <p class="text-lg font-bold text-zinc-900 dark:text-zinc-50">{{ d.label }}</p>
        <p class="mt-2 flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-300">
          <span aria-hidden="true">{{ d.emoji }}</span>
          {{ d.value }}
        </p>
      </div>
    </div>

    <h3 data-sdiag-title class="mt-6 text-xl font-bold text-zinc-900 dark:text-zinc-50">{{ props.title }}</h3>

    <div data-sdiag-tracks class="mt-4 space-y-2.5">
      <div v-for="t in props.tracks" :key="t.id" :data-sdiag-track="t.id" class="flex items-center gap-3">
        <span class="flex w-40 shrink-0 items-center gap-2 text-sm text-zinc-600 dark:text-zinc-300">
          <span aria-hidden="true">{{ t.emoji }}</span>
          {{ t.label }}
        </span>
        <div class="relative h-6 flex-1 overflow-hidden rounded bg-zinc-100 dark:bg-zinc-800">
          <div
            v-for="(w, i) in t.windows"
            :key="i"
            :data-sdiag-window="w.level"
            class="absolute inset-y-0 rounded-sm"
            :class="LEVEL_CLS[w.level] ?? LEVEL_CLS.good"
            :style="{ left: w.start + '%', width: w.width + '%' }"
          />
        </div>
      </div>
    </div>

    <div data-sdiag-log class="mt-6 flex items-center justify-between gap-4">
      <div class="grid flex-1 gap-1 text-sm font-bold text-zinc-800 dark:text-zinc-100 sm:grid-cols-[60px_1fr]">
        <span>Event no.</span>
        <span>Event message</span>
      </div>
      <input
        type="search"
        data-sdiag-search
        :value="query"
        placeholder="Search for an event"
        class="w-56 rounded-full border border-zinc-300 bg-white px-4 py-1.5 text-sm text-zinc-700 outline-none transition-colors placeholder:text-zinc-400 focus:border-indigo-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
        @input="onInput"
      />
    </div>
    <div data-sdiag-events class="mt-2 divide-y divide-zinc-100 dark:divide-zinc-800/60">
      <p v-if="filtered.length === 0" data-sdiag-empty class="py-6 text-center text-sm text-zinc-400 dark:text-zinc-500">No events match your search.</p>
      <button
        v-for="e in filtered"
        :key="e.id"
        type="button"
        :data-sdiag-event="e.no"
        class="grid w-full grid-cols-[60px_1fr_auto] items-center gap-2 py-3 text-left text-sm transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/40 sm:text-[13px]"
        @click="emit('event-click', e)"
      >
        <span class="text-zinc-400 dark:text-zinc-500">{{ e.no }}</span>
        <span class="truncate font-mono text-[13px] text-zinc-700 dark:text-zinc-200">{{ e.message }}</span>
        <span class="whitespace-nowrap text-xs text-zinc-400 dark:text-zinc-500">{{ e.time }}</span>
      </button>
    </div>
  </div>
</template>
