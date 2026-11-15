/**
 * ImageActionMenu - Krea generated-image context menu: Fullscreen / Vary /
 * Edit / Upscale & enhance / Make video / Download actions anchored to an
 * image card, with optional danger styling and per-action icons.
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

class ImageActionMenuElement extends HTMLElement {
  static get observedAttributes() {
    return ['actions', 'open'];
  }

  constructor() {
    super();
    this._bound = false;
    this._actions = [];
    this._open = true;
  }

  connectedCallback() {
    if (!this._actions.length) {
      this._actions = parseJsonAttr(this.getAttribute('actions'), []);
    }
    const openAttr = this.getAttribute('open');
    if (openAttr !== null) {
      this._open = openAttr === 'true';
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

  get open() {
    return this._open;
  }
  set open(value) {
    this._open = Boolean(value);
    this.setAttribute('open', this._open ? 'true' : 'false');
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
    if (!this._open) return;
    const actionEl = event.target.closest('[data-image-action]');
    if (!actionEl) return;
    const action = this._actions.find((a) => String(a.id) === actionEl.getAttribute('data-image-action'));
    if (action) {
      this.dispatchEvent(new CustomEvent('action', { detail: { action }, bubbles: true }));
    }
  }

  _render() {
    if (!this._open) {
      this.innerHTML = '';
      return;
    }
    const iconFor = (a) =>
      a.icon ?? { Fullscreen: '⛶', Vary: '↻', Edit: '✎', 'Make video': '▶', Download: '↓' }[a.label] ?? '•';
    const items = this._actions.length
      ? this._actions
          .map((a, i) => {
            const divider = i > 0 && a.id === 'download' ? '<div class="my-1 h-px bg-zinc-100 dark:bg-zinc-800"></div>' : '';
            const tone = a.danger
              ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40'
              : 'text-zinc-700 hover:bg-zinc-50 dark:text-zinc-200 dark:hover:bg-zinc-800';
            return `${divider}
            <button type="button" data-image-action="${escapeAttribute(a.id)}" class="flex w-full items-center gap-2.5 px-3 py-2 text-left text-xs transition-colors ${tone}">
              <span aria-hidden="true" class="w-4 shrink-0 text-center text-zinc-400 dark:text-zinc-500">${escapeAttribute(iconFor(a))}</span>
              <span data-image-action-label>${escapeAttribute(a.label)}</span>
            </button>`;
          })
          .join('')
      : '<p data-image-action-empty class="px-3 py-3 text-center text-xs text-zinc-400 dark:text-zinc-500">No actions available.</p>';

    this.innerHTML = `
      <div data-image-action-menu class="w-56 overflow-hidden rounded-lg border border-zinc-200 bg-white py-1 shadow-lg dark:border-zinc-700 dark:bg-zinc-900">${items}</div>`;
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('image-action-menu')) {
  customElements.define('image-action-menu', ImageActionMenuElement);
}

export default ImageActionMenuElement;
