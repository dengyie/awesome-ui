import React from "react";

export interface McpClientTab {
  id: string;
  label: string;
  /** Client logo emoji or short mark shown in the tab */
  mark?: string;
  /** Connection steps shown for this client */
  steps: string[];
  /** Optional config snippet (JSON/YAML) rendered in a dark code block */
  snippet?: string;
}

export interface McpConnectPanelProps {
  title?: string;
  description?: string;
  clients: McpClientTab[];
  /** Called when the user copies the config snippet */
  onCopy?: (client: McpClientTab) => void;
  className?: string;
}

/**
 * McpConnectPanel - MCP (Model Context Protocol) server connection guide:
 * per-client tabs (ChatGPT / Claude Desktop / Cursor), numbered setup steps
 * and a copyable config snippet block.
 */
export default function McpConnectPanel({
  title = "Connection guide",
  description = "Connect to the MCP server to access workspace data directly from your preferred AI assistant.",
  clients,
  onCopy,
  className = "",
}: McpConnectPanelProps) {
  const [active, setActive] = React.useState(clients[0]?.id ?? "");
  const [copied, setCopied] = React.useState(false);
  const client = clients.find((c) => c.id === active) ?? clients[0];

  React.useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1600);
    return () => clearTimeout(t);
  }, [copied]);

  if (!client) return null;

  return (
    <div data-mcp-panel className={`rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 ${className}`}>
      <p data-mcp-title className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{title}</p>
      <p data-mcp-description className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{description}</p>

      <div data-mcp-tabs className="mt-3 flex gap-1 border-b border-zinc-200 dark:border-zinc-800">
        {clients.map((c) => (
          <button
            key={c.id}
            type="button"
            data-mcp-tab={c.id}
            aria-selected={c.id === client.id}
            onClick={() => { setActive(c.id); setCopied(false); }}
            className={`-mb-px flex items-center gap-1.5 border-b-2 px-3 py-2 text-xs font-semibold transition-colors ${
              c.id === client.id
                ? "border-teal-600 text-teal-700 dark:border-teal-400 dark:text-teal-300"
                : "border-transparent text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
            }`}
          >
            {c.mark && <span aria-hidden="true">{c.mark}</span>}
            {c.label}
          </button>
        ))}
      </div>

      <ol data-mcp-steps className="mt-3 space-y-2">
        {client.steps.map((step, i) => (
          <li key={i} data-mcp-step className="flex items-start gap-2 text-xs text-zinc-600 dark:text-zinc-300">
            <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-teal-50 font-mono text-[10px] font-bold text-teal-700 dark:bg-teal-950/60 dark:text-teal-300">{i + 1}</span>
            <span className="min-w-0">{step}</span>
          </li>
        ))}
      </ol>

      {client.snippet && (
        <div data-mcp-snippet className="mt-3">
          <div className="relative">
            <pre className="overflow-x-auto rounded-lg bg-zinc-950 p-3 font-mono text-[11px] leading-relaxed text-zinc-200"><code>{client.snippet}</code></pre>
            <button
              type="button"
              data-mcp-copy
              onClick={() => { setCopied(true); onCopy?.(client); }}
              className="absolute right-2 top-2 rounded-md border border-zinc-700 bg-zinc-900/90 px-2 py-1 text-[10px] font-semibold text-zinc-300 hover:border-teal-500 hover:text-teal-300"
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
