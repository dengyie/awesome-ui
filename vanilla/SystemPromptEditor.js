/**
 * SystemPromptEditor - Vanilla Web Component
 * Usage: <system-prompt-editor title="System prompt" version="v3" saved-value="..." temperature="0.7"></system-prompt-editor>
 * Attributes: title, value, placeholder, version, saved-value, variables (JSON array), temperature
 * Events: save (detail {text}), reset, temperature-change (detail {value})
 */
const escapeAttribute = (value) =>
  String(value).replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  }[char]));

export class SystemPromptEditorElement extends HTMLElement {
  static get observedAttributes() {
    return ['title', 'value', 'placeholder', 'version', 'saved-value', 'variables', 'temperature'];
  }

  constructor() {
    super();
    this._bound = false;
    this._variables = [];
  }

  connectedCallback() {
    this.render();
    if (!this._bound) {
      this._bound = true;
      this.addEventListener('click', (event) => {
        if (event.target.closest('[data-editor-save]')) {
          const ta = this.querySelector('[data-editor-textarea]');
          const text = ta ? ta.value : '';
          this.setAttribute('saved-value', text);
          this.dispatchEvent(new CustomEvent('save', { detail: { text } }));
          return;
        }
        if (event.target.closest('[data-editor-reset]')) {
          const saved = this.getAttribute('saved-value');
          if (saved !== null) this.setAttribute('value', saved);
          this.dispatchEvent(new CustomEvent('reset'));
          return;
        }
      });
      this.addEventListener('input', (event) => {
        if (!event.target.matches('[data-editor-textarea]')) return;
        // live dirty-state update — typing into the textarea doesn't re-render
        const saved = this.getAttribute('saved-value');
        const dirty = saved !== null ? event.target.value !== saved : true;
        const btn = this.querySelector('[data-editor-save]');
        if (btn) {
          if (dirty) btn.removeAttribute('disabled');
          else btn.setAttribute('disabled', '');
        }
        const state = this.querySelector('[data-editor-state]');
        if (state) {
          state.textContent = dirty ? 'Unsaved changes' : 'Saved';
          state.classList.toggle('text-amber-600', dirty);
          state.classList.toggle('dark:text-amber-400', dirty);
          state.classList.toggle('text-emerald-600', !dirty);
          state.classList.toggle('dark:text-emerald-400', !dirty);
        }
      });
      this.addEventListener('change', (event) => {
        if (event.target.matches('[data-editor-temperature]')) {
          const value = Number(event.target.value);
          this.setAttribute('temperature', String(value));
          this.dispatchEvent(new CustomEvent('temperature-change', { detail: { value } }));
        }
      });
    }
  }

  get variables() { return this._variables; }
  set variables(v) {
    this._variables = Array.isArray(v) ? v : [];
    this.render();
  }

  attributeChangedCallback(name) {
    if (name === 'variables' && this.getAttribute(name)) {
      try { this._variables = JSON.parse(this.getAttribute(name)); } catch { /* keep */ }
    }
    // Fires before connectedCallback when an already-connected element upgrades;
    // rendering then would wipe light-DOM children (e.g. the textarea) mid-edit.
    if (this._bound === false && this.innerHTML === '') return;
    this.render();
  }

  render() {
    const title = escapeAttribute(this.getAttribute('title') || 'System prompt');
    const value = this.getAttribute('value') || '';
    const placeholder = escapeAttribute(this.getAttribute('placeholder') || 'You are a helpful assistant that…');
    const version = escapeAttribute(this.getAttribute('version') || 'v3');
    const savedValue = this.getAttribute('saved-value');
    const temperature = this.getAttribute('temperature');
    const tokens = Math.max(1, Math.round(value.length * 0.25));
    const dirty = savedValue !== null ? value !== savedValue : false;

    const varChips = this._variables.map((v) =>
      `<code class="rounded bg-indigo-50 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">{{${escapeAttribute(v)}}}</code>`
    ).join('');

    const tempBlock = temperature !== null && temperature !== undefined && temperature !== '' ? `
      <div class="mt-3 flex items-center gap-3">
        <label class="text-xs font-medium text-zinc-600 dark:text-zinc-300" for="prompt-editor-temp">Temperature</label>
        <input id="prompt-editor-temp" data-editor-temperature type="range" min="0" max="2" step="0.1" value="${escapeAttribute(temperature)}" class="h-1 flex-1 cursor-pointer appearance-none rounded bg-zinc-200 accent-indigo-600 dark:bg-zinc-700" />
        <span data-editor-temp-value class="w-8 text-right font-mono text-xs text-zinc-700 dark:text-zinc-200">${Number(temperature).toFixed(1)}</span>
      </div>` : '';

    this.innerHTML = `<div data-prompt-editor class="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
  <div class="flex items-center justify-between">
    <p class="text-sm font-semibold text-zinc-900 dark:text-zinc-50">${title}<span data-editor-version class="ml-2 rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">${version}</span></p>
    <span data-editor-state class="text-[11px] font-semibold ${dirty ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}">${dirty ? 'Unsaved changes' : 'Saved'}</span>
  </div>
  <textarea data-editor-textarea rows="6" placeholder="${placeholder}" class="mt-3 w-full resize-y rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 font-mono text-xs leading-relaxed text-zinc-800 outline-none focus:border-indigo-400 placeholder:text-zinc-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100">${escapeAttribute(value)}</textarea>
  <div class="mt-2 flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400">
    <span data-editor-tokens>~${tokens} tokens · ${value.length} chars</span>
    ${this._variables.length > 0 ? `<span data-editor-variables class="flex flex-wrap items-center gap-1">${varChips}</span>` : ''}
  </div>
  ${tempBlock}
  <div class="mt-3 flex items-center justify-end gap-2">
    <button type="button" data-editor-reset class="rounded-md border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-600 hover:border-zinc-400 dark:border-zinc-700 dark:text-zinc-300">Reset</button>
    <button type="button" data-editor-save ${dirty ? '' : 'disabled'} class="rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-40">Save prompt</button>
  </div>
</div>`;
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('system-prompt-editor')) {
  customElements.define('system-prompt-editor', SystemPromptEditorElement);
}

export default SystemPromptEditorElement;
