<script setup lang="ts">
import { ref } from "vue";

export type ViolationSeverity = "low" | "medium" | "high";
interface Props {
  rule: string;
  severity?: ViolationSeverity;
  runId?: string;
  time?: string;
  input?: string;
  match?: string;
  policyRef?: string;
  proceedLabel?: string;
  blockLabel?: string;
}
const props = withDefaults(defineProps<Props>(), {
  severity: "medium",
  proceedLabel: "Proceed anyway",
  blockLabel: "Block run",
});
const emit = defineEmits<{
  (e: "proceed"): void;
  (e: "block"): void;
}>();

const resolved = ref<null | "proceeded" | "blocked">(null);

const act = (kind: "proceeded" | "blocked") => {
  resolved.value = kind;
  emit(kind === "proceeded" ? "proceed" : "block");
};
</script>

<template>
  <div
    data-guardrail-violation
    role="alert"
    class="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
  >
    <div class="flex flex-wrap items-center gap-2">
      <span data-violation-rule class="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{{ props.rule }}</span>
      <span
        data-violation-severity
        :class="`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
          props.severity === 'high'
            ? 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400'
            : props.severity === 'low'
              ? 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400'
              : 'bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400'
        }`"
      >
        {{ props.severity === "high" ? "High severity" : props.severity === "low" ? "Low severity" : "Medium severity" }}
      </span>
      <span v-if="props.time" data-violation-time class="ml-auto text-[11px] text-zinc-400 dark:text-zinc-500">{{ props.time }}</span>
    </div>

    <p v-if="props.runId" class="mt-1.5">
      <code
        data-violation-run
        class="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-[11px] text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
      >{{ props.runId }}</code>
    </p>

    <div
      v-if="props.input"
      data-violation-input
      class="mt-2.5 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs leading-relaxed text-zinc-600 dark:border-zinc-700 dark:bg-zinc-800/60 dark:text-zinc-300"
    >
      <template v-if="props.match && props.input.includes(props.match)">
        {{ props.input.slice(0, props.input.indexOf(props.match)) }}<mark
          data-violation-match
          class="rounded bg-rose-100 px-0.5 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300"
        >{{ props.match }}</mark>{{ props.input.slice(props.input.indexOf(props.match) + props.match.length) }}
      </template>
      <template v-else>{{ props.input }}</template>
    </div>

    <p v-if="props.policyRef" data-violation-policy class="mt-2 text-[11px] text-zinc-400 dark:text-zinc-500">
      Policy: <code class="font-mono text-zinc-500 dark:text-zinc-400">{{ props.policyRef }}</code>
    </p>

    <p v-if="resolved" data-violation-resolved class="mt-3 text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">
      {{ resolved === "blocked" ? "Run blocked by reviewer." : "Marked reviewed — proceeding anyway." }}
    </p>
    <div v-else class="mt-3 flex items-center justify-end gap-2">
      <button
        type="button"
        data-violation-block
        @click="act('blocked')"
        class="rounded-md bg-rose-600 px-3 py-1.5 text-[11px] font-semibold text-white transition-colors hover:bg-rose-500"
      >
        {{ props.blockLabel }}
      </button>
      <button
        type="button"
        data-violation-proceed
        @click="act('proceeded')"
        class="rounded-md border border-zinc-200 px-3 py-1.5 text-[11px] font-semibold text-zinc-600 transition-colors hover:border-zinc-300 hover:text-zinc-800 dark:border-zinc-700 dark:text-zinc-300 dark:hover:text-zinc-100"
      >
        {{ props.proceedLabel }}
      </button>
    </div>
  </div>
</template>
