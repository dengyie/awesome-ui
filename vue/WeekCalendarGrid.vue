<script setup lang="ts">
import { computed } from "vue";

export interface WeekDay {
  id: string;
  label: string;
  date: string;
}

export interface WeekEvent {
  id: string;
  dayId: string;
  title: string;
  subtitle?: string;
  start: number;
  end: number;
  tone?: "solid" | "dashed";
  color?: "blue" | "green" | "amber";
}

export interface WeekCalendarGridProps {
  days?: WeekDay[];
  startHour?: number;
  endHour?: number;
  timeZone?: string;
  events?: WeekEvent[];
  view?: "week" | "day";
  activeDayId?: string;
  nowHour?: number;
  composerPlaceholder?: string;
  class?: string;
}

const props = withDefaults(defineProps<WeekCalendarGridProps>(), {
  days: () => [
    { id: "mon", label: "Mon", date: "16" },
    { id: "tue", label: "Tue", date: "17" },
    { id: "wed", label: "Wed", date: "18" },
    { id: "thu", label: "Thu", date: "19" },
    { id: "fri", label: "Fri", date: "20" },
  ],
  startHour: 6,
  endHour: 18,
  timeZone: "GMT+7",
  events: () => [
    { id: "e1", dayId: "mon", title: "Alex // Sam", start: 9, end: 10, tone: "solid", color: "blue" },
    { id: "e2", dayId: "mon", title: "Focus Time", start: 10, end: 12, tone: "dashed", color: "blue" },
    { id: "e3", dayId: "mon", title: "Lunch", start: 12, end: 13, tone: "solid", color: "amber" },
    { id: "e4", dayId: "mon", title: "Focus Time", start: 13, end: 17, tone: "dashed", color: "blue" },
    { id: "e5", dayId: "tue", title: "Lunch", start: 12, end: 13, tone: "solid", color: "amber" },
    { id: "e6", dayId: "wed", title: "Team Sync", start: 9, end: 10, tone: "solid", color: "green" },
    { id: "e7", dayId: "wed", title: "Lunch", start: 12, end: 13, tone: "solid", color: "amber" },
    { id: "e8", dayId: "thu", title: "Lunch", start: 12, end: 13, tone: "solid", color: "amber" },
    { id: "e9", dayId: "fri", title: "Lunch", start: 12, end: 13, tone: "solid", color: "amber" },
  ],
  view: "week",
  activeDayId: "mon",
  nowHour: 15.83,
  composerPlaceholder: "Schedule or reschedule…",
  class: "",
});
const emit = defineEmits(["event-click", "view-change", "find-time"]);

const HOUR_HEIGHT = 56;

const EVENT_STYLES: Record<string, { solid: string; dashed: string }> = {
  blue: {
    solid: "bg-blue-500/90 text-white dark:bg-blue-500/80",
    dashed: "border border-dashed border-blue-400 bg-blue-50/60 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300",
  },
  green: {
    solid: "bg-emerald-500/90 text-white dark:bg-emerald-500/80",
    dashed: "border border-dashed border-emerald-400 bg-emerald-50/60 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
  },
  amber: {
    solid: "bg-amber-400/90 text-amber-950 dark:bg-amber-400/80",
    dashed: "border border-dashed border-amber-400 bg-amber-50/60 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
  },
};

const hourLabel = (h: number) => {
  const suffix = h < 12 ? "am" : "pm";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}${suffix}`;
};

const hours = computed(() => {
  const list: number[] = [];
  for (let h = props.startHour; h <= props.endHour; h++) list.push(h);
  return list;
});

const visibleDays = computed(() => (props.view === "day" ? props.days.filter((d) => d.id === props.activeDayId) : props.days));
const gridHeight = computed(() => (props.endHour - props.startHour) * HOUR_HEIGHT);
const gutterStyle = computed(() => ({ height: gridHeight.value + "px" }));
const headerStyle = computed(() => ({ gridTemplateColumns: `64px repeat(${visibleDays.value.length}, minmax(0, 1fr))` }));
const bodyStyle = computed(() => ({ gridTemplateColumns: `64px repeat(${visibleDays.value.length}, minmax(0, 1fr))` }));
const columnStyle = (day: { id: string }) => ({ height: gridHeight.value + "px" });

const dayEvents = (dayId: string) => props.events.filter((ev) => ev.dayId === dayId);
const eventStyle = (ev: WeekEvent) => {
  const styles = EVENT_STYLES[ev.color ?? "blue"];
  return (ev.tone ?? "solid") === "dashed" ? styles.dashed : styles.solid;
};
const eventTop = (ev: WeekEvent) => ({ top: (ev.start - props.startHour) * HOUR_HEIGHT + "px", height: (ev.end - ev.start) * HOUR_HEIGHT - 4 + "px" });
const nowVisible = computed(() => props.nowHour >= props.startHour && props.nowHour <= props.endHour);
const nowTop = computed(() => ({ top: (props.nowHour - props.startHour) * HOUR_HEIGHT + "px" }));
</script>

<template>
  <div data-week-grid class="w-full rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900" :class="props.class">
    <!-- toolbar -->
    <div data-week-toolbar class="flex items-center justify-between gap-4">
      <div class="flex items-center gap-3">
        <div data-week-view-toggle class="flex overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-700">
          <button
            v-for="v in ['day', 'week']"
            :key="v"
            :data-week-view="v"
            type="button"
            class="px-3 py-1.5 text-xs font-semibold capitalize transition-colors"
            :class="props.view === v ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900' : 'bg-white text-zinc-600 hover:bg-zinc-50 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800'"
            @click="emit('view-change', v)"
          >
            {{ v }}
          </button>
        </div>
        <span data-week-timezone class="text-xs font-medium text-zinc-400 dark:text-zinc-500">{{ props.timeZone }}</span>
      </div>
      <button
        data-week-find-time
        type="button"
        class="rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
        @click="emit('find-time')"
      >
        Find time
      </button>
    </div>

    <!-- composer -->
    <input
      data-week-composer
      type="text"
      :placeholder="props.composerPlaceholder"
      class="mt-4 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm text-zinc-800 placeholder-zinc-400 outline-none focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-950/60 dark:text-zinc-100 dark:placeholder-zinc-500"
    />

    <!-- day header -->
    <div class="mt-4 grid" :style="headerStyle">
      <div></div>
      <div
        v-for="day in visibleDays"
        :key="day.id"
        :data-week-day="day.id"
        class="pb-2 text-center"
        :class="day.id === props.activeDayId ? 'rounded-md bg-zinc-50 dark:bg-zinc-800/60' : ''"
      >
        <p class="text-xs font-medium text-zinc-500 dark:text-zinc-400">{{ day.label }}</p>
        <p class="text-sm font-bold" :class="day.id === props.activeDayId ? 'text-zinc-900 dark:text-zinc-50' : 'text-zinc-700 dark:text-zinc-200'">{{ day.date }}</p>
      </div>
    </div>

    <!-- grid body -->
    <div data-week-body class="relative grid overflow-hidden" :style="bodyStyle">
      <!-- gutter -->
      <div data-week-gutter class="relative" :style="gutterStyle">
        <span
          v-for="(h, i) in hours"
          :key="h"
          class="absolute -translate-y-1/2 pr-3 text-right text-[11px] font-medium text-zinc-400 dark:text-zinc-500"
          :style="{ top: i * HOUR_HEIGHT + 'px' }"
        >
          {{ hourLabel(h) }}
        </span>
      </div>

      <!-- day columns -->
      <div
        v-for="day in visibleDays"
        :key="day.id"
        :data-week-column="day.id"
        class="relative border-l border-zinc-100 dark:border-zinc-800"
        :style="columnStyle(day)"
      >
        <div
          v-for="(h, i) in hours"
          :key="h"
          class="absolute w-full border-t border-zinc-100 dark:border-zinc-800"
          :style="{ top: i * HOUR_HEIGHT + 'px' }"
        ></div>
        <button
          v-for="ev in dayEvents(day.id)"
          :key="ev.id"
          :data-week-event="ev.id"
          type="button"
          class="absolute left-1 right-1.5 z-10 overflow-hidden rounded-md px-2 py-1 text-left text-xs font-semibold"
          :class="eventStyle(ev)"
          :style="eventTop(ev)"
          @click="emit('event-click', ev)"
        >
          {{ ev.title }}
          <span v-if="ev.subtitle" class="block truncate text-[10px] font-normal opacity-80">{{ ev.subtitle }}</span>
        </button>
        <!-- current-time line -->
        <div v-if="nowVisible" data-week-now class="pointer-events-none absolute left-0 right-0 z-20 border-t-2 border-red-500" :style="nowTop">
          <span class="absolute -left-1 -top-[5px] h-2 w-2 rounded-full bg-red-500"></span>
        </div>
      </div>
    </div>
  </div>
</template>
