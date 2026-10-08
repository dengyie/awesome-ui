<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] bg-black/40 backdrop-blur-sm"
    role="dialog"
    aria-modal="true"
    aria-label="Command palette"
    @click="emit('close')"
  >
    <div
      class="w-full max-w-lg mx-4 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
      :class="className"
      @click.stop
    >
      <div class="flex items-center gap-2.5 px-4 py-3 border-b border-zinc-100 dark:border-zinc-800">
        <UiIcon name="search" :size="16" class="text-zinc-400 shrink-0" />
        <input
          ref="inputRef"
          v-model="query"
          type="text"
          :placeholder="placeholder"
          class="w-full bg-transparent border-none text-sm text-zinc-800 dark:text-zinc-200 placeholder-zinc-400 focus:outline-none"
        />
        <kbd class="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono text-zinc-400 bg-zinc-100 dark:bg-zinc-800 rounded border border-zinc-200 dark:border-zinc-700">ESC</kbd>
      </div>

      <div class="max-h-72 overflow-y-auto p-1.5" role="listbox">
        <div v-if="filtered.length === 0" class="p-4 text-center text-sm text-zinc-400">No results found</div>
        <template v-else v-for="(item, idx) in filtered" :key="item.id">
          <div
            v-if="item.group && item.group !== filtered[idx - 1]?.group"
            class="px-2.5 pt-2.5 pb-1 text-[10px] uppercase font-semibold tracking-wider text-zinc-400"
          >
            {{ item.group }}
          </div>
          <button
            type="button"
            role="option"
            :aria-selected="idx === activeIndex"
            class="w-full flex items-center gap-3 px-2.5 py-2 rounded-lg text-left text-sm transition-colors"
            :class="idx === activeIndex
              ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100'
              : 'text-zinc-700 dark:text-zinc-300'"
            @click="select(item)"
            @mouseenter="activeIndex = idx"
          >
            <span v-if="item.icon" class="p-1 rounded-md bg-zinc-200/60 dark:bg-zinc-700/60 text-zinc-500 dark:text-zinc-400 shrink-0">
              <UiIcon :name="item.icon" :size="14" />
            </span>
            <span class="flex-1 min-w-0">
              <span class="block truncate font-medium">{{ item.label }}</span>
              <span v-if="item.hint" class="block truncate text-[11px] text-zinc-400">{{ item.hint }}</span>
            </span>
            <kbd v-if="item.shortcut" class="px-1.5 py-0.5 text-[10px] font-mono text-zinc-400 bg-zinc-100 dark:bg-zinc-800 rounded border border-zinc-200 dark:border-zinc-700 shrink-0">
              {{ item.shortcut }}
            </kbd>
          </button>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from "vue";
import UiIcon from "./UiIcon.vue";

export interface CommandItem {
  id: string;
  label: string;
  hint?: string;
  icon?: string;
  group?: string;
  shortcut?: string;
}

const props = withDefaults(
  defineProps<{
    items?: CommandItem[];
    isOpen: boolean;
    placeholder?: string;
    className?: string;
  }>(),
  { items: () => [], placeholder: "Type a command or search...", className: "" }
);

const emit = defineEmits<{
  (e: "select", item: CommandItem): void;
  (e: "close"): void;
}>();

const query = ref("");
const activeIndex = ref(0);
const inputRef = ref<HTMLInputElement | null>(null);

const filtered = computed(() => {
  if (!query.value.trim()) return props.items;
  const q = query.value.toLowerCase();
  return props.items.filter(
    (i) =>
      i.label.toLowerCase().includes(q) ||
      (i.hint && i.hint.toLowerCase().includes(q)) ||
      (i.group && i.group.toLowerCase().includes(q))
  );
});

function select(item: CommandItem) {
  emit("select", item);
  emit("close");
}

watch(
  () => props.isOpen,
  async (open) => {
    if (open) {
      query.value = "";
      activeIndex.value = 0;
      await nextTick();
      inputRef.value?.focus();
    }
  }
);
watch(query, () => (activeIndex.value = 0));

function onKey(e: KeyboardEvent) {
  if (!props.isOpen) return;
  if (e.key === "Escape") {
    e.preventDefault();
    emit("close");
  } else if (e.key === "ArrowDown") {
    e.preventDefault();
    activeIndex.value = Math.min(filtered.value.length - 1, activeIndex.value + 1);
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    activeIndex.value = Math.max(0, activeIndex.value - 1);
  } else if (e.key === "Enter") {
    e.preventDefault();
    const item = filtered.value[activeIndex.value];
    if (item) select(item);
  }
}

onMounted(() => document.addEventListener("keydown", onKey));
onUnmounted(() => document.removeEventListener("keydown", onKey));
</script>
