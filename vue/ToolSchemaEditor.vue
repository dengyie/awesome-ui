<script setup lang="ts">
import { ref } from "vue";

export interface ToolParameter {
  name: string;
  type: "string" | "number" | "boolean";
  required?: boolean;
}
export interface ToolSchema {
  id: string;
  name: string;
  description?: string;
  method?: string;
  endpoint?: string;
  parameters?: ToolParameter[];
}
interface Props {
  title?: string;
  tools: ToolSchema[];
}
const props = withDefaults(defineProps<Props>(), {
  title: "Tools & functions",
});
const emit = defineEmits<{
  (e: "validate", tool: ToolSchema): void;
  (e: "toggle", tool: ToolSchema, enabled: boolean): void;
}>();

const disabled = ref<Record<string, boolean>>({});
const isEnabled = (id: string) => !disabled.value[id];
const toggle = (tool: ToolSchema) => {
  const next = !isEnabled(tool.id);
  disabled.value = { ...disabled.value, [tool.id]: !next };
  emit("toggle", tool, next);
};
const enabledCount = () => props.tools.filter((t) => isEnabled(t.id)).length;

const TYPE_BADGE: Record<string, string> = {
  string: "bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300",
  number: "bg-violet-50 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300",
  boolean: "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300",
};
</script>

<template>
  <div data-tool-editor class="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
    <div class="flex items-center justify-between">
      <p class="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{{ title }}</p>
      <span data-tool-count class="rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
        {{ enabledCount() }}/{{ props.tools.length }} enabled
      </span>
    </div>
    <div class="mt-3 space-y-3">
      <div
        v-for="tool in props.tools"
        :key="tool.id"
        :data-tool-card="tool.id"
        class="rounded-lg border px-3 py-3 transition-colors"
        :class="!isEnabled(tool.id)
          ? 'border-zinc-200 bg-zinc-50 opacity-60 dark:border-zinc-800 dark:bg-zinc-800/40'
          : 'border-zinc-200 hover:border-zinc-300 dark:border-zinc-800 dark:hover:border-zinc-700'"
      >
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <p class="flex items-center gap-2">
              <code data-tool-name class="truncate font-mono text-sm font-semibold text-zinc-900 dark:text-zinc-50">{{ tool.name }}</code>
              <span
                v-if="tool.method"
                data-tool-method
                class="rounded px-1.5 py-0.5 font-mono text-[10px] font-bold"
                :class="tool.method === 'GET' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300' : 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'"
              >{{ tool.method }}</span>
            </p>
            <code v-if="tool.endpoint" data-tool-endpoint class="mt-0.5 block truncate font-mono text-[11px] text-zinc-400 dark:text-zinc-500">{{ tool.endpoint }}</code>
            <p v-if="tool.description" class="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{{ tool.description }}</p>
          </div>
          <button
            type="button"
            data-tool-toggle
            :aria-pressed="isEnabled(tool.id)"
            @click="toggle(tool)"
            class="relative h-5 w-9 shrink-0 rounded-full transition-colors"
            :class="isEnabled(tool.id) ? 'bg-indigo-600' : 'bg-zinc-300 dark:bg-zinc-600'"
            :title="isEnabled(tool.id) ? 'Disable tool' : 'Enable tool'"
          >
            <span class="absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all" :class="isEnabled(tool.id) ? 'left-4' : 'left-0.5'"></span>
          </button>
        </div>
        <div v-if="tool.parameters && tool.parameters.length > 0" data-tool-params class="mt-2 flex flex-wrap items-center gap-1.5 border-t border-zinc-100 pt-2 dark:border-zinc-800">
          <span
            v-for="param in tool.parameters"
            :key="param.name"
            :data-tool-param="param.name"
            class="flex items-center gap-1 rounded px-1.5 py-0.5 font-mono text-[10px] font-semibold"
            :class="TYPE_BADGE[param.type] || TYPE_BADGE.string"
          >
            {{ param.name }}
            <span class="font-normal opacity-70">{{ param.type }}</span>
            <span v-if="param.required" class="font-bold text-red-500" title="required">*</span>
          </span>
        </div>
        <div class="mt-2 flex justify-end">
          <button type="button" data-tool-validate @click="emit('validate', tool)" class="rounded-md border border-zinc-300 px-2.5 py-1 text-[11px] font-semibold text-zinc-700 hover:border-indigo-400 hover:text-indigo-600 dark:border-zinc-700 dark:text-zinc-200">Validate schema</button>
        </div>
      </div>
    </div>
  </div>
</template>
