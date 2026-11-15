<template>
  <div :class="$attrs.class" class="md:flex md:gap-6">
    <nav class="flex gap-1 overflow-x-auto pb-2 md:w-44 md:shrink-0 md:flex-col md:overflow-visible md:pb-0">
      <button v-for="item in sections" :key="item.id" type="button" :aria-current="item.id === currentSection?.id ? 'page' : undefined"
        :class="['flex shrink-0 items-center gap-2 rounded-lg px-3 py-1.5 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500',
          item.id === currentSection?.id
            ? 'bg-zinc-100 dark:bg-zinc-800 font-medium text-zinc-900 dark:text-zinc-100'
            : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 hover:text-zinc-700 dark:hover:text-zinc-200']"
        @click="select(item.id)">
        <UiIcon v-if="item.icon" :name="item.icon" :size="14" class="shrink-0" />
        <span class="whitespace-nowrap">{{ item.title }}</span>
      </button>
    </nav>

    <div v-if="currentSection"
      class="mt-3 min-w-0 flex-1 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 md:mt-0">
      <div class="border-b border-zinc-100 dark:border-zinc-800 px-4 py-3">
        <div class="text-xs font-semibold text-zinc-900 dark:text-zinc-100">{{ currentSection.title }}</div>
        <div v-if="currentSection.description" class="mt-0.5 text-[11px] text-zinc-500 dark:text-zinc-400">
          {{ currentSection.description }}
        </div>
      </div>

      <div class="divide-y divide-zinc-100 dark:divide-zinc-800">
        <div v-for="item in currentSection.items" :key="item.id" class="flex items-start justify-between gap-4 px-4 py-3">
          <div class="min-w-0">
            <div class="text-xs text-zinc-800 dark:text-zinc-200">{{ item.label }}</div>
            <div v-if="item.description" class="mt-0.5 text-[11px] text-zinc-500 dark:text-zinc-400">
              {{ item.description }}
            </div>
          </div>
          <div class="flex shrink-0 items-center gap-2">
            <span v-if="item.value" class="max-w-[12rem] truncate text-[11px] tabular-nums text-zinc-500 dark:text-zinc-400">
              {{ item.value }}
            </span>
            <button v-if="item.actionText" type="button"
              class="rounded-md px-1.5 py-0.5 text-[11px] font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              @click="emit('item-action', currentSection.id, item)">
              {{ item.actionText }}
            </button>
          </div>
        </div>
      </div>

      <div v-if="showSave" class="flex justify-end border-t border-zinc-100 dark:border-zinc-800 px-4 py-3">
        <button type="button" :disabled="saving"
          class="flex items-center gap-2 rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-medium text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-zinc-900"
          @click="emit('save', currentSection.id)">
          <UiIcon v-if="saving" name="loader" :size="12" class="animate-spin" />
          {{ saveText }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import UiIcon from './UiIcon.vue';

type IconName = 'user' | 'users' | 'credit-card' | 'bell' | 'settings' | 'zap' | 'lock' | 'sliders' | 'globe';

export interface SettingsItem { id: string; label: string; description?: string; value?: string; actionText?: string }
export interface SettingsSection { id: string; title: string; icon?: IconName; description?: string; items: SettingsItem[] }

const props = withDefaults(defineProps<{
  sections: SettingsSection[];
  activeId?: string;
  saving?: boolean;
  saveText?: string;
  showSave?: boolean;
}>(), { saving: false, saveText: 'Save changes', showSave: true });

const emit = defineEmits<{
  (e: 'section-change', id: string): void;
  (e: 'item-action', sectionId: string, item: SettingsItem): void;
  (e: 'save', id: string): void;
}>();

const currentId = ref(props.activeId || props.sections[0]?.id || '');
const currentSection = computed(() => props.sections.find((item) => item.id === currentId.value) || props.sections[0]);

const select = (id: string) => {
  currentId.value = id;
  emit('section-change', id);
};
</script>
