<script setup lang="ts">
export interface NotificationPrefEvent {
  id: string;
  label: string;
  channels: Record<string, boolean | undefined>;
}

export interface NotificationPrefColumn {
  key: string;
  label: string;
}

export interface NotificationPrefsMatrixProps {
  title?: string;
  description?: string;
  events?: NotificationPrefEvent[];
  columns?: NotificationPrefColumn[];
  class?: string;
}

const props = withDefaults(defineProps<NotificationPrefsMatrixProps>(), {
  title: "Notification preferences",
  description: "Choose which events reach you and through which channels.",
  events: () => [
    { id: "mentions", label: "Mentions & replies", channels: { inapp: true, email: true, push: false } },
    { id: "assigns", label: "Assigned to me", channels: { inapp: true, email: false, push: true } },
    { id: "comments", label: "Thread comments", channels: { inapp: true, email: true, push: false } },
    { id: "digest", label: "Weekly digest", channels: { inapp: false, email: true, push: false } },
  ],
  columns: () => [
    { key: "inapp", label: "In-app" },
    { key: "email", label: "Email" },
    { key: "push", label: "Push" },
  ],
  class: "",
});

const emit = defineEmits<{
  (e: "pref-change", event: NotificationPrefEvent, channel: string, enabled: boolean): void;
}>();

const onCell = (ev: NotificationPrefEvent, col: NotificationPrefColumn, target: Event | null) => {
  const enabled = Boolean(target && (target as HTMLInputElement).checked);
  ev.channels[col.key] = enabled;
  emit("pref-change", ev, col.key, enabled);
};
</script>

<template>
  <div data-pref-matrix class="w-full rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900" :class="props.class">
    <div data-pref-header class="border-b border-zinc-100 px-5 py-4 dark:border-zinc-800">
      <p data-pref-title class="text-base font-semibold text-zinc-900 dark:text-zinc-50">{{ props.title }}</p>
      <p data-pref-description class="mt-1 text-sm leading-5 text-zinc-500 dark:text-zinc-400">{{ props.description }}</p>
    </div>
    <table data-pref-table-body class="w-full text-left text-xs">
      <thead>
        <tr class="border-b border-zinc-100 text-[11px] font-semibold uppercase tracking-wide text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
          <th class="px-5 py-2.5 font-semibold">Event</th>
          <th v-for="col in (Array.isArray(props.columns) ? props.columns : [])" :key="col.key" :data-pref-col="col.key" class="w-20 px-2 py-2.5 text-center font-semibold">{{ col.label }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="ev in (Array.isArray(props.events) ? props.events : [])" :key="ev.id" :data-pref-row="ev.id" class="border-b border-zinc-50 transition-colors last:border-b-0 hover:bg-zinc-50 dark:border-zinc-800/60 dark:hover:bg-zinc-800/60">
          <td :data-pref-label="ev.label" class="px-5 py-3 text-sm font-medium text-zinc-800 dark:text-zinc-100">{{ ev.label }}</td>
          <td v-for="col in (Array.isArray(props.columns) ? props.columns : [])" :key="col.key" :data-pref-cell-state="`${ev.id}|${col.key}`" class="px-2 py-3 text-center">
            <input
              type="checkbox"
              :data-pref-cell="`${ev.id}|${col.key}`"
              :checked="Boolean(ev.channels && ev.channels[col.key])"
              class="h-4 w-4 accent-violet-600"
              :aria-label="`${ev.label} via ${col.label}`"
              @change="onCell(ev, col, $event.target)"
            />
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
