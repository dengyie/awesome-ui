/**
 * PromptSaveDialog - Vanilla Web Component
 * Usage: <prompt-save-dialog title="..." folder="..."></prompt-save-dialog>
 * Attributes: open, title, folder, description, prompt, variables (JSON array)
 * Events: save (detail {title, prompt, variables}), cancel, close
 */
const escapeAttribute = (value) =>
  String(value).replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  }[char]));

export class PromptSaveDialogElement extends HTMLElement {
  static get observedAttributes() {
    return ['open', 'title', 'folder', 'description', 'prompt', 'variables'];
  }

  constructor() {
    super();
    this._bound = false;
  }

  connectedCallback() {
    this.render();
    if (!this._bound) {
      this._bound = true;
      this.addEventListener('click', (event) => {
        if (event.target.closest('[data-prompt-save-close]')) {
          this.setAttribute('open', 'false');
          this.dispatchEvent(new CustomEvent('close'));
          return;
        }
        if (event.target.closest('[data-prompt-save-cancel]')) {
          this.dispatchEvent(new CustomEvent('cancel'));
          return;
        }
        if (event.target.closest('[data-prompt-save-submit]')) {
          const title = this.querySelector('[data-prompt-save-title]')?.value ?? this.getAttribute('title') ?? '';
          const prompt = this.querySelector('[data-prompt-save-body]')?.value ?? this.getAttribute('prompt') ?? '';
          this.dispatchEvent(new CustomEvent('save', { detail: { title, prompt, variables: this._vars } }));
        }
      });
    }
  }

  attributeChangedCallback() {
    if (this._bound === false && this.innerHTML === '') return;
    this.render();
  }

  get variables() {
    return this._vars;
  }
  set variables(v) {
    this._vars = Array.isArray(v) ? v.map(String) : [];
    this.render();
  }

  _parseVars() {
    try {
      const raw = this.getAttribute('variables');
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed.map(String) : ['company'];
    } catch (e) {
      return ['company'];
    }
  }

  render() {
    if ((this.getAttribute('open') || 'true') === 'false') {
      this.innerHTML = '';
      return;
    }
    this._vars = this._vars || this._parseVars();
    const title = escapeAttribute(this.getAttribute('title') || 'ASMobbin Onboarding Ratings');
    const folder = escapeAttribute(this.getAttribute('folder') || 'ASMobbin');
    const description = escapeAttribute(this.getAttribute('description') || 'Other users with access to the folder will be able to see and use this prompt.');
    const prompt = escapeAttribute(this.getAttribute('prompt') || 'Create a Google Sheet report that rates the onboarding experience of {{company}}.\nOverview:');

    const varChips = (this._vars || []).map((v) => `
      <span data-prompt-save-var class="rounded-md bg-indigo-50 px-2 py-0.5 font-mono text-[11px] font-medium text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">{{${escapeAttribute(v)}}}</span>`).join('');

    this.innerHTML = `<div data-prompt-save role="dialog" aria-modal="true" class="w-full max-w-lg rounded-xl border border-zinc-200 bg-white p-4 shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
  <div class="flex items-start justify-between">
    <button type="button" data-prompt-save-folder class="flex items-center gap-1.5 rounded-md border border-zinc-200 px-2.5 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800">
      <span aria-hidden="true">📁</span>${folder}<span class="text-zinc-400" aria-hidden="true">▾</span>
    </button>
    <button type="button" data-prompt-save-close aria-label="Close" class="rounded p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300">✕</button>
  </div>
  <input data-prompt-save-title type="text" value="${title}" aria-label="Prompt title" class="mt-3 w-full rounded-md border border-transparent bg-transparent px-1 py-1 text-base font-semibold text-zinc-900 outline-none transition-colors focus:border-zinc-300 focus:bg-white dark:text-zinc-50 dark:focus:border-zinc-600 dark:focus:bg-zinc-900">
  <textarea data-prompt-save-body rows="6" aria-label="Prompt body" class="mt-2 w-full resize-y rounded-md border border-zinc-200 px-3 py-2 text-xs leading-relaxed text-zinc-700 outline-none transition-colors focus:border-indigo-400 dark:border-zinc-700 dark:text-zinc-200 dark:focus:border-indigo-500">${prompt}</textarea>
  <div class="mt-2 flex items-center justify-between">
    <button type="button" data-prompt-save-add-var class="rounded-md border border-dashed border-zinc-300 px-2.5 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800">+ Add variable</button>
    <button type="button" data-prompt-save-expand aria-label="Expand editor" class="rounded-md border border-zinc-200 p-1.5 text-zinc-500 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800">⤢</button>
  </div>
  ${this._vars.length > 0 ? `<div data-prompt-save-vars class="mt-2 flex flex-wrap gap-1.5">${varChips}</div>` : ''}
  <div class="mt-3 flex items-center justify-between gap-3 border-t border-zinc-200 pt-3 dark:border-zinc-800">
    <p class="min-w-0 flex-1 text-[11px] leading-snug text-zinc-500 dark:text-zinc-400">${description}</p>
    <div class="flex shrink-0 gap-2">
      <button type="button" data-prompt-save-cancel class="rounded-md px-3 py-1.5 text-xs font-semibold text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800">Cancel</button>
      <button type="button" data-prompt-save-submit class="rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-indigo-500">Save prompt</button>
    </div>
  </div>
</div>`;
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('prompt-save-dialog')) {
  customElements.define('prompt-save-dialog', PromptSaveDialogElement);
}

export default PromptSaveDialogElement;
