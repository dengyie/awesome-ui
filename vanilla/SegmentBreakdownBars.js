/**
 * SegmentBreakdownBars - Vanilla Web Component
 * Usage: <segment-breakdown headline="23.19" caption="Conversion rate"> with `items` property
 * Attributes: headline, headline-unit, caption, unit
 * Properties: items ({ label, value, unit?, delta?, deltaUnit?, tone? }[])
 * Events: none (display-only)
 */
const escapeAttribute = (value) =>
  String(value).replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  }[char]));

const TONE_BAR = {
  indigo: 'bg-indigo-500',
  emerald: 'bg-emerald-500',
  amber: 'bg-amber-400',
  sky: 'bg-sky-500',
  rose: 'bg-rose-500',
};

export class SegmentBreakdownBarsElement extends HTMLElement {
  static get observedAttributes() {
    return ['headline', 'headline-unit', 'caption', 'unit'];
  }

  constructor() {
    super();
    this._items = [];
  }

  get items() {
    return this._items;
  }

  set items(value) {
    this._items = Array.isArray(value) ? value : [];
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
    const headlineUnit = this.getAttribute('headline-unit') ?? '%';
    const caption = this.getAttribute('caption') || '';
    const unit = this.getAttribute('unit') || '';
    const items = this._items;
    const max = Math.max(...items.map((item) => Math.max(0, item.value)), 0.0001);
    const total = Math.round(items.reduce((sum, item) => sum + Math.max(0, item.value), 0) * 100) / 100;

    this.innerHTML = `<div data-segment-breakdown role="table" class="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <p class="border-l-2 border-zinc-900 pl-2 text-2xl font-semibold tracking-tight text-zinc-900 dark:border-zinc-50 dark:text-zinc-50">${escapeAttribute(headline)}<span class="ml-1 text-sm font-medium text-zinc-400">${escapeAttribute(headlineUnit)}</span></p>
      ${caption ? `<p class="mt-1 pl-3 text-xs text-zinc-400">${escapeAttribute(caption)}</p>` : ''}
      <div class="mt-4 space-y-3">
        ${items
          .map((item, index) => {
            const share = Math.max(0, item.value);
            const width = Math.min(100, Math.round((share / max) * 100));
            const tone = TONE_BAR[item.tone || 'indigo'];
            const delta =
              item.delta !== undefined
                ? `<span class="w-16 shrink-0 text-right text-xs font-medium tabular-nums ${
                    item.delta > 0 ? 'text-emerald-600' : item.delta < 0 ? 'text-rose-600' : 'text-zinc-400'
                  }">${item.delta > 0 ? '+' : ''}${escapeAttribute(item.delta)}${escapeAttribute(item.deltaUnit ?? 'pp')}</span>`
                : '<span class="w-16 shrink-0"></span>';
            return `<div role="row" data-segment-index="${index}" class="flex items-center gap-3">
              <span class="w-28 shrink-0 truncate text-xs font-medium text-zinc-600 dark:text-zinc-300">${escapeAttribute(item.label)}</span>
              <span class="relative h-2.5 min-w-0 flex-1 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                <span data-segment-bar class="absolute inset-y-0 left-0 rounded-full transition-all duration-300 ${tone}" style="width:${width}%"></span>
              </span>
              <span class="w-14 shrink-0 text-right text-xs font-semibold tabular-nums text-zinc-900 dark:text-zinc-50">${escapeAttribute(share)}${escapeAttribute(item.unit ?? unit)}</span>
              ${delta}
            </div>`;
          })
          .join('')}
      </div>
      <p class="mt-4 border-t border-zinc-100 pt-3 text-[10px] text-zinc-400 dark:border-zinc-800">Share of ${escapeAttribute(total)}${escapeAttribute(unit)} across ${items.length} segments</p>
    </div>`;
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('segment-breakdown')) {
  customElements.define('segment-breakdown', SegmentBreakdownBarsElement);
}
export default SegmentBreakdownBarsElement;
