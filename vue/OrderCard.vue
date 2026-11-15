<template>
  <div data-order-card class="w-full overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
    <div class="flex items-center justify-between gap-2 bg-zinc-50 px-4 py-2.5 dark:bg-zinc-800/60">
      <p class="truncate text-xs font-semibold text-zinc-700 dark:text-zinc-200">
        Order# {{ orderNumber }}<span v-if="placedAt" class="ml-2 font-normal text-zinc-400">· Placed {{ placedAt }}</span>
      </p>
      <button type="button" data-order-open class="shrink-0 rounded-full border border-zinc-300 bg-white px-2.5 py-1 text-[11px] font-semibold text-zinc-600 transition-colors hover:bg-zinc-100 focus-visible:outline-none dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800" @click="emit('open')">
        View details
      </button>
    </div>
    <div class="p-4">
      <div class="flex items-start justify-between gap-3">
        <div class="min-w-0">
          <p v-if="status === 'canceled'" class="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            Canceled<template v-if="fulfillment?.eta"> on {{ fulfillment.eta }}</template>
          </p>
          <p v-else class="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            {{ fulfillment ? FULFILLMENT_LABEL[fulfillment.type] : 'Fulfilled' }}<template v-if="fulfillment?.eta"> by {{ fulfillment.eta }}</template>
          </p>
          <p v-if="fulfillment?.store" class="mt-0.5 flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-3 w-3"><path d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11Z" /><circle cx="12" cy="10" r="2.5" /></svg>
            {{ fulfillment!.store }}
          </p>
          <p v-if="statusNote" class="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{{ statusNote }}</p>
        </div>
        <span data-order-status :class="['shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold', tone.badge]">{{ tone.label }}</span>
      </div>
      <ul v-if="items.length" data-order-items class="mt-3 space-y-2 border-t border-zinc-100 pt-3 dark:border-zinc-800">
        <li v-for="item in items" :key="item.id" :data-order-item="item.id" class="flex items-center gap-3">
          <img v-if="item.image" :src="item.image" alt="" class="h-10 w-10 shrink-0 rounded-lg object-cover" />
          <span v-else class="h-10 w-10 shrink-0 rounded-lg bg-zinc-100 dark:bg-zinc-800" />
          <span class="min-w-0 flex-1">
            <span class="block truncate text-xs font-medium text-zinc-800 dark:text-zinc-100">{{ item.title }}</span>
            <span v-if="item.qty != null" class="block text-[11px] text-zinc-400">Qty: {{ item.qty }}</span>
          </span>
          <span v-if="item.price" class="shrink-0 text-xs font-semibold text-zinc-700 dark:text-zinc-200">{{ item.price }}</span>
        </li>
      </ul>
      <div class="mt-3 flex items-center justify-between border-t border-zinc-100 pt-3 dark:border-zinc-800">
        <button type="button" data-order-buy-again class="text-xs font-semibold text-indigo-600 hover:underline dark:text-indigo-400" @click="emit('action', 'buy-again')">Buy it again</button>
        <p v-if="total" class="text-xs font-semibold text-zinc-900 dark:text-zinc-50">Total {{ total }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

export interface OrderItem {
  id: string;
  title: string;
  image?: string;
  price?: string;
  qty?: number;
}

const STATUS_TONE: Record<string, { label: string; badge: string }> = {
  placed: { label: 'Placed', badge: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300' },
  preparing: { label: 'Preparing', badge: 'bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300' },
  shipped: { label: 'On its way', badge: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300' },
  delivered: { label: 'Delivered', badge: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300' },
  'on-hold': { label: 'On hold', badge: 'bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300' },
  canceled: { label: 'Canceled', badge: 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400' },
};

const FULFILLMENT_LABEL: Record<string, string> = {
  delivery: 'Arrives',
  pickup: 'Ready for pickup',
  curbside: 'Curbside ready',
};

const props = withDefaults(
  defineProps<{
    orderNumber: string;
    placedAt?: string;
    status: 'placed' | 'preparing' | 'shipped' | 'delivered' | 'on-hold' | 'canceled';
    fulfillment?: { type: 'delivery' | 'pickup' | 'curbside'; eta?: string; store?: string };
    items?: OrderItem[];
    total?: string;
    statusNote?: string;
  }>(),
  { items: () => [] },
);

const emit = defineEmits<{
  (e: 'open'): void;
  (e: 'action', action: string): void;
}>();

const tone = computed(() => STATUS_TONE[props.status] || STATUS_TONE.placed);
</script>
