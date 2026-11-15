<template>
  <div
    class="group relative rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 overflow-hidden text-sm font-mono"
    :class="className"
  >
    <div
      v-if="language || filename || showCopy"
      class="flex items-center justify-between px-3.5 py-2 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-100/60 dark:bg-zinc-900/60"
    >
      <div class="flex items-center gap-2 min-w-0 text-xs text-zinc-500 dark:text-zinc-400">
        <UiIcon name="terminal" :size="13" class="shrink-0" />
        <span v-if="filename" class="font-medium text-zinc-700 dark:text-zinc-300 truncate">
          {{ filename }}
        </span>
        <span
          v-if="language"
          class="px-1.5 py-0.5 rounded bg-zinc-200/70 dark:bg-zinc-800 text-[10px] uppercase font-semibold tracking-wide shrink-0"
        >
          {{ language }}
        </span>
      </div>
      <button
        v-if="showCopy"
        type="button"
        class="flex items-center gap-1 px-2 py-1 rounded-md text-xs text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-200/70 dark:hover:bg-zinc-800 transition-colors shrink-0"
        aria-label="Copy code"
        @click="handleCopy"
      >
        <UiIcon :name="copied ? 'check' : 'copy'" :size="13" :class="copied ? 'text-emerald-500' : ''" />
        <span class="hidden sm:inline">{{ copied ? "Copied" : "Copy" }}</span>
      </button>
    </div>

    <div
      class="overflow-auto p-3.5 text-[13px] leading-relaxed text-zinc-800 dark:text-zinc-200"
      :style="maxHeight ? { maxHeight } : undefined"
    >
      <pre class="whitespace-pre"><code v-if="showLineNumbers"><div v-for="(line, idx) in lines" :key="idx" class="flex"><span class="w-8 shrink-0 select-none text-right pr-3 text-zinc-400 dark:text-zinc-600">{{ idx + 1 }}</span><span class="flex-1">{{ line || " " }}</span></div></code><code v-else>{{ code }}</code></pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import UiIcon from "./UiIcon.vue";

const props = withDefaults(
  defineProps<{
    code: string;
    language?: string;
    filename?: string;
    showLineNumbers?: boolean;
    showCopy?: boolean;
    maxHeight?: string;
    className?: string;
  }>(),
  {
    language: "",
    showLineNumbers: false,
    showCopy: true,
    className: "",
  }
);

const copied = ref(false);

const lines = computed(() => String(props.code ?? "").replace(/\n$/, "").split("\n"));

async function handleCopy() {
  try {
    await navigator.clipboard.writeText(props.code);
    copied.value = true;
    setTimeout(() => (copied.value = false), 2000);
  } catch {
    copied.value = false;
  }
}
</script>
