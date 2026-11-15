/**
 * GammaImageDetail - Gamma AI-images detail pane: large preview with a
 * download / zoom / delete icon row and like / dislike pair, plus the full
 * generation prompt in a bordered reading block.
 */
const escapeAttribute = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

class GammaImageDetailElement extends HTMLElement {
  static get observedAttributes() {
    return ['title', 'preview', 'prompt', 'liked'];
  }

  constructor() {
    super();
    this._bound = false;
    this._liked = false;
  }

  connectedCallback() {
    if (this.getAttribute('liked') === 'true') {
      this._liked = true;
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
    if (name === 'liked') {
      this._liked = newValue === 'true';
    }
    if (this._bound === false && this.innerHTML === '') return;
    this._render();
  }

  get title() {
    return this.getAttribute('title') ?? 'AI images';
  }
  set title(value) {
    this.setAttribute('title', value);
  }

  get preview() {
    return this.getAttribute('preview') ?? '';
  }
  set preview(value) {
    this.setAttribute('preview', value);
  }

  get prompt() {
    return this.getAttribute('prompt') ?? 'Generate the following image: Mobile-first social media carousel content slide with professional creative aesthetic.';
  }
  set prompt(value) {
    this.setAttribute('prompt', value);
  }

  get liked() {
    return this._liked;
  }
  set liked(value) {
    this._liked = Boolean(value);
    this._render();
  }

  _onClick(event) {
    const map = [
      ['[data-gamma-detail-download]', 'download'],
      ['[data-gamma-detail-zoom]', 'zoom'],
      ['[data-gamma-detail-delete]', 'delete'],
      ['[data-gamma-detail-dislike]', 'dislike'],
      ['[data-gamma-detail-like]', 'like'],
      ['[data-gamma-detail-close]', 'close'],
    ];
    for (const [selector, name] of map) {
      if (event.target.closest(selector)) {
        this.dispatchEvent(new CustomEvent(name, { bubbles: true }));
        return;
      }
    }
  }

  _render() {
    const preview = this.preview
      ? `<img src="${escapeAttribute(this.preview)}" alt="${escapeAttribute(this.title)}" class="max-h-64 w-auto object-cover" />`
      : '<span aria-hidden="true" class="text-3xl text-zinc-300 dark:text-zinc-600">🖼</span>';
    this.innerHTML = `
      <div data-gamma-image-detail class="w-full rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div class="flex items-center justify-between">
          <h3 data-gamma-detail-title class="text-base font-semibold text-zinc-900 dark:text-zinc-50">${escapeAttribute(this.title)}</h3>
          <button type="button" data-gamma-detail-close aria-label="Close detail" class="text-zinc-400 transition-colors hover:text-zinc-600 dark:hover:text-zinc-200">✕</button>
        </div>
        <div data-gamma-detail-preview class="mt-3 flex items-center justify-center overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-800" style="min-height:160px">${preview}</div>
        <div data-gamma-detail-toolbar class="mt-3 flex items-center justify-between">
          <div class="flex items-center gap-1">
            <button type="button" data-gamma-detail-download aria-label="Download image" class="flex h-8 w-8 items-center justify-center rounded-md text-sm text-zinc-500 transition-colors hover:bg-zinc-50 hover:text-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200">↓</button>
            <button type="button" data-gamma-detail-zoom aria-label="Zoom image" class="flex h-8 w-8 items-center justify-center rounded-md text-sm text-zinc-500 transition-colors hover:bg-zinc-50 hover:text-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200">🔍</button>
            <button type="button" data-gamma-detail-delete aria-label="Delete image" class="flex h-8 w-8 items-center justify-center rounded-md text-sm text-zinc-500 transition-colors hover:bg-red-50 hover:text-red-500 dark:text-zinc-400 dark:hover:bg-red-950/40">🗑</button>
          </div>
          <div class="flex items-center gap-1">
            <button type="button" data-gamma-detail-dislike aria-label="Dislike image" class="flex h-8 w-8 items-center justify-center rounded-md text-sm text-zinc-500 transition-colors hover:bg-zinc-50 hover:text-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200">👎</button>
            <button type="button" data-gamma-detail-like aria-pressed="${this._liked}" aria-label="Like image" class="flex h-8 w-8 items-center justify-center rounded-md text-sm transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800 ${this._liked ? 'text-rose-500' : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200'}">👍</button>
          </div>
        </div>
        <div class="mt-3">
          <p class="text-[11px] font-medium text-zinc-400 dark:text-zinc-500">Prompt</p>
          <p data-gamma-detail-prompt class="mt-1.5 rounded-lg border border-zinc-200 p-3 text-xs leading-relaxed text-zinc-700 dark:border-zinc-700 dark:text-zinc-300">${escapeAttribute(this.prompt)}</p>
        </div>
      </div>`;
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('gamma-image-detail')) {
  customElements.define('gamma-image-detail', GammaImageDetailElement);
}

export default GammaImageDetailElement;
