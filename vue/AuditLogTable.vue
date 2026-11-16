<script setup lang="ts">
export type AuditEventStatus = "success" | "failure" | "pending";

export interface AuditEvent {
  id: string;
  time: string;
  actor: string;
  event: string;
  status: AuditEventStatus;
  target: string;
}

export interface AuditLogTableProps {
  title?: string;
  filters?: { label: string; value: string }[];
  trend?: { label: string; value: number }[];
  views?: string[];
  activeView?: string;
  events?: AuditEvent[];
  class?: string;
}
const props = withDefaults(defineProps<AuditLogTableProps>(), {
  title: "System Log",
  filters: () => [
    { label: "Date range", value: "Last 24 hours" },
    { label: "Keyword", value: "user.session" },
  ],
  trend: () => [
    { label: "Mon", value: 12 },
    { label: "Tue", value: 28 },
    { label: "Wed", value: 19 },
    { label: "Thu", value: 41 },
    { label: "Fri", value: 33 },
    { label: "Sat", value: 9 },
    { label: "Sun", value: 5 },
  ],
  views: () => ["Events", "Raw export"],
  activeView: "Events",
  events: () => [
    { id: "e1", time: "2026-11-16 09:41:22", actor: "admin@mango.dev", event: "user.session.login", status: "success", target: "Web session (Chrome 141, macOS)" },
    { id: "e2", time: "2026-11-16 09:38:04", actor: "svc-deploy@github", event: "app.oauth2.token.grant", status: "success", target: "deploy-bot client" },
    { id: "e3", time: "2026-11-16 08:57:51", actor: "unknown@203.0.113.7", event: "user.session.login", status: "failure", target: "Sign-in attempt — invalid password" },
    { id: "e4", time: "2026-11-16 08:12:10", actor: "admin@mango.dev", event: "group.membership.add", status: "success", target: "engineering → sso-everyone" },
    { id: "e5", time: "2026-11-16 07:44:36", actor: "audit-daemon", event: "policy.rule.evaluate", status: "pending", target: "mfa-required rule (draft)" },
  ],
  class: "",
});
const emit = defineEmits(["event-click", "view-change"]);

const STATUS_STYLES: Record<AuditEventStatus, { label: string; cls: string }> = {
  success: { label: "SUCCESS", cls: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400" },
  failure: { label: "FAILURE", cls: "bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-400" },
  pending: { label: "PENDING", cls: "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400" },
};
const styleFor = (status: AuditEventStatus) => STATUS_STYLES[status] ?? STATUS_STYLES.pending;
const maxTrend = Math.max(...props.trend.map((t) => t.value), 1);
const barHeight = (value: number) => `${Math.round((value / maxTrend) * 36) + 4}px`;
</script>

<template>
  <div data-audit-log class="w-full rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900" :class="props.class">
    <div data-audit-header class="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 px-4 py-3 dark:border-zinc-800">
      <p data-audit-title class="text-sm font-semibold text-zinc-800 dark:text-zinc-100">{{ props.title }}</p>
      <div data-audit-filters class="flex flex-wrap items-center gap-2">
        <button
          v-for="f in props.filters"
          :key="f.label"
          :data-audit-filter="f.label"
          type="button"
          class="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 px-2.5 py-1.5 text-xs text-zinc-600 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          <span class="text-zinc-400" aria-hidden="true">◷</span>
          <span class="font-medium">{{ f.label }}:</span> {{ f.value }}
          <span class="text-zinc-400" aria-hidden="true">▾</span>
        </button>
      </div>
    </div>
    <div data-audit-overview class="flex flex-wrap items-end justify-between gap-4 px-4 py-3">
      <div data-audit-trend class="flex items-end gap-1.5" aria-hidden="true">
        <span v-for="t in props.trend" :key="t.label" :data-audit-trend-bar="t.label" class="flex w-4 flex-col items-center gap-0.5">
          <span class="w-full rounded-sm bg-zinc-200 dark:bg-zinc-700" :style="{ height: barHeight(t.value) }" />
          <span class="text-[9px] text-zinc-400 dark:text-zinc-500">{{ t.label }}</span>
        </span>
      </div>
      <div class="flex items-center gap-3">
        <p data-audit-count class="text-sm text-zinc-500 dark:text-zinc-400">
          <span class="font-semibold text-zinc-900 dark:text-zinc-50">{{ props.events.length }}</span> events
        </p>
        <div data-audit-views class="inline-flex items-center gap-0.5 rounded-md bg-zinc-100 p-0.5 dark:bg-zinc-800">
          <button
            v-for="v in props.views"
            :key="v"
            type="button"
            :data-audit-view="v"
            :aria-pressed="v === props.activeView"
            :class="v === props.activeView
              ? 'rounded bg-white px-2 py-0.5 text-[11px] font-medium text-zinc-800 shadow-sm dark:bg-zinc-700 dark:text-zinc-100'
              : 'rounded px-2 py-0.5 text-[11px] font-medium text-zinc-500 transition-colors hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200'"
            @click="emit('view-change', v)"
          >
            {{ v }}
          </button>
        </div>
      </div>
    </div>
    <table data-audit-table class="w-full text-left text-xs">
      <thead>
        <tr class="border-y border-zinc-100 text-[11px] font-medium text-zinc-400 dark:border-zinc-800 dark:text-zinc-500">
          <th class="px-4 py-2 font-medium">Time</th>
          <th class="px-2 py-2 font-medium">Actor</th>
          <th class="px-2 py-2 font-medium">Event info</th>
          <th class="px-4 py-2 font-medium">Targets</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="event in props.events"
          :key="event.id"
          :data-audit-row="event.id"
          tabindex="0"
          class="cursor-pointer border-b border-zinc-50 align-top transition-colors last:border-b-0 hover:bg-zinc-50 dark:border-zinc-800/60 dark:hover:bg-zinc-800/60"
          @click="emit('event-click', event)"
        >
          <td :data-audit-row-time="event.time" class="whitespace-nowrap px-4 py-2.5 text-zinc-500 dark:text-zinc-400">{{ event.time }}</td>
          <td :data-audit-row-actor="event.actor" class="px-2 py-2.5 text-zinc-700 dark:text-zinc-200">{{ event.actor }}</td>
          <td :data-audit-row-event="event.event" class="px-2 py-2.5">
            <span class="font-mono text-zinc-800 dark:text-zinc-100">{{ event.event }}</span>
            <span :data-audit-row-status="event.status" class="ml-2 inline-block rounded px-1.5 py-0.5 text-[9px] font-semibold" :class="styleFor(event.status).cls">
              {{ styleFor(event.status).label }}
            </span>
          </td>
          <td :data-audit-row-target="event.target" class="max-w-[18rem] truncate px-4 py-2.5 text-zinc-500 dark:text-zinc-400" :title="event.target">{{ event.target }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
