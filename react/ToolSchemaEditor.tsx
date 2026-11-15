import React from "react";

export interface ToolParameter {
  name: string;
  type: "string" | "number" | "boolean";
  required?: boolean;
}

export interface ToolSchema {
  id: string;
  name: string;
  description?: string;
  method?: string;
  endpoint?: string;
  parameters?: ToolParameter[];
}

export interface ToolSchemaEditorProps {
  title?: string;
  tools: ToolSchema[];
  onValidate?: (tool: ToolSchema) => void;
  onToggle?: (tool: ToolSchema, enabled: boolean) => void;
  className?: string;
}

const TYPE_BADGE: Record<string, string> = {
  string: "bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300",
  number: "bg-violet-50 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300",
  boolean: "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300",
};

/**
 * ToolSchemaEditor - Agent tool registry: function/tool cards with method +
 * endpoint, typed parameter lists and per-tool validate / enable toggles.
 */
export default function ToolSchemaEditor({
  title = "Tools & functions",
  tools,
  onValidate,
  onToggle,
  className = "",
}: ToolSchemaEditorProps) {
  const [disabled, setDisabled] = React.useState<Record<string, boolean>>({});
  return (
    <div data-tool-editor className={`rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 ${className}`}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{title}</p>
        <span data-tool-count className="rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
          {tools.filter((t) => !disabled[t.id]).length}/{tools.length} enabled
        </span>
      </div>
      <div className="mt-3 space-y-3">
        {tools.map((tool) => {
          const off = !!disabled[tool.id];
          return (
            <div
              key={tool.id}
              data-tool-card={tool.id}
              className={`rounded-lg border px-3 py-3 transition-colors ${
                off
                  ? "border-zinc-200 bg-zinc-50 opacity-60 dark:border-zinc-800 dark:bg-zinc-800/40"
                  : "border-zinc-200 hover:border-zinc-300 dark:border-zinc-800 dark:hover:border-zinc-700"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="flex items-center gap-2">
                    <code data-tool-name className="truncate font-mono text-sm font-semibold text-zinc-900 dark:text-zinc-50">{tool.name}</code>
                    {tool.method && (
                      <span data-tool-method className={`rounded px-1.5 py-0.5 font-mono text-[10px] font-bold ${tool.method === "GET" ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300" : "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300"}`}>{tool.method}</span>
                    )}
                  </p>
                  {tool.endpoint && <code data-tool-endpoint className="mt-0.5 block truncate font-mono text-[11px] text-zinc-400 dark:text-zinc-500">{tool.endpoint}</code>}
                  {tool.description && <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{tool.description}</p>}
                </div>
                <label className="flex shrink-0 cursor-pointer items-center" title={off ? "Enable tool" : "Disable tool"}>
                  <input
                    type="checkbox"
                    data-tool-toggle
                    checked={!off}
                    onChange={() => {
                      const next = !off;
                      setDisabled((d) => ({ ...d, [tool.id]: !next }));
                      onToggle?.(tool, next);
                    }}
                    className="peer sr-only"
                  />
                  <span className={`relative h-5 w-9 rounded-full transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-indigo-500 ${off ? "bg-zinc-300 dark:bg-zinc-600" : "bg-indigo-600"}`}>
                    <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${off ? "left-0.5" : "left-4.5"}`}></span>
                  </span>
                </label>
              </div>
              {tool.parameters && tool.parameters.length > 0 && (
                <div data-tool-params className="mt-2 flex flex-wrap items-center gap-1.5 border-t border-zinc-100 pt-2 dark:border-zinc-800">
                  {tool.parameters.map((param) => (
                    <span key={param.name} data-tool-param={param.name} className={`flex items-center gap-1 rounded px-1.5 py-0.5 font-mono text-[10px] font-semibold ${TYPE_BADGE[param.type] || TYPE_BADGE.string}`}>
                      {param.name}
                      <span className="font-normal opacity-70">{param.type}</span>
                      {param.required && <span className="font-bold text-red-500" title="required">*</span>}
                    </span>
                  ))}
                </div>
              )}
              <div className="mt-2 flex justify-end">
                <button
                  type="button"
                  data-tool-validate
                  onClick={() => onValidate?.(tool)}
                  className="rounded-md border border-zinc-300 px-2.5 py-1 text-[11px] font-semibold text-zinc-700 hover:border-indigo-400 hover:text-indigo-600 dark:border-zinc-700 dark:text-zinc-200"
                >
                  Validate schema
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
