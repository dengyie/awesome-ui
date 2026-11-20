/**
 * SpendTrendChart - Vanilla Web Component
 * Spend trend bar chart: headline + mono total, Daily/Weekly granularity
 * segmented switch, pure-SVG bars with dashed grid. Text labels are HTML
 * overlays so preserveAspectRatio never stretches them.
 *
 * Usage: <spend-trend-chart headline="Spend" unit="$"></spend-trend-chart>
 * Attributes: headline, unit, granularity (active), y-ticks
 * Property: points { Daily: [{label, value}], Weekly: [...] }
 * Events: granularity-change (detail {granularity})
 */
const escapeAttribute = (value) =>
  String(value).replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  }[char]));

const GRANULARITIES = ['Daily', 'Weekly'];
const HEIGHT = 180;
const PAD_LEFT = 34;
const PAD_BOTTOM = 26;
const PLOT_W = 100;
const VIEW_W = PAD_LEFT + PLOT_W;

export class SpendTrendChartElement extends HTMLElement {
  static get observedAttributes() {
    return ['headline', 'unit', 'granularity', 'y-ticks'];
  }

  constructor() {
    super();
    this._points = {};
    this._bound = false;
  }

  get points() {
    return this._points;
  }

  set points(value) {
    this._points = value && typeof value === 'object' ? value : {};
    this.render();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;
    this.render();
  }

  connectedCallback() {
    this.render();
    if (!this._bound) {
      this._bound = true;
      this.addEventListener('click', (event) => {
        const btn = event.target.closest('[data-spend-trend-granularity-option]');
        if (!btn) return;
        const next = btn.getAttribute('data-spend-trend-granularity-option');
        if (!GRANULARITIES.includes(next) || next === this.getAttribute('granularity')) return;
        this.setAttribute('granularity', next);
        this.dispatchEvent(new CustomEvent('granularity-change', { detail: { granularity: next } }));
      });
    }
  }

  render() {
    const headline = this.getAttribute('headline') || 'Spend';
    const unit = this.getAttribute('unit') || '$';
    const gran = this.getAttribute('granularity');
    const granularity = gran && GRANULARITIES.includes(gran) ? gran : GRANULARITIES[0];
    const yTicks = Math.max(Number.parseInt(this.getAttribute('y-ticks') || '4', 10) || 4, 1);

    const data = Array.isArray(this._points[granularity]) ? this._points[granularity] : [];
    const total = data.reduce((acc, p) => acc + (Number(p.value) || 0), 0);
    const max = Math.max(...data.map((p) => Number(p.value) || 0), 1);

    const pctY = (y) => `${(y / HEIGHT) * 100}%`;
    const pctX = (x) => `${(x / VIEW_W) * 100}%`;

    const gridLines = Array.from({ length: yTicks + 1 }, (_, i) => {
      const y = 8 + ((HEIGHT - PAD_BOTTOM - 16) * i) / yTicks;
      return `<line x1="${PAD_LEFT}" x2="${VIEW_W}" y1="${y}" y2="${y}" stroke="#3f3f46" stroke-opacity="0.35" stroke-dasharray="3 4" vector-effect="non-scaling-stroke"></line>`;
    }).join('');

    const n = data.length;
    const slot = n > 0 ? PLOT_W / n : 0;
    const every = Math.ceil(n / 8);
    const bars = data
      .map((p, i) => {
        const value = Number(p.value) || 0;
        const bw = Math.min(slot * 0.45, 8);
        const x = PAD_LEFT + slot * i + (slot - bw) / 2;
        const h = Math.max((value / max) * (HEIGHT - PAD_BOTTOM - 16), value > 0 ? 3 : 0);
        const y = HEIGHT - PAD_BOTTOM - h;
        return `<rect data-spend-trend-bar="${escapeAttribute(p.label)}" x="${x}" y="${y}" width="${bw}" height="${h}" rx="2" fill="#14b8a6" opacity="${value > 0 ? 0.9 : 0.25}"></rect>`;
      })
      .join('');

    const yLabels = Array.from({ length: yTicks + 1 }, (_, i) => {
      const y = 8 + ((HEIGHT - PAD_BOTTOM - 16) * i) / yTicks;
      const t = Math.round((max / yTicks) * (yTicks - i));
      return `<span class="absolute -translate-y-1/2 text-[9px] leading-none text-zinc-400 dark:text-zinc-500" style="top:${pctY(y)};right:${((PLOT_W + 6) / VIEW_W) * 100}%">${t}</span>`;
    }).join('');

    const xLabels = data
      .map((p, i) => {
        if (!(n <= 14 || i % every === 0)) return '';
        const bw = Math.min(slot * 0.45, 8);
        const midX = PAD_LEFT + slot * i + bw / 2;
        return `<span class="absolute -translate-x-1/2 text-[9px] leading-none text-zinc-400 dark:text-zinc-500" style="top:${((HEIGHT - PAD_BOTTOM + 10) / HEIGHT) * 100}%;left:${pctX(midX)}">${escapeAttribute(String(p.label || '').slice(5))}</span>`;
      })
      .join('');

    const empty = n === 0
      ? `<text x="${VIEW_W / 2}" y="${HEIGHT / 2}" text-anchor="middle" font-size="10" fill="#a1a1aa">No spend recorded</text>`
      : '';

    const segs = GRANULARITIES.map((g) => {
      const active = g === granularity;
      const cls = active
        ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-900 dark:text-zinc-50'
        : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200';
      return `<button type="button" role="tab" aria-selected="${active}" data-spend-trend-granularity-option="${g}" class="rounded px-2.5 py-1 text-[11px] font-medium transition-colors ${cls}">${g}</button>`;
    }).join('');

    this.innerHTML = `
      <div data-spend-trend-chart class="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <p data-spend-trend-title class="text-sm font-semibold text-zinc-900 dark:text-zinc-50">${escapeAttribute(headline)}</p>
          <div data-spend-trend-granularity role="tablist" aria-label="Granularity" class="flex items-center rounded-md border border-zinc-200 bg-zinc-50 p-0.5 dark:border-zinc-700 dark:bg-zinc-800">${segs}</div>
        </div>

        <p data-spend-trend-total class="mt-1 font-mono text-2xl font-semibold text-zinc-900 dark:text-zinc-50">${escapeAttribute(unit)}${total.toFixed(2)}<span class="ml-1.5 font-sans text-xs font-normal text-zinc-400 dark:text-zinc-500">${granularity}</span></p>

        <div class="relative mt-3" style="height:${HEIGHT}px">
          <svg data-spend-trend-svg width="100%" height="${HEIGHT}" viewBox="0 0 ${VIEW_W} ${HEIGHT}" preserveAspectRatio="none" role="img" aria-label="${escapeAttribute(headline)} ${granularity} bar chart">
            ${gridLines}
            ${bars}
            ${empty}
          </svg>
          <div class="pointer-events-none absolute inset-0">
            ${yLabels}
            ${xLabels}
          </div>
        </div>
      </div>`;
  }
}

export default SpendTrendChartElement;

if (!customElements.get('spend-trend-chart')) {
  customElements.define('spend-trend-chart', SpendTrendChartElement);
}
