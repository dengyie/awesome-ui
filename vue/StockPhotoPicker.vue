<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";

export interface StockPhoto {
  id: string;
  url: string;
  alt?: string;
  author?: string;
  span?: 1 | 2;
}

export interface StockPhotoPickerProps {
  title?: string;
  poweredBy?: string;
  placeholder?: string;
  photos?: StockPhoto[];
  open?: boolean;
  class?: string;
}

const props = withDefaults(defineProps<StockPhotoPickerProps>(), {
  title: "Stock photos",
  poweredBy: "Powered by Unsplash",
  placeholder: "Search photos…",
  photos: () => [
    { id: "p1", url: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&q=60", alt: "Sunlit forest path", author: "Casey Horner", span: 2 },
    { id: "p2", url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=60", alt: "Mountain ridge", author: "Sam Tesla" },
    { id: "p3", url: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=600&q=60", alt: "Foggy hills", author: "Andreas Gücklhorn", span: 2 },
    { id: "p4", url: "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=600&q=60", alt: "Green meadow", author: "Lukasz Szmigiel" },
    { id: "p5", url: "https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=600&q=60", alt: "Park trail", author: "Jerome Printr" },
    { id: "p6", url: "https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=600&q=60", alt: "Autumn bench", author: "Josephine Baran" },
  ],
  open: true,
  class: "",
});

const emit = defineEmits(["search", "add", "close"]);

const query = ref("");

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase();
  if (q === "") return props.photos;
  return props.photos.filter((p) => (p.alt ?? "").toLowerCase().includes(q));
});

const onKey = (e: KeyboardEvent) => {
  if (e.key === "Escape") emit("close");
};

onMounted(() => window.addEventListener("keydown", onKey));
onBeforeUnmount(() => window.removeEventListener("keydown", onKey));

const clearSearch = () => {
  query.value = "";
  emit("search", "");
};
</script>

<template>
  <div v-if="props.open" data-stkpic class="relative w-full overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xl dark:border-zinc-700 dark:bg-zinc-900" :class="props.class">
    <div data-stkpic-header class="flex items-center justify-between gap-4 border-b border-zinc-200 px-5 py-3 dark:border-zinc-800">
      <h2 data-stkpic-title class="text-base font-bold text-zinc-900 dark:text-zinc-50">{{ props.title }}</h2>
      <button data-stkpic-close type="button" aria-label="Close" class="rounded-lg p-1.5 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-800 dark:hover:bg-zinc-800 dark:hover:text-zinc-100" @click="emit('close')">✕</button>
    </div>

    <div data-stkpic-searchrow class="px-5 pt-4">
      <div class="flex items-center gap-2 rounded-xl border border-zinc-300 px-3 py-2 focus-within:ring-2 focus-within:ring-orange-500/40 dark:border-zinc-600">
        <span aria-hidden="true" class="text-zinc-400">⌕</span>
        <input
          data-stkpic-input
          type="text"
          v-model="query"
          :placeholder="props.placeholder"
          class="w-full bg-transparent text-sm text-zinc-800 outline-none placeholder:text-zinc-400 dark:text-zinc-100"
          @input="emit('search', query)"
        />
        <button v-if="query !== ''" data-stkpic-clear type="button" aria-label="Clear search" class="text-zinc-400 transition-colors hover:text-zinc-700 dark:hover:text-zinc-200" @click="clearSearch">✕</button>
      </div>
      <p data-stkpic-powered class="mt-2 text-xs text-zinc-400 dark:text-zinc-500">⭳ {{ props.poweredBy }}</p>
    </div>

    <div data-stkpic-grid class="mt-3 max-h-96 overflow-y-auto px-5 pb-5">
      <div class="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <figure
          v-for="p in filtered"
          :key="p.id"
          :data-stkpic-item="p.id"
          class="group relative overflow-hidden rounded-lg border border-zinc-200 bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800"
        >
          <img :src="p.url" :alt="p.alt ?? ''" class="w-full object-cover" :class="p.span === 2 ? 'h-44' : 'h-28'" />
          <figcaption :data-stkpic-meta="p.id" class="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 bg-gradient-to-t from-black/70 to-transparent px-2 py-1.5 opacity-0 transition-opacity group-hover:opacity-100">
            <span class="truncate text-[11px] text-white">{{ p.author ?? '' }}</span>
            <button :data-stkpic-add="p.id" type="button" class="rounded bg-emerald-600 px-2 py-0.5 text-[11px] font-semibold text-white transition-colors hover:bg-emerald-700" @click="emit('add', p)">Add</button>
          </figcaption>
        </figure>
        <p v-if="filtered.length === 0" data-stkpic-empty class="col-span-full py-8 text-center text-sm text-zinc-400 dark:text-zinc-500">No photos match your search.</p>
      </div>
    </div>
  </div>
</template>
