<template>
  <div
    v-if="rows.length"
    data-marquee-wall
    class="space-y-3 overflow-hidden rounded-xl border border-zinc-200 bg-gradient-to-br from-violet-950 via-zinc-950 to-zinc-950 p-4 dark:border-zinc-800"
    :class="className"
  >
    <div
      v-for="(row, rowIndex) in rows"
      :key="rowIndex"
      :data-marquee-row="rowIndex"
      class="flex overflow-hidden"
    >
      <div
        class="flex min-w-full shrink-0 gap-3"
        :style="{
          animation: `marquee-scroll ${speedSeconds}s linear infinite${rowIndex % 2 === 1 ? ' reverse' : ''}`,
          animationPlayState: paused ? 'paused' : 'running',
        }"
      >
        <figure
          v-for="(card, index) in doubled(row)"
          :key="`${card.name}-${index}`"
          :data-marquee-card="index"
          class="w-64 shrink-0 rounded-xl bg-white p-4 dark:bg-zinc-900"
        >
          <div class="flex items-center gap-2.5">
            <span
              class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
              :class="avatarTones[index % avatarTones.length]"
            >
              {{ initialsOf(card.name) }}
            </span>
            <span class="min-w-0">
              <span class="block truncate text-xs font-semibold text-zinc-900 dark:text-zinc-50">{{ card.name }}</span>
              <span v-if="card.handle && !card.anonymous" class="block truncate text-[11px] text-indigo-500">@{{ card.handle }}</span>
            </span>
          </div>
          <blockquote class="mt-2 text-xs leading-relaxed text-zinc-600 dark:text-zinc-300">{{ card.text }}</blockquote>
        </figure>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';

export interface MarqueeCard {
  name: string;
  handle?: string;
  text: string;
  anonymous?: boolean;
}

const props = withDefaults(
  defineProps<{
    rows?: MarqueeCard[][];
    speedSeconds?: number;
    paused?: boolean;
    className?: string;
  }>(),
  { rows: () => [], speedSeconds: 40, paused: false, className: '' },
);

const avatarTones = ['bg-indigo-500', 'bg-emerald-500', 'bg-rose-500', 'bg-amber-500', 'bg-sky-500', 'bg-violet-500'];

const doubled = (row: MarqueeCard[]) => [...row, ...row];
const initialsOf = (name: string) =>
  name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
void props;

// The <style> tag is not allowed inside a client template; inject the keyframes once.
const MARQUEE_STYLE_ID = 'marquee-scroll-keyframes';
onMounted(() => {
  if (document.getElementById(MARQUEE_STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = MARQUEE_STYLE_ID;
  style.textContent =
    '@keyframes marquee-scroll { from { transform: translateX(0); } to { transform: translateX(-100%); } } ' +
    '[data-marquee-row]:hover div { animation-play-state: paused !important; }';
  document.head.appendChild(style);
});
</script>
