<script setup lang="ts">
import { ref } from "vue";

export interface DeliveryStep {
  id: string;
  icon: string;
  label: string;
  state: "done" | "active" | "pending";
}

export interface DeliveryItem {
  id: string;
  name: string;
  quantity: string;
  price: string;
}

export interface DeliveryTrackingPanelProps {
  title?: string;
  etaPrefix?: string;
  eta?: string;
  statusText?: string;
  steps?: DeliveryStep[];
  courierName?: string;
  courierRole?: string;
  orderName?: string;
  orderSummary?: string;
  items?: DeliveryItem[];
  giftRecipient?: string;
  giftMessage?: string;
  shareTitle?: string;
  shareDescription?: string;
  copyLinkLabel?: string;
  textLinkLabel?: string;
  class?: string;
}

const props = withDefaults(defineProps<DeliveryTrackingPanelProps>(), {
  title: "Heading to Sam Lee",
  etaPrefix: "Arrives between",
  eta: "8:35 - 8:41 AM",
  statusText: "Your Dasher is heading to Sam Lee with your order.",
  steps: () => [
    { id: "store", icon: "store", label: "Store", state: "done" },
    { id: "pickup", icon: "rider", label: "Pickup", state: "done" },
    { id: "enroute", icon: "car", label: "En route", state: "active" },
    { id: "delivered", icon: "home", label: "Delivered", state: "pending" },
  ],
  courierName: "JOSHUA L",
  courierRole: "Your Dasher",
  orderName: "Shake Shack",
  orderSummary: "3 Items",
  items: () => [
    { id: "i1", name: "Shack Stack", quantity: "2×", price: "$32.78" },
    { id: "i2", name: "Cheese Fries", quantity: "1×", price: "$7.49" },
  ],
  giftRecipient: "Sam Lee",
  giftMessage: "Hey, sending over some dinner, hope you enjoy!",
  shareTitle: "Share your digital card with Sam Lee",
  shareDescription: "Send a link to your recipient so they can view your digital card and track their gift. They don't need an account.",
  copyLinkLabel: "Copy link",
  textLinkLabel: "Text me the link",
  class: "",
});
const emit = defineEmits(["courier-call", "courier-message", "copy-link", "text-link"]);

const STEP_ICONS: Record<string, string> = {
  store: "🏪",
  rider: "🛵",
  car: "🚗",
  home: "🏠",
  check: "✓",
};
const stepIcon = (name: string) => STEP_ICONS[name] ?? "•";

const detailsOpen = ref(true);
const toggleDetails = () => { detailsOpen.value = !detailsOpen.value; };
</script>

<template>
  <div data-delivery-panel class="flex w-full overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900" :class="props.class">
    <div data-delivery-map class="relative hidden min-h-[420px] flex-1 bg-zinc-100 lg:block dark:bg-zinc-800">
      <div class="absolute inset-0" aria-hidden="true" />
      <div data-delivery-pin class="absolute left-1/2 top-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-red-500 text-lg text-white shadow-lg" aria-hidden="true">🚗</div>
      <div data-delivery-pin-destination class="absolute left-[60%] top-[45%] flex h-9 w-9 items-center justify-center rounded-full bg-zinc-900 text-base text-white shadow-lg" aria-hidden="true">🏠</div>
      <button data-delivery-back class="absolute left-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white text-zinc-700 shadow-md transition-colors hover:bg-zinc-50 dark:bg-zinc-900 dark:text-zinc-200" aria-label="Back">←</button>
      <button data-delivery-help class="absolute right-4 top-4 rounded-full bg-white px-4 py-2 text-sm font-semibold text-zinc-800 shadow-md transition-colors hover:bg-zinc-50 dark:bg-zinc-900 dark:text-zinc-100">Help</button>
      <div data-delivery-zoom class="absolute bottom-6 right-4 flex flex-col overflow-hidden rounded-xl bg-white shadow-md dark:bg-zinc-900">
        <button class="border-b border-zinc-100 px-3 py-2 text-zinc-600 dark:border-zinc-800 dark:text-zinc-300" aria-label="Zoom in">＋</button>
        <button class="px-3 py-2 text-zinc-600 dark:text-zinc-300" aria-label="Zoom out">－</button>
      </div>
    </div>

    <div data-delivery-info class="flex w-full flex-col border-l border-zinc-100 lg:w-96 lg:shrink-0 dark:border-zinc-800">
      <div data-delivery-header class="flex items-start justify-between gap-3 px-6 pt-5">
        <div>
          <h2 data-delivery-title class="text-xl font-bold text-zinc-900 dark:text-zinc-50">{{ props.title }}</h2>
          <p data-delivery-eta class="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{{ props.etaPrefix }} <span class="font-semibold text-zinc-900 dark:text-zinc-50">{{ props.eta }}</span></p>
        </div>
        <span data-delivery-avatar class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xl dark:bg-emerald-950/60" aria-hidden="true">🍔</span>
      </div>

      <div data-delivery-stepper class="flex items-center px-6 pt-5">
        <template v-for="(step, i) in props.steps" :key="step.id">
          <div v-if="i > 0" :class="step.state === 'pending' ? 'h-0.5 flex-1 bg-zinc-200 dark:bg-zinc-700' : 'h-0.5 flex-1 bg-zinc-900 dark:bg-zinc-100'" aria-hidden="true" />
          <div
            :data-delivery-step="step.id"
            :data-delivery-step-state="step.state"
            :title="step.label"
            :class="step.state === 'pending'
              ? 'flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-sm text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500'
              : 'flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-sm text-white dark:bg-zinc-100 dark:text-zinc-900'"
          >{{ stepIcon(step.icon) }}</div>
        </template>
      </div>
      <p data-delivery-status class="px-6 pt-3 text-sm text-zinc-700 dark:text-zinc-200">{{ props.statusText }}</p>

      <div data-delivery-courier class="mt-4 flex items-center justify-between border-y border-zinc-100 px-6 py-4 dark:border-zinc-800">
        <div class="flex items-center gap-3">
          <span aria-hidden="true" class="text-zinc-400 dark:text-zinc-500">👤</span>
          <div>
            <p data-delivery-courier-role class="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{{ props.courierRole }}</p>
            <p data-delivery-courier-name class="text-sm text-zinc-500 dark:text-zinc-400">{{ props.courierName }}</p>
          </div>
        </div>
        <div class="flex gap-2">
          <button data-delivery-call type="button" class="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-100 text-zinc-700 transition-colors hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700" aria-label="Call courier" @click="emit('courier-call')">📞</button>
          <button data-delivery-message type="button" class="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-100 text-zinc-700 transition-colors hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700" aria-label="Message courier" @click="emit('courier-message')">💬</button>
        </div>
      </div>

      <div class="px-6 py-4">
        <button
          data-delivery-details-toggle
          type="button"
          class="flex w-full items-center justify-center gap-2 rounded-full bg-zinc-100 py-2.5 text-sm font-semibold text-zinc-800 transition-colors hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
          @click="toggleDetails"
        >
          Order Details <span aria-hidden="true">{{ detailsOpen ? "▴" : "▾" }}</span>
        </button>

        <div v-if="detailsOpen" data-delivery-items class="mt-4 space-y-3">
          <div class="flex items-center gap-3">
            <span data-delivery-order-avatar class="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-lg dark:bg-emerald-950/60" aria-hidden="true">🍔</span>
            <div>
              <p data-delivery-order-name class="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{{ props.orderName }}</p>
              <p data-delivery-order-summary class="text-sm text-zinc-500 dark:text-zinc-400">{{ props.orderSummary }}</p>
            </div>
          </div>
          <div v-for="item in props.items" :key="item.id" :data-delivery-item="item.id" class="flex items-center justify-between text-sm">
            <span class="text-zinc-800 dark:text-zinc-100">{{ item.quantity }} {{ item.name }}</span>
            <span class="font-medium text-zinc-900 dark:text-zinc-50">{{ item.price }}</span>
          </div>

          <div data-delivery-gift class="border-t border-zinc-100 pt-4 dark:border-zinc-800">
            <p data-delivery-gift-recipient class="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{{ props.giftRecipient }}</p>
            <p data-delivery-gift-message class="mt-1 text-sm text-zinc-600 dark:text-zinc-300">{{ props.giftMessage }}</p>
          </div>

          <div data-delivery-share class="border-t border-zinc-100 pt-4 dark:border-zinc-800">
            <p class="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{{ props.shareTitle }}</p>
            <p class="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{{ props.shareDescription }}</p>
            <div class="mt-3 flex justify-end gap-2">
              <button data-delivery-copy-link type="button" class="rounded-full bg-zinc-100 px-4 py-2 text-sm font-semibold text-zinc-800 transition-colors hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700" @click="emit('copy-link')">{{ props.copyLinkLabel }}</button>
              <button data-delivery-text-link type="button" class="rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700" @click="emit('text-link')">{{ props.textLinkLabel }}</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
