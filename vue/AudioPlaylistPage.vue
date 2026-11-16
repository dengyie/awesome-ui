<script setup lang="ts">
import { ref } from "vue";

export interface PlaylistTrack {
  id: string;
  title: string;
  artist: string;
  duration: string;
  coverUrl?: string;
  version?: string;
  liked?: boolean;
}

export interface AudioPlaylistPageProps {
  title?: string;
  subtitle?: string;
  coverUrl?: string;
  tracks?: PlaylistTrack[];
  queue?: PlaylistTrack[];
  activeTrackId?: string;
  class?: string;
}

const props = withDefaults(defineProps<AudioPlaylistPageProps>(), {
  title: "Late night sketches",
  subtitle: "A collection of new ideas and alternate versions",
  coverUrl: "",
  tracks: () => [
    { id: "t1", title: "Neon after rain", artist: "Mira Sol", duration: "3:42", version: "v5", liked: true },
    { id: "t2", title: "Soft focus", artist: "Mira Sol", duration: "2:58", version: "v3" },
    { id: "t3", title: "Signals in the dark", artist: "Mira Sol", duration: "4:16", version: "v2" },
    { id: "t4", title: "Morning light", artist: "Mira Sol", duration: "3:05", version: "v1" },
  ],
  queue: () => [
    { id: "q1", title: "City windows", artist: "Mira Sol", duration: "3:10" },
    { id: "q2", title: "Static bloom", artist: "Theo Park", duration: "2:46" },
    { id: "q3", title: "Almost home", artist: "Mira Sol", duration: "3:31" },
  ],
  activeTrackId: "",
  class: "",
});

const emit = defineEmits(["track-click", "like", "remix", "queue-click"]);

const isPlaying = ref(false);
const liked = ref(new Set(props.tracks.filter((t) => t.liked).map((t) => t.id)));
const active = props.tracks.find((t) => t.id === props.activeTrackId) ?? props.tracks[0];

const toggleLike = (track: PlaylistTrack) => {
  const next = new Set(liked.value);
  if (next.has(track.id)) next.delete(track.id);
  else next.add(track.id);
  liked.value = next;
  emit("like", track);
};
</script>

<template>
  <div data-audioplaylist class="overflow-hidden rounded-2xl border border-zinc-200 bg-white text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50" :class="props.class">
    <div class="grid lg:grid-cols-[minmax(0,1fr)_240px]">
      <main data-audioplaylist-main class="min-w-0">
        <div class="flex flex-col gap-5 border-b border-zinc-200 p-5 sm:flex-row sm:items-end sm:p-7 dark:border-zinc-800">
          <div data-audioplaylist-cover class="relative h-40 w-40 shrink-0 overflow-hidden rounded-2xl bg-gradient-to-br from-fuchsia-500 via-indigo-600 to-cyan-400 shadow-lg">
            <img v-if="props.coverUrl" :src="props.coverUrl" alt="" class="h-full w-full object-cover" />
            <div v-else class="absolute inset-0 opacity-40" style="background-image: radial-gradient(circle at 25% 25%, white 0 2px, transparent 3px), radial-gradient(circle at 70% 70%, white 0 1px, transparent 2px); background-size: 22px 22px;" />
            <span class="absolute bottom-3 left-3 text-3xl" aria-hidden="true">♫</span>
          </div>
          <div class="min-w-0">
            <p class="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">Playlist</p>
            <h2 data-audioplaylist-title class="mt-1 truncate text-3xl font-black tracking-tight">{{ props.title }}</h2>
            <p class="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{{ props.subtitle }}</p>
            <div class="mt-4 flex flex-wrap items-center gap-2">
              <button data-audioplaylist-play type="button" class="rounded-full bg-zinc-900 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200" @click="isPlaying = !isPlaying">{{ isPlaying ? "❚❚ Pause" : "▶ Play" }}</button>
              <button data-audioplaylist-share type="button" class="rounded-full border border-zinc-200 px-3 py-2 text-xs font-semibold text-zinc-600 dark:border-zinc-700 dark:text-zinc-300">↗ Share</button>
            </div>
          </div>
        </div>

        <div data-audioplaylist-toolbar class="flex items-center justify-between gap-3 border-b border-zinc-100 px-5 py-3 dark:border-zinc-800/70">
          <p class="text-xs text-zinc-500 dark:text-zinc-400">{{ props.tracks.length }} songs · originals and versions</p>
          <div class="flex items-center gap-2">
            <button data-audioplaylist-like type="button" class="rounded-lg px-2 py-1 text-sm text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800">♡ Like</button>
            <button data-audioplaylist-comment type="button" class="rounded-lg px-2 py-1 text-sm text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800">◌ Comment</button>
          </div>
        </div>

        <div data-audioplaylist-tracks class="divide-y divide-zinc-100 dark:divide-zinc-800/70">
          <div
            v-for="(track, index) in props.tracks"
            :key="track.id"
            :data-audioplaylist-track="track.id"
            :data-audioplaylist-active="track.id === active?.id ? 'true' : 'false'"
            class="group flex items-center gap-3 px-5 py-3.5 transition-colors sm:px-7"
            :class="track.id === active?.id ? 'bg-indigo-50/70 dark:bg-indigo-950/30' : 'hover:bg-zinc-50 dark:hover:bg-zinc-900'"
          >
            <button :data-audioplaylist-track-play="track.id" type="button" :aria-label="'Play ' + track.title" class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm text-zinc-400 transition-colors hover:bg-zinc-200 hover:text-zinc-800 dark:hover:bg-zinc-800 dark:hover:text-zinc-100" @click="emit('track-click', track)">
              <span v-if="track.id === active?.id && isPlaying" class="text-xs">❚❚</span>
              <span v-else class="text-xs">{{ String(index + 1).padStart(2, "0") }}</span>
            </button>
            <div class="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-gradient-to-br from-indigo-200 to-fuchsia-200 dark:from-indigo-950 dark:to-fuchsia-950">
              <img v-if="track.coverUrl" :src="track.coverUrl" alt="" class="h-full w-full object-cover" />
              <span v-else class="flex h-full items-center justify-center text-lg">♫</span>
            </div>
            <button type="button" class="min-w-0 flex-1 text-left" @click="emit('track-click', track)">
              <p class="truncate text-sm font-semibold">{{ track.title }}</p>
              <p class="truncate text-xs text-zinc-500 dark:text-zinc-400">{{ track.artist }}</p>
            </button>
            <span v-if="track.version" data-audioplaylist-version class="rounded-md bg-zinc-100 px-2 py-0.5 text-[10px] font-semibold text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">{{ track.version }}</span>
            <span class="hidden text-xs tabular-nums text-zinc-400 sm:inline">{{ track.duration }}</span>
            <button :data-audioplaylist-remix="track.id" type="button" class="hidden rounded-md px-2 py-1 text-xs font-medium text-zinc-500 hover:bg-zinc-100 sm:inline dark:hover:bg-zinc-800" @click="emit('remix', track)">Remix ▾</button>
            <button :data-audioplaylist-like-track="track.id" type="button" :aria-label="liked.has(track.id) ? 'Unlike' : 'Like'" class="rounded-md px-1.5 py-1 text-base" :class="liked.has(track.id) ? 'text-rose-500' : 'text-zinc-400 hover:text-rose-400'" @click="toggleLike(track)">{{ liked.has(track.id) ? "♥" : "♡" }}</button>
          </div>
        </div>
      </main>

      <aside data-audioplaylist-queue class="border-t border-zinc-200 bg-zinc-50/80 p-5 dark:border-zinc-800 dark:bg-zinc-900/60 lg:border-l lg:border-t-0">
        <div class="flex items-center justify-between">
          <h3 class="text-sm font-bold">Queue</h3>
          <span class="text-xs text-zinc-400">{{ props.queue.length }}</span>
        </div>
        <div class="mt-4 space-y-2.5">
          <button v-for="(track, index) in props.queue" :key="track.id" :data-audioplaylist-queue-item="track.id" type="button" class="flex w-full items-center gap-2.5 rounded-lg p-1.5 text-left transition-colors hover:bg-white dark:hover:bg-zinc-800" @click="emit('queue-click', track)">
            <span class="w-4 text-center text-[10px] text-zinc-400">{{ index + 1 }}</span>
            <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-cyan-200 to-indigo-200 text-sm dark:from-cyan-950 dark:to-indigo-950">♫</span>
            <span class="min-w-0 flex-1"><span class="block truncate text-xs font-semibold">{{ track.title }}</span><span class="block truncate text-[11px] text-zinc-400">{{ track.artist }}</span></span>
            <span class="text-[10px] tabular-nums text-zinc-400">{{ track.duration }}</span>
          </button>
        </div>
        <p class="mt-6 rounded-lg border border-dashed border-zinc-300 p-3 text-center text-xs text-zinc-400 dark:border-zinc-700">Drag songs here to build your queue</p>
      </aside>
    </div>

    <div data-audioplaylist-player class="flex items-center gap-3 border-t border-zinc-200 bg-zinc-900 px-4 py-3 text-white dark:border-zinc-800">
      <button data-audioplaylist-player-toggle type="button" class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-xs text-zinc-900" @click="isPlaying = !isPlaying">{{ isPlaying ? "❚❚" : "▶" }}</button>
      <div class="min-w-0 w-36 sm:w-48"><p class="truncate text-xs font-semibold">{{ active?.title ?? "Nothing playing" }}</p><p class="truncate text-[10px] text-zinc-400">{{ active?.artist ?? "Choose a track" }}</p></div>
      <div class="hidden flex-1 items-center gap-3 sm:flex"><span class="text-[10px] tabular-nums text-zinc-400">0:42</span><div class="h-1.5 flex-1 rounded-full bg-zinc-700"><div class="h-full w-1/4 rounded-full bg-indigo-400" /></div><span class="text-[10px] tabular-nums text-zinc-400">{{ active?.duration ?? "0:00" }}</span></div>
      <div class="ml-auto flex items-center gap-2 text-zinc-300"><button type="button" class="rounded p-1 hover:bg-zinc-800">↶</button><button type="button" class="rounded p-1 hover:bg-zinc-800">↷</button><button type="button" class="rounded p-1 hover:bg-zinc-800">🔊</button></div>
    </div>
  </div>
</template>
