<script setup lang="ts">
export interface MapPin {
  id: string;
  price: string;
  x: number;
  y: number;
}

export interface MapCard {
  id?: string;
  images?: string[];
  title: string;
  rating: string;
  reviews: number;
  subtitle: string;
  price: string;
  dates?: string;
}

export interface MapPropertyCardProps {
  pins?: MapPin[];
  activePinId?: string;
  card?: MapCard | null;
  likeLabel?: string;
  closeLabel?: string;
  class?: string;
}

const props = withDefaults(defineProps<MapPropertyCardProps>(), {
  pins: () => [
    { id: "p1", price: "$148", x: 22, y: 30 },
    { id: "p2", price: "$111", x: 68, y: 48 },
    { id: "p3", price: "$136", x: 40, y: 70 },
    { id: "p4", price: "$137", x: 58, y: 82 },
    { id: "p5", price: "$112", x: 82, y: 25 },
  ],
  activePinId: "p2",
  card: () => ({
    id: "p2",
    images: [],
    title: "Home in Kecamatan Denpasar",
    rating: "4.93",
    reviews: 27,
    subtitle: "Private Joglo in heart of Sanur",
    price: "$111 for 2 nights",
    dates: "Jun 20 – 22",
  }),
  likeLabel: "♡",
  closeLabel: "✕",
  class: "",
});
const emit = defineEmits(["pin-click", "card-close", "card-like"]);
</script>

<template>
  <div data-mappin-card class="relative min-h-[420px] w-full overflow-hidden rounded-xl border border-zinc-200 bg-sky-50 shadow-sm dark:border-zinc-800 dark:bg-sky-950/30" :class="props.class">
    <div class="absolute inset-0" aria-hidden="true" />

    <button
      v-for="pin in props.pins"
      :key="pin.id"
      :data-mappin-pin="pin.id"
      :data-mappin-price="pin.price"
      type="button"
      :style="{ left: pin.x + '%', top: pin.y + '%' }"
      :class="pin.id === props.activePinId
        ? 'absolute z-10 -translate-x-1/2 -translate-y-1/2 rounded-full bg-zinc-900 px-3 py-1.5 text-sm font-semibold text-white shadow-md transition-transform hover:scale-105 dark:bg-white dark:text-zinc-900'
        : 'absolute z-10 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white px-3 py-1.5 text-sm font-semibold text-zinc-900 shadow-md transition-transform hover:scale-105 dark:bg-zinc-900 dark:text-zinc-50'"
      @click="emit('pin-click', pin)"
    >
      {{ pin.price }}
    </button>

    <div v-if="props.card" data-mappin-preview class="absolute bottom-8 left-1/2 z-20 w-72 -translate-x-1/2 overflow-hidden rounded-2xl bg-white shadow-xl dark:bg-zinc-900">
      <div data-mappin-image class="relative h-36 bg-gradient-to-br from-amber-200 via-orange-200 to-rose-200 dark:from-amber-900 dark:via-orange-900 dark:to-rose-900">
        <div class="absolute right-3 top-3 flex gap-2">
          <button data-mappin-like type="button" aria-label="Save" class="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-sm text-zinc-800 shadow transition-colors hover:bg-white dark:bg-zinc-800/90 dark:text-zinc-100" @click="emit('card-like')">{{ props.likeLabel }}</button>
          <button data-mappin-close type="button" aria-label="Close preview" class="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-sm text-zinc-800 shadow transition-colors hover:bg-white dark:bg-zinc-800/90 dark:text-zinc-100" @click="emit('card-close')">{{ props.closeLabel }}</button>
        </div>
        <div data-mappin-dots class="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1.5">
          <span class="h-1.5 w-1.5 rounded-full bg-white" aria-hidden="true" />
          <span class="h-1.5 w-1.5 rounded-full bg-white/50" aria-hidden="true" />
          <span class="h-1.5 w-1.5 rounded-full bg-white/50" aria-hidden="true" />
          <span class="h-1.5 w-1.5 rounded-full bg-white/50" aria-hidden="true" />
        </div>
        <button data-mappin-next aria-label="Next image" class="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-xs text-zinc-800 shadow transition-colors hover:bg-white dark:bg-zinc-800/90 dark:text-zinc-100">›</button>
      </div>
      <div class="space-y-0.5 px-4 py-3">
        <div class="flex items-center justify-between gap-2">
          <p data-mappin-title class="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-50">{{ props.card.title }}</p>
          <p data-mappin-rating class="shrink-0 text-xs text-zinc-700 dark:text-zinc-200">★ {{ props.card.rating }} ({{ props.card.reviews }})</p>
        </div>
        <p data-mappin-subtitle class="truncate text-sm text-zinc-500 dark:text-zinc-400">{{ props.card.subtitle }}</p>
        <p data-mappin-price class="text-sm text-zinc-900 dark:text-zinc-50">
          {{ props.card.price }}<span v-if="props.card.dates" class="text-zinc-500 dark:text-zinc-400"> · {{ props.card.dates }}</span>
        </p>
      </div>
    </div>

    <div data-mappin-zoom class="absolute right-4 top-4 z-20 flex flex-col overflow-hidden rounded-xl bg-white shadow-md dark:bg-zinc-900">
      <button class="border-b border-zinc-100 px-3 py-2 text-zinc-600 dark:border-zinc-800 dark:text-zinc-300" aria-label="Zoom in">＋</button>
      <button class="px-3 py-2 text-zinc-600 dark:text-zinc-300" aria-label="Zoom out">－</button>
    </div>
  </div>
</template>
