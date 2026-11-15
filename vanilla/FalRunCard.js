/**
 * FalRunCard - fal generate-run info card: task type badge, model count and
 * relative time header, prompt paragraph, aspect ratio / total cost metadata
 * rows and a bottom action icon row (duplicate / rerun / delete / share).
 */
const escapeAttribute = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

class FalRunCardElement extends HTMLElement {
  static get observedAttributes() {
    return ['type', 'models', 'time', 'prompt', 'aspect', 'cost', 'cost-tone'];
  }

  constructor() {
    super();
    this._bound = false;
  }

  connectedCallback() {
    if (this._bound === false && this.innerHTML === '') {
      this._bound = true;
    }
    this._render();
    this.addEventListener('click', this._onClick);
  }

  disconnectedCallback() {
    this.removeEventListener('click', this._onClick);
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;
    if (this._bound === false && this.innerHTML === '') return;
    this._render();
  }

  get type() {
    return this.getAttribute('type') ?? 'Text To Image';
  }
  set type(value) {
    this.setAttribute('type', value);
  }

  get models() {
    const raw = this.getAttribute('models');
    const n = raw === null ? NaN : Number(raw);
    return Number.isFinite(n) ? n : 4;
  }
  set models(value) {
    this.setAttribute('models', String(value));
  }

  get time() {
    return this.getAttribute('time') ?? '22 minutes ago';
  }
  set time(value) {
    this.setAttribute('time', value);
  }

  get prompt() {
    return this.getAttribute('prompt') ?? 'a calm, morning, beach scenery';
  }
  set prompt(value) {
    this.setAttribute('prompt', value);
  }

  get aspect() {
    return this.getAttribute('aspect') ?? '1:1';
  }
  set aspect(value) {
    this.setAttribute('aspect', value);
  }

  get cost() {
    return this.getAttribute('cost') ?? '$0.241';
  }
  set cost(value) {
    this.setAttribute('cost', value);
  }

  get costTone() {
    return this.getAttribute('cost-tone') ?? 'green';
  }
  set costTone(value) {
    this.setAttribute('cost-tone', value);
  }

  _onClick(event) {
    const actionEl = event.target.closest('[data-fal-run-duplicate], [data-fal-run-rerun], [data-fal-run-delete]');
    if (!actionEl) return;
    if (actionEl.hasAttribute('data-fal-run-duplicate')) {
      this.dispatchEvent(new CustomEvent('duplicate', { bubbles: true }));
    } else if (actionEl.hasAttribute('data-fal-run-rerun')) {
      this.dispatchEvent(new CustomEvent('rerun', { bubbles: true }));
    } else {
      this.dispatchEvent(new CustomEvent('delete', { bubbles: true }));
    }
  }

  _render() {
    const costClass = this.costTone === 'green' ? 'text-emerald-500' : 'text-zinc-600 dark:text-zinc-300';
    this.innerHTML = `
      <div data-fal-run-card class="w-full rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div class="flex items-center justify-between gap-2">
          <span data-fal-run-type class="inline-flex items-center gap-1.5 rounded-md border border-purple-200 bg-purple-50 px-2 py-1 text-[11px] font-medium text-purple-600 dark:border-purple-800 dark:bg-purple-950/40 dark:text-purple-300">
            <span aria-hidden="true">⌨</span>
            ${escapeAttribute(this.type)}
            <span aria-hidden="true" class="text-purple-300 dark:text-purple-700">▸</span>
          </span>
          <button type="button" data-fal-run-bookmark aria-label="Bookmark run" class="text-zinc-400 transition-colors hover:text-zinc-600 dark:hover:text-zinc-200">⚑</button>
        </div>
        <p data-fal-run-meta class="mt-2 text-[11px] text-zinc-500 dark:text-zinc-400">
          <span data-fal-run-models>${escapeAttribute(this.models)} models</span>
          <span class="mx-1.5">·</span>
          <span data-fal-run-time>${escapeAttribute(this.time)}</span>
        </p>
        <div class="mt-3">
          <p class="text-[11px] font-medium text-zinc-400 dark:text-zinc-500">Prompt</p>
          <p data-fal-run-prompt class="mt-1 text-sm leading-relaxed text-zinc-800 dark:text-zinc-200">${escapeAttribute(this.prompt)}</p>
        </div>
        <div data-fal-run-rows class="mt-3 space-y-1.5">
          <div class="flex items-center justify-between text-xs">
            <span class="text-zinc-500 dark:text-zinc-400">Aspect Ratio:</span>
            <span data-fal-run-aspect class="rounded border border-zinc-200 px-1.5 py-0.5 font-mono text-[10px] text-zinc-600 dark:border-zinc-700 dark:text-zinc-300">${escapeAttribute(this.aspect)}</span>
          </div>
          <div class="flex items-center justify-between text-xs">
            <span class="text-zinc-500 dark:text-zinc-400">Total Cost:</span>
            <span data-fal-run-cost class="font-mono text-[11px] font-medium ${costClass}">${escapeAttribute(this.cost)}</span>
          </div>
        </div>
        <div data-fal-run-actions class="mt-4 flex items-center justify-between border-t border-zinc-100 pt-3 dark:border-zinc-800">
          <div class="flex items-center gap-1">
            <button type="button" data-fal-run-duplicate aria-label="Duplicate run" class="flex h-8 w-8 items-center justify-center rounded-md text-sm text-zinc-400 transition-colors hover:bg-zinc-50 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-200">⧉</button>
            <button type="button" data-fal-run-rerun aria-label="Rerun run" class="flex h-8 w-8 items-center justify-center rounded-md text-sm text-zinc-400 transition-colors hover:bg-zinc-50 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-200">↻</button>
            <button type="button" data-fal-run-delete aria-label="Delete run" class="flex h-8 w-8 items-center justify-center rounded-md text-sm text-zinc-400 transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/40">🗑</button>
          </div>
          <button type="button" data-fal-run-share aria-label="Share run" class="flex h-8 w-8 items-center justify-center rounded-md text-sm text-zinc-400 transition-colors hover:bg-zinc-50 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-200">⇗</button>
        </div>
      </div>`;
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('fal-run-card')) {
  customElements.define('fal-run-card', FalRunCardElement);
}

export default FalRunCardElement;
