<script setup lang="ts">
import { computed } from "vue";

export interface GanttMonth {
  label: string;
  weeks: number;
}

export interface GanttProject {
  id: string;
  emoji: string;
  name: string;
  status: string;
  points: number;
  start: number;
  end: number;
  tone?: "sky" | "violet" | "emerald" | "amber";
}

export interface ProjectGanttTimelineProps {
  months?: GanttMonth[];
  projects?: GanttProject[];
  todayMonth?: number;
  todayFraction?: number;
  class?: string;
}

const props = withDefaults(defineProps<ProjectGanttTimelineProps>(), {
  months: () => [
    { label: "AUG", weeks: 4 },
    { label: "SEP", weeks: 5 },
    { label: "OCT", weeks: 4 },
    { label: "NOV", weeks: 4 },
    { label: "DEC", weeks: 5 },
    { label: "JAN 2026", weeks: 4 },
    { label: "FEB", weeks: 4 },
    { label: "MAR", weeks: 4 },
    { label: "APR", weeks: 4 },
    { label: "MAY", weeks: 5 },
    { label: "JUN", weeks: 4 },
    { label: "JUL", weeks: 4 },
  ],
  projects: () => [
    { id: "p1", emoji: "🎧", name: "AI UX Research Assistant", status: "Planning", points: 34, start: 8, end: 9.5, tone: "violet" },
    { id: "p2", emoji: "📊", name: "User Insight & Behavior Analytics Dashboard", status: "In Progress", points: 68, start: 8.5, end: 12, tone: "sky" },
    { id: "p3", emoji: "🧩", name: "Design System Expansion", status: "In Progress", points: 65, start: 6, end: 11, tone: "sky" },
    { id: "p4", emoji: "🚀", name: "E-commerce Platform Launch", status: "Review", points: 90, start: 4, end: 9, tone: "emerald" },
  ],
  todayMonth: 8,
  todayFraction: 0.25,
  class: "",
});
const emit = defineEmits(["project-click"]);

const TONE_STYLES: Record<string, string> = {
  sky: "bg-sky-200 dark:bg-sky-900/70",
  violet: "bg-violet-200 dark:bg-violet-900/70",
  emerald: "bg-emerald-200 dark:bg-emerald-900/70",
  amber: "bg-amber-200 dark:bg-amber-900/70",
};

const STATUS_STYLES: Record<string, string> = {
  "In Progress": "bg-sky-100 text-sky-700 dark:bg-sky-950/70 dark:text-sky-300",
  Planning: "bg-violet-100 text-violet-700 dark:bg-violet-950/70 dark:text-violet-300",
  Review: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300",
  Done: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300",
};

const totalWeeks = computed(() => props.months.reduce((sum, m) => sum + m.weeks, 0));
const offsets = computed(() => {
  const list: number[] = [];
  let acc = 0;
  for (const m of props.months) {
    list.push(acc);
    acc += m.weeks;
  }
  return list;
});
const todayLeft = computed(() => {
  const off = offsets.value[props.todayMonth] ?? 0;
  const weeks = props.months[props.todayMonth]?.weeks ?? 1;
  return ((off + weeks * props.todayFraction) / totalWeeks.value) * 100;
});
const headerCells = computed(() =>
  props.months.map((m, i) => ({ ...m, i, left: (offsets.value[i] / totalWeeks.value) * 100, width: (m.weeks / totalWeeks.value) * 100 }))
);
const barLeft = (project: GanttProject) => ((offsets.value[project.start] ?? 0) / totalWeeks.value) * 100;
const barWidth = (project: GanttProject) => Math.max(((project.end - project.start) / totalWeeks.value) * 100, 2);
const barCls = (project: GanttProject) => TONE_STYLES[project.tone ?? "sky"] ?? TONE_STYLES.sky;
const statusCls = (status: string) => STATUS_STYLES[status] ?? STATUS_STYLES["In Progress"];
</script>

<template>
  <div data-gantt class="w-full overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900" :class="props.class">
    <!-- month header -->
    <div data-gantt-header class="relative flex border-b border-zinc-100 dark:border-zinc-800">
      <div
        v-for="m in headerCells"
        :key="m.i"
        class="shrink-0 border-r border-zinc-100 px-2 py-2 dark:border-zinc-800"
        :style="{ width: m.width + '%' }"
      >
        <p class="text-[11px] font-bold tracking-wide text-zinc-500 dark:text-zinc-400">{{ m.label }}</p>
        <div class="mt-1 flex gap-1">
          <span v-for="w in m.weeks" :key="w" class="h-1 flex-1 rounded-full bg-zinc-100 dark:bg-zinc-800"></span>
        </div>
      </div>
      <span
        data-gantt-today-pill
        class="absolute -top-0.5 z-10 rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white"
        :style="{ left: `calc(${todayLeft}% - 24px)` }"
      >
        Today
      </span>
    </div>

    <!-- rows -->
    <div data-gantt-rows class="relative">
      <div data-gantt-today-line class="pointer-events-none absolute bottom-0 top-0 z-10 w-px bg-red-400/70" :style="{ left: todayLeft + '%' }"></div>
      <button
        v-for="project in props.projects"
        :key="project.id"
        :data-gantt-project="project.id"
        type="button"
        class="relative flex w-full items-center gap-3 border-b border-zinc-100 px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800/40"
        @click="emit('project-click', project)"
      >
        <div data-gantt-label class="w-64 shrink-0">
          <p class="flex items-center gap-2 truncate text-sm font-semibold text-zinc-800 dark:text-zinc-100">
            <span aria-hidden="true">{{ project.emoji }}</span>
            <span class="truncate">{{ project.name }}</span>
          </p>
          <p class="mt-1 flex items-center gap-2 text-[11px]">
            <span class="rounded px-1.5 py-0.5 font-medium" :class="statusCls(project.status)">{{ project.status }}</span>
            <span class="text-zinc-400 dark:text-zinc-500">· {{ project.points }} pts</span>
          </p>
        </div>
        <div data-gantt-bar class="relative h-9 flex-1">
          <div class="absolute top-1/2 h-6 -translate-y-1/2 rounded-lg" :class="barCls(project)" :style="{ left: barLeft(project) + '%', width: barWidth(project) + '%' }"></div>
        </div>
      </button>
    </div>
  </div>
</template>
