/**
 * CreationComposer - Vanilla Web Component
 * Usage: <creation-composer placeholder="..."></creation-composer>
 * Attributes: open, placeholder, image-assist, resolution, count,
 *             resolutions (JSON), counts (JSON)
 * Events: image-assist-change (detail {enabled}), resolution-change (detail {resolution}),
 *         count-change (detail {count}), submit (detail {prompt, imageAssist, resolution, count})
 */
const escapeAttribute = (value) =>
  String(value).replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  }[char]));

const parseJsonAttr = (raw, fallback) => {
  try {
    const parsed = raw ? JSON.parse(raw) : null;
    return parsed ?? fallback;
  } catch (e) {
    return fallback;
  }
};

export class CreationComposerElement extends HTMLElement {
  static get observedAttributes() {
    return ['open', 'placeholder', 'image-assist', 'resolution', 'count', 'resolutions', 'counts'];
  }

  constructor() {
    super();
    this._bound = false;
    this._resolutions = null;
    this._counts = null;
  }

  connectedCallback() {
    this.render();
    if (!this._bound) {
      this._bound = true;
      this.addEventListener('click', (event) => {
        if (event.target.closest('[data-creation-assist-toggle]')) {
          const enabled = this.getAttribute('image-assist') !== 'true';
          this.setAttribute('image-assist', String(enabled));
          this.dispatchEvent(new CustomEvent('image-assist-change', { detail: { enabled } }));
          return;
        }
        if (event.target.closest('[data-creation-submit]')) {
          const input = this.querySelector('[data-creation-input]');
          this.dispatchEvent(new CustomEvent('submit', {
            detail: {
              prompt: input?.value ?? '',
              imageAssist: this.getAttribute('image-assist') === 'true',
              resolution: this.getAttribute('resolution') || '2K',
              count: Number(this.getAttribute('count') || '1'),
            },
          }));
        }
      });
      this.addEventListener('change', (event) => {
        const resEl = event.target.closest('[data-creation-resolution]');
        if (resEl) {
          this.setAttribute('resolution', resEl.value);
          this.dispatchEvent(new CustomEvent('resolution-change', { detail: { resolution: resEl.value } }));
          return;
        }
        const countEl = event.target.closest('[data-creation-count]');
        if (countEl) {
          this.setAttribute('count', countEl.value);
          this.dispatchEvent(new CustomEvent('count-change', { detail: { count: Number(countEl.value) } }));
        }
      });
    }
  }

  attributeChangedCallback(name) {
    if (name === 'resolutions') this._resolutions = null;
    if (name === 'counts') this._counts = null;
    if (this._bound === false && this.innerHTML === '') return;
    this.render();
  }

  get resolutions() {
    if (!this._resolutions) this._resolutions = parseJsonAttr(this.getAttribute('resolutions'), ['1K', '2K', '4K']);
    return this._resolutions;
  }
  set resolutions(v) {
    this._resolutions = Array.isArray(v) ? v.map(String) : [];
    this.render();
  }

  get counts() {
    if (!this._counts) this._counts = parseJsonAttr(this.getAttribute('counts'), [1, 2, 4]);
    return this._counts;
  }
  set counts(v) {
    this._counts = Array.isArray(v) ? v.map(Number) : [];
    this.render();
  }

  render() {
    if ((this.getAttribute('open') || 'true') === 'false') {
      this.innerHTML = '';
      return;
    }
    const placeholder = escapeAttribute(this.getAttribute('placeholder') || 'Ad creative, product shot, social post…');
    const imageAssist = this.getAttribute('image-assist') === 'true';
    const resolution = this.getAttribute('resolution') || '2K';
    const count = this.getAttribute('count') || '1';

    const resOptions = this.resolutions.map((r) => `<option value="${escapeAttribute(r)}" ${r === resolution ? 'selected' : ''}>${escapeAttribute(r)}</option>`).join('');
    const countOptions = this.counts.map((c) => `<option value="${c}" ${String(c) === count ? 'selected' : ''}>${c}×</option>`).join('');

    this.innerHTML = `<div data-creation-composer class="w-full max-w-xl rounded-2xl border border-zinc-200 bg-white p-3 shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
  <div class="flex items-center justify-between">
    <div class="flex items-center gap-2">
      <button type="button" data-creation-image aria-label="Attach image" class="rounded-md border border-zinc-200 p-1.5 text-zinc-500 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800">🖼</button>
      <button type="button" data-creation-assist-toggle role="switch" aria-checked="${imageAssist}" class="flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${imageAssist ? 'bg-indigo-600 text-white' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'}">
        Image Assist
        <span aria-hidden="true" class="inline-block h-3.5 w-6 rounded-full transition-colors ${imageAssist ? 'bg-white/80' : 'bg-zinc-300 dark:bg-zinc-600'}">
          <span class="block h-3.5 w-3.5 rounded-full shadow transition-transform ${imageAssist ? 'translate-x-2.5 bg-indigo-600' : 'translate-x-0 bg-white dark:bg-zinc-200'}"></span>
        </span>
      </button>
    </div>
    <button type="button" data-creation-idea aria-label="Prompt ideas" class="rounded-md border border-zinc-200 p-1.5 text-zinc-500 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800">💡</button>
  </div>
  <textarea data-creation-input rows="3" placeholder="${placeholder}" aria-label="Creation prompt" class="mt-2 w-full resize-none rounded-lg border border-zinc-200 px-3 py-2 text-xs leading-relaxed text-zinc-700 outline-none transition-colors placeholder:text-zinc-400 focus:border-indigo-400 dark:border-zinc-700 dark:text-zinc-200 dark:placeholder:text-zinc-500 dark:focus:border-indigo-500"></textarea>
  <div class="mt-2 flex items-center justify-end gap-2">
    <select data-creation-resolution aria-label="Resolution" class="rounded-md border border-zinc-200 bg-white px-2 py-1.5 text-xs font-medium text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">${resOptions}</select>
    <select data-creation-count aria-label="Count" class="rounded-md border border-zinc-200 bg-white px-2 py-1.5 text-xs font-medium text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">${countOptions}</select>
    <button type="button" data-creation-submit class="rounded-md bg-violet-600 px-4 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-violet-500">Create</button>
  </div>
</div>`;
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('creation-composer')) {
  customElements.define('creation-composer', CreationComposerElement);
}

export default CreationComposerElement;
