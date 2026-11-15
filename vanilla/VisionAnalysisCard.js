/**
 * VisionAnalysisCard - AI image-analysis structured reply block: key/value
 * attribute table rows and section headings like "Design Strengths" (Claude).
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

const DEFAULT_SECTIONS = () => [
  {
    heading: 'Image Details',
    rows: [
      { key: 'Lighting', value: 'Strong overhead sunlight creating sharp shadows on sand; excellent clarity suggests midday conditions' },
      { key: 'Beach Activity', value: 'Scattered groups of swimmers and sunbathers distributed across the sand and shallow water' },
      { key: 'Wave Patterns', value: 'Multiple rolling waves with consistent whitecaps indicate moderate, consistent swell' },
    ],
  },
];

class VisionAnalysisCardElement extends HTMLElement {
  static get observedAttributes() {
    return ['sections'];
  }

  constructor() {
    super();
    this._bound = false;
    this._sections = [];
  }

  connectedCallback() {
    if (!this._sections.length) {
      this._sections = parseJsonAttr(this.getAttribute('sections'), DEFAULT_SECTIONS());
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
    if (name === 'sections' && !this._sections.length) {
      this._sections = parseJsonAttr(this.getAttribute('sections'), []);
    }
    if (this._bound === false && this.innerHTML === '') return;
    this._render();
  }

  get sections() {
    return this._sections;
  }
  set sections(value) {
    this._sections = Array.isArray(value) ? value : [];
    this._render();
  }

  _onClick(event) {
    const headingEl = event.target.closest('[data-vision-section-heading]');
    if (headingEl) {
      const section = this._sections.find((s) => s.heading === headingEl.getAttribute('data-vision-section-heading'));
      if (section) {
        this.dispatchEvent(new CustomEvent('section-click', { detail: { section }, bubbles: true }));
      }
    }
  }

  _render() {
    const sectionsHtml = this._sections
      .map(
        (section) => `
        <div data-vision-section class="mb-4 last:mb-0">
          <button type="button" data-vision-section-heading="${escapeAttribute(section.heading)}" class="mb-2 text-left text-sm font-semibold text-zinc-900 transition-colors hover:text-indigo-600 dark:text-zinc-50 dark:hover:text-indigo-400">${escapeAttribute(section.heading)}</button>
          <dl data-vision-rows class="overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800">
            ${section.rows
              .map(
                (row) => `
              <div data-vision-row="${escapeAttribute(row.key)}" class="grid grid-cols-[minmax(0,9rem)_1fr] gap-3 border-b border-zinc-100 px-3 py-2 last:border-b-0 dark:border-zinc-800/60">
                <dt data-vision-row-key class="text-xs font-semibold text-zinc-700 dark:text-zinc-200">${escapeAttribute(row.key)}</dt>
                <dd data-vision-row-value class="text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">${escapeAttribute(row.value)}</dd>
              </div>`
              )
              .join('')}
          </dl>
        </div>`
      )
      .join('');

    this.innerHTML = `
      <div data-vision-analysis-card class="w-full rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">${sectionsHtml}</div>`;
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('vision-analysis-card')) {
  customElements.define('vision-analysis-card', VisionAnalysisCardElement);
}

export default VisionAnalysisCardElement;
