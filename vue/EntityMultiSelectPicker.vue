<template>
  <div data-entity-picker class="w-full overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
    <div v-if="searchable" class="border-b border-zinc-100 p-2.5 dark:border-zinc-800">
      <div class="relative">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400">
          <circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" />
        </svg>
        <input
          type="text"
          v-model="query"
          data-picker-search
          placeholder="Search people…"
          class="w-full rounded-lg border border-zinc-300 py-1.5 pl-8 pr-2 text-xs text-zinc-800 placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
          @input="emit('search', query)"
        />
      </div>
    </div>
    <ul class="max-h-64 overflow-y-auto p-1.5">
      <li v-if="filtered.length === 0" data-picker-empty class="px-3 py-4 text-center text-xs text-zinc-400 dark:text-zinc-500">{{ emptyMessage }}</li>
      <li v-for="(option, index) in filtered" :key="option.id">
        <button
          type="button"
          :data-picker-option="option.id"
          :aria-pressed="picked.has(option.id)"
          :class="['flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500', picked.has(option.id) ? 'bg-blue-50 dark:bg-blue-950/40' : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/60']"
          @click="toggle(option.id)"
        >
          <span
            data-picker-checkbox
            :class="['flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors', picked.has(option.id) ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-zinc-300 bg-white dark:border-zinc-600 dark:bg-zinc-800']"
          >
            <svg v-if="picked.has(option.id)" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" class="h-2.5 w-2.5"><path d="m5 12 4 4L19 6" /></svg>
          </span>
          <img v-if="option.avatar" :src="option.avatar" alt="" class="h-6 w-6 shrink-0 rounded-full" />
          <span v-else-if="option.system" class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-200 dark:bg-zinc-700">
            <span class="h-2.5 w-2.5 rounded-full bg-sky-500" />
          </span>
          <span v-else :class="['flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white', AVATAR_TONES[index % AVATAR_TONES.length]]">
            {{ option.initials || initialsOf(option.label) }}
          </span>
          <span class="min-w-0 flex-1 truncate text-xs font-medium text-zinc-800 dark:text-zinc-100">{{ option.label }}</span>
        </button>
      </li>
    </ul>
    <div class="flex items-center justify-end gap-2 border-t border-zinc-100 px-3 py-2.5 dark:border-zinc-800">
      <button type="button" data-picker-cancel @click="emit('dismiss')" class="rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-semibold text-zinc-600 transition-colors hover:bg-zinc-50 focus-visible:outline-none dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800">
        {{ cancelLabel }}
      </button>
      <button type="button" data-picker-confirm @click="emit('select', [...picked])" class="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-indigo-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500">
        {{ confirmLabel }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';

export interface PickerOption {
  id: string;
  label: string;
  avatar?: string;
  initials?: string;
  system?: boolean;
}

const AVATAR_TONES = ['bg-violet-500', 'bg-sky-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500', 'bg-indigo-500'];

const props = withDefaults(
  defineProps<{
    options: PickerOption[];
    selected?: string[];
    searchable?: boolean;
    emptyMessage?: string;
    confirmLabel?: string;
    cancelLabel?: string;
  }>(),
  { selected: () => [], searchable: true, emptyMessage: 'No matches found.', confirmLabel: 'Insert results', cancelLabel: 'Cancel' },
);

const emit = defineEmits<{
  (e: 'select', ids: string[]): void;
  (e: 'search', query: string): void;
  (e: 'dismiss'): void;
}>();

const query = ref('');
const picked = ref(new Set<string>(props.selected));

watch(
  () => props.selected,
  (ids) => {
    picked.value = new Set(ids);
  },
);

const filtered = computed(() =>
  query.value ? props.options.filter((option) => option.label.toLowerCase().includes(query.value.toLowerCase())) : props.options,
);

const initialsOf = (label: string) =>
  label
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => (part[0] || '').toUpperCase())
    .join('');

const toggle = (id: string) => {
  const next = new Set(picked.value);
  if (next.has(id)) next.delete(id);
  else next.add(id);
  picked.value = next;
};
</script>
