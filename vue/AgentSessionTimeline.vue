<script setup lang="ts">
export type AgentStepKind = "prompt" | "reason" | "tool";
export interface AgentStep {
  id: string;
  kind: AgentStepKind;
  label: string;
  at: string;
}
export interface AgentRequest {
  id: string;
  url: string;
  method?: string;
  status: string;
  duration: string;
  ok?: boolean;
}
export interface AgentSessionTimelineProps {
  title?: string;
  status?: string;
  duration?: string;
  stepsCount?: number;
  steps?: AgentStep[];
  requests?: AgentRequest[];
  class?: string;
}
const props = withDefaults(defineProps<AgentSessionTimelineProps>(), {
  title: "Go to techcrunch.com and summarize the top 5 trending tech articles",
  status: "Complete",
  duration: "1m 11s",
  stepsCount: 11,
  steps: () => [
    { id: "s1", kind: "prompt", label: "Summarize the top 5 trending tech articles", at: "0:00" },
    { id: "s2", kind: "reason", label: "Plan fetch strategy", at: "0:03" },
    { id: "s3", kind: "tool", label: "HTTP probe", at: "0:03" },
    { id: "s4", kind: "tool", label: "Fetch API", at: "0:14" },
    { id: "s5", kind: "reason", label: "Need to actually fetch the pages", at: "0:14" },
    { id: "s6", kind: "tool", label: "Search HTML", at: "0:26" },
    { id: "s7", kind: "tool", label: "Run code", at: "0:31" },
  ],
  requests: () => [
    { id: "q1", url: "techcrunch.com", method: "HTTP probe", status: "HTTP 200", duration: "0:03", ok: true },
    { id: "q2", url: "techcrunch.com/2026/08/02/sam-altman-an…", method: "Fetch API", status: "HTTP 200", duration: "0:50", ok: true },
    { id: "q3", url: "techcrunch.com/2026/08/01/inside-one-lond…", method: "Fetch API", status: "HTTP 200", duration: "0:50", ok: true },
    { id: "q4", url: "techcrunch.com/2026/08/02/the-global-me…", method: "Fetch API", status: "HTTP 429", duration: "0:50", ok: false },
  ],
  class: "",
});
defineEmits(["step-click"]);

const kindStyles: Record<AgentStepKind, string> = {
  prompt: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300",
  reason: "bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300",
  tool: "bg-orange-100 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300",
};
const stripColor = (kind: AgentStepKind) =>
  kind === "prompt"
    ? "bg-emerald-400 dark:bg-emerald-500"
    : kind === "reason"
      ? "bg-sky-400 dark:bg-sky-500"
      : "bg-orange-400 dark:bg-orange-500";
</script>

<template>
  <div data-agent-session-timeline class="w-full rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900" :class="props.class">
    <div data-agent-session-header class="border-b border-zinc-100 px-4 py-3 dark:border-zinc-800">
      <p data-agent-session-title class="mb-2 truncate text-sm font-semibold text-zinc-900 dark:text-zinc-50">{{ props.title }}</p>
      <div class="flex flex-wrap items-center gap-2">
        <span data-agent-session-status class="rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">{{ props.status }}</span>
        <span data-agent-session-duration class="text-[11px] text-zinc-400 dark:text-zinc-500">⏱ {{ props.duration }}</span>
        <span data-agent-session-steps-count class="text-[11px] text-zinc-400 dark:text-zinc-500">≡ {{ props.stepsCount }} steps</span>
      </div>
      <div data-agent-session-strip class="mt-3 flex h-2 items-stretch gap-0.5 overflow-hidden rounded-full">
        <span
          v-for="s in props.steps.slice(0, 24)"
          :key="s.id"
          :title="s.kind + ' · ' + s.label"
          class="flex-1 rounded-sm"
          :class="stripColor(s.kind)"
        />
      </div>
    </div>
    <div data-agent-session-body class="grid grid-cols-1 md:grid-cols-2">
      <ol data-agent-steps class="divide-y divide-zinc-50 border-b border-zinc-100 md:border-b-0 md:border-r dark:divide-zinc-800/60 dark:border-zinc-800">
        <li v-for="step in props.steps" :key="step.id">
          <button
            type="button"
            :data-agent-step="step.id"
            class="flex w-full items-center gap-2 px-4 py-2 text-left transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/60"
            @click="$emit('step-click', step)"
          >
            <span :data-agent-step-badge="step.kind" class="inline-flex shrink-0 items-center rounded px-1.5 py-0.5 text-[9px] font-bold tracking-wide" :class="kindStyles[step.kind]">{{ step.kind }}</span>
            <span data-agent-step-label class="min-w-0 flex-1 truncate text-xs text-zinc-700 dark:text-zinc-200">{{ step.label }}</span>
            <span data-agent-step-at class="shrink-0 text-[10px] text-zinc-400 dark:text-zinc-500">{{ step.at }}</span>
          </button>
        </li>
      </ol>
      <div data-agent-requests class="divide-y divide-zinc-50 dark:divide-zinc-800/60">
        <div v-for="req in props.requests" :key="req.id" :data-agent-request="req.id" class="flex items-center gap-2 px-4 py-2">
          <span class="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-[9px] font-bold text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400" aria-hidden="true">⌾</span>
          <span class="min-w-0 flex-1">
            <span data-agent-request-url class="block truncate text-xs font-medium text-zinc-800 dark:text-zinc-100">{{ req.url }}</span>
            <span data-agent-request-status :class="(req.ok ?? true) ? 'block truncate text-[10px] text-zinc-400 dark:text-zinc-500' : 'block truncate text-[10px] text-red-500 dark:text-red-400'">
              {{ req.status }}<template v-if="req.method"> · {{ req.method }}</template>
            </span>
          </span>
          <span data-agent-request-duration class="shrink-0 text-[10px] text-zinc-400 dark:text-zinc-500">{{ req.duration }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
