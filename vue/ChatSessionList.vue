<template>
  <div class="flex flex-col w-64 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden" :class="className">
    <div class="flex items-center gap-2 px-4 py-3 border-b border-zinc-100 dark:border-zinc-800 text-sm font-semibold text-zinc-800 dark:text-zinc-200">
      <UiIcon name="sparkles" :size="15" class="text-indigo-500" />
      {{ title }}
      <span class="ml-auto text-[11px] font-mono font-normal text-zinc-400">{{ sessions.length }}</span>
    </div>

    <div v-if="sessions.length === 0" class="p-6 text-center text-xs text-zinc-400">{{ emptyText }}</div>
    <div v-else class="flex-1 overflow-y-auto p-1.5">
      <div v-for="group in groups" :key="group.label" class="mb-1 last:mb-0">
        <button
          v-if="group.label !== 'Recent'"
          type="button"
          :aria-expanded="!collapsedGroups.has(group.label)"
          class="flex w-full items-center gap-1 px-2.5 pt-2 pb-1 text-[10px] uppercase font-semibold tracking-wider text-zinc-400 hover:text-zinc-500 dark:hover:text-zinc-300 transition-colors select-none"
          @click="toggleGroup(group.label)"
        >
          <UiIcon
            name="chevron-down"
            :size="11"
            :class="['transition-transform duration-150', collapsedGroups.has(group.label) ? '-rotate-90' : '']"
          />
          <span class="flex-1 text-left">{{ group.label }}</span>
          <span class="font-mono font-normal">{{ group.items.length }}</span>
        </button>
        <ul v-if="!collapsedGroups.has(group.label)" class="space-y-0.5">
          <li v-for="s in group.items" :key="s.id">
            <div
              role="button"
              tabindex="0"
              class="group w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-left text-sm cursor-pointer transition-colors"
              :class="String(s.id) === String(activeId)
                ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300'
                : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/70'"
              @click="emit('select', s)"
              @keydown.enter.prevent="emit('select', s)"
              @keydown.space.prevent="emit('select', s)"
            >
              <span class="flex-1 min-w-0">
                <span class="block truncate font-medium">{{ s.title }}</span>
                <span v-if="s.timeLabel" class="block text-[11px] text-zinc-400">{{ s.timeLabel }}</span>
              </span>
              <button
                type="button"
                aria-label="Delete session"
                class="opacity-0 group-hover:opacity-100 focus:opacity-100 p-1 rounded-md text-zinc-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all shrink-0"
                @click.stop="emit('delete', s.id)"
              >
                <UiIcon name="x" :size="13" />
              </button>
            </div>
          </li>
        </ul>
      </div>
    </div>

    <!-- Bottom user card -->
    <button
      v-if="user"
      type="button"
      class="flex items-center gap-2.5 px-3.5 py-3 border-t border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors text-left"
      @click="emit('userClick')"
    >
      <img v-if="user.avatarUrl" :src="user.avatarUrl" alt="" class="h-7 w-7 rounded-full object-cover shrink-0" />
      <span
        v-else
        class="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 shrink-0"
      >
        {{ initials }}
      </span>
      <span class="flex-1 min-w-0">
        <span class="block truncate text-xs font-medium text-zinc-800 dark:text-zinc-200">{{ user.name }}</span>
        <span v-if="user.email" class="block truncate text-[11px] text-zinc-400">{{ user.email }}</span>
      </span>
      <UiIcon name="settings" :size="14" class="text-zinc-400 shrink-0" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import UiIcon from "./UiIcon.vue";

export interface ChatSessionItem {
  id: string | number;
  title: string;
  timeLabel?: string;
  /** Optional group label (e.g. "Today", "Previous 7 days"); sessions without one go to "Recent". */
  group?: string;
}

export interface ChatSessionUser {
  name: string;
  email?: string;
  avatarUrl?: string;
}

const props = withDefaults(
  defineProps<{
    sessions?: ChatSessionItem[];
    activeId?: string | number | null;
    user?: ChatSessionUser;
    title?: string;
    emptyText?: string;
    className?: string;
  }>(),
  { sessions: () => [], activeId: null, title: "Chats", emptyText: "No conversations yet", className: "" }
);

const emit = defineEmits<{
  (e: "select", session: ChatSessionItem): void;
  (e: "delete", id: string | number): void;
  (e: "userClick"): void;
}>();

const collapsedGroups = ref(new Set<string>());
const toggleGroup = (label: string) => {
  const next = new Set(collapsedGroups.value);
  if (next.has(label)) next.delete(label);
  else next.add(label);
  collapsedGroups.value = next;
};

// Preserve the sessions' original order; group headers appear on first occurrence.
const groups = computed(() => {
  const result: { label: string; items: ChatSessionItem[] }[] = [];
  props.sessions.forEach((s) => {
    const label = s.group || "Recent";
    const existing = result.find((g) => g.label === label);
    if (existing) existing.items.push(s);
    else result.push({ label, items: [s] });
  });
  return result;
});

const initials = computed(() =>
  props.user
    ? (props.user.name || "?")
        .trim()
        .split(/\s+/)
        .map((w) => w[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : ""
);
</script>
