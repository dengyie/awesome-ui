<template>
  <div
    :class="className"
    class="w-full max-w-[17rem] rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-3"
  >
    <div class="flex items-center gap-1">
      <button
        type="button"
        aria-label="Previous month"
        class="rounded-md p-1 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
        @click="shift(-1)"
      >
        <UiIcon name="chevron-left" :size="14" />
      </button>
      <span class="flex-1 text-center text-xs font-semibold text-zinc-800 dark:text-zinc-100">
        {{ MONTHS[view.month] }} {{ view.year }}
      </span>
      <button
        type="button"
        aria-label="Next month"
        class="rounded-md p-1 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
        @click="shift(1)"
      >
        <UiIcon name="chevron-right" :size="14" />
      </button>
    </div>

    <div class="mt-2 grid grid-cols-7 gap-0.5">
      <span v-for="label in weekdays" :key="label" class="py-1 text-center text-[10px] font-medium uppercase text-zinc-400">
        {{ label }}
      </span>

      <template v-for="(day, index) in cells" :key="day === null ? `blank-${index}` : iso(day)">
        <span v-if="day === null" />
        <button
          v-else
          type="button"
          :disabled="isDisabled(day)"
          :aria-pressed="value === iso(day)"
          :aria-label="iso(day)"
          :class="[
            'flex h-7 items-center justify-center rounded-md text-[11px] tabular-nums transition-colors disabled:cursor-not-allowed disabled:text-zinc-300 disabled:hover:bg-transparent dark:disabled:text-zinc-600',
            value === iso(day)
              ? 'bg-indigo-600 font-semibold text-white hover:bg-indigo-500'
              : iso(day) === today
                ? 'font-semibold text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-950/40'
                : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800',
          ]"
          @click="selectDay(day)"
        >
          {{ day }}
        </button>
      </template>
    </div>

    <div v-if="showToday" class="mt-2 border-t border-zinc-100 pt-2 dark:border-zinc-800">
      <button
        type="button"
        class="w-full rounded-md py-1 text-[11px] font-medium text-indigo-600 transition-colors hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-950/40"
        @click="selectToday"
      >
        Today
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import UiIcon from './UiIcon.vue';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

const props = withDefaults(
  defineProps<{
    /** Selected date as YYYY-MM-DD. */
    value?: string;
    min?: string;
    max?: string;
    weekStartsOn?: 0 | 1;
    showToday?: boolean;
    disabled?: boolean;
    className?: string;
  }>(),
  { weekStartsOn: 1, showToday: true, disabled: false, className: '' }
);

const emit = defineEmits<{ (e: 'change', isoDate: string): void }>();

const pad = (n: number) => String(n).padStart(2, '0');
const toIso = (year: number, month: number, day: number) => `${year}-${pad(month + 1)}-${pad(day)}`;

const parseIso = (iso?: string) => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || '');
  if (!match) return null;
  return { year: Number(match[1]), month: Number(match[2]) - 1, day: Number(match[3]) };
};

const now = new Date();
const today = toIso(now.getFullYear(), now.getMonth(), now.getDate());

const selected = computed(() => parseIso(props.value));
const initial = selected.value || parseIso(today)!;
const view = ref({ year: initial.year, month: initial.month });

watch(
  () => props.value,
  () => {
    if (selected.value) view.value = { year: selected.value.year, month: selected.value.month };
  }
);

const cells = computed(() => {
  const first = new Date(view.value.year, view.value.month, 1).getDay();
  const lead = (first - props.weekStartsOn + 7) % 7;
  const total = new Date(view.value.year, view.value.month + 1, 0).getDate();
  const out: Array<number | null> = Array.from({ length: lead }, () => null);
  for (let day = 1; day <= total; day += 1) out.push(day);
  while (out.length % 7 !== 0) out.push(null);
  return out;
});

const weekdays = computed(() => Array.from({ length: 7 }, (_, i) => WEEKDAYS[(i + props.weekStartsOn) % 7]));

const iso = (day: number) => toIso(view.value.year, view.value.month, day);

function shift(delta: number) {
  const next = new Date(view.value.year, view.value.month + delta, 1);
  view.value = { year: next.getFullYear(), month: next.getMonth() };
}

function isDisabled(day: number) {
  if (props.disabled) return true;
  const value = iso(day);
  if (props.min && value < props.min) return true;
  if (props.max && value > props.max) return true;
  return false;
}

function selectDay(day: number) {
  if (isDisabled(day)) return;
  emit('change', iso(day));
}

function selectToday() {
  if (props.disabled) return;
  if ((props.min && today < props.min) || (props.max && today > props.max)) return;
  emit('change', today);
}
</script>
