<script setup lang="ts">
import { ref, computed } from "vue";

export interface FollowSuggestion {
  id: string;
  name: string;
  handle?: string;
  avatarUrl?: string;
  initials?: string;
}

interface Props {
  title?: string;
  suggestions?: FollowSuggestion[];
  followLabel?: string;
  followingLabel?: string;
  emptyText?: string;
}
const props = withDefaults(defineProps<Props>(), {
  title: "Discover more people",
  suggestions: () => [],
  followLabel: "Follow",
  followingLabel: "Following",
  emptyText: "No more suggestions right now — check back later.",
});

const emit = defineEmits<{
  (e: "follow", detail: FollowSuggestion): void;
  (e: "dismiss", detail: FollowSuggestion): void;
}>();

const followed = ref<Record<string, boolean>>({});
const dismissed = ref<Record<string, boolean>>({});
const collapsed = ref(false);

const visible = computed(() => props.suggestions.filter((s) => !dismissed.value[s.id]));

const toggleFollow = (person: FollowSuggestion) => {
  const next = !followed.value[person.id];
  followed.value[person.id] = next;
  if (next) emit("follow", person);
};

const initialsOf = (person: FollowSuggestion): string =>
  person.initials ??
  person.name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
</script>

<template>
  <div data-follow-suggestions class="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
    <button
      type="button"
      data-follow-suggestions-toggle
      :aria-expanded="!collapsed"
      class="flex w-full items-center justify-between px-4 py-3"
      @click="collapsed = !collapsed"
    >
      <span data-follow-suggestions-title class="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{{ props.title }}</span>
      <span aria-hidden="true" :class="['text-xs text-zinc-400 transition-transform', collapsed ? '' : 'rotate-180']">▾</span>
    </button>

    <div v-if="!collapsed && visible.length > 0" data-follow-suggestions-grid class="grid grid-cols-2 gap-2 px-4 pb-4 sm:grid-cols-3">
      <div
        v-for="person in visible"
        :key="person.id"
        :data-follow-suggestions-card="person.id"
        class="relative flex flex-col items-center rounded-lg border border-zinc-200 px-3 py-4 text-center dark:border-zinc-700"
      >
        <button
          type="button"
          :data-follow-suggestions-dismiss="person.id"
          :aria-label="`Dismiss ${person.name}`"
          class="absolute right-1.5 top-1.5 rounded p-0.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
          @click="dismissed[person.id] = true; emit('dismiss', person)"
        >
          ✕
        </button>
        <img
          v-if="person.avatarUrl"
          :src="person.avatarUrl"
          alt=""
          class="h-10 w-10 rounded-full bg-zinc-100 object-cover dark:bg-zinc-800"
        />
        <span
          v-else
          class="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 text-xs font-semibold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
        >
          {{ initialsOf(person) }}
        </span>
        <p class="mt-2 text-xs font-semibold text-zinc-900 dark:text-zinc-50">{{ person.name }}</p>
        <p v-if="person.handle" class="text-[11px] text-zinc-400 dark:text-zinc-500">{{ person.handle }}</p>
        <button
          type="button"
          :data-follow-suggestions-follow="person.id"
          :aria-pressed="!!followed[person.id]"
          :class="['mt-2.5 w-full rounded-full px-3 py-1 text-[11px] font-semibold transition-colors',
            followed[person.id]
              ? 'border border-zinc-200 bg-white text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300'
              : 'bg-emerald-600 text-white hover:bg-emerald-500']"
          @click="toggleFollow(person)"
        >
          {{ followed[person.id] ? props.followingLabel : props.followLabel }}
        </button>
      </div>
    </div>

    <p
      v-if="!collapsed && visible.length === 0"
      data-follow-suggestions-empty
      class="px-4 pb-4 text-[11px] text-zinc-400 dark:text-zinc-500"
    >
      {{ props.emptyText }}
    </p>
  </div>
</template>
