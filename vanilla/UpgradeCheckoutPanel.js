/**
 * UpgradeCheckoutPanel - Vanilla Web Component
 * Usage: <upgrade-checkout-panel line-items='[...]' total="$405.00" seats="5"></upgrade-checkout-panel>
 * Attributes: title, plan-name, billing-period (monthly|annual), seats, min-seats, max-seats,
 *             line-items (JSON [{id,label,amount,muted?,strikethrough?}]), total-label, total, total-note,
 *             discount-label, discount, confirm-text, terms
 * Property: lineItems
 * Events: billing-period-change (detail.period), seats-change (detail.seats), confirm
 */
const escapeAttribute = (value) =>
  String(value).replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  }[char]));

export class UpgradeCheckoutPanelElement extends HTMLElement {
  static get observedAttributes() {
    return ['title', 'plan-name', 'billing-period', 'seats', 'line-items', 'total-label', 'total', 'total-note', 'discount', 'confirm-text', 'terms'];
  }

  constructor() {
    super();
    this._lineItems = [];
    this._bound = false;
  }

  connectedCallback() {
    if (!this._lineItems.length) {
      const raw = this.getAttribute('line-items');
      if (raw) { try { this._lineItems = JSON.parse(raw); } catch { this._lineItems = []; } }
    }
    this.render();
    if (!this._bound) {
      this._bound = true;
      this.addEventListener('click', (event) => {
        const periodBtn = event.target.closest('[data-checkout-period]');
        if (periodBtn) {
          const period = periodBtn.getAttribute('data-checkout-period');
          this.setAttribute('billing-period', period);
          this.dispatchEvent(new CustomEvent('billing-period-change', { detail: { period } }));
          return;
        }
        const seats = Number(this.getAttribute('seats'));
        if (!Number.isNaN(seats) && this.getAttribute('seats') !== null) {
          const min = Number(this.getAttribute('min-seats')) || 1;
          const max = Number(this.getAttribute('max-seats')) || 99;
          if (event.target.closest('[data-checkout-seat-minus]')) {
            const next = Math.max(min, seats - 1);
            // read next BEFORE setAttribute (attributeChangedCallback re-renders synchronously)
            this.setAttribute('seats', String(next));
            this.dispatchEvent(new CustomEvent('seats-change', { detail: { seats: next } }));
            return;
          }
          if (event.target.closest('[data-checkout-seat-plus]')) {
            const next = Math.min(max, seats + 1);
            this.setAttribute('seats', String(next));
            this.dispatchEvent(new CustomEvent('seats-change', { detail: { seats: next } }));
            return;
          }
        }
        if (event.target.closest('[data-checkout-confirm]')) {
          this.dispatchEvent(new CustomEvent('confirm'));
        }
      });
    }
  }

  get lineItems() { return this._lineItems; }
  set lineItems(v) {
    this._lineItems = Array.isArray(v) ? v : [];
    this.render();
  }

  attributeChangedCallback(name) {
    if (name === 'line-items' && this.getAttribute(name)) {
      try { this._lineItems = JSON.parse(this.getAttribute(name)); } catch { /* keep */ }
    }
    this.render();
  }

  render() {
    const title = escapeAttribute(this.getAttribute('title') || 'Upgrade to the Teams plan');
    const planName = escapeAttribute(this.getAttribute('plan-name') || 'Teams');
    const period = this.getAttribute('billing-period') || 'annual';
    const seatsAttr = this.getAttribute('seats');
    const totalLabel = escapeAttribute(this.getAttribute('total-label') || 'Total billed today');
    const total = escapeAttribute(this.getAttribute('total') || '');
    const totalNote = escapeAttribute(this.getAttribute('total-note') || '');
    const discount = escapeAttribute(this.getAttribute('discount') || '');
    const discountLabel = escapeAttribute(this.getAttribute('discount-label') || 'Discount');
    const confirmText = escapeAttribute(this.getAttribute('confirm-text') || 'Confirm upgrade');
    const terms = escapeAttribute(this.getAttribute('terms') || '');

    const periodBtn = (p, label) => `
      <button type="button" data-checkout-period="${p}" class="rounded-md px-3 py-1.5 text-xs font-medium capitalize transition-colors ${period === p ? 'bg-zinc-900 text-white' : 'text-zinc-500 hover:text-zinc-800'}">${label}</button>`;

    const seatsBlock = seatsAttr !== null && seatsAttr !== undefined && seatsAttr !== '' ? `
      <p class="mt-5 text-sm font-semibold text-zinc-900">Seats</p>
      <div data-checkout-seats class="mt-2 flex items-center gap-3">
        <button type="button" data-checkout-seat-minus title="Fewer seats" class="flex h-8 w-8 items-center justify-center rounded-md border border-zinc-300 text-zinc-600 hover:border-zinc-400">
          <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16" aria-hidden="true"><path d="M5.5 9.25h9v1.5h-9v-1.5Z"/></svg>
        </button>
        <span data-checkout-seat-count class="min-w-8 text-center text-sm font-semibold text-zinc-900">${escapeAttribute(seatsAttr)}</span>
        <button type="button" data-checkout-seat-plus title="More seats" class="flex h-8 w-8 items-center justify-center rounded-md border border-zinc-300 text-zinc-600 hover:border-zinc-400">
          <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16" aria-hidden="true"><path d="M9.25 5.5h1.5v3.75h3.75v1.5h-3.75v3.75h-1.5v-3.75H5.5v-1.5h3.75V5.5Z"/></svg>
        </button>
        <span class="text-xs text-zinc-500">${planName} plan · ${period === 'annual' ? 'billed annually' : 'billed monthly'}</span>
      </div>` : '';

    const items = this._lineItems.map((item) => `
      <div class="flex items-center justify-between text-sm">
        <span class="text-zinc-600">${escapeAttribute(item.label)}</span>
        <span class="font-medium ${item.strikethrough ? 'text-zinc-400 line-through' : 'text-zinc-900'} ${item.muted ? 'text-zinc-400' : ''}">${escapeAttribute(item.amount)}</span>
      </div>`).join('');

    this.innerHTML = `<div data-upgrade-checkout class="grid gap-6 rounded-xl border border-zinc-200 bg-white p-6 md:grid-cols-[1.2fr_1fr]">
  <div>
    <h3 data-checkout-title class="text-xl font-bold text-zinc-900">${title}</h3>
    <p class="mt-5 text-sm font-semibold text-zinc-900">Billing cadence</p>
    <div class="mt-2 inline-flex rounded-lg border border-zinc-200 p-0.5">${periodBtn('monthly', 'Monthly plan')}${periodBtn('annual', 'Annual plan')}</div>
    ${seatsBlock}
  </div>
  <div data-checkout-summary class="rounded-lg bg-zinc-50 p-4">
    <div class="space-y-2.5">${items}
    </div>
    <div class="mt-3 border-t border-zinc-200 pt-3">
      <div class="flex items-center justify-between text-sm font-semibold">
        <span class="text-zinc-900">${totalLabel}</span>
        <span data-checkout-total class="text-zinc-900">${total}</span>
      </div>
      ${discount ? `<div class="mt-1 flex items-center justify-between text-xs">
        <span class="text-emerald-600">${discountLabel}</span>
        <span data-checkout-discount class="font-medium text-emerald-600">${discount}</span>
      </div>` : ''}
      ${totalNote ? `<p class="mt-1 text-xs text-zinc-500">${totalNote}</p>` : ''}
    </div>
    ${terms ? `<p class="mt-3 text-[11px] leading-relaxed text-zinc-500">${terms}</p>` : ''}
    <button type="button" data-checkout-confirm class="mt-4 w-full rounded-md bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-500">${confirmText}</button>
  </div>
</div>`;
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('upgrade-checkout-panel')) {
  customElements.define('upgrade-checkout-panel', UpgradeCheckoutPanelElement);
}

export default UpgradeCheckoutPanelElement;
