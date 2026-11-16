<script setup lang="ts">
import { ref } from "vue";

export interface MasonryItem {
  id: string;
  url: string;
  alt: string;
  span?: number;
}

export interface MasonryDensityControlsProps {
  title?: string;
  items?: MasonryItem[];
  columns?: number;
  padding?: number;
  class?: string;
}

const props = withDefaults(defineProps<MasonryDensityControlsProps>(), {
  title: "Discovery wall",
  items: () => [
    { id: "m1", url: "https://images.unsplash.com/photo-1493397212122-2b1dda949c8a?w=400&q=60", alt: "Architecture facade", span: 3 },
    { id: "m2", url: "https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=400&q=60", alt: "Surf wave", span: 2 },
    { id: "m3", url: "https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=400&q=60", alt: "Flowers", span: 2 },
    { id: "m4", url: "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=400&q=60", alt: "Microphone", span: 3 },
    { id: "m5", url: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400&q=60", alt: "Mountains at night", span: 2 },
    { id: "m6", url: "https://images.unsplash.com/photo-1449034446853-66c86144b0ad?w=400&q=60", alt: "City dusk", span: 3 },
    { id: "m7", url: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&q=60", alt: "Desk with notes", span: 1 },
    { id: "m8", url: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&q=60", alt: "Writing", span: 2 },
  ],
  columns: 4,
  padding: 12,
  class: "",
});

const emit = defineEmits(["item-click", "close"]);

const size = ref(props.columns);
const gap = ref(props.padding);
const closed = ref(false);

const ratioFor = (span?: number) => (span === 3 ? "3 / 4" : span === 2 ? "4 / 5" : "1 / 1");
</script>

<template>
  <div v-if="!closed" data-masn class="relative w-full overflow-hidden rounded-2xl bg-zinc-950 dark:bg-black" :class="props.class">
    <div data-masn-controls class="absolute inset-x-0 top-0 z-10 flex items-center justify-around gap-6 bg-black/80 px-6 py-4 backdrop-blur-sm">
      <label data-masn-size-group class="flex flex-1 items-center gap-3 text-sm text-zinc-200">
        <span>Size</span>
        <input
          type="range"
          data-masn-size
          min="2"
          max="6"
          step="1"
          v-model.number="size"
          class="h-1 flex-1 cursor-pointer appearance-none rounded bg-zinc-600 accent-white"
        />
      </label>
      <label data-masn-padding-group class="flex flex-1 items-center gap-3 text-sm text-zinc-200">
        <span>Padding</span>
        <input
          type="range"
          data-masn-padding
          min="4"
          max="32"
          step="2"
          v-model.number="gap"
          class="h-1 flex-1 cursor-pointer appearance-none rounded bg-zinc-600 accent-white"
        />
      </label>
      <button type="button" data-masn-close aria-label="Close gallery" class="text-lg text-zinc-300 transition-colors hover:text-white" @click="closed = true; emit('close')">
        ✕
      </button>
    </div>

    <p data-masn-title class="absolute left-5 top-16 z-10 text-xs font-medium uppercase tracking-wider text-zinc-500">{{ props.title }}</p>
    <p data-masn-meta class="absolute right-5 top-16 z-10 text-xs font-medium text-zinc-500">{{ size }} cols · {{ gap }}px</p>

    <div data-masn-grid class="pt-28" :style="{ columnCount: size, columnGap: gap + 'px' }">
      <button
        v-for="item in props.items"
        :key="item.id"
        type="button"
        :data-masn-item="item.id"
        class="block w-full break-inside-avoid overflow-hidden rounded-sm bg-zinc-900"
        :style="{ marginBottom: gap + 'px' }"
        @click="emit('item-click', item)"
      >
        <img
          :src="item.url"
          :alt="item.alt"
          loading="lazy"
          :style="{ aspectRatio: ratioFor(item.span) }"
          class="w-full object-cover transition-transform duration-300 hover:scale-105"
        />
      </button>
    </div>
  </div>
</template>
