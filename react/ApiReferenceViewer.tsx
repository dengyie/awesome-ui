/**
 * ApiReferenceViewer - API reference section: method-badge endpoint header,
 * query parameter definitions with type/meta/description rows, collapsible
 * responses list, and a right code panel with language select, sample
 * request and highlighted JSON response
 * (GitBook API Reference pattern).
 */
import React from "react";

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
  className?: string;
  onParamClick?: (param: ApiParam) => void;
  onLanguageChange?: (language: ApiLanguage) => void;
}

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

export default function ApiReferenceViewer({
  title = "List all pets",
  method = "GET",
  endpoint = "https://petstore.example.com/v1/pets",
  paramsTitle = "Query parameters",
  params = [
    { name: "limit", type: "integer", meta: "max: 100", required: false, description: "Max items to return (100 default)" },
    { name: "status", type: "string", meta: "enum", required: false, description: "Filter by pet status: available, pending, sold" },
  ],
  responsesTitle = "Responses",
  responses = [
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
  languages = [
    { id: "cli", label: "CLI", sample: "curl -L https://petstore.example.com/v1/pets" },
    { id: "js", label: "JS", sample: 'fetch("https://petstore.example.com/v1/pets")' },
  ],
  activeLanguageId = "cli",
  responseTitle = "A paged array of pets",
  className = "",
  onParamClick,
  onLanguageChange,
}: ApiReferenceViewerProps) {
  const [openStatuses, setOpenStatuses] = React.useState<string[]>([responses[0]?.status ?? ""]);
  const [activeLang, setActiveLang] = React.useState(activeLanguageId);

  const toggle = (status: string) =>
    setOpenStatuses((prev) => (prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]));

  const lang = languages.find((l) => l.id === activeLang) ?? languages[0];
  const activeResponse = responses.find((r) => r.status === (openStatuses[0] ?? "")) ?? responses[0];
  const methodCls = METHOD_STYLES[method.toUpperCase()] ?? METHOD_STYLES.GET;

  return (
    <div data-api-viewer className={`grid w-full gap-4 lg:grid-cols-2 ${className}`}>
      {/* left: definition */}
      <div data-api-definition className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h2 data-api-title className="text-lg font-bold text-zinc-900 dark:text-zinc-50">{title}</h2>
        <div className="mt-3 flex items-center gap-3">
          <span data-api-method className={`rounded px-2 py-1 font-mono text-xs font-bold ${methodCls}`}>{method.toUpperCase()}</span>
          <code data-api-endpoint className="truncate font-mono text-sm text-zinc-700 dark:text-zinc-200">{endpoint}</code>
        </div>

        <p data-api-params-title className="mt-6 border-b border-zinc-100 pb-2 text-sm font-semibold text-zinc-900 dark:border-zinc-800 dark:text-zinc-50">{paramsTitle}</p>
        <div data-api-params className="mt-4 space-y-4">
          {params.map((param) => (
            <button
              key={param.name}
              data-api-param={param.name}
              type="button"
              onClick={() => onParamClick?.(param)}
              className="block w-full text-left"
            >
              <p className="font-mono text-sm text-zinc-800 dark:text-zinc-100">
                {param.name} <span className="text-zinc-500 dark:text-zinc-400">{param.type}{param.meta ? ` · ${param.meta}` : ""}</span>{" "}
                {!param.required && <span className="text-red-500">optional</span>}
              </p>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">{param.description}</p>
            </button>
          ))}
        </div>

        <p data-api-responses-title className="mt-6 border-b border-zinc-100 pb-2 text-sm font-semibold text-zinc-900 dark:border-zinc-800 dark:text-zinc-50">{responsesTitle}</p>
        <div data-api-responses className="mt-4 space-y-2">
          {responses.map((response) => {
            const open = openStatuses.includes(response.status);
            const toneCls = TONE_STYLES[response.tone ?? "success"] ?? TONE_STYLES.success;
            return (
              <div key={response.status} data-api-response={response.status} className="rounded-lg border border-zinc-200 dark:border-zinc-800">
                <button
                  data-api-response-toggle
                  type="button"
                  onClick={() => toggle(response.status)}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left"
                >
                  <span aria-hidden="true" className="text-xs text-zinc-400">{open ? "▾" : "▸"}</span>
                  <span className={`rounded px-2 py-0.5 font-mono text-xs font-bold ${toneCls}`}>{response.status}</span>
                  <span className="text-sm text-zinc-700 dark:text-zinc-200">{response.label}</span>
                </button>
                {open && (
                  <div data-api-response-schema className="flex items-center justify-between border-t border-zinc-100 px-4 py-2.5 dark:border-zinc-800">
                    <code className="font-mono text-xs text-zinc-600 dark:text-zinc-300">{response.schema}</code>
                    <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Show properties ＋</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* right: code panel */}
      <div data-api-code-panel className="flex flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-2.5 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <span className={`rounded px-2 py-1 font-mono text-xs font-bold ${methodCls}`}>{method.toUpperCase()}</span>
            <code data-api-code-path className="font-mono text-sm text-zinc-700 dark:text-zinc-200">/pets</code>
          </div>
          <select
            data-api-language-select
            value={activeLang}
            onChange={(e) => {
              setActiveLang(e.target.value);
              const next = languages.find((l) => l.id === e.target.value);
              if (next) onLanguageChange?.(next);
            }}
            className="rounded-md border border-zinc-200 bg-white px-2 py-1 text-xs text-zinc-700 outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
          >
            {languages.map((l) => (
              <option key={l.id} value={l.id}>{l.label}</option>
            ))}
          </select>
        </div>
        <pre data-api-sample className="overflow-x-auto border-b border-zinc-100 bg-zinc-50 px-4 py-3 font-mono text-xs text-zinc-800 dark:border-zinc-800 dark:bg-zinc-950/60 dark:text-zinc-200">{lang?.sample}</pre>
        <button data-api-test type="button" className="border-b border-zinc-100 px-4 py-2 text-right text-xs font-semibold text-zinc-400 transition-colors hover:text-zinc-600 dark:border-zinc-800 dark:hover:text-zinc-200">Test it ▸</button>
        <div className="flex items-center gap-3 px-4 py-2.5">
          <span className={`rounded px-2 py-0.5 font-mono text-xs font-bold ${TONE_STYLES.success}`}>{activeResponse?.status ?? "200"}</span>
          <span className="text-sm text-zinc-700 dark:text-zinc-200">{responseTitle}</span>
        </div>
        <pre data-api-json className="flex-1 overflow-auto px-4 pb-4 font-mono text-xs leading-5 text-sky-700 dark:text-sky-300">{activeResponse?.body}</pre>
      </div>
    </div>
  );
}
