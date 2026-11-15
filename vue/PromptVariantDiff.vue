<script setup lang="ts">
export interface PromptVariant {
  id: string;
  label: string;
  text: string;
}

interface Props {
  variants?: PromptVariant[];
  variables?: string[];
  title?: string;
}

const props = withDefaults(defineProps<Props>(), {
  variants: () => [],
  variables: () => [],
  title: 'Prompt variants',
});

const emit = defineEmits<{
  (e: 'apply', variant: PromptVariant): void;
}>();

const varChipClass =
  'inline rounded bg-indigo-50 px-1 py-0.5 font-mono text-[11px] font-medium text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300';

const extractVars = (text: string) =>
  (text.match(/\{\{\s*[\w.]+\s*\}\}/g) ?? []).map((v) => v.replace(/^\{\{\s*|\s*\}\}$/g, ''));

const base = props.variants[0];
const compare = props.variants[1];
const baseVars = base ? extractVars(base.text) : [];
const cmpVars = compare ? extractVars(compare.text) : [];
const addedVars = cmpVars.filter((v) => !baseVars.includes(v));
const removedVars = baseVars.filter((v) => !cmpVars.includes(v));
const changedText = base && compare ? base.text !== compare.text : false;

// Split text into plain / {{var}} segments for chip rendering.
const segments = (text: string) =>
  text.split(/(\{\{\s*[\w.]+\s*\}\})/g).map((part) => ({
    isVar: /^\{\{/.test(part),
    value: part.replace(/^\{\{\s*|\s*\}\}$/g, ''),
    raw: part,
  }));
</script>

<template>
  <div
    v-if="base && compare"
    data-prompt-variant-diff
    class="w-full overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
  >
    <div class="flex items-center gap-2 border-b border-zinc-100 px-4 py-2.5 dark:border-zinc-800">
      <span class="text-xs font-semibold text-zinc-700 dark:text-zinc-200">{{ props.title }}</span>
      <span class="flex items-center gap-2 text-[11px] tabular-nums text-zinc-400 dark:text-zinc-500">
        <span data-diff-added class="text-emerald-600 dark:text-emerald-400">+{{ addedVars.length }}</span>
        <span data-diff-removed class="text-red-500 dark:text-red-400">−{{ removedVars.length }}</span>
        <span v-if="changedText" data-diff-text class="text-amber-600 dark:text-amber-400">~text</span>
      </span>
    </div>

    <div class="grid gap-0 divide-x divide-zinc-100 sm:grid-cols-2 dark:divide-zinc-800">
      <div
        v-for="(variant, index) in props.variants"
        :key="variant.id"
        :data-variant-panel="variant.id"
        class="flex flex-col p-4"
      >
        <div class="flex items-center gap-2 pb-2">
          <span
            class="h-2 w-2 rounded-full"
            :class="index === 0 ? 'bg-zinc-400' : 'bg-violet-500'"
            aria-hidden="true"
          ></span>
          <span data-variant-label class="text-xs font-semibold text-zinc-800 dark:text-zinc-100">{{ variant.label }}</span>
          <span
            v-if="index === 0"
            class="rounded-full bg-zinc-100 px-1.5 py-0.5 text-[10px] font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
          >Base</span>
        </div>
        <p
          data-variant-text
          class="min-h-16 flex-1 whitespace-pre-wrap rounded-lg bg-zinc-50 px-3 py-2 text-xs leading-relaxed text-zinc-700 dark:bg-zinc-800/60 dark:text-zinc-200"
        ><template v-for="(seg, i) in segments(variant.text)" :key="i"><span
            v-if="seg.isVar"
            :class="varChipClass"
          >{{ seg.value }}</span><template v-else>{{ seg.raw }}</template></template></p>
        <button
          type="button"
          data-variant-apply
          class="mt-3 w-full rounded-md border border-zinc-300 px-2 py-1.5 text-xs font-semibold text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-800"
          @click="emit('apply', variant)"
        >Use this version</button>
      </div>
    </div>

    <div
      v-if="addedVars.length > 0 || removedVars.length > 0"
      data-variant-varlist
      class="flex flex-wrap items-center gap-1.5 border-t border-zinc-100 px-4 py-2.5 dark:border-zinc-800"
    >
      <span
        v-for="v in addedVars"
        :key="`add-${v}`"
        data-var-added
        class="inline rounded bg-emerald-50 px-1.5 py-0.5 font-mono text-[11px] text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
      >+ {{ v }}</span>
      <span
        v-for="v in removedVars"
        :key="`rm-${v}`"
        data-var-removed
        class="inline rounded bg-red-50 px-1.5 py-0.5 font-mono text-[11px] text-red-700 dark:bg-red-950/60 dark:text-red-300"
      >− {{ v }}</span>
    </div>
  </div>
</template>
