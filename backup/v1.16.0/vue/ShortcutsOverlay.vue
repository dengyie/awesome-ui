<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-4 pt-[10vh] backdrop-blur-sm"
    role="dialog"
    aria-modal="true"
    :aria-label="title"
    @click="emit('close')"
  >
    <div
      :class="className"
      class="flex max-h-[75vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-2xl"
      @click.stop
    >
      <div class="flex items-center gap-2.5 border-b border-zinc-100 dark:border-zinc-800 px-4 py-3">
        <UiIcon name="terminal" :size="16" class="shrink-0 text-zinc-400" />
        <h2 class="text-sm font-semibold text-zinc-800 dark:text-zinc-200">{{ title }}</h2>
        <span class="text-[11px] font-mono text-zinc-400">{{ total }}</span>
        <button
          type="button"
          aria-label="Close"
          class="ml-auto rounded-md p-1 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
          @click="emit('close')"
        >
          <UiIcon name="x" :size="14" />
        </button>
      </div>

      <div class="border-b border-zinc-100 dark:border-zinc-800 px-4 py-2.5">
        <div class="flex items-center gap-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 px-2.5 py-1.5">
          <UiIcon name="search" :size="13" class="shrink-0 text-zinc-400" />
          <input
            ref="inputRef"
            v-model="query"
            type="text"
            :placeholder="placeholder"
            class="w-full border-none bg-transparent text-xs text-zinc-800 dark:text-zinc-200 placeholder-zinc-400 focus:outline-none"
          />
        </div>
      </div>

      <div class="flex-1 overflow-y-auto p-4">
        <div v-if="filtered.length === 0" class="py-8 text-center text-xs text-zinc-400">
          No shortcuts match “{{ query }}”
        </div>
        <div v-else class="grid gap-x-8 gap-y-5 sm:grid-cols-2">
          <section v-for="group in filtered" :key="group.id">
            <h3 class="mb-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">{{ group.label }}</h3>
            <ul class="space-y-1.5">
              <li v-for="(item, idx) in group.items" :key="`${group.id}-${idx}`" class="flex items-center gap-2 text-xs">
                <span class="min-w-0 flex-1 truncate text-zinc-600 dark:text-zinc-300">{{ item.label }}</span>
                <span class="flex shrink-0 items-center gap-0.5">
                  <kbd
                    v-for="(key, keyIdx) in item.keys"
                    :key="`${key}-${keyIdx}`"
                    class="inline-flex min-w-[1.4rem] items-center justify-center rounded border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 px-1 py-0.5 font-mono text-[10px] text-zinc-600 dark:text-zinc-300"
                  >
                    {{ key }}
                  </kbd>
                </span>
              </li>
            </ul>
          </section>
        </div>
      </div>

      <div class="flex items-center justify-end gap-3 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-800/30 px-4 py-2 text-[10px] text-zinc-400">
        <span class="flex items-center gap-1">
          <kbd class="inline-flex min-w-[1.4rem] items-center justify-center rounded border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 px-1 py-0.5 font-mono text-[10px] text-zinc-600 dark:text-zinc-300">esc</kbd>
          <span>Close</span>
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, nextTick, onMounted, onUnmounted } from "vue";
import UiIcon from "./UiIcon.vue";

export interface ShortcutItem {
  keys: string[];
  label: string;
  group?: string;
}

export interface ShortcutGroup {
  id: string;
  label: string;
  items: ShortcutItem[];
}

const props = withDefaults(
  defineProps<{
    isOpen: boolean;
    groups?: ShortcutGroup[];
    shortcuts?: ShortcutItem[];
    title?: string;
    placeholder?: string;
    className?: string;
  }>(),
  {
    groups: () => [],
    shortcuts: () => [],
    title: "Keyboard shortcuts",
    placeholder: "Search shortcuts...",
    className: "",
  }
);

const emit = defineEmits<{ (e: "close"): void }>();

const query = ref("");
const inputRef = ref<HTMLInputElement | null>(null);

// Flat list → buckets by item.group (or "General").
const normalized = computed<ShortcutGroup[]>(() => {
  if (props.groups.length > 0) return props.groups;
  const buckets: ShortcutGroup[] = [];
  props.shortcuts.forEach((item) => {
    const label = item.group || "General";
    const bucket = buckets.find((g) => g.label === label);
    if (bucket) bucket.items.push(item);
    else buckets.push({ id: label.toLowerCase().replace(/\s+/g, "-"), label, items: [item] });
  });
  return buckets;
});

const filtered = computed<ShortcutGroup[]>(() => {
  const q = query.value.trim().toLowerCase();
  if (!q) return normalized.value;
  return normalized.value
    .map((group) => ({
      ...group,
      items: group.items.filter(
        (item) => item.label.toLowerCase().includes(q) || item.keys.join("").toLowerCase().includes(q)
      ),
    }))
    .filter((group) => group.items.length > 0);
});

const total = computed(() => normalized.value.reduce((sum, group) => sum + group.items.length, 0));

watch(
  () => props.isOpen,
  async (open) => {
    query.value = "";
    if (open) {
      await nextTick();
      inputRef.value?.focus();
    }
  }
);

function onKey(e: KeyboardEvent) {
  if (!props.isOpen) return;
  if (e.key === "Escape") {
    e.preventDefault();
    emit("close");
  }
}

onMounted(() => document.addEventListener("keydown", onKey));
onUnmounted(() => document.removeEventListener("keydown", onKey));
</script>
