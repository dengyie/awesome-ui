<script setup lang="ts">
import { ref } from "vue";

export interface AgentSettingToggle {
  id: string;
  label: string;
  description?: string;
  enabled: boolean;
}
export interface AgentSettingsSection {
  id: string;
  title: string;
  description?: string;
  toggles: AgentSettingToggle[];
}
export interface AgentSettingsTab {
  id: string;
  label: string;
}
interface Props {
  title?: string;
  subtitle?: string;
  tabs?: AgentSettingsTab[];
  sections: AgentSettingsSection[];
}
const props = withDefaults(defineProps<Props>(), {
  title: "Settings",
  subtitle: "Manage and update your agent workspace.",
});
const emit = defineEmits<{
  (e: "toggle", toggle: AgentSettingToggle, enabled: boolean): void;
}>();

const enabled = ref<Record<string, boolean>>(
  Object.fromEntries(props.sections.flatMap((s) => s.toggles.map((t) => [t.id, t.enabled])))
);
const isOn = (id: string) => !!enabled.value[id];
const flip = (toggle: AgentSettingToggle) => {
  const next = !isOn(toggle.id);
  enabled.value = { ...enabled.value, [toggle.id]: next };
  emit("toggle", toggle, next);
};
const sectionOnCount = (section: AgentSettingsSection) =>
  section.toggles.filter((t) => isOn(t.id)).length;
</script>

<template>
  <div data-agent-settings class="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
    <p data-agent-settings-title class="text-lg font-bold text-zinc-900 dark:text-zinc-50">{{ props.title }}</p>
    <p data-agent-settings-subtitle class="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{{ props.subtitle }}</p>

    <div v-if="props.tabs && props.tabs.length > 0" data-agent-settings-tabs class="mt-4 flex flex-wrap gap-2">
      <button
        v-for="(tab, i) in props.tabs"
        :key="tab.id"
        type="button"
        :data-agent-settings-tab="tab.id"
        :aria-selected="i === 0"
        class="rounded-full border border-zinc-200 px-3.5 py-1.5 text-xs font-semibold text-zinc-600 transition-colors aria-selected:border-transparent aria-selected:bg-zinc-900 aria-selected:text-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:aria-selected:bg-zinc-50 dark:aria-selected:text-zinc-900"
      >
        {{ tab.label }}
      </button>
    </div>

    <div data-agent-settings-sections class="mt-5 space-y-6">
      <section v-for="section in props.sections" :key="section.id" :data-agent-settings-section="section.id">
        <div class="flex items-baseline justify-between">
          <p class="text-sm font-bold text-zinc-900 dark:text-zinc-50">{{ section.title }}</p>
          <span class="text-[11px] font-medium text-zinc-400 dark:text-zinc-500">{{ sectionOnCount(section) }}/{{ section.toggles.length }} on</span>
        </div>
        <p v-if="section.description" class="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">{{ section.description }}</p>
        <div class="mt-3 space-y-3">
          <div v-for="toggle in section.toggles" :key="toggle.id" :data-agent-setting-row="toggle.id" class="flex items-center justify-between gap-4">
            <div class="min-w-0">
              <p class="text-xs font-medium text-zinc-900 dark:text-zinc-50">{{ toggle.label }}</p>
              <p v-if="toggle.description" class="mt-0.5 text-[11px] text-zinc-500 dark:text-zinc-400">{{ toggle.description }}</p>
            </div>
            <button
              type="button"
              data-agent-setting-toggle
              role="switch"
              :aria-checked="isOn(toggle.id)"
              :aria-label="toggle.label"
              @click="flip(toggle)"
              :class="['relative h-5 w-9 shrink-0 rounded-full transition-colors', isOn(toggle.id) ? 'bg-emerald-500' : 'bg-zinc-300 dark:bg-zinc-600']"
            >
              <span :class="['absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all', isOn(toggle.id) ? 'left-4' : 'left-0.5']"></span>
            </button>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>
