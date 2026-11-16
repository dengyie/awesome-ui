/**
 * MasonryDensityControls - Immersive masonry gallery with a floating
 * Size / Padding dual-slider control bar that live-adjusts column count and
 * gutter (Savee discovery wall pattern).
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

const DEFAULT_ITEMS = () => [
  { id: 'm1', url: 'https://images.unsplash.com/photo-1493397212122-2b1dda949c8a?w=400&q=60', alt: 'Architecture facade', span: 3 },
  { id: 'm2', url: 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=400&q=60', alt: 'Surf wave', span: 2 },
  { id: 'm3', url: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=400&q=60', alt: 'Flowers', span: 2 },
  { id: 'm4', url: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=400&q=60', alt: 'Microphone', span: 3 },
  { id: 'm5', url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400&q=60', alt: 'Mountains at night', span: 2 },
  { id: 'm6', url: 'https://images.unsplash.com/photo-1449034446853-66c86144b0ad?w=400&q=60', alt: 'City dusk', span: 3 },
  { id: 'm7', url: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&q=60', alt: 'Desk with notes', span: 1 },
  { id: 'm8', url: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&q=60', alt: 'Writing', span: 2 },
];

const ratioFor = (span) => (span === 3 ? '3 / 4' : span === 2 ? '4 / 5' : '1 / 1');

class MasonryDensityControlsElement extends HTMLElement {
  static get observedAttributes() {
    return ['title', 'items', 'columns', 'padding'];
  }

  constructor() {
    super();
    this._bound = false;
    this._size = 4;
    this._gap = 12;
    this._closed = false;
  }

  connectedCallback() {
    if (this._bound === false && this.innerHTML === '') {
      this._bound = true;
    }
    this._size = Number(this.getAttribute('columns')) || 4;
    this._gap = Number(this.getAttribute('padding')) || 12;
    this._closed = false;
    this._render();
    this.addEventListener('input', this._onInput);
    this.addEventListener('click', this._onClick);
  }

  disconnectedCallback() {
    this.removeEventListener('input', this._onInput);
    this.removeEventListener('click', this._onClick);
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;
    if (this._bound === false && this.innerHTML === '') return;
    if (name === 'columns') this._size = Number(newValue) || 4;
    if (name === 'padding') this._gap = Number(newValue) || 12;
    this._render();
  }

  _onInput(event) {
    const target = event.target;
    if (!target || typeof target.hasAttribute !== 'function') return;
    if (target.hasAttribute('data-masn-size')) {
      this._size = Number(target.value) || 2;
      this._syncGrid();
    } else if (target.hasAttribute('data-masn-padding')) {
      this._gap = Number(target.value) || 4;
      this._syncGrid();
    }
  }

  _syncGrid() {
    const grid = this.querySelector('[data-masn-grid]');
    if (grid) {
      grid.style.columnCount = String(this._size);
      grid.style.columnGap = this._gap + 'px';
    }
    // update per-item margin + meta line without re-render (keeps slider focus)
    this.querySelectorAll('[data-masn-item]').forEach((el) => {
      el.style.marginBottom = this._gap + 'px';
    });
    const meta = this.querySelector('[data-masn-meta]');
    if (meta) meta.textContent = `${this._size} cols · ${this._gap}px`;
    this.dispatchEvent(new CustomEvent('density-change', { detail: { columns: this._size, padding: this._gap }, bubbles: true }));
  }

  _onClick(event) {
    if (event.target.closest('[data-masn-close]')) {
      this._closed = true;
      this.dispatchEvent(new CustomEvent('close', { bubbles: true }));
      this._render();
      return;
    }
    const itemBtn = event.target.closest('[data-masn-item]');
    if (itemBtn) {
      const items = parseJsonAttr(this.getAttribute('items'), DEFAULT_ITEMS());
      const id = itemBtn.getAttribute('data-masn-item');
      const item = items.find((it) => it.id === id);
      if (item) {
        this.dispatchEvent(new CustomEvent('item-click', { detail: item, bubbles: true }));
      }
    }
  }

  _render() {
    if (this._closed) {
      this.innerHTML = '';
      return;
    }
    const title = this.getAttribute('title') || 'Discovery wall';
    const items = parseJsonAttr(this.getAttribute('items'), DEFAULT_ITEMS());

    const cards = items
      .map(
        (it) => `<button type="button" data-masn-item="${escapeAttribute(it.id)}" class="block w-full break-inside-avoid overflow-hidden rounded-sm bg-zinc-900" style="margin-bottom:${this._gap}px">
            <img src="${escapeAttribute(it.url)}" alt="${escapeAttribute(it.alt)}" loading="lazy" style="aspect-ratio:${ratioFor(it.span)}" class="w-full object-cover transition-transform duration-300 hover:scale-105" />
          </button>`
      )
      .join('');

    this.innerHTML = `
      <div data-masn class="relative w-full overflow-hidden rounded-2xl bg-zinc-950 dark:bg-black">
        <div data-masn-controls class="absolute inset-x-0 top-0 z-10 flex items-center justify-around gap-6 bg-black/80 px-6 py-4 backdrop-blur-sm">
          <label data-masn-size-group class="flex flex-1 items-center gap-3 text-sm text-zinc-200">
            <span>Size</span>
            <input type="range" data-masn-size min="2" max="6" step="1" value="${this._size}" class="h-1 flex-1 cursor-pointer appearance-none rounded bg-zinc-600 accent-white" />
          </label>
          <label data-masn-padding-group class="flex flex-1 items-center gap-3 text-sm text-zinc-200">
            <span>Padding</span>
            <input type="range" data-masn-padding min="4" max="32" step="2" value="${this._gap}" class="h-1 flex-1 cursor-pointer appearance-none rounded bg-zinc-600 accent-white" />
          </label>
          <button type="button" data-masn-close aria-label="Close gallery" class="text-lg text-zinc-300 transition-colors hover:text-white">✕</button>
        </div>
        <p data-masn-title class="absolute left-5 top-16 z-10 text-xs font-medium uppercase tracking-wider text-zinc-500">${escapeAttribute(title)}</p>
        <p data-masn-meta class="absolute right-5 top-16 z-10 text-xs font-medium text-zinc-500">${this._size} cols · ${this._gap}px</p>
        <div data-masn-grid class="pt-28" style="column-count:${this._size};column-gap:${this._gap}px">${cards}</div>
      </div>`;
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('masonry-density-controls')) {
  customElements.define('masonry-density-controls', MasonryDensityControlsElement);
}

export default MasonryDensityControlsElement;
