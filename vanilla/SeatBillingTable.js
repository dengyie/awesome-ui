/**
 * SeatBillingTable - Vanilla Web Component
 * Per-seat billing table: user rows with seat type, usage, cost and status
 * badges, client-side search and a billed-seats total footer.
 *
 * Usage: <seat-billing-table title="Usage by User"></seat-billing-table>
 * Properties: rows ([{id,user,email?,seat?,cost?,usage?,status?}]), currency
 * Attributes: title, description, period, currency, searchable ("false" hides search)
 * Events: seat-search (detail {query})
 */
const escapeAttribute = (value) =>
  String(value).replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  }[char]));

const STATUS_BADGE = {
  active: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400',
  invited: 'bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-400',
  suspended: 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400',
};
const STATUS_LABEL = {
  active: 'Active',
  invited: 'Invited',
  suspended: 'Suspended',
};

export class SeatBillingTableElement extends HTMLElement {
  static get observedAttributes() {
    return ['title', 'description', 'period', 'currency', 'searchable'];
  }

  constructor() {
    super();
    this._rows = [];
    this._query = '';
    this._bound = false;
  }

  get rows() {
    return this._rows;
  }

  set rows(value) {
    this._rows = Array.isArray(value) ? value.map((r) => ({ ...r })) : [];
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
      this.addEventListener('input', (event) => {
        const input = event.target.closest('[data-seat-search]');
        if (!input) return;
        this._query = input.value;
        this.render();
        const search = this.querySelector('[data-seat-search]');
        if (search) {
          search.focus();
          search.setSelectionRange(search.value.length, search.value.length);
          this.dispatchEvent(new CustomEvent('seat-search', { detail: { query: this._query } }));
        }
      });
    }
  }

  _filtered() {
    const q = this._query.trim().toLowerCase();
    if (!q) return this._rows;
    return this._rows.filter(
      (r) => String(r.user).toLowerCase().includes(q) || String(r.email || '').toLowerCase().includes(q)
    );
  }

  render() {
    const title = this.getAttribute('title') || 'Usage by User';
    const description = this.getAttribute('description') ||
      'Per-seat costs and credit consumption for the current billing period.';
    const period = this.getAttribute('period') || 'Monthly';
    const currency = this.getAttribute('currency') || '$';
    const searchable = this.getAttribute('searchable') !== 'false';

    const filtered = this._filtered();
    const billed = this._rows.filter((r) => r.status !== 'suspended');
    const totalCost = billed.reduce((acc, r) => acc + (Number(r.cost) || 0), 0);
    const fmt = (cost) => `${currency}${Number(cost).toFixed(2)}`;

    const bodyRows = filtered.map((r) => {
      const status = r.status && STATUS_BADGE[r.status] ? r.status : null;
      const badge = status && status !== 'active'
        ? `<span data-seat-status class="rounded-full px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide ${STATUS_BADGE[status]}">${STATUS_LABEL[status]}</span>`
        : '';
      const email = r.email
        ? `<p class="mt-0.5 truncate text-[10px] text-zinc-400 dark:text-zinc-500">${escapeAttribute(r.email)}</p>`
        : '';
      const cost = r.cost != null ? fmt(r.cost) : '—';
      return `<tr data-seat-row="${escapeAttribute(r.id)}" class="border-b border-zinc-100 last:border-0 dark:border-zinc-800">
          <td class="py-2 pr-2">
            <div class="flex items-center gap-2">
              <span data-seat-user class="truncate font-medium text-zinc-700 dark:text-zinc-200">${escapeAttribute(r.user)}</span>
              ${badge}
            </div>
            ${email}
          </td>
          <td class="py-2 pr-2 text-zinc-500 dark:text-zinc-400">${escapeAttribute(r.seat || 'Member')}</td>
          <td class="py-2 pr-2 font-mono text-[11px] text-zinc-500 dark:text-zinc-400">${escapeAttribute(r.usage || '—')}</td>
          <td data-seat-cost class="py-2 text-right font-mono text-[11px] text-zinc-700 dark:text-zinc-200">${cost}</td>
        </tr>`;
    }).join('');

    const emptyRow = `<tr><td colspan="4" data-seat-empty class="py-4 text-center text-xs text-zinc-400 dark:text-zinc-500">${
      this._query.trim() ? 'No users match your search' : 'No seats billed this period'
    }</td></tr>`;

    const footer = billed.length > 0
      ? `<tfoot><tr data-seat-total class="border-t border-zinc-200 dark:border-zinc-700">
          <td class="py-2 pr-2 text-[11px] font-semibold text-zinc-600 dark:text-zinc-300">${billed.length} billed seat${billed.length === 1 ? '' : 's'}</td>
          <td colspan="2"></td>
          <td data-seat-total-cost class="py-2 text-right font-mono text-xs font-semibold text-zinc-800 dark:text-zinc-100">${fmt(totalCost)}</td>
        </tr></tfoot>`
      : '';

    this.innerHTML = `
      <div data-seat-table class="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <p data-seat-title class="text-sm font-semibold text-zinc-900 dark:text-zinc-50">${escapeAttribute(title)}</p>
          ${period ? `<span data-seat-period class="text-[11px] text-zinc-400 dark:text-zinc-500">${escapeAttribute(period)}</span>` : ''}
        </div>
        <p data-seat-description class="mt-1 text-xs text-zinc-500 dark:text-zinc-400">${escapeAttribute(description)}</p>

        ${searchable ? `<input data-seat-search type="search" value="${escapeAttribute(this._query)}" placeholder="Search for a user…" class="mt-3 w-full rounded-md border border-zinc-200 bg-white px-2.5 py-1.5 text-xs text-zinc-700 placeholder:text-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200" />` : ''}

        <table data-seat-rows class="mt-2 w-full text-left text-xs">
          <thead>
            <tr class="border-b border-zinc-200 text-[10px] uppercase tracking-wide text-zinc-400 dark:border-zinc-700">
              <th class="py-1.5 pr-2 font-semibold">Name</th>
              <th class="py-1.5 pr-2 font-semibold">Seat</th>
              <th class="py-1.5 pr-2 font-semibold">Usage</th>
              <th class="py-1.5 text-right font-semibold">Cost</th>
            </tr>
          </thead>
          <tbody>${bodyRows || emptyRow}</tbody>
          ${footer}
        </table>
      </div>`;
  }
}

export default SeatBillingTableElement;

if (!customElements.get('seat-billing-table')) {
  customElements.define('seat-billing-table', SeatBillingTableElement);
}
