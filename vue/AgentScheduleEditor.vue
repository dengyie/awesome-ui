<script setup lang="ts">
import { ref } from "vue";

export interface ScheduleFrequency {
  id: string;
  label: string;
  expression: string;
}
interface Props {
  title?: string;
  description?: string;
  frequencies?: ScheduleFrequency[];
  activeId?: string;
  time?: string;
  nextRun?: string;
  timezone?: string;
}
const props = withDefaults(defineProps<Props>(), {
  title: "Run schedule",
  description: "Configure when the agent runs automatically. The cron expression is derived from your selection.",
  frequencies: () => [
    { id: "hourly", label: "Every hour", expression: "0 * * * *" },
    { id: "daily", label: "Daily", expression: "0 9 * * *" },
    { id: "weekly", label: "Weekly", expression: "0 9 * * 1" },
  ],
  time: "09:00",
});
const emit = defineEmits<{
  (e: "save", freq: ScheduleFrequency, time: string): void;
}>();

const selectedId = ref(props.activeId ?? props.frequencies[0]?.id ?? "");
const timeValue = ref(props.time);
const saved = ref(false);
let savedTimer: ReturnType<typeof setTimeout> | undefined;

const selected = () => props.frequencies.find((f) => f.id === selectedId.value) ?? props.frequencies[0];

const save = () => {
  const freq = selected();
  if (!freq) return;
  saved.value = true;
  if (savedTimer) clearTimeout(savedTimer);
  savedTimer = setTimeout(() => (saved.value = false), 1600);
  emit("save", freq, timeValue.value);
};
</script>

<template>
  <div data-schedule-editor class="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
    <p data-schedule-title class="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{{ props.title }}</p>
    <p data-schedule-description class="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{{ props.description }}</p>

    <div data-schedule-frequencies class="mt-3 flex flex-wrap gap-1.5">
      <button
        v-for="f in props.frequencies"
        :key="f.id"
        type="button"
        :data-schedule-frequency="f.id"
        :aria-pressed="f.id === selectedId"
        @click="selectedId = f.id"
        :class="f.id === selectedId
          ? 'rounded-full bg-indigo-600 px-3 py-1 text-[11px] font-semibold text-white transition-colors hover:bg-indigo-500'
          : 'rounded-full border border-zinc-200 px-3 py-1 text-[11px] font-semibold text-zinc-500 transition-colors hover:border-zinc-300 hover:text-zinc-700 dark:border-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200'"
      >
        {{ f.label }}
      </button>
    </div>

    <div class="mt-3 flex flex-wrap items-center gap-2">
      <label data-schedule-time-wrap class="flex items-center gap-2">
        <span class="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">Run at</span>
        <input
          data-schedule-time
          type="time"
          v-model="timeValue"
          class="rounded-md border border-zinc-200 bg-white px-2 py-1.5 font-mono text-xs text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
        />
      </label>
      <span v-if="props.timezone" data-schedule-timezone class="text-[11px] text-zinc-400 dark:text-zinc-500">{{ props.timezone }}</span>
    </div>

    <div class="mt-3 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-800/60">
      <span class="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">Cron</span>
      <code data-schedule-cron class="ml-2 font-mono text-xs text-zinc-700 dark:text-zinc-200">{{ selected()?.expression ?? "—" }}</code>
      <span class="mx-2 text-zinc-300 dark:text-zinc-600">|</span>
      <span class="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">Next run</span>
      <span data-schedule-next class="ml-2 text-xs text-zinc-700 dark:text-zinc-200">{{ props.nextRun ?? "—" }}</span>
    </div>

    <div class="mt-3 flex items-center justify-end gap-2">
      <span v-if="saved" data-schedule-saved class="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">Schedule saved</span>
      <button
        type="button"
        data-schedule-save
        @click="save"
        class="rounded-md bg-indigo-600 px-3 py-1.5 text-[11px] font-semibold text-white transition-colors hover:bg-indigo-500"
      >
        Save schedule
      </button>
    </div>
  </div>
</template>
