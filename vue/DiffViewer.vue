<template>
  <div class="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 overflow-hidden" :class="className">
    <div class="flex items-center gap-2 px-3.5 py-2 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/60 text-xs">
      <UiIcon name="git-branch" :size="14" class="text-zinc-400 shrink-0" />
      <span v-if="filename" class="font-mono font-medium text-zinc-700 dark:text-zinc-300 truncate">{{ filename }}</span>
      <span v-if="language" class="px-1.5 py-0.5 rounded bg-zinc-200/70 dark:bg-zinc-700/70 text-[10px] font-mono text-zinc-500 dark:text-zinc-400">
        {{ language }}
      </span>
      <span class="ml-auto flex items-center gap-2 font-mono text-[11px]">
        <span class="text-emerald-600 dark:text-emerald-400">+{{ added }}</span>
        <span class="text-rose-600 dark:text-rose-400">-{{ removed }}</span>
      </span>
    </div>

    <div class="overflow-x-auto text-[13px] font-mono leading-relaxed">
      <div v-if="lines.length === 0" class="p-4 text-center text-xs text-zinc-400">No changes</div>
      <div v-for="(row, i) in rows" :key="i" class="flex" :class="row.meta.row">
        <span
          v-if="showLineNumbers"
          class="w-16 shrink-0 select-none px-2 text-right text-[11px] text-zinc-400 dark:text-zinc-600 tabular-nums"
        >
          {{ row.oldNo }} {{ row.newNo }}
        </span>
        <span class="w-5 shrink-0 select-none text-center" :class="row.meta.gutter">{{ row.meta.sign }}</span>
        <span class="flex-1 min-w-0 whitespace-pre-wrap break-words pr-3">{{ row.line.content }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import UiIcon from "./UiIcon.vue";

export interface DiffLine {
  type: "add" | "remove" | "context";
  content: string;
}

const LINE_STYLE: Record<string, { row: string; gutter: string; sign: string }> = {
  add: { row: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300", gutter: "text-emerald-500", sign: "+" },
  remove: { row: "bg-rose-500/10 text-rose-700 dark:text-rose-300", gutter: "text-rose-500", sign: "-" },
  context: { row: "text-zinc-600 dark:text-zinc-400", gutter: "text-zinc-300 dark:text-zinc-600", sign: " " },
};

const props = withDefaults(
  defineProps<{
    lines?: DiffLine[];
    filename?: string;
    language?: string;
    showLineNumbers?: boolean;
    className?: string;
  }>(),
  { lines: () => [], showLineNumbers: true, className: "" }
);

const added = computed(() => props.lines.filter((l) => l.type === "add").length);
const removed = computed(() => props.lines.filter((l) => l.type === "remove").length);

const rows = computed(() => {
  let oldLine = 0;
  let newLine = 0;
  return props.lines.map((line) => {
    if (line.type !== "add") oldLine += 1;
    if (line.type !== "remove") newLine += 1;
    return {
      line,
      meta: LINE_STYLE[line.type] || LINE_STYLE.context,
      oldNo: line.type !== "add" ? oldLine : "",
      newNo: line.type !== "remove" ? newLine : "",
    };
  });
});
</script>
