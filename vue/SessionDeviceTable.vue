<script setup lang="ts">
export type SessionStatus = "current" | "active" | "logged-out";

export interface SessionDevice {
  id: string;
  os: string;
  application: string;
  location: string;
  ip: string;
  lastActive: string;
  status: SessionStatus;
}

export interface SessionDeviceTableProps {
  title?: string;
  description?: string;
  learnMoreLabel?: string;
  logoutAllLabel?: string;
  pageLabel?: string;
  page?: number;
  rowsPerPageLabel?: string;
  rowsPerPage?: number;
  sessions?: SessionDevice[];
  class?: string;
}
const props = withDefaults(defineProps<SessionDeviceTableProps>(), {
  title: "Login sessions",
  description: "View your login sessions from the past 28 days. If you notice any suspicious logins, log out of those sessions and change your password immediately.",
  learnMoreLabel: "Learn more",
  logoutAllLabel: "Log out of all other sessions",
  pageLabel: "Page",
  page: 1,
  rowsPerPageLabel: "Rows per page:",
  rowsPerPage: 10,
  sessions: () => [
    { id: "s1", os: "Mac OS X", application: "Chrome 141", location: "Singapore, Singapore", ip: "116.14.152.165", lastActive: "4 minutes ago", status: "current" },
    { id: "s2", os: "Mac OS X", application: "Chrome 141", location: "Singapore, Singapore", ip: "103.224.164.31", lastActive: "6 days ago", status: "logged-out" },
    { id: "s3", os: "Windows 11", application: "Edge 140", location: "Tokyo, Japan", ip: "203.0.113.42", lastActive: "2 days ago", status: "active" },
    { id: "s4", os: "iOS 18", application: "Airwallex iOS", location: "Singapore, Singapore", ip: "116.14.152.198", lastActive: "10 days ago", status: "logged-out" },
  ],
  class: "",
});
const emit = defineEmits(["session-click", "logout-all"]);

const STATUS_STYLES: Record<SessionStatus, { label: string; cls: string }> = {
  current: { label: "Current", cls: "bg-violet-100 text-violet-700 dark:bg-violet-950/70 dark:text-violet-300" },
  active: { label: "Active", cls: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400" },
  "logged-out": { label: "Logged out", cls: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400" },
};
const styleFor = (status: SessionStatus) => STATUS_STYLES[status] ?? STATUS_STYLES["logged-out"];
const OS_ICONS: [string, string][] = [["mac", "🖥"], ["windows", "🪟"], ["linux", "🐧"], ["mobile", "📱"]];
const iconFor = (os: string) => {
  const hit = OS_ICONS.find(([k]) => os.toLowerCase().includes(k));
  return hit ? hit[1] : "🖥";
};
</script>

<template>
  <div data-session-table class="w-full rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900" :class="props.class">
    <div data-session-header class="flex flex-wrap items-start justify-between gap-3 border-b border-zinc-100 px-5 py-4 dark:border-zinc-800">
      <div class="max-w-2xl">
        <p data-session-title class="text-base font-semibold text-zinc-900 dark:text-zinc-50">{{ props.title }}</p>
        <p data-session-description class="mt-1 text-sm leading-5 text-zinc-500 dark:text-zinc-400">
          {{ props.description }}
          <a data-session-learn-more href="#" class="font-medium text-violet-600 hover:underline dark:text-violet-400">{{ props.learnMoreLabel }}</a>
        </p>
      </div>
      <button
        data-session-logout-all
        type="button"
        class="rounded-lg border border-zinc-200 px-3 py-2 text-sm font-medium text-violet-600 transition-colors hover:bg-violet-50 dark:border-zinc-700 dark:text-violet-400 dark:hover:bg-violet-950/40"
        @click="emit('logout-all')"
      >
        {{ props.logoutAllLabel }}
      </button>
    </div>
    <table data-session-table-body class="w-full text-left text-xs">
      <thead>
        <tr class="border-b border-zinc-100 text-[11px] font-semibold uppercase tracking-wide text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
          <th class="px-5 py-2.5 font-semibold">Operating system</th>
          <th class="px-2 py-2.5 font-semibold">Application</th>
          <th class="px-2 py-2.5 font-semibold">Location</th>
          <th class="px-2 py-2.5 font-semibold">IP address</th>
          <th class="px-2 py-2.5 font-semibold">Last active</th>
          <th class="px-5 py-2.5 font-semibold">Status</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="session in props.sessions"
          :key="session.id"
          :data-session-row="session.id"
          tabindex="0"
          class="cursor-pointer border-b border-zinc-50 transition-colors last:border-b-0 hover:bg-zinc-50 dark:border-zinc-800/60 dark:hover:bg-zinc-800/60"
          @click="emit('session-click', session)"
        >
          <td :data-session-row-os="session.os" class="whitespace-nowrap px-5 py-3 font-medium text-zinc-800 dark:text-zinc-100">
            <span class="mr-1.5 inline-flex" aria-hidden="true">{{ iconFor(session.os) }}</span>
            {{ session.os }}
          </td>
          <td :data-session-row-app="session.application" class="px-2 py-3 text-zinc-600 dark:text-zinc-300">{{ session.application }}</td>
          <td :data-session-row-location="session.location" class="px-2 py-3 text-zinc-600 dark:text-zinc-300">{{ session.location }}</td>
          <td :data-session-row-ip="session.ip" class="px-2 py-3 font-mono text-zinc-500 dark:text-zinc-400">{{ session.ip }}</td>
          <td :data-session-row-active="session.lastActive" class="whitespace-nowrap px-2 py-3 text-zinc-500 dark:text-zinc-400">{{ session.lastActive }}</td>
          <td :data-session-row-status="session.status" class="px-5 py-3">
            <span class="inline-block rounded px-2 py-0.5 text-[11px] font-semibold" :class="styleFor(session.status).cls">{{ styleFor(session.status).label }}</span>
          </td>
        </tr>
      </tbody>
    </table>
    <div data-session-footer class="flex items-center justify-between border-t border-zinc-100 px-5 py-3 dark:border-zinc-800">
      <div data-session-pager class="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-300">
        <button type="button" data-session-pager-prev aria-label="Previous page" class="rounded-md border border-zinc-200 px-2 py-1 text-zinc-400 transition-colors hover:text-zinc-600 dark:border-zinc-700 dark:text-zinc-500 dark:hover:text-zinc-300">‹</button>
        <span :data-session-page="props.page">{{ props.pageLabel }} {{ props.page }}</span>
        <button type="button" data-session-pager-next aria-label="Next page" class="rounded-md border border-zinc-200 px-2 py-1 text-zinc-400 transition-colors hover:text-zinc-600 dark:border-zinc-700 dark:text-zinc-500 dark:hover:text-zinc-300">›</button>
      </div>
      <label data-session-rows-per-page class="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
        {{ props.rowsPerPageLabel }}
        <select data-session-rows-select :value="props.rowsPerPage" class="rounded-md border border-zinc-200 bg-white px-2 py-1 text-xs text-zinc-700 outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200">
          <option v-for="n in [10, 25, 50]" :key="n" :value="n">{{ n }}</option>
        </select>
      </label>
    </div>
  </div>
</template>
