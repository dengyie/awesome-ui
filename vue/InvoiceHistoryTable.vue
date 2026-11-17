<script setup lang="ts">
import { computed } from "vue";

export type InvoiceStatus = "paid" | "pending" | "failed";

export interface Invoice {
  id: string;
  period: string;
  amount: string;
  status: InvoiceStatus;
  date: string;
}

export interface InvoiceHistoryTableProps {
  title?: string;
  currency?: string;
  downloadLabel?: string;
  invoices?: Invoice[];
  class?: string;
}

const props = withDefaults(defineProps<InvoiceHistoryTableProps>(), {
  title: "Invoice history",
  currency: "USD",
  downloadLabel: "Download",
  invoices: () => [
    { id: "INV-2026-011", period: "November 2026", amount: "148.00", status: "paid", date: "Nov 1, 2026" },
    { id: "INV-2026-010", period: "October 2026", amount: "148.00", status: "paid", date: "Oct 1, 2026" },
    { id: "INV-2026-009", period: "September 2026", amount: "96.00", status: "pending", date: "Sep 1, 2026" },
    { id: "INV-2026-008", period: "August 2026", amount: "148.00", status: "failed", date: "Aug 1, 2026" },
  ],
  class: "",
});

const emit = defineEmits<{
  (e: "invoice-download", invoice: Invoice): void;
}>();

const STATUS_STYLES: Record<InvoiceStatus, { label: string; cls: string }> = {
  paid: { label: "Paid", cls: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400" },
  pending: { label: "Pending", cls: "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400" },
  failed: { label: "Failed", cls: "bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-400" },
};

const list = computed(() => (Array.isArray(props.invoices) ? props.invoices : []));
const paidTotal = computed(() => {
  const sum = list.value
    .filter((inv) => inv.status === "paid")
    .reduce((acc, inv) => {
      const n = Number.parseFloat(String(inv.amount ?? "0").replace(/[^0-9.\-]/g, ""));
      return acc + (Number.isNaN(n) ? 0 : n);
    }, 0);
  return sum.toFixed(2);
});
</script>

<template>
  <div data-invoice-table class="w-full rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900" :class="props.class">
    <div data-invoice-header class="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 px-5 py-4 dark:border-zinc-800">
      <p data-invoice-title class="text-base font-semibold text-zinc-900 dark:text-zinc-50">{{ props.title }}</p>
      <span data-invoice-currency class="rounded-full bg-zinc-100 px-2.5 py-0.5 text-[11px] font-semibold text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">{{ props.currency }}</span>
    </div>
    <table data-invoice-table-body class="w-full text-left text-xs">
      <thead>
        <tr class="border-b border-zinc-100 text-[11px] font-semibold uppercase tracking-wide text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
          <th class="px-5 py-2.5 font-semibold">Billing period</th>
          <th class="px-2 py-2.5 font-semibold">Invoice</th>
          <th class="px-2 py-2.5 text-right font-semibold">Amount</th>
          <th class="px-2 py-2.5 font-semibold">Status</th>
          <th class="px-2 py-2.5 font-semibold">Date</th>
          <th class="px-5 py-2.5 text-right font-semibold"><span class="sr-only">Actions</span></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="inv in list" :key="inv.id" :data-invoice-row="inv.id" class="border-b border-zinc-50 transition-colors last:border-b-0 hover:bg-zinc-50 dark:border-zinc-800/60 dark:hover:bg-zinc-800/60">
          <td :data-invoice-period="inv.period" class="whitespace-nowrap px-5 py-3 font-medium text-zinc-800 dark:text-zinc-100">{{ inv.period }}</td>
          <td :data-invoice-id="inv.id" class="px-2 py-3 font-mono text-xs text-zinc-500 dark:text-zinc-400">{{ inv.id }}</td>
          <td :data-invoice-amount="inv.amount" class="px-2 py-3 text-right font-mono text-zinc-800 dark:text-zinc-100">{{ props.currency }} {{ inv.amount }}</td>
          <td :data-invoice-status="inv.status" class="px-2 py-3"><span class="inline-block rounded px-2 py-0.5 text-[11px] font-semibold" :class="STATUS_STYLES[inv.status]?.cls">{{ STATUS_STYLES[inv.status]?.label }}</span></td>
          <td :data-invoice-date="inv.date" class="whitespace-nowrap px-2 py-3 text-zinc-500 dark:text-zinc-400">{{ inv.date }}</td>
          <td class="px-5 py-3 text-right">
            <button type="button" :data-invoice-download="inv.id" class="rounded-md border border-zinc-200 px-2.5 py-1 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800" @click="emit('invoice-download', inv)">{{ props.downloadLabel }}</button>
          </td>
        </tr>
      </tbody>
    </table>
    <div data-invoice-footer class="flex items-center justify-between border-t border-zinc-100 px-5 py-3 text-sm dark:border-zinc-800">
      <span data-invoice-total-label class="text-zinc-500 dark:text-zinc-400">Paid total</span>
      <span data-invoice-total-value class="font-mono font-semibold text-zinc-900 dark:text-zinc-50">{{ props.currency }} {{ paidTotal }}</span>
    </div>
  </div>
</template>
