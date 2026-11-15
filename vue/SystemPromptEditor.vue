<script setup lang="ts">
import { ref, computed } from "vue";

interface Props {
  title?: string;
  value?: string;
  placeholder?: string;
  version?: string;
  savedValue?: string;
  variables?: string[];
  temperature?: number;
}
const props = withDefaults(defineProps<Props>(), {
  title: "System prompt",
  value: "",
  placeholder: "You are a helpful assistant that…",
  version: "v3",
  variables: () => [],
});
const emit = defineEmits<{
  (e: "save", text: string): void;
  (e: "reset"): void;
  (e: "temperature-change", value: number): void;
}>();

const draft = ref(props.value);
const dirty = computed(() =>
  props.savedValue !== undefined ? draft.value !== props.savedValue : draft.value !== props.value
);
const tokens = computed(() => Math.max(1, Math.round(draft.value.length * 0.25)));
const temp = computed(() => props.temperature);

const doSave = () => {
  if (!dirty.value) return;
  emit("save", draft.value);
};
const doReset = () => {
  draft.value = props.savedValue ?? props.value;
  emit("reset");
};
// brace literals in template expressions confuse the mustache scanner — build in script scope
const varChip = (v: string) => `{{${v}}}`;
</script>

<template>
  <div data-prompt-editor class="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
    <div class="flex items-center justify-between">
      <p class="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
        {{ title }}
        <span data-editor-version class="ml-2 rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">{{ version }}</span>
      </p>
      <span data-editor-state class="text-[11px] font-semibold" :class="dirty ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'">
        {{ dirty ? 'Unsaved changes' : 'Saved' }}
      </span>
    </div>
    <textarea
      data-editor-textarea
      v-model="draft"
      :placeholder="placeholder"
      rows="6"
      class="mt-3 w-full resize-y rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 font-mono text-xs leading-relaxed text-zinc-800 outline-none focus:border-indigo-400 placeholder:text-zinc-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
    ></textarea>
    <div class="mt-2 flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400">
      <span data-editor-tokens>~{{ tokens }} tokens · {{ draft.length }} chars</span>
      <span v-if="props.variables.length > 0" data-editor-variables class="flex flex-wrap items-center gap-1">
        <code v-for="v in props.variables" :key="v" class="rounded bg-indigo-50 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">{{ varChip(v) }}</code>
      </span>
    </div>
    <div v-if="typeof temp === 'number'" class="mt-3 flex items-center gap-3">
      <label class="text-xs font-medium text-zinc-600 dark:text-zinc-300" for="prompt-editor-temp">Temperature</label>
      <input
        id="prompt-editor-temp"
        data-editor-temperature
        type="range"
        min="0"
        max="2"
        step="0.1"
        :value="temp"
        @change="emit('temperature-change', Number(($event.target as HTMLInputElement).value))"
        class="h-1 flex-1 cursor-pointer appearance-none rounded bg-zinc-200 accent-indigo-600 dark:bg-zinc-700"
      />
      <span data-editor-temp-value class="w-8 text-right font-mono text-xs text-zinc-700 dark:text-zinc-200">{{ temp.toFixed(1) }}</span>
    </div>
    <div class="mt-3 flex items-center justify-end gap-2">
      <button type="button" data-editor-reset @click="doReset" class="rounded-md border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-600 hover:border-zinc-400 dark:border-zinc-700 dark:text-zinc-300">Reset</button>
      <button type="button" data-editor-save :disabled="!dirty" @click="doSave" class="rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-40">Save prompt</button>
    </div>
  </div>
</template>
