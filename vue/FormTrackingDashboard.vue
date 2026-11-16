<script setup lang="ts">
import { ref } from "vue";

export interface FormStat {
  id: string;
  label: string;
  value: number;
  pct: number;
  tone: "sky" | "emerald" | "amber" | "rose";
  icon?: string;
}

export interface FormDetail {
  label: string;
  value: string;
}

export interface FormRequestRow {
  id: string;
  name: string;
  initials?: string;
  avatarUrl?: string;
  submitted: string;
  service: string;
  status: "completed" | "to-be-completed" | "not-completed";
}

export interface FormTrackingDashboardProps {
  title?: string;
  active?: boolean;
  stats?: FormStat[];
  details?: FormDetail[];
  requests?: FormRequestRow[];
  sortOptions?: string[];
  class?: string;
}

const props = withDefaults(defineProps<FormTrackingDashboardProps>(), {
  title: "Consultation form",
  active: true,
  stats: () => [
    { id: "s1", label: "Sent to", value: 12, pct: 100, tone: "sky", icon: "📤" },
    { id: "s2", label: "Completed", value: 8, pct: 67, tone: "emerald", icon: "✅" },
    { id: "s3", label: "To be completed", value: 2, pct: 17, tone: "amber", icon: "⏳" },
    { id: "s4", label: "Not completed", value: 2, pct: 17, tone: "rose", icon: "⛔" },
  ],
  details: () => [
    { label: "Form name", value: "Consultation form" },
    { label: "Service", value: "Initial consultation" },
    { label: "Sent to", value: "12 clients" },
    { label: "Created", value: "Nov 2, 2026" },
    { label: "Reminder", value: "Automatic · 3 days" },
    { label: "Expiration", value: "No expiration" },
  ],
  requests: () => [
    { id: "r1", name: "Anna Kowalski", initials: "AK", submitted: "Nov 12, 2026", service: "Initial consultation", status: "completed" },
    { id: "r2", name: "Ben Carter", initials: "BC", submitted: "Nov 13, 2026", service: "Initial consultation", status: "to-be-completed" },
    { id: "r3", name: "Chen Wei", initials: "CW", submitted: "—", service: "Initial consultation", status: "not-completed" },
    { id: "r4", name: "Dana Patel", initials: "DP", submitted: "Nov 14, 2026", service: "Initial consultation", status: "completed" },
  ],
  sortOptions: () => ["Newest first", "Oldest first", "Name A–Z", "Status"],
  class: "",
});

const emit = defineEmits(["back", "sort-change", "request-click"]);

const sortOpen = ref(false);
const sort = ref(props.sortOptions[0] ?? "Newest first");

const STATUS_META: Record<string, { label: string; cls: string }> = {
  completed: { label: "Completed", cls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300" },
  "to-be-completed": { label: "To be completed", cls: "bg-amber-100 text-amber-700 dark:bg-amber-950/70 dark:text-amber-300" },
  "not-completed": { label: "Not completed", cls: "bg-rose-100 text-rose-700 dark:bg-rose-950/70 dark:text-rose-300" },
};

const TONE_DOT: Record<string, string> = {
  sky: "bg-sky-500",
  emerald: "bg-emerald-500",
  amber: "bg-amber-500",
  rose: "bg-rose-500",
};

const TONE_BAR: Record<string, string> = {
  sky: "bg-sky-500",
  emerald: "bg-emerald-500",
  amber: "bg-amber-500",
  rose: "bg-rose-500",
};

const pickSort = (opt: string) => {
  sort.value = opt;
  sortOpen.value = false;
  emit("sort-change", opt);
};

const clampPct = (n: number) => Math.min(100, Math.max(0, n));
</script>

<template>
  <div data-formtrack class="w-full rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900 sm:p-6" :class="props.class">
    <div data-formtrack-header class="flex items-center gap-3">
      <button data-formtrack-back type="button" aria-label="Back" class="rounded-lg p-1.5 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-800 dark:hover:bg-zinc-800 dark:hover:text-zinc-100" @click="emit('back')">←</button>
      <h2 data-formtrack-title class="text-xl font-bold text-zinc-900 dark:text-zinc-50">{{ props.title }}</h2>
      <span v-if="props.active" data-formtrack-active class="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300">Active</span>
      <div class="relative ml-auto">
        <button data-formtrack-options type="button" class="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800" @click="sortOpen = !sortOpen">Options ▾</button>
        <div v-if="sortOpen" data-formtrack-sortmenu class="absolute right-0 z-10 mt-1 w-44 overflow-hidden rounded-xl border border-zinc-200 bg-white py-1 shadow-lg dark:border-zinc-700 dark:bg-zinc-800">
          <button
            v-for="opt in props.sortOptions"
            :key="opt"
            :data-formtrack-sortoption="opt"
            type="button"
            class="block w-full px-3 py-1.5 text-left text-xs transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-700"
            :class="opt === sort ? 'font-semibold text-indigo-600 dark:text-indigo-300' : 'text-zinc-600 dark:text-zinc-300'"
            @click="pickSort(opt)"
          >
            {{ opt }}
          </button>
        </div>
      </div>
    </div>

    <div data-formtrack-stats class="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <div v-for="s in props.stats" :key="s.id" :data-formtrack-stat="s.id" class="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
        <div class="flex items-center gap-2">
          <span class="h-2.5 w-2.5 rounded-full" :class="TONE_DOT[s.tone]" aria-hidden="true" />
          <p class="text-xs font-medium text-zinc-500 dark:text-zinc-400"><span v-if="s.icon" aria-hidden="true" class="mr-1">{{ s.icon }}</span>{{ s.label }}</p>
        </div>
        <p :data-formtrack-stat-value="s.id" class="mt-1.5 text-2xl font-black text-zinc-900 dark:text-zinc-50">{{ s.value }}</p>
        <div class="mt-2 h-1.5 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
          <div class="h-full rounded-full" :class="TONE_BAR[s.tone]" :style="{ width: clampPct(s.pct) + '%' }" />
        </div>
        <p class="mt-1 text-[11px] text-zinc-400 dark:text-zinc-500">{{ s.pct }}% of sent</p>
      </div>
    </div>

    <div data-formtrack-details class="mt-6">
      <p class="text-sm font-bold text-zinc-900 dark:text-zinc-50">Consultation form details</p>
      <div class="mt-2 grid gap-x-8 gap-y-2 rounded-xl border border-zinc-200 p-4 sm:grid-cols-2 dark:border-zinc-800">
        <div v-for="d in props.details" :key="d.label" class="flex items-center justify-between gap-4 text-sm">
          <span class="text-zinc-500 dark:text-zinc-400">{{ d.label }}</span>
          <span class="font-medium text-zinc-800 dark:text-zinc-100">{{ d.value }}</span>
        </div>
      </div>
    </div>

    <div data-formtrack-table class="mt-6">
      <p class="text-sm font-bold text-zinc-900 dark:text-zinc-50">Client form requests</p>
      <div class="mt-2 overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
        <table class="w-full text-left text-sm">
          <thead>
            <tr class="border-b border-zinc-200 bg-zinc-50 text-xs uppercase tracking-wide text-zinc-400 dark:border-zinc-800 dark:bg-zinc-800/50 dark:text-zinc-500">
              <th class="px-4 py-2.5 font-semibold">Client</th>
              <th class="px-4 py-2.5 font-semibold">Submitted</th>
              <th class="px-4 py-2.5 font-semibold">Service</th>
              <th class="px-4 py-2.5 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="r in props.requests"
              :key="r.id"
              :data-formtrack-row="r.id"
              class="cursor-pointer border-b border-zinc-100 transition-colors last:border-0 hover:bg-zinc-50 dark:border-zinc-800/60 dark:hover:bg-zinc-800/40"
              @click="emit('request-click', r)"
            >
              <td class="px-4 py-2.5">
                <span class="flex items-center gap-2.5">
                  <span class="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-indigo-100 text-xs font-bold text-indigo-700 dark:bg-indigo-950/70 dark:text-indigo-300">
                    <img v-if="r.avatarUrl" :src="r.avatarUrl" :alt="r.name" class="h-8 w-8 rounded-full object-cover" />
                    <template v-else>{{ r.initials ?? r.name.slice(0, 2).toUpperCase() }}</template>
                  </span>
                  <span class="font-medium text-zinc-800 dark:text-zinc-100">{{ r.name }}</span>
                </span>
              </td>
              <td class="whitespace-nowrap px-4 py-2.5 text-zinc-500 dark:text-zinc-400">{{ r.submitted }}</td>
              <td class="px-4 py-2.5 text-zinc-500 dark:text-zinc-400">{{ r.service }}</td>
              <td class="px-4 py-2.5">
                <span :data-formtrack-status="r.status" class="inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold" :class="STATUS_META[r.status]?.cls">{{ STATUS_META[r.status]?.label }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
