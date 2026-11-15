<script setup lang="ts">
export interface AiTemplate {
  id: string;
  name: string;
  description: string;
  category?: string;
}

export interface AiTemplatePickerProps {
  open?: boolean;
  title?: string;
  categories?: { id: string; label: string; count: number }[];
  templates: AiTemplate[];
  activeCategory?: string;
}

const props = withDefaults(defineProps<AiTemplatePickerProps>(), {
  open: true,
  title: 'AI Research templates',
  categories: () => [],
  activeCategory: '',
});

const emit = defineEmits<{
  (e: 'category-change', categoryId: string): void;
  (e: 'try', template: AiTemplate): void;
  (e: 'run-custom'): void;
  (e: 'close'): void;
}>();

const visibleTemplates = () => {
  const active = props.activeCategory || props.categories[0]?.id || '';
  return active
    ? props.templates.filter((t) => !t.category || t.category === active)
    : props.templates;
};

const isActive = (id: string) => id === (props.activeCategory || props.categories[0]?.id);
</script>

<template>
  <div
    v-if="props.open"
    data-ai-template-picker
    role="dialog"
    aria-modal="true"
    class="w-full max-w-3xl overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-xl dark:border-zinc-800 dark:bg-zinc-900"
  >
    <div class="flex items-center justify-between border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
      <h3 class="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{{ props.title }}</h3>
      <button
        type="button"
        data-ai-templates-close
        aria-label="Close"
        class="rounded p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
        @click="emit('close')"
      >✕</button>
    </div>
    <div class="flex max-h-[26rem]">
      <div
        v-if="props.categories.length > 0"
        data-ai-templates-rail
        class="w-52 shrink-0 overflow-y-auto border-r border-zinc-200 p-2 dark:border-zinc-800"
      >
        <button
          v-for="cat in props.categories"
          :key="cat.id"
          type="button"
          :data-ai-templates-category="cat.id"
          class="flex w-full items-center justify-between rounded-md px-2.5 py-2 text-left text-xs font-medium transition-colors"
          :class="isActive(cat.id)
            ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
            : 'text-zinc-600 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-800/60'"
          @click="emit('category-change', cat.id)"
        >
          <span class="min-w-0 truncate">{{ cat.label }}</span>
          <span
            class="ml-2 shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-semibold"
            :class="isActive(cat.id)
              ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300'
              : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400'"
          >{{ cat.count }}</span>
        </button>
      </div>
      <div class="min-w-0 flex-1 overflow-y-auto p-3">
        <p
          v-if="visibleTemplates().length === 0"
          data-ai-templates-empty
          class="px-2 py-8 text-center text-xs text-zinc-500 dark:text-zinc-400"
        >No templates in this category yet.</p>
        <div v-else data-ai-templates-grid class="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div
            v-for="tpl in visibleTemplates()"
            :key="tpl.id"
            :data-ai-template-card="tpl.id"
            class="flex flex-col rounded-lg border border-zinc-200 p-3 dark:border-zinc-700"
          >
            <p class="text-xs font-semibold leading-snug text-zinc-800 dark:text-zinc-100">{{ tpl.name }}</p>
            <p class="mt-1.5 flex-1 text-[11px] leading-relaxed text-zinc-500 dark:text-zinc-400">{{ tpl.description }}</p>
            <button
              type="button"
              data-ai-template-try
              class="mt-3 w-full rounded-md border border-zinc-300 px-2 py-1.5 text-xs font-semibold text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-800"
              @click="emit('try', tpl)"
            >Try it</button>
          </div>
        </div>
      </div>
    </div>
    <div class="flex items-center justify-end border-t border-zinc-200 px-4 py-3 dark:border-zinc-800">
      <button
        type="button"
        data-ai-templates-custom
        class="rounded-md border border-zinc-300 px-3 py-1.5 text-xs font-semibold text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-800"
        @click="emit('run-custom')"
      >Run custom AI prompt</button>
    </div>
  </div>
</template>
