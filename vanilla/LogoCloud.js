/**
 * LogoCloud - "Trusted by" customer logo wall: optional kicker line, a
 * responsive grid of grayscale logo tiles (name or image), hover restores
 * color emphasis (logo cloud social proof pattern).
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

const DEFAULT_LOGOS = () => [
  { name: 'Acme Corp' },
  { name: 'Globex' },
  { name: 'Initech' },
  { name: 'Umbrella' },
  { name: 'Stark Industries' },
  { name: 'Wayne Enterprises' },
];

class LogoCloudElement extends HTMLElement {
  static get observedAttributes() {
    return ['kicker', 'logos'];
  }

  constructor() {
    super();
    this._kicker = 'Trusted by teams at';
    this._logos = DEFAULT_LOGOS();
  }

  connectedCallback() {
    const k = this.getAttribute('kicker');
    if (k !== null) this._kicker = k;
    this._logos = parseJsonAttr(this.getAttribute('logos'), DEFAULT_LOGOS());
    this._render();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;
    if (name === 'kicker') this._kicker = newValue ?? '';
    if (name === 'logos') this._logos = parseJsonAttr(newValue, DEFAULT_LOGOS());
    this._render();
  }

  get logos() { return this._logos; }
  set logos(value) { this._logos = Array.isArray(value) ? value : []; this._render(); }

  _render() {
    const logos = Array.isArray(this._logos) ? this._logos : [];
    const tilesHtml = logos
      .map((logo) => {
        const inner = logo.src
          ? `<img src="${escapeAttribute(logo.src)}" alt="${escapeAttribute(logo.name || 'logo')}" loading="lazy" class="max-h-7 w-auto object-contain" />`
          : `<span data-logocloud-name="${escapeAttribute(logo.name)}" class="text-sm font-semibold tracking-tight text-zinc-400 transition-colors group-hover:text-zinc-600 dark:text-zinc-600 dark:group-hover:text-zinc-300">${escapeAttribute(logo.name)}</span>`;
        return `<div data-logocloud-item="${escapeAttribute(logo.name)}" class="group flex h-14 items-center justify-center rounded-lg border border-zinc-100 bg-white px-4 transition-colors dark:border-zinc-800 dark:bg-zinc-900">${inner}</div>`;
      })
      .join('');

    const kickerHtml = this._kicker
      ? `<p data-logocloud-kicker class="mb-4 text-center text-xs font-medium uppercase tracking-widest text-zinc-400 dark:text-zinc-500">${escapeAttribute(this._kicker)}</p>`
      : '';

    this.innerHTML = `
      <div data-logocloud class="w-full rounded-xl border border-zinc-200 bg-zinc-50/60 p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/60">
        ${kickerHtml}
        <div data-logocloud-grid class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">${tilesHtml}</div>
      </div>`;
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('logo-cloud')) {
  customElements.define('logo-cloud', LogoCloudElement);
}

export default LogoCloudElement;
