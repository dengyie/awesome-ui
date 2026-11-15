/**
 * TrialBanner - Vanilla Web Component
 * Usage: <trial-banner days-left="11" plan-name="Pro"></trial-banner>
 * Attributes: plan-name, days-left, message, cta-text, tone (indigo|amber), dismissible
 * Events: cta, dismiss
 */
const escapeAttribute = (value) =>
  String(value).replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  }[char]));

const CLOSE_SVG = '<svg viewBox="0 0 20 20" fill="none" width="12" height="12" aria-hidden="true"><path d="m5 5 10 10M15 5 5 15" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';

export class TrialBannerElement extends HTMLElement {
  static get observedAttributes() {
    return ['plan-name', 'days-left', 'message', 'cta-text', 'tone'];
  }

  constructor() {
    super();
    this._hidden = false;
    this._bound = false;
  }

  connectedCallback() {
    this.render();
    if (!this._bound) {
      this._bound = true;
      this.addEventListener('click', (event) => {
        if (event.target.closest('[data-trial-cta]')) {
          this.dispatchEvent(new CustomEvent('cta'));
        }
        if (event.target.closest('[data-trial-dismiss]')) {
          this._hidden = true;
          this.render();
          this.dispatchEvent(new CustomEvent('dismiss'));
        }
      });
    }
  }

  show() {
    this._hidden = false;
    this.render();
  }

  attributeChangedCallback() {
    if (!this._hidden) this.render();
  }

  render() {
    if (this._hidden) {
      this.innerHTML = '';
      return;
    }
    const planName = escapeAttribute(this.getAttribute('plan-name') || 'Pro');
    const daysLeft = Number(this.getAttribute('days-left')) || 0;
    const message = escapeAttribute(this.getAttribute('message') || `Your ${planName} trial ends soon — upgrade to keep ${planName} features.`);
    const ctaText = escapeAttribute(this.getAttribute('cta-text') || 'Upgrade now');
    const tone = this.getAttribute('tone') || 'indigo';
    const dismissible = this.hasAttribute('dismissible');
    const urgent = daysLeft <= 3;
    const toneClass = tone === 'amber'
      ? 'border-amber-200 bg-amber-50'
      : 'border-indigo-200 bg-indigo-50';
    const pillClass = tone === 'amber' ? 'bg-amber-500' : 'bg-indigo-600';

    this.innerHTML = `<div data-trial-banner class="flex flex-wrap items-center gap-3 rounded-lg border px-4 py-3 ${toneClass}">
  <span data-trial-days class="rounded-full px-2.5 py-1 text-xs font-bold text-white ${pillClass} ${urgent ? 'animate-pulse' : ''}">${daysLeft} ${daysLeft === 1 ? 'day' : 'days'} left</span>
  <span data-trial-message class="flex-1 text-sm text-zinc-800">${message}</span>
  <button type="button" data-trial-cta class="rounded-md bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-zinc-700">${ctaText}</button>
  ${dismissible ? `<button type="button" data-trial-dismiss title="Dismiss" class="flex h-6 w-6 items-center justify-center rounded-full text-zinc-400 hover:bg-zinc-200 hover:text-zinc-700">${CLOSE_SVG}</button>` : ''}
</div>`;
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('trial-banner')) {
  customElements.define('trial-banner', TrialBannerElement);
}

export default TrialBannerElement;
