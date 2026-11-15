<template>
  <div class="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 overflow-hidden" :class="className">
    <!-- Multi-file tab bar -->
    <div
      v-if="files.length"
      role="tablist"
      class="flex gap-1 overflow-x-auto border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-1.5 pt-1.5"
    >
      <button
        v-for="(file, idx) in files"
        :key="file.filename"
        type="button"
        role="tab"
        :aria-selected="idx === activeIdx"
        @click="activeIdx = idx"
        :class="[
          'flex shrink-0 items-center gap-1.5 rounded-t-lg px-3 py-1.5 font-mono text-[11px] transition-colors',
          idx === activeIdx
            ? 'border border-b-0 border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200'
            : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
        ]"
      >
        <span class="max-w-[10rem] truncate">{{ file.filename }}</span>
        <span class="text-emerald-600 dark:text-emerald-400">+{{ countType(file.lines, 'add') }}</span>
        <span class="text-rose-600 dark:text-rose-400">-{{ countType(file.lines, 'remove') }}</span>
      </button>
    </div>

    <!-- Active file header -->
    <div class="flex items-center gap-2 px-3.5 py-2 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/60 text-xs">
      <UiIcon name="git-branch" :size="14" class="text-zinc-400 shrink-0" />
      <span v-if="activeFilename" class="font-mono font-medium text-zinc-700 dark:text-zinc-300 truncate">{{ activeFilename }}</span>
      <span
        v-if="activeLanguage"
        class="px-1.5 py-0.5 rounded bg-zinc-200/70 dark:bg-zinc-700/70 text-[10px] font-mono text-zinc-500 dark:text-zinc-400"
      >
        {{ activeLanguage }}
      </span>
      <span class="ml-auto flex items-center gap-2 font-mono text-[11px]">
        <span class="text-emerald-600 dark:text-emerald-400">+{{ added }}</span>
        <span class="text-rose-600 dark:text-rose-400">-{{ removed }}</span>
      </span>
    </div>

    <div class="overflow-x-auto text-[13px] font-mono leading-relaxed">
      <div v-if="activeLines.length === 0" class="p-4 text-center text-xs text-zinc-400">No changes</div>

      <template v-for="row in rows" :key="row.key">
        <!-- Collapsed gap: toggle button, or the revealed hidden lines -->
        <button
          v-if="row.kind === 'collapsed' && !expandedGaps.has(row.key)"
          type="button"
          @click="toggleGap(row.key)"
          class="flex w-full items-center gap-2 bg-zinc-50 dark:bg-zinc-800/40 px-3 py-1 text-[11px] text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors select-none"
        >
          <UiIcon name="chevron-down" :size="12" />
          <span class="font-mono">⋯ {{ row.count }} unchanged lines</span>
        </button>
        <template v-else-if="row.kind === 'collapsed'">
          <div
            v-for="(entry, i) in row.hidden"
            :key="`${row.key}-${i}`"
            class="flex text-zinc-600 dark:text-zinc-400"
          >
            <span
              v-if="showLineNumbers"
              class="w-16 shrink-0 select-none px-2 text-right text-[11px] text-zinc-400 dark:text-zinc-600 tabular-nums"
            >
              {{ entry.oldNo }} {{ entry.newNo }}
            </span>
            <span class="w-5 shrink-0 select-none text-center text-zinc-300 dark:text-zinc-600">&nbsp;</span>
            <span class="flex-1 min-w-0 whitespace-pre-wrap break-words pr-3">{{ entry.line.content }}</span>
          </div>
          <button
            type="button"
            @click="toggleGap(row.key)"
            class="flex w-full items-center gap-2 bg-zinc-50 dark:bg-zinc-800/40 px-3 py-1 text-[11px] text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors select-none"
          >
            <UiIcon name="minus" :size="12" />
            <span class="font-mono">Collapse unchanged lines</span>
          </button>
        </template>

        <!-- Regular diff line -->
        <div v-else class="flex" :class="row.meta.row">
          <span
            v-if="showLineNumbers"
            class="w-16 shrink-0 select-none px-2 text-right text-[11px] text-zinc-400 dark:text-zinc-600 tabular-nums"
          >
            {{ row.oldNo }} {{ row.newNo }}
          </span>
          <span class="w-5 shrink-0 select-none text-center" :class="row.meta.gutter">{{ row.meta.sign }}</span>
          <span class="flex-1 min-w-0 whitespace-pre-wrap break-words pr-3">{{ row.line.content }}</span>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import UiIcon from "./UiIcon.vue";

export interface DiffLine {
  type: "add" | "remove" | "context";
  content: string;
}

export interface DiffFile {
  filename: string;
  language?: string;
  lines: DiffLine[];
}

const LINE_STYLE: Record<string, { row: string; gutter: string; sign: string }> = {
  add: { row: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300", gutter: "text-emerald-500", sign: "+" },
  remove: { row: "bg-rose-500/10 text-rose-700 dark:text-rose-300", gutter: "text-rose-500", sign: "-" },
  context: { row: "text-zinc-600 dark:text-zinc-400", gutter: "text-zinc-300 dark:text-zinc-600", sign: " " },
};

interface HiddenLine {
  line: DiffLine;
  oldNo: number;
  newNo: number;
}

interface RenderRow {
  kind: "line" | "collapsed";
  line?: DiffLine;
  meta?: { row: string; gutter: string; sign: string };
  oldNo?: number | "";
  newNo?: number | "";
  count?: number;
  hidden?: HiddenLine[];
  key: string;
}

const props = withDefaults(
  defineProps<{
    /** Legacy single-diff API (kept for backward compatibility). */
    lines?: DiffLine[];
    filename?: string;
    language?: string;
    /** Multi-file API: renders a tab bar when 1+ files are provided. */
    files?: DiffFile[];
    /** Context lines kept visible around each collapsed gap (default 3). */
    contextSize?: number;
    showLineNumbers?: boolean;
    className?: string;
  }>(),
  { lines: () => [], files: () => [], contextSize: 3, showLineNumbers: true, className: "" }
);

const activeIdx = ref(0);
const expandedGaps = ref(new Set<string>());

watch(
  () => props.files,
  () => {
    activeIdx.value = 0;
    expandedGaps.value = new Set();
  }
);

const activeFile = computed(() => (props.files.length ? props.files[Math.min(activeIdx.value, props.files.length - 1)] : null));
const activeLines = computed(() => (activeFile.value ? activeFile.value.lines : props.lines));
const activeFilename = computed(() => (activeFile.value ? activeFile.value.filename : props.filename));
const activeLanguage = computed(() => (activeFile.value ? activeFile.value.language : props.language));

const countType = (lines: DiffLine[], type: DiffLine["type"]) => lines.filter((l) => l.type === type).length;

const added = computed(() => countType(activeLines.value, "add"));
const removed = computed(() => countType(activeLines.value, "remove"));

const toggleGap = (key: string) => {
  const next = new Set(expandedGaps.value);
  if (next.has(key)) next.delete(key);
  else next.add(key);
  expandedGaps.value = next;
};

/**
 * Walks the diff once and produces render rows. Long runs of context lines
 * (> contextSize*2) become a collapsible gap that keeps `contextSize` lines
 * visible on each side; the hidden middle travels with the row so expanding
 * needs no second pass over the source.
 */
const buildRows = (lines: DiffLine[], contextSize: number): RenderRow[] => {
  const rows: RenderRow[] = [];
  let oldNo = 0;
  let newNo = 0;
  let contextRun: HiddenLine[] = [];

  const pushLine = (entry: HiddenLine) => {
    rows.push({ kind: "line", line: entry.line, meta: LINE_STYLE.context, oldNo: entry.oldNo, newNo: entry.newNo, key: `l-${entry.oldNo}-${entry.newNo}` });
  };

  const flushContext = (isTail: boolean) => {
    if (contextRun.length <= contextSize * 2) {
      contextRun.forEach(pushLine);
    } else {
      const hidden = isTail
        ? contextRun.slice(contextSize)
        : contextRun.slice(contextSize, contextRun.length - contextSize);
      contextRun.slice(0, contextSize).forEach(pushLine);
      rows.push({ kind: "collapsed", count: hidden.length, hidden, key: `gap-${rows.length}-${hidden.length}` });
      if (!isTail) contextRun.slice(contextRun.length - contextSize).forEach(pushLine);
    }
    contextRun = [];
  };

  lines.forEach((line) => {
    if (line.type !== "add") oldNo += 1;
    if (line.type !== "remove") newNo += 1;

    if (line.type === "context") {
      contextRun.push({ line, oldNo, newNo });
      return;
    }
    flushContext(false);
    rows.push({
      kind: "line",
      line,
      meta: LINE_STYLE[line.type] || LINE_STYLE.context,
      oldNo: line.type !== "add" ? oldNo : "",
      newNo: line.type !== "remove" ? newNo : "",
      key: `c-${rows.length}`,
    });
  });

  flushContext(true);
  return rows;
};

const rows = computed(() => buildRows(activeLines.value, props.contextSize));
</script>
