import React from "react";

export interface EnvVar {
  key: string;
  value: string;
  /** Secret values render masked with a reveal toggle */
  secret?: boolean;
}

export interface AgentEnvVarEditorProps {
  title?: string;
  description?: string;
  vars: EnvVar[];
  /** Called with the full list after any add/edit/delete */
  onChange?: (vars: EnvVar[]) => void;
  className?: string;
}

/**
 * AgentEnvVarEditor - agent environment variable editor: key/value rows with
 * secret masking + reveal toggle, per-row delete and an add-row input.
 */
export default function AgentEnvVarEditor({
  title = "Environment variables",
  description = "Injected into every agent run. Secret values are masked.",
  vars,
  onChange,
  className = "",
}: AgentEnvVarEditorProps) {
  const [rows, setRows] = React.useState<EnvVar[]>(vars);
  const [revealed, setRevealed] = React.useState<Record<string, boolean>>({});
  const [newKey, setNewKey] = React.useState("");
  const [newValue, setNewValue] = React.useState("");
  const [newSecret, setNewSecret] = React.useState(false);

  const commit = (next: EnvVar[]) => {
    setRows(next);
    onChange?.(next);
  };

  const update = (i: number, patch: Partial<EnvVar>) => {
    commit(rows.map((row, idx) => (idx === i ? { ...row, ...patch } : row)));
  };

  const remove = (i: number) => {
    commit(rows.filter((_, idx) => idx !== i));
  };

  const add = () => {
    const key = newKey.trim();
    if (!key) return;
    commit([...rows, { key, value: newValue, secret: newSecret }]);
    setNewKey("");
    setNewValue("");
    setNewSecret(false);
  };

  return (
    <div data-env-editor className={`rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 ${className}`}>
      <p data-env-title className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{title}</p>
      <p data-env-description className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{description}</p>

      <div data-env-rows className="mt-3 space-y-2">
        {rows.map((row, i) => {
          const revealedRow = !!revealed[row.key];
          return (
            <div key={i} data-env-row={row.key} className="flex items-center gap-2">
              <input
                data-env-key
                value={row.key}
                readOnly
                aria-label="Variable name"
                className="w-44 shrink-0 rounded-md border border-zinc-200 bg-zinc-50 px-2 py-1.5 font-mono text-xs text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800/60 dark:text-zinc-200"
              />
              <input
                data-env-value
                type={row.secret && !revealedRow ? "password" : "text"}
                value={row.value}
                onChange={(e) => update(i, { value: e.target.value })}
                aria-label="Variable value"
                className="min-w-0 flex-1 rounded-md border border-zinc-200 bg-white px-2 py-1.5 font-mono text-xs text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
              />
              {row.secret && (
                <button
                  type="button"
                  data-env-reveal
                  aria-pressed={revealedRow}
                  title={revealedRow ? "Hide value" : "Reveal value"}
                  onClick={() => setRevealed((r) => ({ ...r, [row.key]: !revealedRow }))}
                  className="shrink-0 rounded-md border border-zinc-200 px-2 py-1.5 text-[11px] font-semibold text-zinc-500 hover:border-zinc-300 hover:text-zinc-700 dark:border-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
                >
                  {revealedRow ? "Hide" : "Show"}
                </button>
              )}
              <button
                type="button"
                data-env-delete
                title="Delete variable"
                onClick={() => remove(i)}
                className="shrink-0 rounded-md border border-transparent px-2 py-1.5 text-[11px] font-semibold text-zinc-400 hover:border-rose-200 hover:text-rose-600 dark:hover:border-rose-900 dark:hover:text-rose-400"
              >
                Delete
              </button>
            </div>
          );
        })}
        {rows.length === 0 && (
          <p data-env-empty className="rounded-lg border border-dashed border-zinc-200 px-3 py-4 text-center text-xs text-zinc-400 dark:border-zinc-700 dark:text-zinc-500">
            No environment variables yet
          </p>
        )}
      </div>

      <div data-env-add className="mt-3 flex items-center gap-2 border-t border-zinc-100 pt-3 dark:border-zinc-800">
        <input
          data-env-new-key
          value={newKey}
          onChange={(e) => setNewKey(e.target.value)}
          placeholder="KEY_NAME"
          aria-label="New variable name"
          className="w-44 shrink-0 rounded-md border border-zinc-200 bg-white px-2 py-1.5 font-mono text-xs text-zinc-700 placeholder:text-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
        />
        <input
          data-env-new-value
          value={newValue}
          onChange={(e) => setNewValue(e.target.value)}
          placeholder="value"
          aria-label="New variable value"
          className="min-w-0 flex-1 rounded-md border border-zinc-200 bg-white px-2 py-1.5 font-mono text-xs text-zinc-700 placeholder:text-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
        />
        <label data-env-new-secret className="flex shrink-0 cursor-pointer items-center gap-1.5 text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
          <input type="checkbox" checked={newSecret} onChange={(e) => setNewSecret(e.target.checked)} className="h-3.5 w-3.5 rounded border-zinc-300" />
          secret
        </label>
        <button
          type="button"
          data-env-add-btn
          onClick={add}
          disabled={!newKey.trim()}
          className="shrink-0 rounded-md bg-indigo-600 px-3 py-1.5 text-[11px] font-semibold text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Add
        </button>
      </div>
    </div>
  );
}
