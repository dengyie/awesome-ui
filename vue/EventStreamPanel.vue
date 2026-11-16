<script setup lang="ts">
import { computed, ref } from "vue";

export interface StreamEvent {
  id: string;
  name: string;
  date: string;
  metadata: { label: string; value: string }[];
  details: string;
}

export interface EventStreamPanelProps {
  filterPlaceholder?: string;
  eventColumnLabel?: string;
  dateColumnLabel?: string;
  events?: StreamEvent[];
  metadataTitle?: string;
  detailsTitle?: string;
  detailsLines?: number;
  class?: string;
}

const props = withDefaults(defineProps<EventStreamPanelProps>(), {
  filterPlaceholder: "Filter by event name, data, or date range",
  eventColumnLabel: "Event",
  dateColumnLabel: "Date and time",
  events: () => [
    {
      id: "ev1",
      name: "user.updated",
      date: "Nov 14, 2026 3:12 PM",
      metadata: [
        { label: "User", value: "Sama Lee" },
        { label: "Email", value: "sama@example.com" },
        { label: "Environment", value: "Production" },
      ],
      details:
        '{\n  "event": "user.updated",\n  "user": {\n    "id": "user_01H9",\n    "email": "sama@example.com",\n    "first_name": "Sama",\n    "last_name": "Lee",\n    "email_verified": true\n  }\n}',
    },
    {
      id: "ev2",
      name: "organization_membership.updated",
      date: "Nov 14, 2026 2:48 PM",
      metadata: [
        { label: "Organization", value: "Acme Inc" },
        { label: "Role", value: "admin" },
      ],
      details: '{\n  "event": "organization_membership.updated",\n  "role": "admin"\n}',
    },
    {
      id: "ev3",
      name: "invitation.created",
      date: "Nov 14, 2026 11:05 AM",
      metadata: [{ label: "Email", value: "new hire" }],
      details: '{\n  "event": "invitation.created"\n}',
    },
    {
      id: "ev4",
      name: "connection.activated",
      date: "Nov 13, 2026 5:30 PM",
      metadata: [{ label: "Connection", value: "Okta SSO" }],
      details: '{\n  "event": "connection.activated"\n}',
    },
    {
      id: "ev5",
      name: "session.created",
      date: "Nov 13, 2026 9:02 AM",
      metadata: [{ label: "User", value: "Sama Lee" }],
      details: '{\n  "event": "session.created"\n}',
    },
  ],
  metadataTitle: "Metadata",
  detailsTitle: "Event Details",
  detailsLines: 10,
  class: "",
});
const emit = defineEmits(["filter-change", "event-select", "view-event"]);

const filter = ref("");
const activeId = ref(props.events[0]?.id ?? "");

const filtered = computed(() =>
  filter.value
    ? props.events.filter((ev) => ev.name.toLowerCase().includes(filter.value.toLowerCase()))
    : props.events
);
const active = computed(() => props.events.find((ev) => ev.id === activeId.value) ?? props.events[0]);
const lineNumbers = computed(() => {
  const count = Math.max(props.detailsLines ?? 10, active.value ? active.value.details.split("\n").length : 1);
  return Array.from({ length: count }, (_, i) => i + 1).join("\n");
});

const select = (ev: StreamEvent) => {
  activeId.value = ev.id;
  emit("event-select", ev);
};
</script>

<template>
  <div data-stream-panel class="grid w-full gap-4 lg:grid-cols-5" :class="props.class">
    <!-- left: list -->
    <div data-stream-list class="rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900 lg:col-span-3">
      <div class="border-b border-zinc-100 p-3 dark:border-zinc-800">
        <input
          data-stream-filter
          v-model="filter"
          type="text"
          :placeholder="props.filterPlaceholder"
          class="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-800 placeholder-zinc-400 outline-none focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-950/60 dark:text-zinc-100 dark:placeholder-zinc-500"
          @input="emit('filter-change', filter)"
        />
      </div>
      <div data-stream-columns class="grid grid-cols-2 border-b border-zinc-100 px-4 py-2 text-xs font-semibold text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
        <span>{{ props.eventColumnLabel }}</span>
        <span>{{ props.dateColumnLabel }}</span>
      </div>
      <ul data-stream-items>
        <li v-for="ev in filtered" :key="ev.id">
          <button
            :data-stream-event="ev.id"
            type="button"
            class="grid w-full grid-cols-2 items-center px-4 py-3 text-left text-sm transition-colors"
            :class="ev.id === active?.id ? 'bg-zinc-50 dark:bg-zinc-800/60' : 'hover:bg-zinc-50/60 dark:hover:bg-zinc-800/40'"
            @click="select(ev)"
          >
            <span class="truncate font-mono text-xs font-semibold text-zinc-800 dark:text-zinc-100">{{ ev.name }}</span>
            <span class="truncate text-xs text-zinc-500 dark:text-zinc-400">{{ ev.date }}</span>
          </button>
        </li>
        <li v-if="filtered.length === 0" class="px-4 py-6 text-center text-sm text-zinc-400 dark:text-zinc-500">No events match this filter</li>
      </ul>
    </div>

    <!-- right: details -->
    <div data-stream-details class="space-y-4 lg:col-span-2">
      <div class="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <p data-stream-metadata-title class="text-sm font-bold text-zinc-900 dark:text-zinc-50">{{ props.metadataTitle }}</p>
        <dl data-stream-metadata class="mt-3 space-y-2">
          <div v-for="m in active?.metadata ?? []" :key="m.label" class="flex items-baseline justify-between gap-3">
            <dt class="text-xs text-zinc-500 dark:text-zinc-400">{{ m.label }}</dt>
            <dd class="truncate text-xs font-medium text-zinc-800 dark:text-zinc-100">{{ m.value }}</dd>
          </div>
        </dl>
        <button
          data-stream-view-event
          type="button"
          class="mt-4 w-full rounded-lg bg-zinc-900 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
          @click="active && emit('view-event', active)"
        >
          View event
        </button>
      </div>

      <div class="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <p data-stream-details-title class="border-b border-zinc-100 px-4 py-2.5 text-sm font-bold text-zinc-900 dark:border-zinc-800 dark:text-zinc-50">{{ props.detailsTitle }}</p>
        <div data-stream-json class="flex gap-3 overflow-x-auto px-4 py-3 font-mono text-[11px] leading-5">
          <span data-stream-json-lines aria-hidden="true" class="select-none whitespace-pre text-right text-zinc-300 dark:text-zinc-600">{{ lineNumbers }}</span>
          <pre class="whitespace-pre text-sky-700 dark:text-sky-300">{{ active?.details }}</pre>
        </div>
        <div data-stream-pager class="flex items-center justify-between border-t border-zinc-100 px-4 py-2.5 dark:border-zinc-800">
          <button type="button" class="text-xs font-semibold text-zinc-400 transition-colors hover:text-zinc-600 dark:hover:text-zinc-200">← Previous</button>
          <button type="button" class="text-xs font-semibold text-zinc-400 transition-colors hover:text-zinc-600 dark:hover:text-zinc-200">Next →</button>
        </div>
      </div>
    </div>
  </div>
</template>
