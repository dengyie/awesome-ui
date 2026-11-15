<template>
  <div data-time-slot-picker class="w-full rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
    <div class="border-b border-zinc-100 px-4 pt-3 dark:border-zinc-800">
      <p class="text-xs font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">{{ daysLabel }}</p>
      <div class="mt-2 flex gap-1.5 overflow-x-auto pb-3">
        <button
          v-for="day in days"
          :key="day.id"
          type="button"
          :data-slot-day="day.id"
          :disabled="day.disabled"
          :class="['min-w-[64px] rounded-lg px-2 py-2 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-40', day.id === activeDayId ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900' : 'bg-zinc-50 text-zinc-700 hover:bg-zinc-100 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700']"
          @click="activeDayId = day.id"
        >
          <span class="block text-[10px] font-medium uppercase tracking-wide opacity-70">{{ day.weekday }}</span>
          <span class="block text-sm font-semibold">{{ day.label }}</span>
        </button>
      </div>
    </div>
    <div class="p-4">
      <div class="flex items-center justify-between">
        <p data-slot-heading class="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
          {{ slotsLabel }}<span v-if="activeDay" class="ml-1 font-normal text-zinc-400">· {{ activeDay.weekday }} {{ activeDay.label }}</span>
        </p>
        <span v-if="timezone" class="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">{{ timezone }}</span>
      </div>
      <div v-if="activeDay" data-slot-periods class="mt-3 space-y-4">
        <div v-for="period in PERIODS" :key="period">
          <template v-if="slotsFor(activeDay, period).length">
            <p class="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">{{ PERIOD_LABELS[period] }}</p>
            <div class="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
              <button
                v-for="slot in slotsFor(activeDay, period)"
                :key="slot.id"
                type="button"
                :data-time-slot="slot.id"
                :disabled="slot.disabled"
                :class="['rounded-lg border px-2 py-2 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-40', isSelected(slot) ? 'border-indigo-600 bg-indigo-50 dark:border-indigo-500 dark:bg-indigo-950/60' : 'border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800']"
                @click="choose(slot)"
              >
                <span :class="['block text-xs font-semibold', isSelected(slot) ? 'text-indigo-700 dark:text-indigo-300' : 'text-zinc-800 dark:text-zinc-100']">{{ slot.label }}</span>
                <span v-if="slot.available != null" :class="['mt-0.5 block text-[10px]', slot.available > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-400']">
                  {{ slot.available > 0 ? `${slot.available} available` : 'Fully booked' }}
                </span>
              </button>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';

export interface TimeSlot {
  id: string;
  label: string;
  period?: 'morning' | 'afternoon' | 'evening';
  available?: number;
  disabled?: boolean;
}

export interface SlotDay {
  id: string;
  label: string;
  weekday: string;
  disabled?: boolean;
  slots: TimeSlot[];
}

const PERIODS = ['morning', 'afternoon', 'evening'] as const;
const PERIOD_LABELS: Record<string, string> = { morning: 'Morning', afternoon: 'Afternoon', evening: 'Evening' };

const props = withDefaults(
  defineProps<{
    days: SlotDay[];
    value?: { dayId: string; slotId: string } | null;
    timezone?: string;
    daysLabel?: string;
    slotsLabel?: string;
  }>(),
  { value: null, daysLabel: 'Date', slotsLabel: 'Select a time' },
);

const emit = defineEmits<{
  (e: 'select', value: { dayId: string; slotId: string; slot: TimeSlot }): void;
}>();

const selected = ref(props.value);
const activeDayId = ref(props.value?.dayId || props.days.find((day) => !day.disabled)?.id || props.days[0]?.id || '');

watch(
  () => props.value,
  (value) => {
    if (value) {
      selected.value = value;
      activeDayId.value = value.dayId;
    }
  },
);

const activeDay = computed(() => props.days.find((day) => day.id === activeDayId.value) || props.days[0]);

const slotsFor = (day: SlotDay, period: string) => day.slots.filter((slot) => (slot.period || 'morning') === period);

const isSelected = (slot: TimeSlot) => selected.value?.dayId === activeDayId.value && selected.value?.slotId === slot.id;

const choose = (slot: TimeSlot) => {
  if (slot.disabled) return;
  selected.value = { dayId: activeDayId.value, slotId: slot.id };
  emit('select', { dayId: activeDayId.value, slotId: slot.id, slot });
};
</script>
