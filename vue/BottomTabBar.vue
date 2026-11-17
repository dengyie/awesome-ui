<script setup lang="ts">
import { computed, ref } from "vue";

export interface BottomTab {
  id: string;
  label: string;
  icon?: string;
  badge?: number;
}

export interface BottomTabBarProps {
  tabs?: BottomTab[];
  active?: string;
  label?: string;
  class?: string;
}

const props = withDefaults(defineProps<BottomTabBarProps>(), {
  tabs: () => [
    { id: "home", label: "Home", icon: "⌂" },
    { id: "search", label: "Search", icon: "⌕", badge: 3 },
    { id: "create", label: "Create", icon: "+" },
    { id: "inbox", label: "Inbox", icon: "✉", badge: 12 },
    { id: "profile", label: "Profile", icon: "◉" },
  ],
  active: "",
  label: "Primary navigation",
  class: "",
});

const emit = defineEmits<{
  (e: "tab-change", id: string): void;
}>();

const list = computed(() => (Array.isArray(props.tabs) ? props.tabs : []));
const internalActive = ref("");
const active = computed(() => props.active || internalActive.value || list.value[0]?.id || "home");

const select = (id: string) => {
  internalActive.value = id;
  emit("tab-change", id);
};
</script>

<template>
  <nav data-bottomtab-bar :aria-label="props.label" class="w-full rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900" :class="props.class">
    <div data-bottomtab-items class="flex items-stretch px-2 pb-[env(safe-area-inset-bottom)]">
      <button
        v-for="tab in list"
        :key="tab.id"
        type="button"
        :data-bottomtab-item="tab.id"
        :aria-current="tab.id === active ? 'page' : 'false'"
        class="relative flex flex-1 flex-col items-center gap-0.5 py-2 transition-colors"
        :class="tab.id === active
          ? 'text-violet-600 dark:text-violet-400'
          : 'text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300'"
        @click="select(tab.id)"
      >
        <span :data-bottomtab-icon="tab.id" aria-hidden="true" class="text-lg leading-5">{{ tab.icon || "" }}</span>
        <span :data-bottomtab-label="tab.id" class="text-[10px] font-medium">{{ tab.label }}</span>
        <span v-if="tab.badge" :data-bottomtab-badge="tab.id" class="absolute -right-2 -top-1.5 rounded-full bg-red-500 px-1.5 text-[10px] font-bold leading-4 text-white">{{ tab.badge }}</span>
        <span :data-bottomtab-indicator="tab.id" aria-hidden="true" class="absolute -top-px inset-x-4 h-0.5 rounded-full bg-violet-600 dark:bg-violet-400" :class="tab.id === active ? 'block' : 'hidden'"></span>
      </button>
    </div>
  </nav>
</template>
