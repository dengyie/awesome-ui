/**
 * TopUpBalanceDialog - Vanilla Web Component
 * Top-up dialog: Bill-to / Currency selects, amount input with quick-amount
 * chips, live "new balance" summary, min-amount validation, confirmed state.
 *
 * Usage: <topup-balance-dialog balance="6.68"></topup-balance-dialog>
 * Attributes: trigger-label, title, balance, currency-symbol, min-amount,
 *             confirm-label, cancel-label
 * Properties: billToOptions, currencies, quickAmounts
 * Events: topup-confirm (detail {billTo, currency, amount}), topup-cancel
 */
const escapeAttribute = (value) =>
  String(value).replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  }[char]));

export class TopUpBalanceDialogElement extends HTMLElement {
  static get observedAttributes() {
    return ['trigger-label', 'title', 'balance', 'currency-symbol', 'min-amount', 'confirm-label', 'cancel-label'];
  }

  constructor() {
    super();
    this._billToOptions = ['Acme Inc.'];
    this._currencies = ['USD', 'EUR', 'SGD'];
    this._quickAmounts = [50, 100, 250, 500];
    this._billTo = null;
    this._currency = null;
    this._amount = '';
    this._error = null;
    this._confirmed = null;
    this._open = false;
    this._bound = false;
  }

  get billToOptions() {
    return this._billToOptions;
  }

  set billToOptions(value) {
    this._billToOptions = Array.isArray(value) && value.length ? value.map(String) : ['Acme Inc.'];
    if (!this._billTo) this._billTo = this._billToOptions[0];
    this.render();
  }

  get currencies() {
    return this._currencies;
  }

  set currencies(value) {
    this._currencies = Array.isArray(value) && value.length ? value.map(String) : ['USD', 'EUR', 'SGD'];
    if (!this._currency) this._currency = this._currencies[0];
    this.render();
  }

  get quickAmounts() {
    return this._quickAmounts;
  }

  set quickAmounts(value) {
    this._quickAmounts = Array.isArray(value) ? value.map(Number).filter((n) => Number.isFinite(n)) : [50, 100, 250, 500];
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
      this.addEventListener('click', (event) => {
        if (event.target.closest('[data-topup-open]')) {
          this._open = true;
          this._confirmed = null;
          this._error = null;
          this.render();
          return;
        }
        if (event.target.closest('[data-topup-close]') || event.target.closest('[data-topup-done]')) {
          this._close();
          return;
        }
        if (event.target.closest('[data-topup-cancel]')) {
          this.dispatchEvent(new CustomEvent('topup-cancel'));
          this._close();
          return;
        }
        const quick = event.target.closest('[data-topup-quick-amount]');
        if (quick) {
          this._amount = quick.getAttribute('data-topup-quick-amount') || '';
          this._error = null;
          this.render();
          return;
        }
        if (event.target.closest('[data-topup-confirm]')) {
          this._confirm();
          return;
        }
        if (event.target === this.querySelector('[data-topup-overlay]')) {
          this._close();
        }
      });
      this.addEventListener('input', (event) => {
        const input = event.target.closest('[data-topup-amount]');
        if (!input) return;
        this._amount = input.value;
        this._error = null;
        this._updateSummary();
      });
      this.addEventListener('change', (event) => {
        const billTo = event.target.closest('[data-topup-billto]');
        if (billTo) {
          this._billTo = billTo.value;
          return;
        }
        const currency = event.target.closest('[data-topup-currency]');
        if (currency) this._currency = currency.value;
      });
    }
  }

  _close() {
    this._open = false;
    this._amount = '';
    this._error = null;
    this._confirmed = null;
    this.render();
  }

  get _parsed() {
    return Number.parseFloat(this._amount);
  }

  get _valid() {
    const min = Number.parseFloat(this.getAttribute('min-amount') || '10') || 10;
    return Number.isFinite(this._parsed) && this._parsed >= min;
  }

  _updateSummary() {
    const el = this.querySelector('[data-topup-summary-value]');
    if (!el) return;
    const symbol = this.getAttribute('currency-symbol') || '$';
    const balance = Number.parseFloat(this.getAttribute('balance') || '0') || 0;
    const next = balance + (this._valid ? this._parsed : 0);
    el.textContent = `${symbol}${next.toFixed(2)}`;
  }

  _confirm() {
    if (!this._valid) {
      const min = Number.parseFloat(this.getAttribute('min-amount') || '10') || 10;
      const symbol = this.getAttribute('currency-symbol') || '$';
      this._error = `Minimum top-up is ${symbol}${min.toFixed(2)}`;
      this.render();
      return;
    }
    const billTo = this._billTo || this._billToOptions[0] || '';
    const currency = this._currency || this._currencies[0] || 'USD';
    this._confirmed = { billTo, currency, amount: this._parsed };
    this.render();
    this.dispatchEvent(
      new CustomEvent('topup-confirm', {
        detail: { billTo, currency, amount: this._parsed },
      }),
    );
  }

  render() {
    const title = this.getAttribute('title') || 'Top up balance';
    const trigger = this.getAttribute('trigger-label') || title;
    const symbol = this.getAttribute('currency-symbol') || '$';
    const min = Number.parseFloat(this.getAttribute('min-amount') || '10') || 10;
    const confirmLabel = this.getAttribute('confirm-label') || 'Confirm top-up';
    const cancelLabel = this.getAttribute('cancel-label') || 'Cancel';
    const balance = Number.parseFloat(this.getAttribute('balance') || '0') || 0;

    const billTo = this._billTo || this._billToOptions[0] || '';
    const currency = this._currency || this._currencies[0] || 'USD';

    if (!this._open) {
      this.innerHTML = `
        <div data-topup-balance-dialog>
          <button type="button" data-topup-open class="rounded-md bg-indigo-600 px-3 py-1.5 text-[11px] font-semibold text-white transition-colors hover:bg-indigo-500">${escapeAttribute(trigger)}</button>
        </div>`;
      return;
    }

    if (this._confirmed) {
      this.innerHTML = `
        <div data-topup-balance-dialog>
          <button type="button" data-topup-open class="rounded-md bg-indigo-600 px-3 py-1.5 text-[11px] font-semibold text-white transition-colors hover:bg-indigo-500">${escapeAttribute(trigger)}</button>
          <div data-topup-overlay class="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/50 p-4">
            <div data-topup-panel role="dialog" aria-modal="true" aria-label="${escapeAttribute(title)}" class="w-full max-w-sm rounded-xl border border-zinc-200 bg-white p-4 shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
              <p data-topup-confirmed class="text-sm font-semibold text-emerald-600 dark:text-emerald-400">Top-up confirmed</p>
              <p class="mt-1 text-xs text-zinc-500 dark:text-zinc-400">${escapeAttribute(symbol)}${this._confirmed.amount.toFixed(2)} ${escapeAttribute(this._confirmed.currency)} billed to ${escapeAttribute(this._confirmed.billTo)}.</p>
              <div class="mt-3 flex justify-end">
                <button type="button" data-topup-done class="rounded-md bg-zinc-900 px-3 py-1.5 text-[11px] font-semibold text-white dark:bg-zinc-100 dark:text-zinc-900">Done</button>
              </div>
            </div>
          </div>
        </div>`;
      return;
    }

    const billToOptions = this._billToOptions
      .map((o) => `<option value="${escapeAttribute(o)}" ${o === billTo ? 'selected' : ''}>${escapeAttribute(o)}</option>`)
      .join('');
    const currencyOptions = this._currencies
      .map((c) => `<option value="${escapeAttribute(c)}" ${c === currency ? 'selected' : ''}>${escapeAttribute(c)}</option>`)
      .join('');
    const quickChips = this._quickAmounts
      .map((q) => {
        const active = Number.parseFloat(this._amount) === q;
        const cls = active
          ? 'border-indigo-500 bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400'
          : 'border-zinc-200 text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800';
        return `<button type="button" data-topup-quick-amount="${q}" class="rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors ${cls}">${escapeAttribute(symbol)}${q}</button>`;
      })
      .join('');

    const nextBalance = balance + (this._valid ? this._parsed : 0);
    const errorLine = this._error
      ? `<p data-topup-error role="alert" class="mt-2 text-[11px] font-medium text-rose-600 dark:text-rose-400">${escapeAttribute(this._error)}</p>`
      : '';

    this.innerHTML = `
      <div data-topup-balance-dialog>
        <button type="button" data-topup-open class="rounded-md bg-indigo-600 px-3 py-1.5 text-[11px] font-semibold text-white transition-colors hover:bg-indigo-500">${escapeAttribute(trigger)}</button>
        <div data-topup-overlay class="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/50 p-4">
          <div data-topup-panel role="dialog" aria-modal="true" aria-label="${escapeAttribute(title)}" class="w-full max-w-sm rounded-xl border border-zinc-200 bg-white p-4 shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
            <div class="flex items-center justify-between">
              <p data-topup-title class="text-sm font-semibold text-zinc-900 dark:text-zinc-50">${escapeAttribute(title)}</p>
              <button type="button" data-topup-close aria-label="Close" class="rounded p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300">✕</button>
            </div>

            <label class="mt-3 block">
              <span class="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">Bill to</span>
              <select data-topup-billto class="mt-1 w-full rounded-md border border-zinc-200 bg-white px-2 py-1.5 text-xs text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200">${billToOptions}</select>
            </label>

            <label class="mt-2 block">
              <span class="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">Currency</span>
              <select data-topup-currency class="mt-1 w-full rounded-md border border-zinc-200 bg-white px-2 py-1.5 text-xs text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200">${currencyOptions}</select>
            </label>

            <label class="mt-2 block">
              <span class="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">Amount</span>
              <div class="mt-1 flex items-center gap-1 rounded-md border border-zinc-200 bg-white px-2 py-1.5 focus-within:border-indigo-400 dark:border-zinc-700 dark:bg-zinc-900">
                <span class="text-xs text-zinc-400">${escapeAttribute(symbol)}</span>
                <input data-topup-amount type="number" inputmode="decimal" min="${min}" placeholder="0.00" value="${escapeAttribute(this._amount)}" class="min-w-0 flex-1 bg-transparent text-xs text-zinc-700 outline-none placeholder:text-zinc-400 dark:text-zinc-200" />
              </div>
            </label>

            <div data-topup-quick class="mt-2 flex flex-wrap gap-1.5">${quickChips}</div>

            <p data-topup-summary class="mt-3 flex items-center justify-between border-t border-zinc-100 pt-2 text-xs dark:border-zinc-800">
              <span class="text-zinc-500 dark:text-zinc-400">New balance after top-up</span>
              <span data-topup-summary-value class="font-mono font-semibold text-zinc-900 dark:text-zinc-50">${escapeAttribute(symbol)}${nextBalance.toFixed(2)}</span>
            </p>

            ${errorLine}

            <div class="mt-3 flex items-center justify-end gap-2">
              <button type="button" data-topup-cancel class="rounded-md border border-zinc-200 px-3 py-1.5 text-[11px] font-semibold text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800">${escapeAttribute(cancelLabel)}</button>
              <button type="button" data-topup-confirm class="rounded-md bg-indigo-600 px-3 py-1.5 text-[11px] font-semibold text-white transition-colors hover:bg-indigo-500">${escapeAttribute(confirmLabel)}</button>
            </div>
          </div>
        </div>
      </div>`;
  }
}

export default TopUpBalanceDialogElement;

if (!customElements.get('topup-balance-dialog')) {
  customElements.define('topup-balance-dialog', TopUpBalanceDialogElement);
}
