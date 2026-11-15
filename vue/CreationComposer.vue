<script setup lang="ts">
export interface CreationComposerProps {
  open?: boolean;
  placeholder?: string;
  imageAssist?: boolean;
  resolution?: string;
  count?: number;
  resolutions?: string[];
  counts?: number[];
}

const props = withDefaults(defineProps<CreationComposerProps>(), {
  open: true,
  placeholder: 'Ad creative, product shot, social post…',
  imageAssist: false,
  resolution: '2K',
  count: 1,
  resolutions: () => ['1K', '2K', '4K'],
  counts: () => [1, 2, 4],
});

const emit = defineEmits<{
  (e: 'image-assist-change', enabled: boolean): void;
  (e: 'resolution-change', resolution: string): void;
  (e: 'count-change', count: number): void;
  (e: 'submit', value: { prompt: string; imageAssist: boolean; resolution: string; count: number }): void;
}>();

const submit = (event: Event) => {
  const root = (event.currentTarget as HTMLElement).closest('[data-creation-composer]');
  const input = root?.querySelector('[data-creation-input]') as HTMLTextAreaElement | null;
  emit('submit', { prompt: input?.value ?? '', imageAssist: props.imageAssist, resolution: props.resolution, count: props.count });
};
</script>

<template>
  <div
    v-if="props.open"
    data-creation-composer
    class="w-full max-w-xl rounded-2xl border border-zinc-200 bg-white p-3 shadow-xl dark:border-zinc-800 dark:bg-zinc-900"
  >
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2">
        <button
          type="button"
          data-creation-image
          aria-label="Attach image"
          class="rounded-md border border-zinc-200 p-1.5 text-zinc-500 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >🖼</button>
        <button
          type="button"
          data-creation-assist-toggle
          role="switch"
          :aria-checked="props.imageAssist"
          class="flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-medium transition-colors"
          :class="props.imageAssist
            ? 'bg-indigo-600 text-white'
            : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'"
          @click="emit('image-assist-change', !props.imageAssist)"
        >
          Image Assist
          <span
            aria-hidden="true"
            class="inline-block h-3.5 w-6 rounded-full transition-colors"
            :class="props.imageAssist ? 'bg-white/80' : 'bg-zinc-300 dark:bg-zinc-600'"
          >
            <span
              class="block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform dark:bg-zinc-200"
              :class="props.imageAssist ? 'translate-x-2.5 !bg-indigo-600' : 'translate-x-0'"
            ></span>
          </span>
        </button>
      </div>
      <button
        type="button"
        data-creation-idea
        aria-label="Prompt ideas"
        class="rounded-md border border-zinc-200 p-1.5 text-zinc-500 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
      >💡</button>
    </div>
    <textarea
      data-creation-input
      rows="3"
      :placeholder="props.placeholder"
      aria-label="Creation prompt"
      class="mt-2 w-full resize-none rounded-lg border border-zinc-200 px-3 py-2 text-xs leading-relaxed text-zinc-700 outline-none transition-colors placeholder:text-zinc-400 focus:border-indigo-400 dark:border-zinc-700 dark:text-zinc-200 dark:placeholder:text-zinc-500 dark:focus:border-indigo-500"
    ></textarea>
    <div class="mt-2 flex items-center justify-end gap-2">
      <select
        data-creation-resolution
        aria-label="Resolution"
        :value="props.resolution"
        class="rounded-md border border-zinc-200 bg-white px-2 py-1.5 text-xs font-medium text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
        @change="emit('resolution-change', ($event.target as HTMLSelectElement).value)"
      >
        <option v-for="r in props.resolutions" :key="r" :value="r">{{ r }}</option>
      </select>
      <select
        data-creation-count
        aria-label="Count"
        :value="props.count"
        class="rounded-md border border-zinc-200 bg-white px-2 py-1.5 text-xs font-medium text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
        @change="emit('count-change', Number(($event.target as HTMLSelectElement).value))"
      >
        <option v-for="c in props.counts" :key="c" :value="c">{{ c }}×</option>
      </select>
      <button
        type="button"
        data-creation-submit
        class="rounded-md bg-violet-600 px-4 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-violet-500"
        @click="submit"
      >Create</button>
    </div>
  </div>
</template>
