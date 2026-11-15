/**
 * TokenCostBreakdown - Vanilla Web Component
 * Usage: <token-cost-breakdown title="Spend breakdown" segments='[...]' usage-rows='[...]'></token-cost-breakdown>
 * Attributes: title, segments (JSON: [{id,label,amountUsd,color?}]),
 *             usage-rows (JSON: [{id,label,tokens,percent,barColor?}]),
 *             spend-used (number), spend-total (number)
 * Events: segment-select (detail {segment})
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

const defaultColors = ['bg-zinc-500', 'bg-emerald-500', 'bg-amber-500', 'bg-sky-500', 'bg-violet-500', 'bg-rose-500'];

const segColor = (segment, index) =>
  segment.color ?? defaultColors[index % defaultColors.length];

const fmtUsd = (usd) =>
  usd >= 100 ? `$${usd.toFixed(0)}` : usd >= 1 ? `$${usd.toFixed(2)}` : `$${usd.toFixed(3)}`;

const fmtTokens = (tokens) => Number(tokens).toLocaleString('en-US');

export class TokenCostBreakdownElement extends HTMLElement {
  static get observedAttributes() {
    return ['title', 'segments', 'usage-rows', 'spend-used', 'spend-total'];
  }

  constructor() {
    super();
    this._bound = false;
    this._segments = [];
    this._usageRows = [];
  }

  connectedCallback() {
    if (!this._segments.length) this._segments = parseJsonAttr(this.getAttribute('segments'), []);
    if (!this._usageRows.length) this._usageRows = parseJsonAttr(this.getAttribute('usage-rows'), []);
    this.render();
    if (!this._bound) {
      this._bound = true;
      this.addEventListener('click', (event) => {
        const segEl = event.target.closest('[data-token-cost-segment]');
        if (!segEl) return;
        const segment = this._segments.find((s) => s.id === segEl.getAttribute('data-token-cost-segment'));
        if (segment) this.dispatchEvent(new CustomEvent('segment-select', { detail: { segment } }));
      });
    }
  }

  attributeChangedCallback(name) {
    if (name === 'segments' && !this._segments.length) {
      this._segments = parseJsonAttr(this.getAttribute('segments'), []);
    }
    if (name === 'usage-rows' && !this._usageRows.length) {
      this._usageRows = parseJsonAttr(this.getAttribute('usage-rows'), []);
    }
    if (this._bound === false && this.innerHTML === '') return;
    this.render();
  }

  get segments() { return this._segments; }
  set segments(v) {
    this._segments = Array.isArray(v) ? v.map((s) => ({ ...s })) : [];
    this.render();
  }

  get usageRows() { return this._usageRows; }
  set usageRows(v) {
    this._usageRows = Array.isArray(v) ? v.map((r) => ({ ...r })) : [];
    this.render();
  }

  render() {
    const segments = this._segments;
    const usageRows = this._usageRows;
    const title = escapeAttribute(this.getAttribute('title') || 'Spend breakdown');
    const spendTotal = Number(this.getAttribute('spend-total'));
    const spendUsedAttr = Number(this.getAttribute('spend-used'));

    const totalUsd = segments.reduce((sum, s) => sum + s.amountUsd, 0);
    const used = Number.isFinite(spendUsedAttr) && this.getAttribute('spend-used') !== null ? spendUsedAttr : totalUsd;
    const percent = Number.isFinite(spendTotal) && spendTotal > 0 ? Math.min((used / spendTotal) * 100, 100) : 100;
    const headerValue = Number.isFinite(spendTotal) && this.getAttribute('spend-total') !== null
      ? `${fmtUsd(used)} of ${fmtUsd(spendTotal)}`
      : fmtUsd(totalUsd);

    const segmentsMarkup = segments.map((segment, index) => `
      <span data-token-cost-segment="${escapeAttribute(segment.id)}" class="h-full cursor-pointer ${segColor(segment, index)}" style="width: ${totalUsd > 0 ? (segment.amountUsd / totalUsd) * percent : 0}%;"></span>`).join('');

    const legend = segments.map((segment, index) => `
      <div class="flex items-center gap-2 text-xs">
        <span class="h-2 w-2 shrink-0 rounded-sm ${segColor(segment, index)}"></span>
        <span class="min-w-0 flex-1 truncate text-zinc-700 dark:text-zinc-200">${escapeAttribute(segment.label)}</span>
        <span class="font-medium tabular-nums text-zinc-800 dark:text-zinc-100">${fmtUsd(segment.amountUsd)}</span>
        <span class="w-12 text-right tabular-nums text-zinc-400 dark:text-zinc-500">${totalUsd > 0 ? Math.round((segment.amountUsd / totalUsd) * 100) : 0}%</span>
      </div>`).join('');

    const usage = usageRows.map((row) => `
      <div data-token-usage-row="${escapeAttribute(row.id)}">
        <div class="flex items-center justify-between text-xs">
          <span class="text-zinc-700 dark:text-zinc-200">${escapeAttribute(row.label)}</span>
          <span class="tabular-nums text-zinc-500 dark:text-zinc-400">${fmtTokens(row.tokens)} (${row.percent}%)</span>
        </div>
        <div class="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
          <div data-token-usage-bar class="h-full rounded-full ${row.barColor ?? 'bg-sky-500'}" style="width: ${Math.min(Math.max(row.percent, 0), 100)}%;"></div>
        </div>
      </div>`).join('');

    this.innerHTML = `<div data-token-cost class="w-full rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
  <div class="flex items-center justify-between">
    <span class="text-xs font-semibold text-zinc-700 dark:text-zinc-200">${title}</span>
    <span class="text-[11px] tabular-nums text-zinc-400 dark:text-zinc-500">${headerValue}</span>
  </div>
  <div data-token-cost-bar class="mt-3 flex h-2.5 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">${segmentsMarkup}</div>
  <div data-token-cost-legend class="mt-3 space-y-1.5">${legend}</div>
  ${usageRows.length > 0 ? `<div data-token-usage class="mt-4 space-y-2.5 border-t border-zinc-100 pt-3 dark:border-zinc-800">
    <p class="text-[10px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">Token usage</p>
    ${usage}
  </div>` : ''}
</div>`;
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('token-cost-breakdown')) {
  customElements.define('token-cost-breakdown', TokenCostBreakdownElement);
}

export default TokenCostBreakdownElement;
