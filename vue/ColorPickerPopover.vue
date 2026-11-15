<template>
  <div data-color-picker class="w-64 rounded-xl border border-zinc-200 bg-white p-3 shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
    <div class="flex items-center gap-1.5">
      <span class="h-6 w-6 shrink-0 rounded-md border border-zinc-200" :style="{ backgroundColor: hex }" />
      <input
        v-if="showHexInput"
        data-color-hex-input
        type="text"
        :value="draft"
        placeholder="#2563eb"
        aria-label="Hex color"
        class="min-w-0 flex-1 rounded-md border border-zinc-200 bg-white px-2 py-1 font-mono text-xs text-zinc-700 focus:border-indigo-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
        @input="onHexInput(($event.target as HTMLInputElement).value)"
      />
      <button
        v-if="showEyedropper"
        type="button"
        data-color-eyedropper
        title="Pick color from page"
        class="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:hover:bg-zinc-800"
        @click="emit('eyedropper-click')"
      >
        <svg viewBox="0 0 20 20" fill="none" class="h-4 w-4" aria-hidden="true">
          <path d="M12.7 3.3a2.1 2.1 0 0 1 3 3l-1.2 1.2 1.1 1.1-1.5 1.5-1.1-1.1-6.3 6.3c-.3.3-.6.4-1 .4H4v-2.7c0-.4.1-.7.4-1l6.3-6.3-1.1-1.1L10.1 4l1.1 1.1 1.5-1.8Z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round" />
        </svg>
      </button>
    </div>

    <div v-if="showRgbInputs" class="mt-2 grid grid-cols-3 gap-1.5">
      <label v-for="channel in ['r', 'g', 'b'] as const" :key="channel" class="flex items-center gap-1 rounded-md border border-zinc-200 px-1.5 py-1 dark:border-zinc-700">
        <span class="text-[10px] font-semibold uppercase text-zinc-400">{{ channel }}</span>
        <input
          :data-color-channel="channel"
          type="number"
          min="0"
          max="255"
          :value="rgb[channel]"
          class="w-full min-w-0 bg-transparent text-xs text-zinc-700 focus:outline-none dark:text-zinc-200"
          @input="onChannel(channel, ($event.target as HTMLInputElement).value)"
        />
      </label>
    </div>

    <div data-color-grid class="mt-3 space-y-1.5">
      <div v-for="(row, index) in rows" :key="index" class="flex justify-between">
        <button
          v-for="color in row"
          :key="color"
          type="button"
          :data-color-swatch="color"
          :title="color"
          :class="['relative flex h-6 w-6 items-center justify-center rounded-md border transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500', color.toLowerCase() === hex ? 'border-indigo-600 ring-2 ring-indigo-200' : 'border-zinc-200 hover:ring-2 hover:ring-zinc-200']"
          :style="{ backgroundColor: color }"
          @click="apply(color.toLowerCase())"
        >
          <span v-if="color.toLowerCase() === hex" :class="['text-white', color.toLowerCase() === '#ffffff' || color.toLowerCase() === '#f3f4f6' ? '!text-zinc-500' : '']">
            <svg viewBox="0 0 20 20" fill="none" class="h-3.5 w-3.5" aria-hidden="true">
              <path d="M4 10.5 8 14.5 16 6" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </span>
        </button>
      </div>
    </div>

    <div v-if="documentColors.length" class="mt-3">
      <p class="text-[10px] font-semibold uppercase tracking-wide text-zinc-400">Document colors</p>
      <div class="mt-1.5 flex flex-wrap gap-1.5">
        <button
          v-for="color in documentColors"
          :key="color"
          type="button"
          :data-color-swatch="color"
          :title="color"
          :class="['relative flex h-6 w-6 items-center justify-center rounded-md border transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500', color.toLowerCase() === hex ? 'border-indigo-600 ring-2 ring-indigo-200' : 'border-zinc-200 hover:ring-2 hover:ring-zinc-200']"
          :style="{ backgroundColor: color }"
          @click="apply(color.toLowerCase())"
        >
          <span v-if="color.toLowerCase() === hex" :class="['text-white', color.toLowerCase() === '#ffffff' || color.toLowerCase() === '#f3f4f6' ? '!text-zinc-500' : '']">
            <svg viewBox="0 0 20 20" fill="none" class="h-3.5 w-3.5" aria-hidden="true">
              <path d="M4 10.5 8 14.5 16 6" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </span>
        </button>
      </div>
    </div>

    <div class="mt-3">
      <p class="text-[10px] font-semibold uppercase tracking-wide text-zinc-400">Custom colors</p>
      <div class="mt-1.5 flex flex-wrap items-center gap-1.5">
        <button
          v-for="color in customColors"
          :key="color"
          type="button"
          :data-color-swatch="color"
          :title="color"
          :class="['relative flex h-6 w-6 items-center justify-center rounded-md border transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500', color.toLowerCase() === hex ? 'border-indigo-600 ring-2 ring-indigo-200' : 'border-zinc-200 hover:ring-2 hover:ring-zinc-200']"
          :style="{ backgroundColor: color }"
          @click="apply(color.toLowerCase())"
        >
          <span v-if="color.toLowerCase() === hex" :class="['text-white', color.toLowerCase() === '#ffffff' || color.toLowerCase() === '#f3f4f6' ? '!text-zinc-500' : '']">
            <svg viewBox="0 0 20 20" fill="none" class="h-3.5 w-3.5" aria-hidden="true">
              <path d="M4 10.5 8 14.5 16 6" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </span>
        </button>
        <button
          type="button"
          data-color-custom-add
          :title="`Add ${hex}`"
          class="flex h-6 w-6 items-center justify-center rounded-md border border-dashed border-zinc-300 text-zinc-400 hover:border-indigo-500 hover:text-indigo-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          @click="emit('add-custom', hex)"
        >
          <svg viewBox="0 0 20 20" fill="none" class="h-3.5 w-3.5" aria-hidden="true">
            <path d="M10 4v12M4 10h12" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';

const props = withDefaults(
  defineProps<{
    value?: string;
    swatches?: string[];
    documentColors?: string[];
    customColors?: string[];
    showEyedropper?: boolean;
    showRgbInputs?: boolean;
    showHexInput?: boolean;
  }>(),
  {
    value: '#2563eb',
    swatches: () => [],
    documentColors: () => [],
    customColors: () => [],
    showEyedropper: false,
    showRgbInputs: false,
    showHexInput: true,
  },
);

const emit = defineEmits<{
  (e: 'change', hex: string): void;
  (e: 'eyedropper-click'): void;
  (e: 'add-custom', hex: string): void;
}>();

const DEFAULT_ROWS = [
  ['#000000', '#374151', '#6b7280', '#9ca3af', '#d1d5db', '#f3f4f6'],
  ['#dc2626', '#ef4444', '#f87171', '#fca5a5', '#fecaca', '#fee2e2'],
  ['#ea580c', '#f97316', '#fb923c', '#fdba74', '#fed7aa', '#ffedd5'],
  ['#16a34a', '#22c55e', '#4ade80', '#86efac', '#bbf7d0', '#dcfce7'],
  ['#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe', '#dbeafe'],
  ['#7c3aed', '#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe', '#ede9fe'],
];

const rows = computed(() => (props.swatches.length ? [props.swatches] : DEFAULT_ROWS));

const normalizeHex = (input: string): string | null => {
  const match = /^#?([0-9a-f]{6})$/i.exec(input.trim());
  return match ? `#${match[1].toLowerCase()}` : null;
};

const hexToRgb = (hexValue: string) => {
  const match = /^#?([0-9a-f]{6})$/i.exec(hexValue.trim());
  if (!match) return null;
  const int = parseInt(match[1], 16);
  return { r: (int >> 16) & 255, g: (int >> 8) & 255, b: int & 255 };
};

const rgbToHex = (r: number, g: number, b: number) =>
  `#${[r, g, b].map((c) => Math.max(0, Math.min(255, Math.round(c))).toString(16).padStart(2, '0')).join('')}`;

const initial = normalizeHex(props.value) || '#2563eb';
const hex = ref(initial);
const draft = ref(initial);

watch(
  () => props.value,
  (next) => {
    const parsed = normalizeHex(next);
    if (parsed) {
      hex.value = parsed;
      draft.value = parsed;
    }
  },
);

const rgb = computed(() => hexToRgb(hex.value) || { r: 37, g: 99, b: 235 });

const apply = (next: string) => {
  hex.value = next;
  draft.value = next;
  emit('change', next);
};

const onHexInput = (raw: string) => {
  draft.value = raw;
  const parsed = normalizeHex(raw);
  if (parsed) {
    hex.value = parsed;
    emit('change', parsed);
  }
};

const onChannel = (channel: 'r' | 'g' | 'b', raw: string) => {
  const num = parseInt(raw, 10);
  if (Number.isNaN(num)) return;
  const current = rgb.value;
  const next = rgbToHex(channel === 'r' ? num : current.r, channel === 'g' ? num : current.g, channel === 'b' ? num : current.b);
  apply(next);
};
</script>
