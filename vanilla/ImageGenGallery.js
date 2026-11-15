/**
 * ImageGenGallery - Vanilla Web Component
 * Usage: <image-gen-gallery title="Image studio" placeholder="Describe an image…"></image-gen-gallery>
 * Attributes: title, placeholder, generate-text, prompt (initial input value)
 * Property: images ([{id, alt, url?, aspect?, status?, model?}])
 * Events: generate (detail {prompt}), tile-action (detail {id, action})
 */
const escapeAttribute = (value) =>
  String(value).replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  }[char]));

export class ImageGenGalleryElement extends HTMLElement {
  static get observedAttributes() {
    return ['title', 'placeholder', 'generate-text', 'prompt'];
  }

  constructor() {
    super();
    this._images = [];
    this._prompt = '';
    this._bound = false;
    this._gradients = [
      'from-indigo-400 via-purple-400 to-pink-300',
      'from-sky-400 via-cyan-300 to-emerald-300',
      'from-amber-300 via-orange-400 to-rose-400',
      'from-violet-400 via-fuchsia-400 to-indigo-300',
    ];
    this._aspect = { square: 'aspect-square', portrait: 'aspect-[3/4]', landscape: 'aspect-[4/3]' };
  }

  connectedCallback() {
    this.render();
    if (!this._bound) {
      this._bound = true;
      this.addEventListener('click', (event) => {
        if (event.target.closest('[data-gen-generate]')) {
          const input = this.querySelector('[data-gen-input]');
          const prompt = (input ? input.value : '').trim();
          if (prompt) this.dispatchEvent(new CustomEvent('generate', { detail: { prompt } }));
          return;
        }
        const actionBtn = event.target.closest('[data-gen-action]');
        if (actionBtn) {
          const tile = actionBtn.closest('[data-gen-tile]');
          if (tile) {
            this.dispatchEvent(new CustomEvent('tile-action', { detail: { id: tile.getAttribute('data-gen-tile'), action: actionBtn.getAttribute('data-gen-action') } }));
          }
        }
      });
      this.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' && event.target.matches('[data-gen-input]')) {
          const prompt = event.target.value.trim();
          if (prompt) this.dispatchEvent(new CustomEvent('generate', { detail: { prompt } }));
        }
      });
    }
  }

  get images() { return this._images; }
  set images(v) {
    this._images = Array.isArray(v) ? v : [];
    this.render();
  }

  get prompt() { return this._prompt; }
  set prompt(v) {
    this._prompt = String(v || '');
    this.render();
  }

  attributeChangedCallback(name) {
    // Fires before connectedCallback when an already-connected element upgrades;
    // rendering then would wipe light-DOM children (e.g. the prompt input).
    if (this._bound === false && this._images.length === 0 && this.innerHTML === '') return;
    if (name === 'prompt') this._prompt = this.getAttribute(name) || '';
    this.render();
  }

  render() {
    const title = escapeAttribute(this.getAttribute('title') || 'Image studio');
    const placeholder = escapeAttribute(this.getAttribute('placeholder') || 'Describe an image…');
    const generateText = escapeAttribute(this.getAttribute('generate-text') || 'Generate');

    const tiles = this._images.map((img, i) => {
      const generating = img.status === 'generating';
      const gradient = this._gradients[i % this._gradients.length];
      const aspect = this._aspect[img.aspect] || this._aspect.square;
      const inner = img.url
        ? `<img src="${escapeAttribute(img.url)}" alt="${escapeAttribute(img.alt)}" class="h-full w-full object-cover" />`
        : generating
          ? `<span class="rounded-full bg-white/70 px-2 py-1 text-[10px] font-semibold text-zinc-700">Generating…</span>`
          : `<span class="max-w-full truncate px-2 text-[10px] font-semibold text-white/90">${escapeAttribute(img.alt)}</span>`;
      const actions = generating ? '' : `
        <div class="absolute inset-x-1.5 bottom-1.5 flex items-center justify-center gap-1 rounded-md bg-black/55 px-1.5 py-1 opacity-0 backdrop-blur transition-opacity group-hover:opacity-100">
          <button type="button" data-gen-action="download" aria-label="Download" class="rounded p-1 text-white/90 hover:bg-white/20"><svg viewBox="0 0 20 20" fill="currentColor" class="h-3.5 w-3.5" aria-hidden="true"><path d="M10 3.5a.75.75 0 0 1 .75.75v6.19l2.22-2.22a.75.75 0 1 1 1.06 1.06l-3.5 3.5a.75.75 0 0 1-1.06 0l-3.5-3.5a.75.75 0 1 1 1.06-1.06l2.22 2.22V4.25A.75.75 0 0 1 10 3.5Zm-5.5 9.25a.75.75 0 0 1 .75.75v1c0 .14.11.25.25.25h9a.25.25 0 0 0 .25-.25v-1a.75.75 0 0 1 1.5 0v1A1.75 1.75 0 0 1 14.5 16h-9A1.75 1.75 0 0 1 3.75 14.25v-1a.75.75 0 0 1 .75-.75Z"/></svg></button>
          <button type="button" data-gen-action="variant" aria-label="Make variant" class="rounded p-1 text-white/90 hover:bg-white/20"><svg viewBox="0 0 20 20" fill="currentColor" class="h-3.5 w-3.5" aria-hidden="true"><path d="M10 3.75a.75.75 0 0 1 .53.22l2 2a.75.75 0 1 1-1.06 1.06l-.72-.72v4.94a.75.75 0 0 1-1.5 0V6.31l-.72.72a.75.75 0 0 1-1.06-1.06l2-2a.75.75 0 0 1 .53-.22ZM4.25 11.5a.75.75 0 0 1 .75.75v1.5c0 .14.11.25.25.25h9.5a.25.25 0 0 0 .25-.25v-1.5a.75.75 0 0 1 1.5 0v1.5A1.75 1.75 0 0 1 14.75 15h-9.5A1.75 1.75 0 0 1 3.5 13.25v-1.5a.75.75 0 0 1 .75-.75Z"/></svg></button>
          <button type="button" data-gen-action="delete" aria-label="Delete" class="rounded p-1 text-white/90 hover:bg-white/20"><svg viewBox="0 0 20 20" fill="currentColor" class="h-3.5 w-3.5" aria-hidden="true"><path d="M8 3.25h4a.75.75 0 0 1 0 1.5h1.75a.75.75 0 0 1 0 1.5H6.25a.75.75 0 0 1 0-1.5H8Zm-2.75 4.5h9.5a.75.75 0 0 1 0 1.5h-.5l-.4 5.6A1.75 1.75 0 0 1 12.1 16.3H7.9a1.75 1.75 0 0 1-1.75-1.62l-.4-5.68h-.5a.75.75 0 0 1 0-1.5Z"/></svg></button>
        </div>`;
      const badge = img.model && !generating
        ? `<figcaption class="absolute left-1.5 top-1.5 rounded bg-black/55 px-1.5 py-0.5 text-[10px] font-medium text-white/90 backdrop-blur">${escapeAttribute(img.model)}</figcaption>`
        : '';
      return `
        <figure data-gen-tile="${escapeAttribute(img.id)}" class="group relative overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800">
          <div data-gen-status="${generating ? 'generating' : 'done'}" class="flex items-center justify-center bg-gradient-to-br ${gradient} ${aspect} ${generating ? 'animate-pulse' : ''}">${inner}</div>
          ${actions}${badge}
        </figure>`;
    }).join('');

    this.innerHTML = `<div data-image-gen class="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
  <p class="text-sm font-semibold text-zinc-900 dark:text-zinc-50">${title}</p>
  <div class="mt-3 flex items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 p-1.5 focus-within:border-indigo-400 dark:border-zinc-700 dark:bg-zinc-800">
    <input data-gen-input value="${escapeAttribute(this._prompt)}" placeholder="${placeholder}" class="min-w-0 flex-1 bg-transparent px-2 text-sm text-zinc-800 outline-none placeholder:text-zinc-400 dark:text-zinc-100" />
    <button type="button" data-gen-generate class="shrink-0 rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-indigo-500">${generateText}</button>
  </div>
  ${this._images.length === 0
    ? `<div data-gen-empty class="mt-3 flex aspect-[4/3] items-center justify-center rounded-lg border border-dashed border-zinc-300 text-sm text-zinc-400 dark:border-zinc-700">No images yet — describe one above</div>`
    : `<div class="mt-3 grid grid-cols-2 gap-3 md:grid-cols-3">${tiles}</div>`}
</div>`;
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('image-gen-gallery')) {
  customElements.define('image-gen-gallery', ImageGenGalleryElement);
}

export default ImageGenGalleryElement;
