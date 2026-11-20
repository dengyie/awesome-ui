/**
 * TrialExpiryNotice - Vanilla Web Component
 * Trial expiration warning card: big countdown number, expiring (amber) /
 * urgent (red, <=3 days) tones, locked vs kept feature lists and
 * Upgrade / Extend trial CTAs.
 *
 * Usage: <trial-expiry-notice plan-name="Pro" days-left="4" expires-on="Nov 28"></trial-expiry-notice>
 * Attributes: plan-name, days-left, tone (expiring/urgent/auto), expires-on,
 * extend-label, upgrade-label
 * Properties: losingFeatures {string[]}, keepingFeatures {string[]}
 * Events: upgrade, extend
 */
const escapeAttribute = (value) =>
  String(value).replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  }[char]));

export class TrialExpiryNoticeElement extends HTMLElement {
  static get observedAttributes() {
    return ['plan-name', 'days-left', 'tone', 'expires-on', 'extend-label', 'upgrade-label'];
  }

  constructor() {
    super();
    this._losing = [];
    this._keeping = [];
    this._bound = false;
  }

  get losingFeatures() {
    return this._losing;
  }

  set losingFeatures(value) {
    this._losing = Array.isArray(value) ? value : [];
    this.render();
  }

  get keepingFeatures() {
    return this._keeping;
  }

  set keepingFeatures(value) {
    this._keeping = Array.isArray(value) ? value : [];
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
        if (event.target.closest('[data-trial-expiry-upgrade]')) {
          this.dispatchEvent(new CustomEvent('upgrade'));
        } else if (event.target.closest('[data-trial-expiry-extend]')) {
          this.dispatchEvent(new CustomEvent('extend'));
        }
      });
    }
  }

  render() {
    const planName = this.getAttribute('plan-name') || 'Pro';
    const daysLeft = Math.max(Number.parseInt(this.getAttribute('days-left') || '0', 10) || 0, 0);
    const toneAttr = this.getAttribute('tone') || 'auto';
    const tone = toneAttr === 'expiring' || toneAttr === 'urgent' ? toneAttr : daysLeft <= 3 ? 'urgent' : 'expiring';
    const expiresOn = this.getAttribute('expires-on');
    const extendLabel = this.getAttribute('extend-label') || 'Extend trial';
    const upgradeLabel = this.getAttribute('upgrade-label') || 'Upgrade now';

    const p =
      tone === 'urgent'
        ? {
            wrap: 'border-red-200 bg-red-50 dark:border-red-900/60 dark:bg-red-950/40',
            icon: 'bg-red-100 text-red-600 dark:bg-red-900/60 dark:text-red-300',
            title: 'text-red-900 dark:text-red-100',
            body: 'text-red-700/90 dark:text-red-200/80',
            big: 'text-red-600 dark:text-red-300',
            primary: 'bg-red-600 hover:bg-red-700 text-white',
            secondary: 'border-red-300 text-red-700 hover:bg-red-100 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-900/40',
          }
        : {
            wrap: 'border-amber-200 bg-amber-50 dark:border-amber-900/60 dark:bg-amber-950/40',
            icon: 'bg-amber-100 text-amber-600 dark:bg-amber-900/60 dark:text-amber-300',
            title: 'text-amber-900 dark:text-amber-100',
            body: 'text-amber-700/90 dark:text-amber-200/80',
            big: 'text-amber-600 dark:text-amber-300',
            primary: 'bg-amber-500 hover:bg-amber-600 text-white',
            secondary: 'border-amber-300 text-amber-700 hover:bg-amber-100 dark:border-amber-800 dark:text-amber-300 dark:hover:bg-amber-900/40',
          };

    const titleText =
      daysLeft > 0
        ? `Your free ${planName} trial expires in ${daysLeft} day${daysLeft === 1 ? '' : 's'}.`
        : `Your free ${planName} trial has expired.`;
    const subText =
      tone === 'urgent'
        ? 'Act now to keep your workspace running without interruption.'
        : 'After the trial ends, paid features below will be locked.';

    const losing = this._losing
      .map(
        (f) =>
          `<li class="flex items-start gap-1.5 text-xs ${p.body}"><span aria-hidden="true">🔒</span><span class="line-through decoration-current/60">${escapeAttribute(f)}</span></li>`,
      )
      .join('');
    const keeping = this._keeping
      .map(
        (f) =>
          `<li class="flex items-start gap-1.5 text-xs ${p.body}"><span aria-hidden="true">✅</span>${escapeAttribute(f)}</li>`,
      )
      .join('');

    this.innerHTML = `
      <div data-trial-expiry-notice class="rounded-xl border p-4 ${p.wrap}" role="alert">
        <div class="flex items-start gap-3">
          <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg ${p.icon}" aria-hidden="true">⏳</div>
          <div class="min-w-0 flex-1">
            <p data-trial-expiry-title class="text-sm font-semibold ${p.title}">${escapeAttribute(titleText)}</p>
            <p data-trial-expiry-sub class="mt-0.5 text-xs ${p.body}">${expiresOn ? `Deadline: ${escapeAttribute(expiresOn)}. ` : ''}${escapeAttribute(subText)}</p>
            <p class="mt-1 flex items-baseline gap-1">
              <span data-trial-expiry-days class="font-mono text-3xl font-bold ${p.big}">${daysLeft}</span>
              <span class="text-xs font-medium ${p.body}">days left</span>
            </p>
            ${this._losing.length ? `<ul data-trial-expiry-losing class="mt-2 space-y-1">${losing}</ul>` : ''}
            ${this._keeping.length ? `<ul data-trial-expiry-keeping class="mt-1.5 space-y-1">${keeping}</ul>` : ''}
          </div>
        </div>
        <div class="mt-3 flex flex-wrap gap-2 pl-[52px]">
          <button type="button" data-trial-expiry-upgrade class="rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors ${p.primary}">${escapeAttribute(upgradeLabel)}</button>
          <button type="button" data-trial-expiry-extend class="rounded-lg border px-3.5 py-2 text-xs font-semibold transition-colors ${p.secondary}">${escapeAttribute(extendLabel)}</button>
        </div>
      </div>`;
  }
}

export default TrialExpiryNoticeElement;

if (!customElements.get('trial-expiry-notice')) {
  customElements.define('trial-expiry-notice', TrialExpiryNoticeElement);
}
