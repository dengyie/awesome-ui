<script setup lang="ts">
import { ref, computed } from "vue";

export interface SeatRow {
  id: string;
  user: string;
  email?: string;
  seat?: string;
  cost?: number;
  usage?: string;
  status?: "active" | "invited" | "suspended";
}
interface Props {
  title?: string;
  description?: string;
  rows?: SeatRow[];
  period?: string;
  currency?: string;
  searchable?: boolean;
}
const props = withDefaults(defineProps<Props>(), {
  title: "Usage by User",
  description: "Per-seat costs and credit consumption for the current billing period.",
  rows: () => [],
  period: "Monthly",
  currency: "$",
  searchable: true,
});

const query = ref("");
const q = computed(() => query.value.trim().toLowerCase());
const filtered = computed(() => {
  if (!q.value) return props.rows;
  return props.rows.filter(
    (r) => r.user.toLowerCase().includes(q.value) || (r.email ?? "").toLowerCase().includes(q.value)
  );
});

const billedSeats = computed(() => props.rows.filter((r) => r.status !== "suspended"));
const totalCost = computed(() => billedSeats.value.reduce((acc, r) => acc + (r.cost ?? 0), 0));

const statusBadge = (status: NonNullable<SeatRow["status"]>) =>
  status === "active"
    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
    : status === "invited"
      ? "bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-400"
      : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400";
const statusLabel = (status: NonNullable<SeatRow["status"]>) =>
  status === "active" ? "Active" : status === "invited" ? "Invited" : "Suspended";

const fmtCost = (cost: number) => `${props.currency}${cost.toFixed(2)}`;
</script>

<template>
  <div data-seat-table class="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
    <div class="flex flex-wrap items-center justify-between gap-2">
      <p data-seat-title class="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{{ props.title }}</p>
      <span v-if="props.period" data-seat-period class="text-[11px] text-zinc-400 dark:text-zinc-500">{{ props.period }}</span>
    </div>
    <p data-seat-description class="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{{ props.description }}</p>

    <input
      v-if="props.searchable"
      data-seat-search
      type="search"
      v-model="query"
      placeholder="Search for a user…"
      class="mt-3 w-full rounded-md border border-zinc-200 bg-white px-2.5 py-1.5 text-xs text-zinc-700 placeholder:text-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
    />

    <table data-seat-rows class="mt-2 w-full text-left text-xs">
      <thead>
        <tr class="border-b border-zinc-200 text-[10px] uppercase tracking-wide text-zinc-400 dark:border-zinc-700">
          <th class="py-1.5 pr-2 font-semibold">Name</th>
          <th class="py-1.5 pr-2 font-semibold">Seat</th>
          <th class="py-1.5 pr-2 font-semibold">Usage</th>
          <th class="py-1.5 text-right font-semibold">Cost</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="r in filtered"
          :key="r.id"
          :data-seat-row="r.id"
          class="border-b border-zinc-100 last:border-0 dark:border-zinc-800"
        >
          <td class="py-2 pr-2">
            <div class="flex items-center gap-2">
              <span data-seat-user class="truncate font-medium text-zinc-700 dark:text-zinc-200">{{ r.user }}</span>
              <span
                v-if="r.status && r.status !== 'active'"
                data-seat-status
                :class="`rounded-full px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide ${statusBadge(r.status)}`"
              >
                {{ statusLabel(r.status) }}
              </span>
            </div>
            <p v-if="r.email" class="mt-0.5 truncate text-[10px] text-zinc-400 dark:text-zinc-500">{{ r.email }}</p>
          </td>
          <td class="py-2 pr-2 text-zinc-500 dark:text-zinc-400">{{ r.seat ?? "Member" }}</td>
          <td class="py-2 pr-2 font-mono text-[11px] text-zinc-500 dark:text-zinc-400">{{ r.usage ?? "—" }}</td>
          <td data-seat-cost class="py-2 text-right font-mono text-[11px] text-zinc-700 dark:text-zinc-200">
            {{ r.cost != null ? fmtCost(r.cost) : "—" }}
          </td>
        </tr>
        <tr v-if="filtered.length === 0">
          <td colspan="4" data-seat-empty class="py-4 text-center text-xs text-zinc-400 dark:text-zinc-500">
            {{ q ? "No users match your search" : "No seats billed this period" }}
          </td>
        </tr>
      </tbody>
      <tfoot v-if="billedSeats.length > 0">
        <tr data-seat-total class="border-t border-zinc-200 dark:border-zinc-700">
          <td class="py-2 pr-2 text-[11px] font-semibold text-zinc-600 dark:text-zinc-300">
            {{ billedSeats.length }} billed seat{{ billedSeats.length === 1 ? "" : "s" }}
          </td>
          <td colspan="2"></td>
          <td data-seat-total-cost class="py-2 text-right font-mono text-xs font-semibold text-zinc-800 dark:text-zinc-100">
            {{ fmtCost(totalCost) }}
          </td>
        </tr>
      </tfoot>
    </table>
  </div>
</template>
