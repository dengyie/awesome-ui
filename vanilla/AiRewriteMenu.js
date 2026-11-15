/**
 * AiRewriteMenu - Intercom composer AI rewrite menu: a trigger button that
 * opens a popover of writing-assistant actions (Expand, Rephrase, tone
 * variants, Fix grammar, Translate) with optional feature badges.
 */
const escapeAttribute = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

const parseJsonAttr = (raw, fallback) => {
  if (typeof raw !== 'string' || raw.trim() === '') return fallback;
  try {
    const parsed = JSON.parse(raw);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
};

class AiRewriteMenuElement extends HTMLElement {
  static get observedAttributes() {
    return ['trigger-label', 'actions', 'open'];
  }

  constructor() {
    super();
    this._bound = false;
    this._actions = [];
    this._open = false;
  }

  connectedCallback() {
    if (!this._actions.length) {
      this._actions = parseJsonAttr(this.getAttribute('actions'), []);
    }
    if (this._open === false && this.getAttribute('open') === 'true') {
      this._open = true;
    }
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
    if (name === 'actions' && !this._actions.length) {
      this._actions = parseJsonAttr(this.getAttribute('actions'), []);
    }
    if (name === 'open') {
      this._open = newValue === 'true';
    }
    if (this._bound === false && this.innerHTML === '') return;
    this._render();
  }

  get triggerLabel() {
    return this.getAttribute('trigger-label') ?? 'Rewrite';
  }
  set triggerLabel(value) {
    this.setAttribute('trigger-label', value);
  }

  get open() {
    return this._open;
  }
  set open(value) {
    this._open = Boolean(value);
    this._render();
  }

  get actions() {
    return this._actions;
  }
  set actions(value) {
    this._actions = Array.isArray(value) ? value : [];
    this._render();
  }

  _onClick(event) {
    if (event.target.closest('[data-rewrite-trigger]')) {
      this._open = !this._open;
      this._render();
      this.dispatchEvent(new CustomEvent('toggle', { detail: { open: this._open }, bubbles: true }));
      return;
    }
    const itemEl = event.target.closest('[data-rewrite-item]');
    if (!itemEl) return;
    const action = this._actions.find((a) => String(a.id) === itemEl.getAttribute('data-rewrite-item'));
    if (!action) return;
    this._open = false;
    this._render();
    this.dispatchEvent(new CustomEvent('select', { detail: { action }, bubbles: true }));
  }

  _render() {
    const menu = this._open && this._actions.length
      ? `<div data-rewrite-menu class="absolute bottom-full left-0 z-10 mb-2 w-60 overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-lg dark:border-zinc-700 dark:bg-zinc-900">${this._actions
          .map((a) => {
            const badge = a.badge
              ? `<span data-rewrite-item-badge class="inline-flex shrink-0 items-center gap-1 rounded-full bg-indigo-50 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-300"><span aria-hidden="true">↑</span>${escapeAttribute(a.badge)}</span>`
              : '';
            return `
            <button type="button" data-rewrite-item="${escapeAttribute(a.id)}" class="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-xs text-zinc-700 transition-colors hover:bg-zinc-50 dark:text-zinc-200 dark:hover:bg-zinc-800">
              <span data-rewrite-item-label>${escapeAttribute(a.label)}</span>
              ${badge}
            </button>`;
          })
          .join('')}</div>`
      : '';

    this.innerHTML = `
      <div data-rewrite-menu-root class="relative inline-block">
        <button type="button" data-rewrite-trigger aria-expanded="${this._open}" class="flex items-center gap-1.5 rounded-md border border-zinc-200 bg-white px-2.5 py-1.5 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800">
          <span aria-hidden="true" class="text-indigo-500">✦</span>
          ${escapeAttribute(this.triggerLabel)}
          <span aria-hidden="true" class="text-zinc-400">▾</span>
        </button>
        ${menu}
      </div>`;
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('ai-rewrite-menu')) {
  customElements.define('ai-rewrite-menu', AiRewriteMenuElement);
}

export default AiRewriteMenuElement;
