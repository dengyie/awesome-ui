<script setup lang="ts">
import { ref } from "vue";

export interface ApiParam {
  name: string;
  type: string;
  meta?: string;
  required?: boolean;
  description: string;
}

export interface ApiResponse {
  status: string;
  tone?: "success" | "error" | "warning";
  label: string;
  schema: string;
  body: string;
}

export interface ApiLanguage {
  id: string;
  label: string;
  sample: string;
}

export interface ApiReferenceViewerProps {
  title?: string;
  method?: string;
  endpoint?: string;
  paramsTitle?: string;
  params?: ApiParam[];
  responsesTitle?: string;
  responses?: ApiResponse[];
  languages?: ApiLanguage[];
  activeLanguageId?: string;
  responseTitle?: string;
  class?: string;
}

const props = withDefaults(defineProps<ApiReferenceViewerProps>(), {
  title: "List all pets",
  method: "GET",
  endpoint: "https://petstore.example.com/v1/pets",
  paramsTitle: "Query parameters",
  params: () => [
    { name: "limit", type: "integer", meta: "max: 100", required: false, description: "Max items to return (100 default)" },
    { name: "status", type: "string", meta: "enum", required: false, description: "Filter by pet status: available, pending, sold" },
  ],
  responsesTitle: "Responses",
  responses: () => [
    {
      status: "200",
      tone: "success",
      label: "A paged array of pets",
      schema: "Response object[]",
      body: '[\n  {\n    "id": 1,\n    "name": "Fluffy",\n    "tag": "dog",\n    "status": "available"\n  }\n]',
    },
    {
      status: "404",
      tone: "error",
      label: "Pets not found",
      schema: "Error object",
      body: '{\n  "error": "not_found",\n  "message": "No pets matched the query."\n}',
    },
  ],
  languages: () => [
    { id: "cli", label: "CLI", sample: "curl -L https://petstore.example.com/v1/pets" },
    { id: "js", label: "JS", sample: 'fetch("https://petstore.example.com/v1/pets")' },
  ],
  activeLanguageId: "cli",
  responseTitle: "A paged array of pets",
  class: "",
});
const emit = defineEmits(["param-click", "language-change"]);

const METHOD_STYLES: Record<string, string> = {
  GET: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300",
  POST: "bg-sky-100 text-sky-700 dark:bg-sky-950/70 dark:text-sky-300",
  PUT: "bg-amber-100 text-amber-700 dark:bg-amber-950/70 dark:text-amber-300",
  PATCH: "bg-violet-100 text-violet-700 dark:bg-violet-950/70 dark:text-violet-300",
  DELETE: "bg-red-100 text-red-700 dark:bg-red-950/70 dark:text-red-300",
};

const TONE_STYLES: Record<string, string> = {
  success: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300",
  error: "bg-red-100 text-red-700 dark:bg-red-950/70 dark:text-red-300",
  warning: "bg-amber-100 text-amber-700 dark:bg-amber-950/70 dark:text-amber-300",
};

const methodCls = METHOD_STYLES[props.method.toUpperCase()] ?? METHOD_STYLES.GET;
const toneCls = (tone?: string) => TONE_STYLES[tone ?? "success"] ?? TONE_STYLES.success;

const openStatuses = ref<string[]>([props.responses[0]?.status ?? ""]);
const activeLang = ref(props.activeLanguageId);
const toggle = (status: string) => {
  openStatuses.value = openStatuses.value.includes(status)
    ? openStatuses.value.filter((s) => s !== status)
    : [...openStatuses.value, status];
};
const isOpen = (status: string) => openStatuses.value.includes(status);
const activeResponse = () => props.responses.find((r) => r.status === (openStatuses.value[0] ?? "")) ?? props.responses[0];
const activeLanguage = () => props.languages.find((l) => l.id === activeLang.value) ?? props.languages[0];
</script>

<template>
  <div data-api-viewer class="grid w-full gap-4 lg:grid-cols-2" :class="props.class">
    <div data-api-definition class="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <h2 data-api-title class="text-lg font-bold text-zinc-900 dark:text-zinc-50">{{ props.title }}</h2>
      <div class="mt-3 flex items-center gap-3">
        <span data-api-method :class="'rounded px-2 py-1 font-mono text-xs font-bold ' + methodCls">{{ props.method.toUpperCase() }}</span>
        <code data-api-endpoint class="truncate font-mono text-sm text-zinc-700 dark:text-zinc-200">{{ props.endpoint }}</code>
      </div>

      <p data-api-params-title class="mt-6 border-b border-zinc-100 pb-2 text-sm font-semibold text-zinc-900 dark:border-zinc-800 dark:text-zinc-50">{{ props.paramsTitle }}</p>
      <div data-api-params class="mt-4 space-y-4">
        <button
          v-for="param in props.params"
          :key="param.name"
          :data-api-param="param.name"
          type="button"
          class="block w-full text-left"
          @click="emit('param-click', param)"
        >
          <p class="font-mono text-sm text-zinc-800 dark:text-zinc-100">
            {{ param.name }} <span class="text-zinc-500 dark:text-zinc-400">{{ param.type }}{{ param.meta ? ' · ' + param.meta : '' }}</span>
            <span v-if="!param.required" class="text-red-500">optional</span>
          </p>
          <p class="mt-1 text-sm text-zinc-600 dark:text-zinc-300">{{ param.description }}</p>
        </button>
      </div>

      <p data-api-responses-title class="mt-6 border-b border-zinc-100 pb-2 text-sm font-semibold text-zinc-900 dark:border-zinc-800 dark:text-zinc-50">{{ props.responsesTitle }}</p>
      <div data-api-responses class="mt-4 space-y-2">
        <div v-for="response in props.responses" :key="response.status" :data-api-response="response.status" class="rounded-lg border border-zinc-200 dark:border-zinc-800">
          <button data-api-response-toggle type="button" class="flex w-full items-center gap-3 px-4 py-3 text-left" @click="toggle(response.status)">
            <span aria-hidden="true" class="text-xs text-zinc-400">{{ isOpen(response.status) ? "▾" : "▸" }}</span>
            <span :class="'rounded px-2 py-0.5 font-mono text-xs font-bold ' + toneCls(response.tone)">{{ response.status }}</span>
            <span class="text-sm text-zinc-700 dark:text-zinc-200">{{ response.label }}</span>
          </button>
          <div v-if="isOpen(response.status)" data-api-response-schema class="flex items-center justify-between border-t border-zinc-100 px-4 py-2.5 dark:border-zinc-800">
            <code class="font-mono text-xs text-zinc-600 dark:text-zinc-300">{{ response.schema }}</code>
            <span class="text-xs font-medium text-zinc-500 dark:text-zinc-400">Show properties ＋</span>
          </div>
        </div>
      </div>
    </div>

    <div data-api-code-panel class="flex flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div class="flex items-center justify-between border-b border-zinc-100 px-4 py-2.5 dark:border-zinc-800">
        <div class="flex items-center gap-2">
          <span :class="'rounded px-2 py-1 font-mono text-xs font-bold ' + methodCls">{{ props.method.toUpperCase() }}</span>
          <code data-api-code-path class="font-mono text-sm text-zinc-700 dark:text-zinc-200">/pets</code>
        </div>
        <select
          data-api-language-select
          v-model="activeLang"
          class="rounded-md border border-zinc-200 bg-white px-2 py-1 text-xs text-zinc-700 outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
          @change="emit('language-change', activeLanguage())"
        >
          <option v-for="l in props.languages" :key="l.id" :value="l.id">{{ l.label }}</option>
        </select>
      </div>
      <pre data-api-sample class="overflow-x-auto border-b border-zinc-100 bg-zinc-50 px-4 py-3 font-mono text-xs text-zinc-800 dark:border-zinc-800 dark:bg-zinc-950/60 dark:text-zinc-200">{{ activeLanguage()?.sample }}</pre>
      <button data-api-test type="button" class="border-b border-zinc-100 px-4 py-2 text-right text-xs font-semibold text-zinc-400 transition-colors hover:text-zinc-600 dark:border-zinc-800 dark:hover:text-zinc-200">Test it ▸</button>
      <div class="flex items-center gap-3 px-4 py-2.5">
        <span :class="'rounded px-2 py-0.5 font-mono text-xs font-bold ' + toneCls(activeResponse()?.tone)">{{ activeResponse()?.status ?? "200" }}</span>
        <span class="text-sm text-zinc-700 dark:text-zinc-200">{{ props.responseTitle }}</span>
      </div>
      <pre data-api-json class="flex-1 overflow-auto px-4 pb-4 font-mono text-xs leading-5 text-sky-700 dark:text-sky-300">{{ activeResponse()?.body }}</pre>
    </div>
  </div>
</template>
