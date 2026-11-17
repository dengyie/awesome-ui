/**
 * BentoFeatureGrid - Marketing bento grid: mixed-span feature tiles with
 * icon / title / description and optional embedded media slot, laid out
 * with CSS grid (Krea AI / Magnific bento pattern).
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

const DEFAULT_TILES = () => [
  { id: 't1', title: 'Ship faster', description: 'Generate production-ready components in one prompt.', icon: '⚡', span: 2 },
  { id: 't2', title: 'Zero blackbox', description: 'Every component is a single readable file.', icon: '📄', span: 1 },
  { id: 't3', title: 'Three stacks', description: 'React, Vue 3 and Vanilla with aligned APIs.', icon: '🧩', span: 1 },
  { id: 't4', title: 'Mobbin-grade patterns', description: 'Visual language borrowed from the best products.', icon: '🎯', span: 2 },
];

const SPAN_CLASS = { 1: '', 2: 'sm:col-span-2', 3: 'sm:col-span-3' };

class BentoFeatureGridElement extends HTMLElement {
  static get observedAttributes() {
    return ['title', 'description', 'tiles'];
  }

  constructor() {
    super();
    this._title = 'Built for the AI era';
    this._description = 'A curated atomic library assembled from real product patterns.';
    this._tiles = DEFAULT_TILES();
    this._onClick = this._onClick.bind(this);
  }

  connectedCallback() {
    const t = this.getAttribute('title');
    if (t) this._title = t;
    const d = this.getAttribute('description');
    if (d) this._description = d;
    this._tiles = parseJsonAttr(this.getAttribute('tiles'), DEFAULT_TILES());
    this._render();
    this.addEventListener('click', this._onClick);
  }

  disconnectedCallback() {
    this.removeEventListener('click', this._onClick);
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;
    if (name === 'title') this._title = newValue || 'Built for the AI era';
    if (name === 'description') this._description = newValue || '';
    if (name === 'tiles') this._tiles = parseJsonAttr(newValue, DEFAULT_TILES());
    this._render();
  }

  get tiles() { return this._tiles; }
  set tiles(value) { this._tiles = Array.isArray(value) ? value : []; this._render(); }

  _onClick(event) {
    const tile = event.target.closest('[data-bento-tile]');
    if (tile) {
      const item = this._tiles.find((t) => t.id === tile.getAttribute('data-bento-tile'));
      if (item) this.dispatchEvent(new CustomEvent('tile-click', { detail: { tile: item }, bubbles: true }));
    }
  }

  _render() {
    const tiles = Array.isArray(this._tiles) ? this._tiles : [];
    const tilesHtml = tiles
      .map((tile) => {
        const spanCls = SPAN_CLASS[tile.span] ?? '';
        const media = tile.media
          ? `<div data-bento-media="${escapeAttribute(tile.id)}" class="mt-3 overflow-hidden rounded-lg border border-zinc-100 dark:border-zinc-800"><img src="${escapeAttribute(tile.media)}" alt="" class="h-28 w-full object-cover" loading="lazy" /></div>`
          : '';
        return `<div data-bento-tile="${escapeAttribute(tile.id)}" class="group cursor-pointer rounded-xl border border-zinc-200 bg-white p-5 transition-all hover:border-violet-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-violet-700 ${spanCls}">
          ${tile.icon ? `<div data-bento-icon="${escapeAttribute(tile.id)}" aria-hidden="true" class="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-violet-50 text-lg dark:bg-violet-950/50">${escapeAttribute(tile.icon)}</div>` : ''}
          <p data-bento-title="${escapeAttribute(tile.title)}" class="text-sm font-semibold text-zinc-900 dark:text-zinc-50">${escapeAttribute(tile.title)}</p>
          <p data-bento-description="${escapeAttribute(tile.id)}" class="mt-1 text-xs leading-5 text-zinc-500 dark:text-zinc-400">${escapeAttribute(tile.description || '')}</p>
          ${media}
        </div>`;
      })
      .join('');

    this.innerHTML = `
      <div data-bento-grid class="w-full rounded-xl border border-zinc-200 bg-zinc-50/60 p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/60">
        <div data-bento-header class="mb-5 text-center">
          <p data-bento-heading class="text-lg font-semibold text-zinc-900 dark:text-zinc-50">${escapeAttribute(this._title)}</p>
          <p data-bento-subtitle class="mt-1 text-sm text-zinc-500 dark:text-zinc-400">${escapeAttribute(this._description)}</p>
        </div>
        <div data-bento-tiles class="grid grid-cols-1 gap-3 sm:grid-cols-3">${tilesHtml}</div>
      </div>`;
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('bento-feature-grid')) {
  customElements.define('bento-feature-grid', BentoFeatureGridElement);
}

export default BentoFeatureGridElement;
