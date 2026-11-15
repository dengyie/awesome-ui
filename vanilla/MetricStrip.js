/**
 * MetricStrip - Vanilla Web Component
 * Usage: <metric-strip active-index="0"></metric-strip> with `metrics` property
 * Attributes: active-index
 * Properties: metrics ({ label, value, delta?, deltaLabel?, icon? }[])
 * Events: metric-click (detail: { index, metric })
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

export class MetricStripElement extends HTMLElement {
  static get observedAttributes() {
    return ['active-index'];
  }

  constructor() {
    super();
    this._metrics = [];
  }

  get metrics() {
    return this._metrics;
  }

  set metrics(value) {
    this._metrics = Array.isArray(value) ? value : [];
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
    if (!this._metrics.length) {
      this.innerHTML = '';
      return;
    }
    const activeIndex = Number(this.getAttribute('active-index') ?? -1);

    const cells = this._metrics
      .map((metric, index) => {
        const active = index === activeIndex;
        let delta = '';
        if (metric.delta !== undefined) {
          const tone = metric.delta > 0 ? 'text-emerald-600' : metric.delta < 0 ? 'text-rose-600' : 'text-zinc-400';
          const icon = metric.delta > 0 ? 'trending-up' : metric.delta < 0 ? 'trending-down' : 'minus';
          delta = `<span class="flex items-center gap-0.5 text-[10px] font-medium ${tone}">${uiIcon(icon, { size: 11 })}${metric.delta > 0 ? '+' : ''}${escapeAttribute(metric.delta)}${metric.deltaLabel ? ` ${escapeAttribute(metric.deltaLabel)}` : '%'}</span>`;
        } else if (metric.deltaLabel) {
          delta = `<span class="text-[10px] font-medium text-zinc-400">${escapeAttribute(metric.deltaLabel)}</span>`;
        }
        return `<div role="button" tabindex="0" data-metric-index="${index}" ${active ? 'aria-current="true"' : ''}
          class="group flex min-w-[140px] flex-1 cursor-pointer flex-col gap-0.5 px-4 py-3 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-500 ${
            active ? 'bg-zinc-50 dark:bg-zinc-800/60' : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/40'
          }">
          <span class="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">${
            metric.icon ? uiIcon(metric.icon, { size: 12, className: 'text-zinc-400' }) : ''
          }${escapeAttribute(metric.label)}</span>
          <span class="flex items-baseline gap-2">
            <span class="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">${escapeAttribute(metric.value)}</span>
            ${delta}
          </span>
        </div>`;
      })
      .join('');

    this.innerHTML = `<div data-metric-strip class="flex flex-wrap items-stretch divide-x divide-zinc-100 overflow-hidden rounded-xl border border-zinc-200 bg-white dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-900">${cells}</div>`;

    this.querySelectorAll('[data-metric-index]').forEach((cell) => {
      const fire = () => {
        const index = Number(cell.getAttribute('data-metric-index'));
        this.dispatchEvent(new CustomEvent('metric-click', { detail: { index, metric: this._metrics[index] } }));
      };
      cell.addEventListener('click', fire);
      cell.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          fire();
        }
      });
    });
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('metric-strip')) {
  customElements.define('metric-strip', MetricStripElement);
}
export default MetricStripElement;
