<script setup lang="ts">
export type EvalResultStatus = "passed" | "failed" | "unknown";
export interface EvalVariable {
  name: string;
  value: string;
}
export interface EvalResult {
  id: string;
  status: EvalResultStatus;
  reason: string;
  response: string;
  variables?: EvalVariable[];
}
export interface EvalSection {
  id: string;
  name: string;
  subtitle: string;
  icon?: string;
  results: EvalResult[];
}
export interface EvalRunResultsProps {
  passRate?: string;
  passLabel?: string;
  counters?: { passed: number; unknown: number; failed: number; total: number };
  filterLabel?: string;
  filterValue?: string;
  sections?: EvalSection[];
  class?: string;
}
const props = withDefaults(defineProps<EvalRunResultsProps>(), {
  passRate: "64.00%",
  passLabel: "Passed",
  counters: () => ({ passed: 64, unknown: 0, failed: 36, total: 100 }),
  filterLabel: "has any of",
  filterValue: "Passed",
  sections: () => [
    {
      id: "judge",
      name: "summary_quality_judge",
      subtitle: "AI-Powered / LLM as a Judge",
      icon: "⚖️",
      results: [
        {
          id: "j1",
          status: "passed",
          reason: "The output provides a summary that captures the key points of the document and presents them in a clear structure.",
          response: "Key Points: Product launched a pilot feature that enables users to customize dashboards. Insights: This initiative aims to enhance user engagement and satisfaction through personalization.",
          variables: [
            { name: "EXPECTED_SUMMARY", value: "Product laun…" },
            { name: "CONTENT", value: "Product laun…" },
            { name: "CATEGORY", value: "Product" },
          ],
        },
        {
          id: "j2",
          status: "passed",
          reason: "The output summarizes the content well, preserving the key fact that employee satisfaction increased after the policy change.",
          response: "Key Points: HR reported higher satisfaction among remote employees after implementing flexible working hours. Insights: Flexibility drives retention.",
          variables: [
            { name: "EXPECTED_SUMMARY", value: "HR report…" },
            { name: "CONTENT", value: "HR report…" },
            { name: "CATEGORY", value: "HR" },
          ],
        },
      ],
    },
    {
      id: "cost",
      name: "cost_efficiency_guard",
      subtitle: "Performance / Cost",
      icon: "💰",
      results: [
        {
          id: "c1",
          status: "passed",
          reason: "Response cost is $0.0003 which is less than the required value of $0.0100.",
          response: "Key Points: A pilot feature has been launched that allows users to customize their dashboards in the product. Insights: Customization may improve engagement.",
          variables: [
            { name: "COST", value: "$0.0003" },
            { name: "BUDGET", value: "$0.0100" },
          ],
        },
      ],
    },
  ],
  class: "",
});
const emit = defineEmits(["result-click"]);
const STATUS_STYLES: Record<string, { icon: string; label: string; cell: string }> = {
  passed: { icon: "✓", label: "Passed", cell: "text-emerald-600 dark:text-emerald-400" },
  failed: { icon: "✕", label: "Failed", cell: "text-red-600 dark:text-red-400" },
  unknown: { icon: "⊘", label: "Unknown", cell: "text-amber-600 dark:text-amber-400" },
};
const styleFor = (status: string) => STATUS_STYLES[status] ?? STATUS_STYLES.unknown;
</script>

<template>
  <div data-eval-run-results class="w-full rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900" :class="props.class">
    <div data-eval-header class="flex flex-wrap items-end justify-between gap-3 px-4 pb-3 pt-4">
      <p data-eval-score class="text-3xl font-semibold tracking-tight text-emerald-700 dark:text-emerald-400">
        {{ props.passRate }} <span class="text-zinc-900 dark:text-zinc-50">{{ props.passLabel }}</span>
      </p>
      <div data-eval-counters class="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-medium">
        <span data-eval-counter="passed" class="text-emerald-600 dark:text-emerald-400">✓ Passed {{ props.counters.passed }}</span>
        <span data-eval-counter="unknown" class="text-amber-600 dark:text-amber-400">⊘ Unknown {{ props.counters.unknown }}</span>
        <span data-eval-counter="failed" class="text-red-600 dark:text-red-400">✕ Failed {{ props.counters.failed }}</span>
        <span data-eval-counter="total" class="text-zinc-400 dark:text-zinc-500">≡ Total {{ props.counters.total }}</span>
      </div>
    </div>
    <div class="border-b border-zinc-100 px-4 pb-3 dark:border-zinc-800">
      <span data-eval-filter class="inline-flex items-center gap-2 rounded-full border border-zinc-200 px-3 py-1.5 text-xs text-zinc-600 dark:border-zinc-700 dark:text-zinc-300">
        <span class="text-zinc-400" aria-hidden="true">⊙</span>
        <span class="font-medium">Status</span>
        <span class="text-zinc-400">{{ props.filterLabel }}</span>
        <span class="inline-flex items-center gap-1 rounded-md bg-zinc-100 px-1.5 py-0.5 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
          <span class="text-emerald-600 dark:text-emerald-400" aria-hidden="true">✓</span> {{ props.filterValue }}
          <span class="text-zinc-400" aria-hidden="true">✕</span>
        </span>
      </span>
    </div>
    <div v-for="section in props.sections" :key="section.id" :data-eval-section="section.id" class="border-b border-zinc-100 last:border-b-0 dark:border-zinc-800">
      <div data-eval-section-header class="flex items-center gap-2.5 px-4 py-3">
        <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-sm dark:bg-zinc-800" aria-hidden="true">{{ section.icon ?? '⚖️' }}</span>
        <span>
          <span data-eval-section-name class="block text-sm font-semibold text-zinc-800 dark:text-zinc-100">{{ section.name }}</span>
          <span data-eval-section-subtitle class="block text-[11px] text-zinc-400 dark:text-zinc-500">{{ section.subtitle }}</span>
        </span>
      </div>
      <table data-eval-section-results class="w-full">
        <thead>
          <tr class="border-b border-zinc-100 text-left text-[11px] font-medium text-zinc-400 dark:border-zinc-800 dark:text-zinc-500">
            <th class="px-4 py-2 font-medium">Status</th>
            <th class="px-2 py-2 font-medium">Reason</th>
            <th class="px-2 py-2 font-medium">Response</th>
            <th class="px-4 py-2 font-medium">Variables</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="result in section.results"
            :key="result.id"
            :data-eval-row="result.id"
            tabindex="0"
            class="cursor-pointer border-b border-zinc-50 align-top text-xs transition-colors last:border-b-0 hover:bg-zinc-50 dark:border-zinc-800/60 dark:hover:bg-zinc-800/60"
            @click="emit('result-click', result, section)"
          >
            <td :data-eval-row-status="result.status" class="whitespace-nowrap px-4 py-2.5 font-medium" :class="styleFor(result.status).cell">
              <span class="mr-1 inline-flex" aria-hidden="true">{{ styleFor(result.status).icon }}</span>
              {{ styleFor(result.status).label }}
            </td>
            <td data-eval-row-reason class="max-w-[16rem] px-2 py-2.5 text-zinc-600 dark:text-zinc-300">{{ result.reason }}</td>
            <td data-eval-row-response class="max-w-[16rem] px-2 py-2.5 text-zinc-500 dark:text-zinc-400">
              <span class="line-clamp-2">{{ result.response }}</span>
            </td>
            <td data-eval-row-variables class="px-4 py-2.5">
              <span class="flex max-w-[14rem] flex-wrap gap-1">
                <span
                  v-for="v in result.variables ?? []"
                  :key="v.name"
                  :data-eval-var="v.name"
                  class="max-w-[13rem] truncate rounded bg-violet-50 px-1.5 py-0.5 font-mono text-[9px] text-violet-700 dark:bg-violet-950/60 dark:text-violet-300"
                  :title="v.name + ': ' + v.value"
                >
                  {{ v.name }}: {{ v.value }}
                </span>
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
