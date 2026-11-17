/**
 * PermissionDeniedState - Permission-restricted empty state: lock
 * illustration slot, title/description, Request access primary CTA and an
 * optional contact-admin secondary link (permission denied pattern).
 */
const escapeAttribute = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

class PermissionDeniedStateElement extends HTMLElement {
  static get observedAttributes() {
    return ['title', 'description', 'cta-label', 'contact-label', 'contact-href'];
  }

  constructor() {
    super();
    this._title = 'You don’t have access to this page';
    this._description = 'This space is restricted. Request access and a workspace admin will review your request.';
    this._ctaLabel = 'Request access';
    this._contactLabel = 'or contact a workspace admin';
    this._contactHref = '#';
    this._onClick = this._onClick.bind(this);
  }

  connectedCallback() {
    const t = this.getAttribute('title');
    if (t) this._title = t;
    const d = this.getAttribute('description');
    if (d) this._description = d;
    const c = this.getAttribute('cta-label');
    if (c) this._ctaLabel = c;
    const cl = this.getAttribute('contact-label');
    if (cl) this._contactLabel = cl;
    const ch = this.getAttribute('contact-href');
    if (ch) this._contactHref = ch;
    this._render();
    this.addEventListener('click', this._onClick);
  }

  disconnectedCallback() {
    this.removeEventListener('click', this._onClick);
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;
    if (name === 'title') this._title = newValue || 'You don’t have access to this page';
    if (name === 'description') this._description = newValue || '';
    if (name === 'cta-label') this._ctaLabel = newValue || 'Request access';
    if (name === 'contact-label') this._contactLabel = newValue || '';
    if (name === 'contact-href') this._contactHref = newValue || '#';
    this._render();
  }

  _onClick(event) {
    if (event.target.closest('[data-denied-cta]')) {
      this.dispatchEvent(new CustomEvent('request-access', { bubbles: true }));
    }
  }

  _render() {
    // Keep any illustration/slot content provided by the host page.
    const slotted = this.querySelector('[data-denied-illustration-slot]');
    const slotHtml = slotted ? slotted.outerHTML : `<div data-denied-illustration aria-hidden="true" class="flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-100 text-3xl dark:bg-zinc-800">🔒</div>`;

    const contactHtml = this._contactLabel
      ? `<a data-denied-contact href="${escapeAttribute(this._contactHref)}" class="text-xs font-medium text-zinc-500 underline-offset-2 hover:underline dark:text-zinc-400">${escapeAttribute(this._contactLabel)}</a>`
      : '';

    this.innerHTML = `
      <div data-denied-state class="flex w-full flex-col items-center justify-center gap-4 rounded-xl border border-zinc-200 bg-white px-6 py-14 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        ${slotHtml}
        <div class="space-y-1.5">
          <p data-denied-title class="text-base font-semibold text-zinc-900 dark:text-zinc-50">${escapeAttribute(this._title)}</p>
          <p data-denied-description class="mx-auto max-w-md text-sm leading-5 text-zinc-500 dark:text-zinc-400">${escapeAttribute(this._description)}</p>
        </div>
        <button type="button" data-denied-cta class="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-violet-500">${escapeAttribute(this._ctaLabel)}</button>
        ${contactHtml}
      </div>`;
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('permission-denied-state')) {
  customElements.define('permission-denied-state', PermissionDeniedStateElement);
}

export default PermissionDeniedStateElement;
