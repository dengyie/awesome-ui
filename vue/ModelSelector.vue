<template>
  <div
    ref="containerRef"
    class="relative inline-block text-xs font-sans text-zinc-900 dark:text-zinc-100"
    :class="className"
  >
    <button
      type="button"
      :disabled="disabled"
      @click="isOpen = !isOpen"
      class="flex items-center justify-between gap-2.5 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/90 dark:bg-zinc-900/90 hover:bg-zinc-50 dark:hover:bg-zinc-800/80 transition-all shadow-sm"
      :class="disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'"
      aria-haspopup="listbox"
      :aria-expanded="isOpen"
    >
      <div class="flex items-center gap-2 min-w-0">
        <div class="p-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 shrink-0">
          <UiIcon name="sparkles" :size="14" />
        </div>
        <div class="flex flex-col text-left truncate">
          <span class="font-semibold text-zinc-800 dark:text-zinc-200 truncate">
            {{ selectedModel ? selectedModel.name : placeholder }}
          </span>
          <span v-if="selectedModel?.provider" class="text-[10px] text-zinc-400 font-mono">
            {{ selectedModel.provider }}
            {{ selectedModel.contextLength ? ` · ${selectedModel.contextLength}` : '' }}
          </span>
        </div>
      </div>

      <UiIcon
        name="chevron-down"
        :size="14"
        class="text-zinc-400 shrink-0 transition-transform duration-200"
        :class="{ 'rotate-180': isOpen }"
      />
    </button>

    <div
      v-if="isOpen"
      class="absolute left-0 mt-1.5 w-72 max-h-80 overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xl z-40 flex flex-col animate-in fade-in zoom-in-95 duration-150"
    >
      <div v-if="showSearch" class="p-2 border-b border-zinc-100 dark:border-zinc-800">
        <div class="flex items-center gap-2 px-2 py-1 rounded-lg bg-zinc-100/80 dark:bg-zinc-800/80">
          <UiIcon name="search" :size="13" class="text-zinc-400 shrink-0" />
          <input
            type="text"
            v-model="searchQuery"
            placeholder="Search models..."
            class="w-full bg-transparent border-none text-xs text-zinc-800 dark:text-zinc-200 placeholder-zinc-400 focus:outline-none"
            autofocus
          />
        </div>
      </div>

      <div class="overflow-y-auto p-1.5 space-y-1 max-h-60" role="listbox">
        <div v-if="filteredModels.length === 0" class="p-3 text-center text-zinc-400 text-xs">
          No models found
        </div>
        <button
          v-else
          v-for="model in filteredModels"
          :key="model.id"
          type="button"
          @click="handleSelect(model)"
          role="option"
          :aria-selected="model.id === selectedId"
          class="w-full flex items-start justify-between gap-2 p-2 rounded-lg text-left transition-colors"
          :class="model.id === selectedId
            ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100'
            : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/50 text-zinc-700 dark:text-zinc-300'"
        >
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-1.5 flex-wrap">
              <span class="font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                {{ model.name }}
              </span>
              <span
                v-if="model.contextLength"
                class="text-[10px] px-1.5 py-0.2 rounded bg-zinc-200/60 dark:bg-zinc-700/60 text-zinc-500 dark:text-zinc-300 font-mono"
              >
                {{ model.contextLength }}
              </span>
              <span
                v-for="tag in model.tags || []"
                :key="tag"
                class="text-[9px] px-1.5 py-0.2 rounded font-medium bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/50"
              >
                {{ tag }}
              </span>
            </div>
            <p v-if="model.description" class="text-[11px] text-zinc-500 dark:text-zinc-400 truncate mt-0.5">
              {{ model.description }}
            </p>
          </div>

          <UiIcon
            v-if="model.id === selectedId"
            name="check"
            :size="14"
            class="text-emerald-500 shrink-0 mt-0.5"
          />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import UiIcon from "./UiIcon.vue";

export interface ModelOption {
  id: string;
  name: string;
  provider?: string;
  description?: string;
  contextLength?: string;
  tags?: string[];
  isDefault?: boolean;
}

const props = withDefaults(
  defineProps<{
    models?: ModelOption[];
    selectedId: string;
    placeholder?: string;
    showSearch?: boolean;
    disabled?: boolean;
    className?: string;
  }>(),
  {
    models: () => [],
    placeholder: "Select model...",
    showSearch: true,
    disabled: false,
    className: "",
  }
);

const emit = defineEmits<{
  (e: "select", model: ModelOption): void;
  (e: "update:selectedId", id: string): void;
}>();

const isOpen = ref(false);
const searchQuery = ref("");
const containerRef = ref<HTMLElement | null>(null);

const selectedModel = computed(
  () => props.models.find((m) => m.id === props.selectedId) || null
);

const filteredModels = computed(() => {
  if (!searchQuery.value.trim()) return props.models;
  const q = searchQuery.value.toLowerCase();
  return props.models.filter(
    (m) =>
      m.name.toLowerCase().includes(q) ||
      (m.provider && m.provider.toLowerCase().includes(q)) ||
      (m.description && m.description.toLowerCase().includes(q)) ||
      (m.tags && m.tags.some((t) => t.toLowerCase().includes(q)))
  );
});

function handleSelect(model: ModelOption) {
  emit("select", model);
  emit("update:selectedId", model.id);
  isOpen.value = false;
  searchQuery.value = "";
}

function handleClickOutside(event: MouseEvent) {
  if (containerRef.value && !containerRef.value.contains(event.target as Node)) {
    isOpen.value = false;
  }
}

onMounted(() => {
  document.addEventListener("mousedown", handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener("mousedown", handleClickOutside);
});
</script>
