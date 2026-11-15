<template>
  <div :class="className" class="rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900">
    <header class="flex items-center gap-2 border-b border-zinc-100 pb-2 dark:border-zinc-800">
      <span
        class="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400"
      >
        <UiIcon name="calendar" :size="14" />
      </span>
      <div class="min-w-0 flex-1">
        <h3 class="text-xs font-semibold text-zinc-800 dark:text-zinc-100">{{ humanDate(date) }}</h3>
        <p v-if="timezone" class="text-[10px] text-zinc-400">All times in {{ timezone }}</p>
      </div>
      <span
        class="rounded-full bg-zinc-100 px-1.5 py-0.5 text-[10px] font-medium tabular-nums text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
      >
        {{ openCount }} open
      </span>
    </header>

    <p v-if="groups.length === 0" class="py-8 text-center text-[11px] text-zinc-400">
      No slots available for this day.
    </p>

    <div v-else class="mt-2 space-y-3">
      <fieldset v-for="group in groups" :key="group.period.key">
        <legend class="text-[10px] font-medium uppercase tracking-wide text-zinc-400">{{ group.period.label }}</legend>
        <div class="mt-1 grid grid-cols-2 gap-1.5">
          <button
            v-for="slot in group.slots"
            :key="slot.id"
            type="button"
            :disabled="slot.available === false"
            :aria-pressed="slot.id === selectedId"
            :class="[
              'flex items-center justify-between rounded-lg border px-2 py-1.5 text-[11px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500',
              slot.id === selectedId
                ? 'border-indigo-600 bg-indigo-600 font-medium text-white'
                : slot.available === false
                  ? 'cursor-not-allowed border-zinc-100 text-zinc-300 line-through dark:border-zinc-800 dark:text-zinc-600'
                  : 'border-zinc-200 text-zinc-700 hover:border-indigo-300 hover:bg-indigo-50/60 dark:border-zinc-700 dark:text-zinc-200 dark:hover:border-indigo-500 dark:hover:bg-indigo-950/20',
            ]"
            @click="emit('select', slot)"
          >
            <span class="tabular-nums">{{ amPm(slot.time) }}</span>
            <UiIcon v-if="slot.id === selectedId" name="check" :size="11" />
            <UiIcon v-else-if="slot.available === false" name="lock" :size="11" />
          </button>
        </div>
        <p v-if="group.slots.some((slot) => slot.note)" class="mt-1 text-[10px] text-zinc-400">
          {{ group.slots.filter((slot) => slot.note).map((slot) => slot.note).join(' · ') }}
        </p>
      </fieldset>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import UiIcon from './UiIcon.vue';

export interface SchedulerSlot {
  id: string;
  time: string;
  available?: boolean;
  note?: string;
}

const PERIODS = [
  { key: 'morning', label: 'Morning', range: [6, 12] },
  { key: 'afternoon', label: 'Afternoon', range: [12, 17] },
  { key: 'evening', label: 'Evening', range: [17, 24] },
] as const;

const props = withDefaults(
  defineProps<{
    date: string;
    slots?: SchedulerSlot[];
    selectedId?: string;
    timezone?: string;
    className?: string;
  }>(),
  { slots: () => [], selectedId: '', timezone: '', className: '' }
);

const emit = defineEmits<{ (e: 'select', slot: SchedulerSlot): void }>();

const humanDate = (iso: string) => {
  const [year, month, day] = iso.split('-').map(Number);
  if (!year || !month || !day) return iso;
  return new Date(year, month - 1, day).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
};

const hourOf = (time: string) => {
  const [hour] = time.split(':').map(Number);
  return Number.isFinite(hour) ? hour : -1;
};

const amPm = (time: string) => {
  const [hour, minute] = time.split(':').map(Number);
  if (!Number.isFinite(hour) || !Number.isFinite(minute)) return time;
  const suffix = hour >= 12 ? 'PM' : 'AM';
  const display = hour % 12 === 0 ? 12 : hour % 12;
  return `${display}:${String(minute).padStart(2, '0')} ${suffix}`;
};

const groups = computed(() =>
  PERIODS.map((period) => ({
    period,
    slots: props.slots.filter((slot) => {
      const hour = hourOf(slot.time);
      return hour >= period.range[0] && hour < period.range[1];
    }),
  })).filter((group) => group.slots.length > 0)
);

const openCount = computed(() => props.slots.filter((slot) => slot.available !== false).length);
</script>
