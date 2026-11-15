<template>
  <div class="fixed inset-0 z-40" :data-side="side" data-side-drawer>
    <div class="absolute inset-0 bg-zinc-950/50" data-drawer-overlay @click="emit('close')" />
    <aside
      :class="['absolute top-0 flex h-full w-full max-w-md flex-col border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-900', side === 'left' ? 'left-0 rounded-r-2xl' : 'right-0 rounded-l-2xl']"
      data-drawer-panel
      role="dialog"
      :aria-label="title"
    >
      <div class="flex items-center justify-between border-b border-zinc-200 px-5 py-4 dark:border-zinc-800">
        <h2 class="text-base font-bold text-zinc-900 dark:text-zinc-50">{{ title }}</h2>
        <button type="button" data-drawer-close aria-label="Close settings" class="rounded-md p-1 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800" @click="emit('close')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-4 w-4">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div v-if="tabs.length" class="flex gap-1 border-b border-zinc-200 px-5 pt-1 dark:border-zinc-800" role="tablist" data-drawer-tabs>
        <button
          v-for="tab in tabs"
          :key="tab.id"
          type="button"
          role="tab"
          :aria-selected="tab.id === activeTab"
          :data-drawer-tab="tab.id"
          :class="['-mb-px border-b-2 px-3 py-2 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500', tab.id === activeTab ? 'border-indigo-500 text-zinc-900 dark:text-zinc-50' : 'border-transparent text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200']"
          @click="emit('tab-change', tab.id)"
        >
          {{ tab.label }}
        </button>
      </div>

      <div class="flex-1 overflow-y-auto px-5 py-4" data-drawer-body>
        <section v-for="(section, sectionIndex) in sections" :key="sectionIndex" :class="sectionIndex > 0 ? 'mt-5 border-t border-zinc-200 pt-4 dark:border-zinc-800' : ''">
          <h3 v-if="section.title" class="text-sm font-bold text-zinc-900 dark:text-zinc-50">{{ section.title }}</h3>
          <ul :class="section.title ? 'mt-2 space-y-3' : 'space-y-3'">
            <li v-for="(row, rowIndex) in section.rows" :key="rowIndex" class="flex items-center justify-between gap-4" :data-settings-row="row.label">
              <span class="min-w-0">
                <span class="block text-xs font-semibold text-zinc-800 dark:text-zinc-100">{{ row.label }}</span>
                <span v-if="row.description" class="mt-0.5 block text-[11px] leading-relaxed text-zinc-500 dark:text-zinc-400">{{ row.description }}</span>
              </span>
              <button
                v-if="row.control === 'toggle'"
                type="button"
                role="switch"
                :aria-checked="Boolean(row.enabled)"
                data-row-toggle
                :class="['flex h-5 w-9 shrink-0 items-center rounded-full px-0.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500', row.enabled ? 'bg-indigo-600' : 'bg-zinc-300 dark:bg-zinc-700']"
                @click="emit('row-toggle', row.label, !row.enabled)"
              >
                <span :class="['h-4 w-4 rounded-full bg-white shadow transition-transform', row.enabled ? 'translate-x-4' : '']" />
              </button>
              <select v-else-if="row.control === 'select'" data-row-select :value="row.value" class="shrink-0 rounded-lg border border-zinc-300 bg-white px-2 py-1 text-xs font-medium text-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-200">
                <option v-for="option in row.options || []" :key="option">{{ option }}</option>
              </select>
              <button
                v-else-if="row.control === 'button'"
                type="button"
                data-row-button
                :class="['shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500', BUTTON_TONE[row.buttonTone || 'outline']]"
                @click="emit('row-action', row.label)"
              >
                {{ row.buttonLabel || 'Open' }}
              </button>
            </li>
          </ul>
        </section>
      </div>

      <div v-if="footerPrimary || footerSecondary" class="flex items-center justify-end gap-2 border-t border-zinc-200 px-5 py-3 dark:border-zinc-800" data-drawer-footer>
        <button v-if="footerSecondary" type="button" data-drawer-secondary class="rounded-lg px-3 py-1.5 text-xs font-semibold text-zinc-500 transition-colors hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200">
          {{ footerSecondary }}
        </button>
        <button
          v-if="footerPrimary"
          type="button"
          data-drawer-primary
          class="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-indigo-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          @click="emit('footer-primary')"
        >
          {{ footerPrimary }}
        </button>
      </div>
    </aside>
  </div>
</template>

<script setup lang="ts">
export interface SettingsRow {
  label: string;
  description?: string;
  control?: 'toggle' | 'select' | 'button' | 'none';
  value?: string;
  options?: string[];
  buttonLabel?: string;
  buttonTone?: 'indigo' | 'danger' | 'outline';
  enabled?: boolean;
}

export interface SettingsSection {
  title?: string;
  rows: SettingsRow[];
}

withDefaults(
  defineProps<{
    title?: string;
    side?: 'right' | 'left';
    tabs?: { id: string; label: string }[];
    activeTab?: string;
    sections?: SettingsSection[];
    footerPrimary?: string;
    footerSecondary?: string;
  }>(),
  { title: 'Settings', side: 'right', tabs: () => [], activeTab: '', sections: () => [], footerPrimary: '', footerSecondary: '' },
);

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'tab-change', id: string): void;
  (e: 'row-toggle', label: string, enabled: boolean): void;
  (e: 'row-action', label: string): void;
  (e: 'footer-primary'): void;
}>();

const BUTTON_TONE: Record<string, string> = {
  indigo: 'bg-indigo-600 text-white hover:bg-indigo-500',
  danger: 'border border-rose-300 text-rose-600 hover:bg-rose-50 dark:border-rose-500/50 dark:hover:bg-rose-950/40',
  outline: 'border border-zinc-300 text-zinc-600 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800',
};
</script>
