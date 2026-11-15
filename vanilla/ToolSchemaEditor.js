/**
 * ToolSchemaEditor - Vanilla Web Component
 * Usage: <tool-schema-editor title="Tools & functions"></tool-schema-editor>
 * Property: tools ([{id, name, description?, method?, endpoint?, parameters?: [{name, type, required?}]}])
 * Attributes: title
 * Events: validate (detail {tool}), toggle (detail {tool, enabled})
 */
const escapeAttribute = (value) =>
  String(value).replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  }[char]));

export class ToolSchemaEditorElement extends HTMLElement {
  static get observedAttributes() {
    return ['title'];
  }

  constructor() {
    super();
    this._tools = [];
    this._disabled = {};
    this._bound = false;
  }

  connectedCallback() {
    this.render();
    if (!this._bound) {
      this._bound = true;
      this.addEventListener('click', (event) => {
        const validateBtn = event.target.closest('[data-tool-validate]');
        if (validateBtn) {
          const card = validateBtn.closest('[data-tool-card]');
          const tool = this._tools.find((t) => t.id === card?.getAttribute('data-tool-card'));
          if (tool) this.dispatchEvent(new CustomEvent('validate', { detail: { tool } }));
          return;
        }
        const toggleBtn = event.target.closest('[data-tool-toggle]');
        if (toggleBtn) {
          const card = toggleBtn.closest('[data-tool-card]');
          const id = card?.getAttribute('data-tool-card');
          const tool = this._tools.find((t) => t.id === id);
          if (tool) {
            const enabled = !!this._disabled[id];
            this._disabled[id] = !enabled;
            this.dispatchEvent(new CustomEvent('toggle', { detail: { tool, enabled } }));
            this.render();
          }
        }
      });
    }
  }

  get tools() { return this._tools; }
  set tools(v) {
    this._tools = Array.isArray(v) ? v.map((t) => ({ ...t })) : [];
    this.render();
  }

  attributeChangedCallback() {
    // Fires before connectedCallback when an already-connected element upgrades;
    // rendering then would wipe light-DOM children before tools are captured.
    if (this._tools.length === 0 && this.innerHTML === '') return;
    this.render();
  }

  render() {
    const title = escapeAttribute(this.getAttribute('title') || 'Tools & functions');
    const enabledCount = this._tools.filter((t) => !this._disabled[t.id]).length;

    const TYPE_BADGE = {
      string: 'bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300',
      number: 'bg-violet-50 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300',
      boolean: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300',
    };

    const cards = this._tools.map((tool) => {
      const off = !!this._disabled[tool.id];
      const params = (tool.parameters || []).map((param) =>
        `<span data-tool-param="${escapeAttribute(param.name)}" class="flex items-center gap-1 rounded px-1.5 py-0.5 font-mono text-[10px] font-semibold ${TYPE_BADGE[param.type] || TYPE_BADGE.string}">${escapeAttribute(param.name)}<span class="font-normal opacity-70">${escapeAttribute(param.type)}</span>${param.required ? '<span class="font-bold text-red-500" title="required">*</span>' : ''}</span>`
      ).join('');
      return `
        <div data-tool-card="${escapeAttribute(tool.id)}" class="rounded-lg border px-3 py-3 transition-colors ${off ? 'border-zinc-200 bg-zinc-50 opacity-60 dark:border-zinc-800 dark:bg-zinc-800/40' : 'border-zinc-200 hover:border-zinc-300 dark:border-zinc-800 dark:hover:border-zinc-700'}">
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0">
              <p class="flex items-center gap-2">
                <code data-tool-name class="truncate font-mono text-sm font-semibold text-zinc-900 dark:text-zinc-50">${escapeAttribute(tool.name)}</code>
                ${tool.method ? `<span data-tool-method class="rounded px-1.5 py-0.5 font-mono text-[10px] font-bold ${tool.method === 'GET' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300' : 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'}">${escapeAttribute(tool.method)}</span>` : ''}
              </p>
              ${tool.endpoint ? `<code data-tool-endpoint class="mt-0.5 block truncate font-mono text-[11px] text-zinc-400 dark:text-zinc-500">${escapeAttribute(tool.endpoint)}</code>` : ''}
              ${tool.description ? `<p class="mt-1 text-xs text-zinc-500 dark:text-zinc-400">${escapeAttribute(tool.description)}</p>` : ''}
            </div>
            <button type="button" data-tool-toggle aria-pressed="${!off}" title="${off ? 'Enable tool' : 'Disable tool'}" class="relative h-5 w-9 shrink-0 rounded-full transition-colors ${off ? 'bg-zinc-300 dark:bg-zinc-600' : 'bg-indigo-600'}">
              <span class="absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${off ? 'left-0.5' : 'left-4'}"></span>
            </button>
          </div>
          ${params ? `<div data-tool-params class="mt-2 flex flex-wrap items-center gap-1.5 border-t border-zinc-100 pt-2 dark:border-zinc-800">${params}</div>` : ''}
          <div class="mt-2 flex justify-end">
            <button type="button" data-tool-validate class="rounded-md border border-zinc-300 px-2.5 py-1 text-[11px] font-semibold text-zinc-700 hover:border-indigo-400 hover:text-indigo-600 dark:border-zinc-700 dark:text-zinc-200">Validate schema</button>
          </div>
        </div>`;
    }).join('');

    this.innerHTML = `<div data-tool-editor class="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
  <div class="flex items-center justify-between">
    <p class="text-sm font-semibold text-zinc-900 dark:text-zinc-50">${title}</p>
    <span data-tool-count class="rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">${enabledCount}/${this._tools.length} enabled</span>
  </div>
  <div class="mt-3 space-y-3">${cards}</div>
</div>`;
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('tool-schema-editor')) {
  customElements.define('tool-schema-editor', ToolSchemaEditorElement);
}

export default ToolSchemaEditorElement;
