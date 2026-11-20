/**
 * CreditBalanceCard - Vanilla Web Component
 * Prepaid credit balance card: mono balance headline, plan status dot badge,
 * low-balance warning state and Buy / Coupon actions with a brief pulse.
 *
 * Usage: <credit-balance-card balance="6.68"></credit-balance-card>
 * Attributes: balance, unit, plan, currency, warn-below, buy-label, coupon-label
 * Events: credit-buy, credit-coupon
 */
const escapeAttribute = (value) =>
  String(value).replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  }[char]));

export class CreditBalanceCardElement extends HTMLElement {
  static get observedAttributes() {
    return ['balance', 'unit', 'plan', 'currency', 'warn-below', 'buy-label', 'coupon-label'];
  }

  constructor() {
    super();
    this._pulseTimer = null;
    this._bound = false;
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;
    if (newValue === null && ['warn-below'].includes(name)) return;
    this.render();
  }

  connectedCallback() {
    this.render();
    if (!this._bound) {
      this._bound = true;
      this.addEventListener('click', (event) => {
        if (event.target.closest('[data-credit-balance-buy]')) {
          this._pulse();
          this.dispatchEvent(new CustomEvent('credit-buy'));
        } else if (event.target.closest('[data-credit-balance-coupon]')) {
          this._pulse();
          this.dispatchEvent(new CustomEvent('credit-coupon'));
        }
      });
    }
  }

  disconnectedCallback() {
    if (this._pulseTimer) clearTimeout(this._pulseTimer);
  }

  _pulse() {
    const btn = this.querySelector('[data-credit-balance-buy]');
    if (!btn) return;
    btn.classList.add('ring-2', 'ring-emerald-300', 'ring-offset-1');
    if (this._pulseTimer) clearTimeout(this._pulseTimer);
    this._pulseTimer = setTimeout(() => {
      btn.classList.remove('ring-2', 'ring-emerald-300', 'ring-offset-1');
    }, 600);
  }

  render() {
    const balance = Number.parseFloat(this.getAttribute('balance') || '0') || 0;
    const unit = this.getAttribute('unit') || 'credits';
    const plan = this.getAttribute('plan') || 'Current plan';
    const currency = this.getAttribute('currency') || '';
    const warnRaw = this.getAttribute('warn-below');
    const warnBelow = warnRaw === null ? null : Number.parseFloat(warnRaw);
    const buyLabel = this.getAttribute('buy-label') || 'Buy More Credits';
    const couponLabel = this.getAttribute('coupon-label') || 'Apply Coupon';

    const low = typeof warnBelow === 'number' && balance < warnBelow;
    const formatted = balance.toFixed(2);

    const planBadge = low
      ? 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400'
      : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300';
    const dot = low ? 'bg-amber-500' : 'bg-emerald-500';
    const valueColor = low ? 'text-amber-600 dark:text-amber-400' : 'text-zinc-900 dark:text-zinc-50';
    const border = low ? 'border-amber-300 dark:border-amber-500/60' : 'border-zinc-200 dark:border-zinc-800';

    this.innerHTML = `
      <div data-credit-balance-card class="rounded-xl border bg-white p-4 dark:bg-zinc-900 ${border}">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <p data-credit-balance-title class="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Credit Balance</p>
          <span data-credit-balance-plan class="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-medium ${planBadge}">
            <span class="h-1.5 w-1.5 rounded-full ${dot}" aria-hidden="true"></span>
            ${escapeAttribute(plan)}
          </span>
        </div>

        <p class="mt-2 flex items-baseline gap-2">
          <span data-credit-balance-value class="font-mono text-3xl font-semibold tracking-tight ${valueColor}">${escapeAttribute(currency)}${formatted}</span>
          <span data-credit-balance-unit class="text-xs text-zinc-500 dark:text-zinc-400">${escapeAttribute(unit)}</span>
        </p>

        ${low ? `<p data-credit-balance-warning class="mt-1 text-[11px] font-medium text-amber-600 dark:text-amber-400">Balance is running low — top up to avoid interruptions.</p>` : ''}

        <div class="mt-3 flex flex-wrap items-center gap-2">
          <button type="button" data-credit-balance-buy
            class="rounded-md bg-emerald-600 px-3 py-1.5 text-[11px] font-semibold text-white transition-all hover:bg-emerald-500">${escapeAttribute(buyLabel)}</button>
          <button type="button" data-credit-balance-coupon
            class="rounded-md border border-zinc-200 px-3 py-1.5 text-[11px] font-semibold text-zinc-600 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800">${escapeAttribute(couponLabel)}</button>
        </div>
      </div>`;
  }
}

export default CreditBalanceCardElement;

if (!customElements.get('credit-balance-card')) {
  customElements.define('credit-balance-card', CreditBalanceCardElement);
}
