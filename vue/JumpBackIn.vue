<script setup lang="ts">
export interface JumpBackInCard {
  id: string;
  kind: string;
  title: string;
  subtitle: string;
  image?: string;
}

export interface JumpBackInProps {
  cards?: JumpBackInCard[];
  class?: string;
}

const props = withDefaults(defineProps<JumpBackInProps>(), {
  cards: () => [
    { id: "c1", kind: "Trip", title: "Trip to Japan, September 2026", subtitle: "Tokyo · Starting 14 Sept" },
    { id: "c2", kind: "Chat", title: "Mount Fuji Trip Planning", subtitle: "Last touched 2 days ago" },
    { id: "c3", kind: "Trip", title: "Kyoto Autumn Walk", subtitle: "Kyoto · Draft itinerary" },
  ],
  class: "",
});
defineEmits(["card-click"]);

const kindTones: Record<string, string> = {
  trip: "bg-sky-600/90 text-sky-50",
  chat: "bg-zinc-900/85 text-zinc-50",
};
</script>

<template>
  <div data-jump-back-in class="w-full" :class="props.class">
    <div class="mb-3 flex items-center justify-between">
      <h3 data-jump-back-in-title class="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Jump back in</h3>
      <button type="button" data-jump-back-in-see-all class="text-xs font-medium text-zinc-500 transition-colors hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200">See all</button>
    </div>
    <div class="grid grid-cols-2 gap-3 sm:grid-cols-3">
      <button
        v-for="card in props.cards"
        :key="card.id"
        type="button"
        :data-jump-back-in-card="card.id"
        class="group relative overflow-hidden rounded-xl text-left shadow-sm transition-transform hover:scale-[1.02] focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        @click="$emit('card-click', card)"
      >
        <img v-if="card.image" :src="card.image" alt="" data-jump-back-in-image class="h-32 w-full object-cover" />
        <div v-else data-jump-back-in-placeholder class="h-32 w-full bg-gradient-to-br from-sky-400 via-indigo-400 to-slate-600"></div>
        <div class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3 pt-8">
          <span
            data-jump-back-in-kind
            class="inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold"
            :class="kindTones[card.kind.toLowerCase()] ?? 'bg-zinc-900/85 text-zinc-50'"
          >
            {{ card.kind }}
          </span>
          <span data-jump-back-in-card-title class="mt-1 block truncate text-xs font-semibold text-white">{{ card.title }}</span>
          <span data-jump-back-in-card-subtitle class="block truncate text-[11px] text-zinc-200">{{ card.subtitle }}</span>
        </div>
      </button>
    </div>
  </div>
</template>
