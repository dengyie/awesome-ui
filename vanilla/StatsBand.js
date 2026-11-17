/**
 * StatsBand - Marketing metrics band: 3-4 column big-number stats with
 * labels and optional trend footnotes in a single band section
 * (landing page social proof numbers pattern).
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

const DEFAULT_STATS = () => [
  { value: '235+', label: 'Production components', note: 'React / Vue / Vanilla' },
  { value: '771', label: 'Regression tests', note: 'jsdom + SSR + compile' },
  { value: '706', label: 'Source files', note: 'Single-file, copy-paste' },
  { value: '3.5k', label: 'Reference screens', note: 'Mobbin-curated patterns' },
];

const columnsFor = (count) => {
  if (count >= 4) return 'sm:grid-cols-4';
  if (count === 3) return 'sm:grid-cols-3';
  if (count === 2) return 'sm:grid-cols-2';
  return '';
};

class StatsBandElement extends HTMLElement {
  static get observedAttributes() {
    return ['stats'];
  }

  constructor() {
    super();
    this._stats = DEFAULT_STATS();
  }

  connectedCallback() {
    this._stats = parseJsonAttr(this.getAttribute('stats'), DEFAULT_STATS());
    this._render();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;
    if (name === 'stats') this._stats = parseJsonAttr(newValue, DEFAULT_STATS());
    this._render();
  }

  get stats() { return this._stats; }
  set stats(value) { this._stats = Array.isArray(value) ? value : []; this._render(); }

  _render() {
    const stats = Array.isArray(this._stats) ? this._stats : [];
    const cellsHtml = stats
      .map((stat, index) => {
        const trend = stat.note
          ? `<p data-stats-note="${index}" class="mt-1 text-[11px] font-medium text-zinc-400 dark:text-zinc-500">${escapeAttribute(stat.note)}</p>`
          : '';
        return `<div data-stats-cell="${index}" class="flex flex-col items-center gap-1 px-4 py-3 text-center">
          <span data-stats-value="${escapeAttribute(stat.value)}" class="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">${escapeAttribute(stat.value)}</span>
          <span data-stats-label="${escapeAttribute(stat.label)}" class="text-sm font-medium text-zinc-600 dark:text-zinc-300">${escapeAttribute(stat.label)}</span>
          ${trend}
        </div>`;
      })
      .join('');

    this.innerHTML = `
      <div data-stats-band class="w-full rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div data-stats-grid class="grid grid-cols-1 divide-y divide-zinc-100 dark:divide-zinc-800 ${columnsFor(stats.length)} sm:divide-x sm:divide-y-0">${cellsHtml}</div>
      </div>`;
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('stats-band')) {
  customElements.define('stats-band', StatsBandElement);
}

export default StatsBandElement;
