/**
 * AgentEnvVarEditor - Vanilla Web Component
 * Agent environment variable editor: key/value rows with secret masking +
 * reveal toggle, per-row delete and an add-row input.
 *
 * Usage: <agent-env-var-editor title="Environment variables"></agent-env-var-editor>
 * Property: vars ([{key, value, secret?}])
 * Attributes: title, description
 * Events: change (detail {vars})
 */
const escapeAttribute = (value) =>
  String(value).replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  }[char]));

export class AgentEnvVarEditorElement extends HTMLElement {
  static get observedAttributes() {
    return ['title', 'description'];
  }

  constructor() {
    super();
    this._vars = [];
    this._revealed = {};
    this._newKey = '';
    this._newValue = '';
    this._newSecret = false;
    this._bound = false;
  }

  connectedCallback() {
    this.render();
    if (!this._bound) {
      this._bound = true;
      this.addEventListener('click', (event) => {
        const revealBtn = event.target.closest('[data-env-reveal]');
        if (revealBtn) {
          const row = revealBtn.closest('[data-env-row]');
          const key = row?.getAttribute('data-env-row');
          if (key) {
            this._revealed[key] = !this._revealed[key];
            this.render();
          }
          return;
        }
        const deleteBtn = event.target.closest('[data-env-delete]');
        if (deleteBtn) {
          const row = deleteBtn.closest('[data-env-row]');
          const key = row?.getAttribute('data-env-row');
          const vars = this._vars.filter((v) => v.key !== key);
          this._vars = vars;
          delete this._revealed[key];
          this.dispatchEvent(new CustomEvent('change', { detail: { vars: vars.map((v) => ({ ...v })) } }));
          this.render();
          return;
        }
        if (event.target.closest('[data-env-add-btn]')) {
          this._addFromInputs();
        }
      });
      this.addEventListener('input', (event) => {
        const target = event.target;
        if (!(target instanceof HTMLElement)) return;
        if (target.hasAttribute('data-env-new-key')) {
          this._newKey = target.value;
          const btn = this.querySelector('[data-env-add-btn]');
          if (btn) btn.disabled = !this._newKey.trim();
          return;
        }
        if (target.hasAttribute('data-env-new-value')) {
          this._newValue = target.value;
          return;
        }
        if (target.hasAttribute('data-env-new-secret')) {
          this._newSecret = target.checked || target.getAttribute('checked') === 'true';
          return;
        }
        const valueInput = target.closest('[data-env-value]');
        if (valueInput) {
          const row = valueInput.closest('[data-env-row]');
          const key = row?.getAttribute('data-env-row');
          const v = this._vars.find((it) => it.key === key);
          if (v) v.value = target.value;
        }
      });
      this.addEventListener('change', (event) => {
        const target = event.target;
        if (target instanceof HTMLInputElement && target.hasAttribute('data-env-new-secret')) {
          this._newSecret = target.checked;
        }
      });
    }
  }

  _addFromInputs() {
    const key = this._newKey.trim();
    if (!key) return;
    if (this._vars.find((v) => v.key === key)) return;
    this._vars = [...this._vars, { key, value: this._newValue, secret: this._newSecret }];
    this._newKey = '';
    this._newValue = '';
    this._newSecret = false;
    this.dispatchEvent(new CustomEvent('change', { detail: { vars: this._vars.map((v) => ({ ...v })) } }));
    this.render();
  }

  get vars() { return this._vars; }
  set vars(v) {
    this._vars = Array.isArray(v) ? v.map((it) => ({ ...it })) : [];
    this.render();
  }

  attributeChangedCallback() {
    // Fires before connectedCallback when an already-connected element upgrades;
    // rendering then would wipe light-DOM children before vars are captured.
    if (this._vars.length === 0 && this.innerHTML === '') return;
    this.render();
  }

  render() {
    const title = escapeAttribute(this.getAttribute('title') || 'Environment variables');
    const description = escapeAttribute(this.getAttribute('description') || 'Injected into every agent run. Secret values are masked.');

    const rows = this._vars.map((row) => {
      const revealedRow = !!this._revealed[row.key];
      const type = row.secret && !revealedRow ? 'password' : 'text';
      const revealBtn = row.secret
        ? `<button type="button" data-env-reveal aria-pressed="${revealedRow}" title="${revealedRow ? 'Hide value' : 'Reveal value'}" class="shrink-0 rounded-md border border-zinc-200 px-2 py-1.5 text-[11px] font-semibold text-zinc-500 hover:border-zinc-300 hover:text-zinc-700 dark:border-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200">${revealedRow ? 'Hide' : 'Show'}</button>`
        : '';
      return `
        <div data-env-row="${escapeAttribute(row.key)}" class="flex items-center gap-2">
          <input data-env-key value="${escapeAttribute(row.key)}" readonly aria-label="Variable name" class="w-44 shrink-0 rounded-md border border-zinc-200 bg-zinc-50 px-2 py-1.5 font-mono text-xs text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800/60 dark:text-zinc-200" />
          <input data-env-value type="${type}" value="${escapeAttribute(row.value)}" aria-label="Variable value" class="min-w-0 flex-1 rounded-md border border-zinc-200 bg-white px-2 py-1.5 font-mono text-xs text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200" />
          ${revealBtn}
          <button type="button" data-env-delete title="Delete variable" class="shrink-0 rounded-md border border-transparent px-2 py-1.5 text-[11px] font-semibold text-zinc-400 hover:border-rose-200 hover:text-rose-600 dark:hover:border-rose-900 dark:hover:text-rose-400">Delete</button>
        </div>`;
    }).join('');

    const empty = this._vars.length === 0
      ? '<p data-env-empty class="rounded-lg border border-dashed border-zinc-200 px-3 py-4 text-center text-xs text-zinc-400 dark:border-zinc-700 dark:text-zinc-500">No environment variables yet</p>'
      : '';

    this.innerHTML = `<div data-env-editor class="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
  <p data-env-title class="text-sm font-semibold text-zinc-900 dark:text-zinc-50">${title}</p>
  <p data-env-description class="mt-1 text-xs text-zinc-500 dark:text-zinc-400">${description}</p>
  <div data-env-rows class="mt-3 space-y-2">${rows}${empty}</div>
  <div data-env-add class="mt-3 flex items-center gap-2 border-t border-zinc-100 pt-3 dark:border-zinc-800">
    <input data-env-new-key value="${escapeAttribute(this._newKey)}" placeholder="KEY_NAME" aria-label="New variable name" class="w-44 shrink-0 rounded-md border border-zinc-200 bg-white px-2 py-1.5 font-mono text-xs text-zinc-700 placeholder:text-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200" />
    <input data-env-new-value value="${escapeAttribute(this._newValue)}" placeholder="value" aria-label="New variable value" class="min-w-0 flex-1 rounded-md border border-zinc-200 bg-white px-2 py-1.5 font-mono text-xs text-zinc-700 placeholder:text-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200" />
    <label data-env-new-secret class="flex shrink-0 cursor-pointer items-center gap-1.5 text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
      <input type="checkbox" data-env-new-secret ${this._newSecret ? 'checked' : ''} class="h-3.5 w-3.5 rounded border-zinc-300" /> secret
    </label>
    <button type="button" data-env-add-btn ${this._newKey.trim() ? '' : 'disabled'} class="shrink-0 rounded-md bg-indigo-600 px-3 py-1.5 text-[11px] font-semibold text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-40">Add</button>
  </div>
</div>`;
  }
}

if (!customElements.get('agent-env-var-editor')) {
  customElements.define('agent-env-var-editor', AgentEnvVarEditorElement);
}
