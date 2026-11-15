/**
 * ForecastTrendChart - Vanilla Web Component
 * Usage: <forecast-trend headline="48.2k" unit="views" delta-label="+108% vs prior" note="…"> with `points` property
 * Attributes: headline, unit, delta-label, delta-tone (emerald|rose|zinc), note
 * Properties: points ({ label, value, forecast? }[])
 */
import uiIcon from './UiIcon.js';

const escapeAttribute = (value) =>
  String(value).replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  }[char]));

const TONE_TEXT = {
  emerald: 'text-emerald-600',
  rose: 'text-rose-600',
  zinc: 'text-zinc-400',
};

const TONE_ICON = {
  emerald: 'trending-up',
  rose: 'trending-down',
  zinc: 'minus',
};

export class ForecastTrendChartElement extends HTMLElement {
  static get observedAttributes() {
    return ['headline', 'unit', 'delta-label', 'delta-tone', 'note'];
  }

  constructor() {
    super();
    this._points = [];
  }

  get points() {
    return this._points;
  }

  set points(value) {
    this._points = Array.isArray(value) ? value : [];
    this.render();
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback() {
    this.render();
  }

  _applyHostClass(hostClass) {
    const prev = this._appliedLayout || '';
    let user = this.className || '';
    if (prev && user.startsWith(prev)) user = user.slice(prev.length).trim();
    this._appliedLayout = hostClass;
    const next = `${hostClass}${user ? ` ${user}` : ''}`;
    if (this.className !== next) this.className = next;
  }

  render() {
    this._applyHostClass('block');
    const headline = this.getAttribute('headline') || '0';
    const unit = this.getAttribute('unit') || '';
    const deltaLabel = this.getAttribute('delta-label') || '';
    const deltaTone = this.getAttribute('delta-tone') || 'emerald';
    const note = this.getAttribute('note') || '';
    const points = this._points;
    const max = Math.max(...points.map((point) => point.value), 0.0001);

    this.innerHTML = `<div data-forecast-trend class="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <div class="flex flex-wrap items-baseline gap-2">
        <p class="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">${escapeAttribute(headline)}${unit ? `<span class="ml-1 text-sm font-medium text-zinc-400">${escapeAttribute(unit)}</span>` : ''}</p>
        ${
          deltaLabel
            ? `<span class="flex items-center gap-0.5 text-xs font-semibold ${TONE_TEXT[deltaTone]}">${uiIcon(TONE_ICON[deltaTone] || 'trending-up', { size: 12 })}${escapeAttribute(deltaLabel)}</span>`
            : ''
        }
      </div>
      ${note ? `<p class="mt-0.5 text-xs text-zinc-400">${escapeAttribute(note)}</p>` : ''}
      <div class="mt-4 flex h-28 items-end gap-1" role="img" aria-label="Trend with forecast">
        ${points
          .map((point, index) => {
            const height = Math.max(4, Math.round((point.value / max) * 100));
            const bar = point.forecast
              ? `<div class="w-full max-w-6 rounded-md border-2 border-dashed border-sky-400 bg-sky-100/50 dark:border-sky-500 dark:bg-sky-900/40" style="height:${height}%" title="${escapeAttribute(point.label)}: ${escapeAttribute(point.value + unit)} (forecast)"></div>`
              : `<div class="w-full max-w-6 rounded-md bg-sky-500 transition-all duration-300 dark:bg-sky-400" style="height:${height}%" title="${escapeAttribute(point.label)}: ${escapeAttribute(point.value + unit)}"></div>`;
            return `<div data-point-index="${index}" class="flex min-w-0 flex-1 flex-col items-center gap-1">
              <div class="relative flex h-full w-full items-end justify-center">${bar}</div>
              <span class="truncate text-[9px] text-zinc-400">${escapeAttribute(point.label)}</span>
            </div>`;
          })
          .join('')}
      </div>
      <div class="mt-3 flex items-center gap-4 border-t border-zinc-100 pt-3 text-[10px] text-zinc-400 dark:border-zinc-800">
        <span class="flex items-center gap-1.5"><span class="h-2.5 w-2.5 rounded-sm bg-sky-500"></span> Actual</span>
        <span class="flex items-center gap-1.5"><span class="h-2.5 w-2.5 rounded-sm border border-dashed border-sky-400 bg-sky-100/50"></span> Forecast</span>
      </div>
    </div>`;
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('forecast-trend')) {
  customElements.define('forecast-trend', ForecastTrendChartElement);
}
export default ForecastTrendChartElement;
