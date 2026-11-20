/**
 * UsageCreditsDonut - Vanilla Web Component
 * Pure-SVG donut of credit usage by type: palette arcs with gaps,
 * hover-linked legend, dynamic center text and a range dropdown.
 *
 * Usage: <usage-credits-donut title="Usage by Type"></usage-credits-donut>
 * Properties: slices ([{id,label,value,color?}]), total, ranges, defaultRange
 * Attributes: title, unit, total
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

const PALETTE = ['#6366f1', '#22c55e', '#f59e0b', '#ec4899', '#06b6d4', '#a855f7'];
const DEFAULT_RANGES = ['Last 7 days', 'Last 30 days'];

export class UsageCreditsDonutElement extends HTMLElement {
  static get observedAttributes() {
    return ['title', 'unit', 'total'];
  }

  constructor() {
    super();
    this._slices = [];
    this._ranges = DEFAULT_RANGES;
    this._defaultRange = '';
    this._range = '';
    this._active = null;
    this._bound = false;
  }

  get slices() {
    return this._slices;
  }

  set slices(value) {
    this._slices = Array.isArray(value) ? value.map((s) => ({ ...s })) : [];
    this.render();
  }

  get ranges() {
    return this._ranges;
  }

  set ranges(value) {
    this._ranges = Array.isArray(value) ? value.map(String) : DEFAULT_RANGES;
    this.render();
  }

  get defaultRange() {
    return this._defaultRange;
  }

  set defaultRange(value) {
    this._defaultRange = value == null ? '' : String(value);
    this._range = this._defaultRange || this._ranges[0] || '';
    this.render();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;
    this.render();
  }

  connectedCallback() {
    if (!this._range) this._range = this._defaultRange || this._ranges[0] || '';
    this.render();
    if (!this._bound) {
      this._bound = true;
      this.addEventListener('change', (event) => {
        const select = event.target.closest('[data-usage-donut-range]');
        if (!select) return;
        this._range = select.value;
        this.dispatchEvent(new CustomEvent('range-change', { detail: { range: this._range } }));
      });
      this.addEventListener('mouseover', (event) => {
        const slice = event.target.closest('[data-usage-donut-slice]');
        const path = event.target.closest('[data-usage-donut-arc]');
        const id = slice ? slice.getAttribute('data-usage-donut-slice') : path ? path.getAttribute('data-usage-donut-arc') : null;
        if (id !== this._active) {
          this._active = id;
          this._refreshActive();
        }
      });
      this.addEventListener('mouseout', () => {
        if (this._active !== null) {
          this._active = null;
          this._refreshActive();
        }
      });
    }
  }

  _sum() {
    const totalAttr = this.getAttribute('total');
    if (totalAttr !== null) return Number(totalAttr) || 0;
    return this._slices.reduce((acc, s) => acc + (Number(s.value) || 0), 0);
  }

  _colored() {
    return this._slices.map((s, i) => ({ ...s, color: s.color || PALETTE[i % PALETTE.length] }));
  }

  _polar(r, deg) {
    const rad = ((deg - 90) * Math.PI) / 180;
    return [80 + r * Math.cos(rad), 80 + r * Math.sin(rad)];
  }

  _donutArc(startDeg, endDeg) {
    const [x1, y1] = this._polar(70, startDeg);
    const [x2, y2] = this._polar(70, endDeg);
    const [x3, y3] = this._polar(44, endDeg);
    const [x4, y4] = this._polar(44, startDeg);
    const large = endDeg - startDeg > 180 ? 1 : 0;
    return [
      `M ${x1.toFixed(2)} ${y1.toFixed(2)}`,
      `A 70 70 0 ${large} 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`,
      `L ${x3.toFixed(2)} ${y3.toFixed(2)}`,
      `A 44 44 0 ${large} 0 ${x4.toFixed(2)} ${y4.toFixed(2)}`,
      'Z',
    ].join(' ');
  }

  _refreshActive() {
    const sum = this._sum();
    const colored = this._colored();
    const activeSlice = this._active ? colored.find((s) => s.id === this._active) : null;
    const unit = this.getAttribute('unit') || 'credits';
    const nameEl = this.querySelector('[data-usage-donut-center-name]');
    const valueEl = this.querySelector('[data-usage-donut-center-value]');
    if (nameEl) {
      nameEl.textContent = activeSlice ? activeSlice.label : `${((((colored[0] || {}).value) || 0) / (sum || 1) * 100).toFixed(0)}%`;
    }
    if (valueEl) {
      valueEl.textContent = activeSlice ? `${activeSlice.value} ${unit}` : unit;
    }
    this.querySelectorAll('[data-usage-donut-arc]').forEach((p) => {
      const id = p.getAttribute('data-usage-donut-arc');
      p.setAttribute('opacity', this._active && this._active !== id ? '0.35' : '1');
    });
  }

  render() {
    const title = this.getAttribute('title') || 'Usage by Type';
    const unit = this.getAttribute('unit') || 'credits';
    const sum = this._sum();
    const colored = this._colored();

    let angle = 0;
    const paths = colored.map((s) => {
      const sweep = sum > 0 ? ((Number(s.value) || 0) / sum) * 360 : 0;
      const start = angle;
      const end = angle + sweep;
      angle = end;
      return { id: s.id, color: s.color, path: this._donutArc(start, Math.max(end - 0.6, start + 0.1)) };
    }).map((p) =>
      `<path data-usage-donut-arc="${escapeAttribute(p.id)}" d="${p.path}" fill="${p.color}" opacity="${this._active && this._active !== p.id ? '0.35' : '1'}"></path>`
    ).join('');

    const emptyRing = sum <= 0
      ? `<circle cx="80" cy="80" r="57" fill="none" stroke="#e4e4e7" stroke-width="26" class="dark:opacity-20"></circle>`
      : '';

    const legend = colored.map((s) => {
      const pct = sum > 0 ? `${(((Number(s.value) || 0) / sum) * 100).toFixed(0)}%` : '—';
      return `<li data-usage-donut-slice="${escapeAttribute(s.id)}" class="flex items-center gap-2 text-xs">
          <span class="h-2.5 w-2.5 shrink-0 rounded-sm" style="background-color:${escapeAttribute(s.color)}"></span>
          <span class="min-w-0 flex-1 truncate text-zinc-600 dark:text-zinc-300">${escapeAttribute(s.label)}</span>
          <span class="font-mono text-[11px] text-zinc-500 dark:text-zinc-400">${escapeAttribute(s.value)}</span>
          <span class="w-10 text-right text-[10px] text-zinc-400 dark:text-zinc-500">${pct}</span>
        </li>`;
    }).join('');

    const rangeOptions = this._ranges.map((r) =>
      `<option value="${escapeAttribute(r)}" ${r === this._range ? 'selected' : ''}>${escapeAttribute(r)}</option>`
    ).join('');

    const activeSlice = this._active ? colored.find((s) => s.id === this._active) : null;
    const centerName = activeSlice ? activeSlice.label : `${((((colored[0] || {}).value) || 0) / (sum || 1) * 100).toFixed(0)}%`;
    const centerValue = activeSlice ? `${activeSlice.value} ${unit}` : unit;

    this.innerHTML = `
      <div data-usage-donut class="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <p data-usage-donut-title class="text-sm font-semibold text-zinc-900 dark:text-zinc-50">${escapeAttribute(title)}</p>
          ${this._ranges.length > 0 ? `<select data-usage-donut-range class="rounded-md border border-zinc-200 bg-white px-2 py-1 text-[11px] text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">${rangeOptions}</select>` : ''}
        </div>
        <p data-usage-donut-total class="mt-1 text-xs text-zinc-500 dark:text-zinc-400">${sum.toFixed(2)} ${escapeAttribute(unit)}</p>

        <div class="mt-3 flex flex-wrap items-center gap-4">
          <svg data-usage-donut-chart width="160" height="160" viewBox="0 0 160 160" role="img" aria-label="${escapeAttribute(title)} donut chart">
            ${paths}${emptyRing}
            <text data-usage-donut-center-name x="80" y="78" text-anchor="middle" class="fill-zinc-900 text-sm font-semibold dark:fill-zinc-50">${escapeAttribute(centerName)}</text>
            <text data-usage-donut-center-value x="80" y="94" text-anchor="middle" class="fill-zinc-400 text-[10px]">${escapeAttribute(centerValue)}</text>
          </svg>

          <ul data-usage-donut-legend class="min-w-0 flex-1 space-y-1.5">
            ${legend || '<li data-usage-donut-empty class="text-xs text-zinc-400 dark:text-zinc-500">No usage recorded</li>'}
          </ul>
        </div>
      </div>`;
  }
}

export default UsageCreditsDonutElement;

if (!customElements.get('usage-credits-donut')) {
  customElements.define('usage-credits-donut', UsageCreditsDonutElement);
}
