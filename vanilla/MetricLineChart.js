/**
 * MetricLineChart - Vanilla Web Component
 * Metric headline card with multi-series smooth SVG line chart, time-range
 * pills and a hover tooltip. Text labels are HTML overlays so
 * preserveAspectRatio never stretches them.
 *
 * Usage: <metric-line-chart headline="Active users" value="48.2k" delta="+12.4%" delta-tone="up"></metric-line-chart>
 * Attributes: headline, value, delta, delta-tone (up/down/flat), ranges (comma
 * separated), range (active), unit
 * Properties: labels {string[]}, series {name,color,values[]}
 * Events: range-change (detail {range})
 */
const escapeAttribute = (value) =>
  String(value).replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  }[char]));

const HEIGHT = 160;
const PAD_LEFT = 30;
const PAD_BOTTOM = 22;
const PLOT_W = 100;
const VIEW_W = PAD_LEFT + PLOT_W;

function smoothPath(pts) {
  if (pts.length === 0) return '';
  if (pts.length === 1) return `M ${pts[0][0]} ${pts[0][1]}`;
  let d = `M ${pts[0][0]} ${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(i - 1, 0)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(i + 2, pts.length - 1)];
    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ` C ${c1x.toFixed(2)} ${c1y.toFixed(2)}, ${c2x.toFixed(2)} ${c2y.toFixed(2)}, ${p2[0].toFixed(2)} ${p2[1].toFixed(2)}`;
  }
  return d;
}

export class MetricLineChartElement extends HTMLElement {
  static get observedAttributes() {
    return ['headline', 'value', 'delta', 'delta-tone', 'ranges', 'range', 'unit'];
  }

  constructor() {
    super();
    this._labels = [];
    this._series = [];
    this._hover = null;
    this._bound = false;
  }

  get labels() {
    return this._labels;
  }

  set labels(value) {
    this._labels = Array.isArray(value) ? value : [];
    this.render();
  }

  get series() {
    return this._series;
  }

  set series(value) {
    this._series = Array.isArray(value) ? value : [];
    this.render();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;
    if (name === 'range') this._hover = null;
    this.render();
  }

  connectedCallback() {
    this.render();
    if (!this._bound) {
      this._bound = true;
      this.addEventListener('click', (event) => {
        const btn = event.target.closest('[data-metric-line-range-option]');
        if (!btn) return;
        const next = btn.getAttribute('data-metric-line-range-option');
        if (next === this.getAttribute('range')) return;
        this.setAttribute('range', next);
        this._hover = null;
        this.render();
        this.dispatchEvent(new CustomEvent('range-change', { detail: { range: next } }));
      });
      this.addEventListener('mouseover', (event) => {
        const col = event.target.closest('[data-metric-line-col]');
        if (!col) return;
        const idx = this._labels.indexOf(col.getAttribute('data-metric-line-col'));
        if (idx >= 0 && idx !== this._hover) {
          this._hover = idx;
          this.render();
        }
      });
      this.addEventListener('mouseleave', () => {
        if (this._hover !== null) {
          this._hover = null;
          this.render();
        }
      });
    }
  }

  render() {
    const headline = this.getAttribute('headline') || 'Active users';
    const value = this.getAttribute('value') || '0';
    const delta = this.getAttribute('delta');
    const deltaTone = this.getAttribute('delta-tone') || 'flat';
    const ranges = (this.getAttribute('ranges') || '24h,7d,30d,90d')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const allRanges = ranges.length ? ranges : ['30d'];
    const range = allRanges.includes(this.getAttribute('range'))
      ? this.getAttribute('range')
      : allRanges[0];
    const unit = this.getAttribute('unit') || '';

    const labels = this._labels;
    const series = this._series;
    const n = labels.length;
    const max = Math.max(...series.flatMap((s) => s.values.map(Number)), 1);
    const plotH = HEIGHT - PAD_BOTTOM - 8;

    const xAt = (i) => PAD_LEFT + (n > 1 ? (PLOT_W * i) / (n - 1) : PLOT_W / 2);
    const yAt = (v) => 8 + plotH - (v / max) * plotH;
    const pctY = (y) => `${(y / HEIGHT) * 100}%`;
    const pctX = (x) => `${(x / VIEW_W) * 100}%`;

    const grid = [0.25, 0.5, 0.75]
      .map((f) => {
        const y = 8 + plotH * f;
        return `<line x1="${PAD_LEFT}" x2="${VIEW_W}" y1="${y}" y2="${y}" stroke="#3f3f46" stroke-opacity="0.3" stroke-dasharray="3 4" vector-effect="non-scaling-stroke"></line>`;
      })
      .join('');

    const paths = series
      .map((s) => {
        const pts = s.values.map((v, i) => [xAt(i), yAt(Number(v) || 0)]);
        return `<path d="${smoothPath(pts)}" fill="none" stroke="${escapeAttribute(s.color)}" stroke-width="2" vector-effect="non-scaling-stroke" stroke-linecap="round"></path>`;
      })
      .join('');

    const hover = this._hover !== null && n > 0 ? this._hover : null;
    const hoverGroup = hover !== null
      ? `<g data-metric-line-hover-group>
          <line x1="${xAt(hover)}" x2="${xAt(hover)}" y1="8" y2="${8 + plotH}" stroke="#a1a1aa" stroke-opacity="0.6" stroke-dasharray="2 3" vector-effect="non-scaling-stroke"></line>
          ${series.map((s) => `<circle cx="${xAt(hover)}" cy="${yAt(Number(s.values[hover]) || 0)}" r="3" fill="${escapeAttribute(s.color)}" stroke="#fff" stroke-width="1.5" vector-effect="non-scaling-stroke"></circle>`).join('')}
        </g>`
      : '';

    const yLabels = [0, 0.5, 1]
      .map((f) => {
        const y = 8 + plotH * f;
        const t = Math.round(max * (1 - f));
        return `<span class="absolute -translate-y-1/2 text-[9px] leading-none text-zinc-400 dark:text-zinc-500" style="top:${pctY(y)};right:${((PLOT_W + 6) / VIEW_W) * 100}%">${t}</span>`;
      })
      .join('');

    const every = Math.ceil(n / 7);
    const xLabels = labels
      .map((label, i) => {
        if (!(n <= 7 || i % every === 0 || i === n - 1)) return '';
        return `<span class="absolute -translate-x-1/2 text-[9px] leading-none text-zinc-400 dark:text-zinc-500" style="top:${((HEIGHT - PAD_BOTTOM + 8) / HEIGHT) * 100}%;left:${pctX(xAt(i))}">${escapeAttribute(label)}</span>`;
      })
      .join('');

    const tooltip = hover !== null
      ? `<div data-metric-line-tooltip class="absolute z-10 rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 shadow-md dark:border-zinc-700 dark:bg-zinc-800" style="top:0;left:${pctX(xAt(hover))};transform:translateX(${hover > n / 2 ? '-90%' : '-10%'})">
          <p class="text-[10px] font-medium text-zinc-500 dark:text-zinc-400">${escapeAttribute(labels[hover])}</p>
          ${series.map((s) => `<p class="mt-0.5 flex items-center gap-1.5 whitespace-nowrap text-[11px]">
            <span class="inline-block h-1.5 w-1.5 rounded-full" style="background:${escapeAttribute(s.color)}"></span>
            <span class="text-zinc-500 dark:text-zinc-400">${escapeAttribute(s.name)}</span>
            <span class="ml-auto font-mono font-medium text-zinc-900 dark:text-zinc-50">${Number(s.values[hover]) || 0}${escapeAttribute(unit)}</span>
          </p>`).join('')}
        </div>`
      : '';

    const deltaCls =
      deltaTone === 'up'
        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
        : deltaTone === 'down'
          ? 'bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-300'
          : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300';
    const deltaArrow = deltaTone === 'up' ? '▲' : deltaTone === 'down' ? '▼' : '—';
    const deltaHtml = delta
      ? `<span data-metric-line-delta class="rounded-full px-1.5 py-0.5 text-[11px] font-medium ${deltaCls}">${deltaArrow} ${escapeAttribute(delta)}</span>`
      : '';

    const rangePills = allRanges
      .map((r) => {
        const active = r === range;
        const cls = active
          ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-900 dark:text-zinc-50'
          : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200';
        return `<button type="button" role="tab" aria-selected="${active}" data-metric-line-range-option="${escapeAttribute(r)}" class="rounded px-2 py-1 text-[11px] font-medium transition-colors ${cls}">${escapeAttribute(r)}</button>`;
      })
      .join('');

    const legend =
      series.length > 1
        ? `<div data-metric-line-legend class="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">${series
            .map(
              (s) =>
                `<span class="flex items-center gap-1.5 text-[11px] text-zinc-500 dark:text-zinc-400"><span class="inline-block h-1.5 w-1.5 rounded-full" style="background:${escapeAttribute(s.color)}"></span>${escapeAttribute(s.name)}</span>`,
            )
            .join('')}</div>`
        : '';

    this.innerHTML = `
      <div data-metric-line-chart class="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <div class="flex flex-wrap items-start justify-between gap-2">
          <div>
            <p data-metric-line-title class="text-sm font-medium text-zinc-500 dark:text-zinc-400">${escapeAttribute(headline)}</p>
            <p class="mt-0.5 flex items-center gap-2">
              <span data-metric-line-value class="font-mono text-2xl font-semibold text-zinc-900 dark:text-zinc-50">${escapeAttribute(value)}</span>
              ${deltaHtml}
            </p>
          </div>
          <div data-metric-line-ranges role="tablist" aria-label="Time range" class="flex items-center gap-0.5 rounded-md border border-zinc-200 bg-zinc-50 p-0.5 dark:border-zinc-700 dark:bg-zinc-800">${rangePills}</div>
        </div>

        <div class="relative mt-3" style="height:${HEIGHT}px">
          <svg data-metric-line-svg width="100%" height="${HEIGHT}" viewBox="0 0 ${VIEW_W} ${HEIGHT}" preserveAspectRatio="none" role="img" aria-label="${escapeAttribute(headline)} line chart, ${escapeAttribute(range)}">
            ${grid}
            ${paths}
            ${hoverGroup}
          </svg>
          <div class="absolute inset-y-0 flex" style="left:${(PAD_LEFT / VIEW_W) * 100}%;right:0">
            ${labels.map((label) => `<div data-metric-line-col="${escapeAttribute(label)}" class="flex-1 cursor-crosshair"></div>`).join('')}
          </div>
          <div class="pointer-events-none absolute inset-0">
            ${yLabels}
            ${xLabels}
            ${tooltip}
          </div>
        </div>
        ${legend}
      </div>`;
  }
}

export default MetricLineChartElement;

if (!customElements.get('metric-line-chart')) {
  customElements.define('metric-line-chart', MetricLineChartElement);
}
