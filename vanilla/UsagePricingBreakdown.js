/**
 * UsagePricingBreakdown - Metered usage pricing: tiered unit-price table
 * (range / usage / unit price / subtotal) with the current tier highlighted
 * and an estimated total footer (usage-based billing pattern).
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

const DEFAULT_TIERS = () => [
  { range: 'First 10,000', unit: 'requests', usage: 9420, unitPrice: 0.002 },
  { range: '10,001 – 50,000', unit: 'requests', usage: 18340, unitPrice: 0.0012 },
  { range: '50,001 – 200,000', unit: 'requests', usage: 0, unitPrice: 0.0008 },
];

const toNumber = (value, fallback = 0) => {
  const n = Number.parseFloat(String(value ?? ''));
  return Number.isNaN(n) ? fallback : n;
};

const fmtMoney = (n) => n.toFixed(2);

class UsagePricingBreakdownElement extends HTMLElement {
  static get observedAttributes() {
    return ['title', 'currency', 'tiers', 'footer-note'];
  }

  constructor() {
    super();
    this._title = 'Usage this cycle';
    this._currency = 'USD';
    this._tiers = DEFAULT_TIERS();
    this._footerNote = 'Estimated charges based on metered usage to date.';
  }

  connectedCallback() {
    const t = this.getAttribute('title');
    if (t) this._title = t;
    const c = this.getAttribute('currency');
    if (c) this._currency = c;
    const f = this.getAttribute('footer-note');
    if (f !== null) this._footerNote = f;
    this._tiers = parseJsonAttr(this.getAttribute('tiers'), DEFAULT_TIERS());
    this._render();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;
    if (name === 'title') this._title = newValue || 'Usage this cycle';
    if (name === 'currency') this._currency = newValue || 'USD';
    if (name === 'footer-note') this._footerNote = newValue ?? '';
    if (name === 'tiers') this._tiers = parseJsonAttr(newValue, DEFAULT_TIERS());
    this._render();
  }

  get tiers() { return this._tiers; }
  set tiers(value) { this._tiers = Array.isArray(value) ? value : []; this._render(); }

  _render() {
    const tiers = Array.isArray(this._tiers) ? this._tiers : [];
    let total = 0;
    const rowsHtml = tiers
      .map((tier, index) => {
        const usage = Math.max(0, toNumber(tier.usage));
        const unitPrice = Math.max(0, toNumber(tier.unitPrice));
        const subtotal = usage * unitPrice;
        total += subtotal;
        const current = usage > 0;
        const rowCls = current
          ? 'border-b border-zinc-50 bg-violet-50/60 dark:border-zinc-800/60 dark:bg-violet-950/30'
          : 'border-b border-zinc-50 dark:border-zinc-800/60';
        return `<tr data-pricing-tier="${index}" class="${rowCls} transition-colors last:border-b-0">
          <td data-pricing-range="${escapeAttribute(tier.range)}" class="whitespace-nowrap px-5 py-3 font-medium text-zinc-800 dark:text-zinc-100">${escapeAttribute(tier.range)} <span class="ml-1 text-[11px] font-normal text-zinc-400">${escapeAttribute(tier.unit || '')}</span></td>
          <td data-pricing-usage="${usage}" class="px-2 py-3 text-right font-mono text-zinc-700 dark:text-zinc-200">${usage.toLocaleString()}</td>
          <td data-pricing-unit-price="${unitPrice}" class="px-2 py-3 text-right font-mono text-zinc-500 dark:text-zinc-400">${escapeAttribute(this._currency)} ${unitPrice.toFixed(4)}</td>
          <td data-pricing-subtotal="${fmtMoney(subtotal)}" class="px-5 py-3 text-right font-mono font-semibold ${current ? 'text-violet-700 dark:text-violet-300' : 'text-zinc-400 dark:text-zinc-500'}">${escapeAttribute(this._currency)} ${fmtMoney(subtotal)}</td>
        </tr>`;
      })
      .join('');

    const noteHtml = this._footerNote
      ? `<p data-pricing-note class="mt-2 text-[11px] leading-4 text-zinc-400 dark:text-zinc-500">${escapeAttribute(this._footerNote)}</p>`
      : '';

    this.innerHTML = `
      <div data-pricing-breakdown class="w-full rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div data-pricing-header class="flex items-center justify-between border-b border-zinc-100 px-5 py-4 dark:border-zinc-800">
          <p data-pricing-title class="text-base font-semibold text-zinc-900 dark:text-zinc-50">${escapeAttribute(this._title)}</p>
          <span data-pricing-currency class="rounded-full bg-zinc-100 px-2.5 py-0.5 text-[11px] font-semibold text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">${escapeAttribute(this._currency)}</span>
        </div>
        <table data-pricing-table-body class="w-full text-left text-xs">
          <thead>
            <tr class="border-b border-zinc-100 text-[11px] font-semibold uppercase tracking-wide text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
              <th class="px-5 py-2.5 font-semibold">Tier</th>
              <th class="px-2 py-2.5 text-right font-semibold">Usage</th>
              <th class="px-2 py-2.5 text-right font-semibold">Unit price</th>
              <th class="px-5 py-2.5 text-right font-semibold">Subtotal</th>
            </tr>
          </thead>
          <tbody>${rowsHtml}</tbody>
        </table>
        <div data-pricing-footer class="flex items-center justify-between border-t border-zinc-100 px-5 py-4 dark:border-zinc-800">
          <div>
            <p data-pricing-total-label class="text-sm font-medium text-zinc-600 dark:text-zinc-300">Estimated total</p>
            ${noteHtml}
          </div>
          <span data-pricing-total-value class="font-mono text-lg font-bold text-zinc-900 dark:text-zinc-50">${escapeAttribute(this._currency)} ${fmtMoney(total)}</span>
        </div>
      </div>`;
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('usage-pricing-breakdown')) {
  customElements.define('usage-pricing-breakdown', UsagePricingBreakdownElement);
}

export default UsagePricingBreakdownElement;
