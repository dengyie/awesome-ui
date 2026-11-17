/**
 * InvoiceHistoryTable - Billing invoice history: header with title and
 * currency note, table of invoices (period / invoice id / amount / status
 * badge / date / download action) with a paid-total footer
 * (Contractbook / Remote billing history pattern).
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

const DEFAULT_INVOICES = () => [
  { id: 'INV-2026-011', period: 'November 2026', amount: '148.00', status: 'paid', date: 'Nov 1, 2026' },
  { id: 'INV-2026-010', period: 'October 2026', amount: '148.00', status: 'paid', date: 'Oct 1, 2026' },
  { id: 'INV-2026-009', period: 'September 2026', amount: '96.00', status: 'pending', date: 'Sep 1, 2026' },
  { id: 'INV-2026-008', period: 'August 2026', amount: '148.00', status: 'failed', date: 'Aug 1, 2026' },
];

const STATUS_STYLES = {
  paid: { label: 'Paid', cls: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400' },
  pending: { label: 'Pending', cls: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400' },
  failed: { label: 'Failed', cls: 'bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-400' },
};

const amountNumber = (invoice) => {
  const n = Number.parseFloat(String(invoice.amount ?? '0').replace(/[^0-9.\-]/g, ''));
  return Number.isNaN(n) ? 0 : n;
};

class InvoiceHistoryTableElement extends HTMLElement {
  static get observedAttributes() {
    return ['title', 'currency', 'download-label', 'invoices'];
  }

  constructor() {
    super();
    this._title = 'Invoice history';
    this._currency = 'USD';
    this._downloadLabel = 'Download';
    this._invoices = DEFAULT_INVOICES();
    this._onClick = this._onClick.bind(this);
  }

  connectedCallback() {
    const t = this.getAttribute('title');
    if (t) this._title = t;
    const c = this.getAttribute('currency');
    if (c) this._currency = c;
    const d = this.getAttribute('download-label');
    if (d) this._downloadLabel = d;
    this._invoices = parseJsonAttr(this.getAttribute('invoices'), DEFAULT_INVOICES());
    this._render();
    this.addEventListener('click', this._onClick);
  }

  disconnectedCallback() {
    this.removeEventListener('click', this._onClick);
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;
    if (name === 'title') this._title = newValue || 'Invoice history';
    if (name === 'currency') this._currency = newValue || 'USD';
    if (name === 'download-label') this._downloadLabel = newValue || 'Download';
    if (name === 'invoices') this._invoices = parseJsonAttr(newValue, DEFAULT_INVOICES());
    this._render();
  }

  get invoices() { return this._invoices; }
  set invoices(value) { this._invoices = Array.isArray(value) ? value : []; this._render(); }

  _onClick(event) {
    const btn = event.target.closest('[data-invoice-download]');
    if (!btn) return;
    const invoice = this._invoices.find((inv) => inv.id === btn.getAttribute('data-invoice-download'));
    if (invoice) this.dispatchEvent(new CustomEvent('invoice-download', { detail: { invoice }, bubbles: true }));
  }

  _render() {
    const list = Array.isArray(this._invoices) ? this._invoices : [];
    const rowsHtml = list
      .map((inv) => {
        const style = STATUS_STYLES[inv.status] ?? STATUS_STYLES.pending;
        return `<tr data-invoice-row="${escapeAttribute(inv.id)}" class="border-b border-zinc-50 transition-colors last:border-b-0 hover:bg-zinc-50 dark:border-zinc-800/60 dark:hover:bg-zinc-800/60">
          <td data-invoice-period="${escapeAttribute(inv.period)}" class="whitespace-nowrap px-5 py-3 font-medium text-zinc-800 dark:text-zinc-100">${escapeAttribute(inv.period)}</td>
          <td data-invoice-id="${escapeAttribute(inv.id)}" class="px-2 py-3 font-mono text-xs text-zinc-500 dark:text-zinc-400">${escapeAttribute(inv.id)}</td>
          <td data-invoice-amount="${escapeAttribute(inv.amount)}" class="px-2 py-3 text-right font-mono text-zinc-800 dark:text-zinc-100">${escapeAttribute(this._currency)} ${escapeAttribute(inv.amount)}</td>
          <td data-invoice-status="${escapeAttribute(inv.status)}" class="px-2 py-3"><span class="inline-block rounded px-2 py-0.5 text-[11px] font-semibold ${style.cls}">${style.label}</span></td>
          <td data-invoice-date="${escapeAttribute(inv.date)}" class="whitespace-nowrap px-2 py-3 text-zinc-500 dark:text-zinc-400">${escapeAttribute(inv.date)}</td>
          <td class="px-5 py-3 text-right">
            <button type="button" data-invoice-download="${escapeAttribute(inv.id)}" class="rounded-md border border-zinc-200 px-2.5 py-1 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800">${escapeAttribute(this._downloadLabel)}</button>
          </td>
        </tr>`;
      })
      .join('');

    const paidTotal = list
      .filter((inv) => inv.status === 'paid')
      .reduce((sum, inv) => sum + amountNumber(inv), 0)
      .toFixed(2);

    this.innerHTML = `
      <div data-invoice-table class="w-full rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div data-invoice-header class="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 px-5 py-4 dark:border-zinc-800">
          <p data-invoice-title class="text-base font-semibold text-zinc-900 dark:text-zinc-50">${escapeAttribute(this._title)}</p>
          <span data-invoice-currency class="rounded-full bg-zinc-100 px-2.5 py-0.5 text-[11px] font-semibold text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">${escapeAttribute(this._currency)}</span>
        </div>
        <table data-invoice-table-body class="w-full text-left text-xs">
          <thead>
            <tr class="border-b border-zinc-100 text-[11px] font-semibold uppercase tracking-wide text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
              <th class="px-5 py-2.5 font-semibold">Billing period</th>
              <th class="px-2 py-2.5 font-semibold">Invoice</th>
              <th class="px-2 py-2.5 text-right font-semibold">Amount</th>
              <th class="px-2 py-2.5 font-semibold">Status</th>
              <th class="px-2 py-2.5 font-semibold">Date</th>
              <th class="px-5 py-2.5 text-right font-semibold"><span class="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody>${rowsHtml}</tbody>
        </table>
        <div data-invoice-footer class="flex items-center justify-between border-t border-zinc-100 px-5 py-3 text-sm dark:border-zinc-800">
          <span data-invoice-total-label class="text-zinc-500 dark:text-zinc-400">Paid total</span>
          <span data-invoice-total-value class="font-mono font-semibold text-zinc-900 dark:text-zinc-50">${escapeAttribute(this._currency)} ${paidTotal}</span>
        </div>
      </div>`;
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('invoice-history-table')) {
  customElements.define('invoice-history-table', InvoiceHistoryTableElement);
}

export default InvoiceHistoryTableElement;
