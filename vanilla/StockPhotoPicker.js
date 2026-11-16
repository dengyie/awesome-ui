/**
 * StockPhotoPicker - Media picker modal: title bar with close button,
 * search input with clear, "Powered by" caption and masonry photo grid
 * with hover author name + Add button (Substack stock-photos pattern).
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

const DEFAULT_PHOTOS = () => [
  { id: 'p1', url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&q=60', alt: 'Sunlit forest path', author: 'Casey Horner', span: 2 },
  { id: 'p2', url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=60', alt: 'Mountain ridge', author: 'Sam Tesla' },
  { id: 'p3', url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=600&q=60', alt: 'Foggy hills', author: 'Andreas Gücklhorn', span: 2 },
  { id: 'p4', url: 'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=600&q=60', alt: 'Green meadow', author: 'Lukasz Szmigiel' },
  { id: 'p5', url: 'https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=600&q=60', alt: 'Park trail', author: 'Jerome Printr' },
  { id: 'p6', url: 'https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=600&q=60', alt: 'Autumn bench', author: 'Josephine Baran' },
];

class StockPhotoPickerElement extends HTMLElement {
  static get observedAttributes() {
    return ['title', 'powered-by', 'placeholder', 'photos', 'open'];
  }

  constructor() {
    super();
    this._bound = false;
    this._query = '';
    this._onKey = (event) => {
      if (event.key === 'Escape') {
        this.dispatchEvent(new CustomEvent('close', { bubbles: true }));
      }
    };
  }

  connectedCallback() {
    if (this._bound === false && this.innerHTML === '') {
      this._bound = true;
    }
    this._render();
    this.addEventListener('click', this._onClick);
    this.addEventListener('input', this._onInput);
    window.addEventListener('keydown', this._onKey);
  }

  disconnectedCallback() {
    this.removeEventListener('click', this._onClick);
    this.removeEventListener('input', this._onInput);
    window.removeEventListener('keydown', this._onKey);
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;
    if (this._bound === false && this.innerHTML === '') return;
    if (name === 'open') {
      this._query = '';
    }
    this._render();
  }

  _onClick(event) {
    if (event.target.closest('[data-stkpic-close]')) {
      this.dispatchEvent(new CustomEvent('close', { bubbles: true }));
      return;
    }
    if (event.target.closest('[data-stkpic-clear]')) {
      this._query = '';
      this.dispatchEvent(new CustomEvent('search', { detail: { query: '' }, bubbles: true }));
      this._render();
      return;
    }
    const addBtn = event.target.closest('[data-stkpic-add]');
    if (addBtn) {
      const photos = parseJsonAttr(this.getAttribute('photos'), DEFAULT_PHOTOS());
      const found = photos.find((p) => p.id === addBtn.getAttribute('data-stkpic-add'));
      if (found) this.dispatchEvent(new CustomEvent('add', { detail: { photo: found }, bubbles: true }));
    }
  }

  _onInput(event) {
    const input = event.target.closest('[data-stkpic-input]');
    if (!input) return;
    this._query = input.value;
    this.dispatchEvent(new CustomEvent('search', { detail: { query: this._query }, bubbles: true }));
    this._render();
    const fresh = this.querySelector('[data-stkpic-input]');
    if (fresh) fresh.focus();
  }

  _filtered(photos) {
    const q = this._query.trim().toLowerCase();
    if (q === '') return photos;
    return photos.filter((p) => String(p.alt ?? '').toLowerCase().includes(q));
  }

  _renderGrid() {
    const grid = this.querySelector('[data-stkpic-gridinner]');
    if (!grid) return;
    const photos = this._filtered(parseJsonAttr(this.getAttribute('photos'), DEFAULT_PHOTOS()));
    grid.innerHTML = this._gridHtml(photos);
  }

  _gridHtml(photos) {
    const cards = photos
      .map((p) => {
        const h = p.span === 2 ? 'h-44' : 'h-28';
        return `<figure data-stkpic-item="${escapeAttribute(p.id)}" class="group relative overflow-hidden rounded-lg border border-zinc-200 bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800">
            <img src="${escapeAttribute(p.url)}" alt="${escapeAttribute(p.alt ?? '')}" class="w-full object-cover ${h}" />
            <figcaption data-stkpic-meta="${escapeAttribute(p.id)}" class="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 bg-gradient-to-t from-black/70 to-transparent px-2 py-1.5 opacity-0 transition-opacity group-hover:opacity-100">
              <span class="truncate text-[11px] text-white">${escapeAttribute(p.author ?? '')}</span>
              <button data-stkpic-add="${escapeAttribute(p.id)}" type="button" class="rounded bg-emerald-600 px-2 py-0.5 text-[11px] font-semibold text-white transition-colors hover:bg-emerald-700">Add</button>
            </figcaption>
          </figure>`;
      })
      .join('');
    const empty =
      photos.length === 0
        ? '<p data-stkpic-empty class="col-span-full py-8 text-center text-sm text-zinc-400 dark:text-zinc-500">No photos match your search.</p>'
        : '';
    return cards + empty;
  }

  _render() {
    const title = this.getAttribute('title') || 'Stock photos';
    const poweredBy = this.getAttribute('powered-by') || 'Powered by Unsplash';
    const placeholder = this.getAttribute('placeholder') || 'Search photos…';
    const open = this.getAttribute('open') !== 'false';
    const photos = this._filtered(parseJsonAttr(this.getAttribute('photos'), DEFAULT_PHOTOS()));

    if (!open) {
      this.innerHTML = '';
      return;
    }

    this.innerHTML = `
      <div data-stkpic class="relative w-full overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xl dark:border-zinc-700 dark:bg-zinc-900">
        <div data-stkpic-header class="flex items-center justify-between gap-4 border-b border-zinc-200 px-5 py-3 dark:border-zinc-800">
          <h2 data-stkpic-title class="text-base font-bold text-zinc-900 dark:text-zinc-50">${escapeAttribute(title)}</h2>
          <button data-stkpic-close type="button" aria-label="Close" class="rounded-lg p-1.5 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-800 dark:hover:bg-zinc-800 dark:hover:text-zinc-100">✕</button>
        </div>
        <div data-stkpic-searchrow class="px-5 pt-4">
          <div class="flex items-center gap-2 rounded-xl border border-zinc-300 px-3 py-2 focus-within:ring-2 focus-within:ring-orange-500/40 dark:border-zinc-600">
            <span aria-hidden="true" class="text-zinc-400">⌕</span>
            <input data-stkpic-input type="text" value="${escapeAttribute(this._query)}" placeholder="${escapeAttribute(placeholder)}"
              class="w-full bg-transparent text-sm text-zinc-800 outline-none placeholder:text-zinc-400 dark:text-zinc-100" />
            ${this._query !== '' ? '<button data-stkpic-clear type="button" aria-label="Clear search" class="text-zinc-400 transition-colors hover:text-zinc-700 dark:hover:text-zinc-200">✕</button>' : ''}
          </div>
          <p data-stkpic-powered class="mt-2 text-xs text-zinc-400 dark:text-zinc-500">⭳ ${escapeAttribute(poweredBy)}</p>
        </div>
        <div data-stkpic-grid class="mt-3 max-h-96 overflow-y-auto px-5 pb-5">
          <div data-stkpic-gridinner class="grid grid-cols-2 gap-3 sm:grid-cols-3">${this._gridHtml(photos)}</div>
        </div>
      </div>`;
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('stock-photo-picker')) {
  customElements.define('stock-photo-picker', StockPhotoPickerElement);
}

export default StockPhotoPickerElement;
