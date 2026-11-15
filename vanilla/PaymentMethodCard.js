/**
 * PaymentMethodCard - Vanilla Web Component
 * Usage: <payment-method-card brand="visa" last4="6008" exp="10 / 2028" amount="$6.53"></payment-method-card>
 * Attributes: brand, last4, exp, amount, holder-label, holder, show-add-new, change-label, add-new-label
 * Events: change, add-new
 */
const escapeAttribute = (value) =>
  String(value).replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  }[char]));

const BRAND_LABEL = { visa: 'VISA', mastercard: 'MC', amex: 'AMEX' };
const BRAND_TONE = {
  visa: 'bg-blue-700 text-white',
  mastercard: 'bg-zinc-900 text-white',
  amex: 'bg-sky-600 text-white',
};

export class PaymentMethodCardElement extends HTMLElement {
  static get observedAttributes() {
    return ['brand', 'last4', 'exp', 'amount', 'holder-label', 'holder', 'show-add-new', 'change-label', 'add-new-label'];
  }

  constructor() {
    super();
    this._bound = false;
  }

  connectedCallback() {
    this.render();
    if (!this._bound) {
      this._bound = true;
      this.addEventListener('click', (event) => {
        if (event.target.closest('[data-payment-change]')) this.dispatchEvent(new CustomEvent('change'));
        if (event.target.closest('[data-payment-add]')) this.dispatchEvent(new CustomEvent('add-new'));
      });
    }
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
    const brand = (this.getAttribute('brand') || 'card').toLowerCase();
    const last4 = this.getAttribute('last4') || '';
    const exp = this.getAttribute('exp') || '';
    const amount = this.getAttribute('amount') || '';
    const holderLabel = this.getAttribute('holder-label') || 'Billing address';
    const holder = this.getAttribute('holder') || '';
    const showAddNew = this.getAttribute('show-add-new') !== 'false';
    const changeLabel = this.getAttribute('change-label') || 'Change';
    const addNewLabel = this.getAttribute('add-new-label') || '+ Add new payment';
    const brandLabel = BRAND_LABEL[brand] || String(brand).slice(0, 4).toUpperCase();
    const brandTone = BRAND_TONE[brand] || 'bg-zinc-700 text-white';

    this.innerHTML = `<div data-payment-card class="w-full rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <div class="flex items-center gap-3">
        <span data-payment-brand class="flex h-8 w-12 shrink-0 items-center justify-center rounded-md text-[11px] font-black tracking-wide ${brandTone}">${escapeAttribute(brandLabel)}</span>
        <div class="min-w-0 flex-1">
          <p data-payment-number class="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Ending in ${escapeAttribute(last4)}${amount ? `<span class="ml-2 font-normal text-zinc-500 dark:text-zinc-400">${escapeAttribute(amount)}</span>` : ''}</p>
          ${exp ? `<p class="text-xs text-zinc-400 dark:text-zinc-500">Exp. ${escapeAttribute(exp)}</p>` : ''}
        </div>
        <button type="button" data-payment-change class="shrink-0 text-xs font-semibold uppercase tracking-wide text-indigo-600 hover:underline dark:text-indigo-400">${escapeAttribute(changeLabel)}</button>
      </div>
      ${holder ? `<div class="mt-3 border-t border-zinc-100 pt-3 dark:border-zinc-800">
        <p class="text-[10px] font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">${escapeAttribute(holderLabel)}</p>
        <p class="mt-0.5 text-xs text-zinc-700 dark:text-zinc-200">${escapeAttribute(holder)}</p>
      </div>` : ''}
      ${showAddNew ? `<button type="button" data-payment-add class="mt-3 text-xs font-medium text-zinc-500 underline-offset-2 hover:text-zinc-700 hover:underline dark:text-zinc-400 dark:hover:text-zinc-200">${escapeAttribute(addNewLabel)}</button>` : ''}
    </div>`;
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('payment-method-card')) {
  customElements.define('payment-method-card', PaymentMethodCardElement);
}

export default PaymentMethodCardElement;
