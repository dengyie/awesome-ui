<script setup lang="ts">
import { ref, computed } from "vue";

export interface EnvVar {
  key: string;
  value: string;
  secret?: boolean;
}
interface Props {
  title?: string;
  description?: string;
  vars: EnvVar[];
}
const props = withDefaults(defineProps<Props>(), {
  title: "Environment variables",
  description: "Injected into every agent run. Secret values are masked.",
});
const emit = defineEmits<{
  (e: "change", vars: EnvVar[]): void;
}>();

const rows = ref<EnvVar[]>([...props.vars]);
const revealed = ref<Record<string, boolean>>({});
const newKey = ref("");
const newValue = ref("");
const newSecret = ref(false);

const commit = (next: EnvVar[]) => {
  rows.value = next;
  emit("change", next);
};
const update = (i: number, value: string) => {
  commit(rows.value.map((row, idx) => (idx === i ? { ...row, value } : row)));
};
const remove = (i: number) => {
  commit(rows.value.filter((_, idx) => idx !== i));
};
const add = () => {
  const key = newKey.value.trim();
  if (!key) return;
  commit([...rows.value, { key, value: newValue.value, secret: newSecret.value }]);
  newKey.value = "";
  newValue.value = "";
  newSecret.value = false;
};
const isEmpty = computed(() => rows.value.length === 0);
</script>

<template>
  <div data-env-editor class="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
    <p data-env-title class="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{{ props.title }}</p>
    <p data-env-description class="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{{ props.description }}</p>

    <div data-env-rows class="mt-3 space-y-2">
      <div v-for="(row, i) in rows" :key="i" :data-env-row="row.key" class="flex items-center gap-2">
        <input
          data-env-key
          :value="row.key"
          readonly
          aria-label="Variable name"
          class="w-44 shrink-0 rounded-md border border-zinc-200 bg-zinc-50 px-2 py-1.5 font-mono text-xs text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800/60 dark:text-zinc-200"
        />
        <input
          data-env-value
          :type="row.secret && !revealed[row.key] ? 'password' : 'text'"
          :value="row.value"
          @input="update(i, $event.target.value)"
          aria-label="Variable value"
          class="min-w-0 flex-1 rounded-md border border-zinc-200 bg-white px-2 py-1.5 font-mono text-xs text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
        />
        <button
          v-if="row.secret"
          type="button"
          data-env-reveal
          :aria-pressed="!!revealed[row.key]"
          :title="revealed[row.key] ? 'Hide value' : 'Reveal value'"
          @click="revealed = { ...revealed, [row.key]: !revealed[row.key] }"
          class="shrink-0 rounded-md border border-zinc-200 px-2 py-1.5 text-[11px] font-semibold text-zinc-500 hover:border-zinc-300 hover:text-zinc-700 dark:border-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
        >
          {{ revealed[row.key] ? "Hide" : "Show" }}
        </button>
        <button
          type="button"
          data-env-delete
          title="Delete variable"
          @click="remove(i)"
          class="shrink-0 rounded-md border border-transparent px-2 py-1.5 text-[11px] font-semibold text-zinc-400 hover:border-rose-200 hover:text-rose-600 dark:hover:border-rose-900 dark:hover:text-rose-400"
        >
          Delete
        </button>
      </div>
      <p v-if="isEmpty" data-env-empty class="rounded-lg border border-dashed border-zinc-200 px-3 py-4 text-center text-xs text-zinc-400 dark:border-zinc-700 dark:text-zinc-500">
        No environment variables yet
      </p>
    </div>

    <div data-env-add class="mt-3 flex items-center gap-2 border-t border-zinc-100 pt-3 dark:border-zinc-800">
      <input
        data-env-new-key
        v-model="newKey"
        placeholder="KEY_NAME"
        aria-label="New variable name"
        class="w-44 shrink-0 rounded-md border border-zinc-200 bg-white px-2 py-1.5 font-mono text-xs text-zinc-700 placeholder:text-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
      />
      <input
        data-env-new-value
        v-model="newValue"
        placeholder="value"
        aria-label="New variable value"
        class="min-w-0 flex-1 rounded-md border border-zinc-200 bg-white px-2 py-1.5 font-mono text-xs text-zinc-700 placeholder:text-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
      />
      <label data-env-new-secret class="flex shrink-0 cursor-pointer items-center gap-1.5 text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
        <input type="checkbox" v-model="newSecret" class="h-3.5 w-3.5 rounded border-zinc-300" />
        secret
      </label>
      <button
        type="button"
        data-env-add-btn
        @click="add"
        :disabled="!newKey.trim()"
        class="shrink-0 rounded-md bg-indigo-600 px-3 py-1.5 text-[11px] font-semibold text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Add
      </button>
    </div>
  </div>
</template>
