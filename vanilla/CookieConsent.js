/**
 * CookieConsent - Vanilla Web Component
 * Usage: <cookie-consent title="…" description="…" policy-label="Privacy Policy" accept-label="Accept All" reject-label="Reject All" save-label="Confirm"></cookie-consent>
 * Properties: categories ({ id, label, description?, alwaysActive?, cookies? }[])
 * Events: confirm (detail {accepted: string[]})
 */
const escapeAttribute = (value) =>
  String(value).replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  }[char]));

export class CookieConsentElement extends HTMLElement {
  static get observedAttributes() {
    return ['title', 'description', 'policy-label', 'accept-label', 'reject-label', 'save-label'];
  }

  constructor() {
    super();
    this._categories = [];
  }

  get categories() {
    return this._categories;
  }

  set categories(value) {
    this._categories = Array.isArray(value) ? value : [];
    this.render();
  }

  connectedCallback() {
    this.render();
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
    const title = this.getAttribute('title') || 'Choose how we use your personal information';
    const description = this.getAttribute('description') || 'We use cookies to personalize content, run analytics and improve your experience.';
    const policyLabel = this.getAttribute('policy-label') || 'Privacy Policy';
    const acceptLabel = this.getAttribute('accept-label') || 'Accept All';
    const rejectLabel = this.getAttribute('reject-label') || 'Reject All';
    const saveLabel = this.getAttribute('save-label') || 'Confirm';

    const always = this._categories.filter((category) => category.alwaysActive);
    const optional = this._categories.filter((category) => !category.alwaysActive);
    const ordered = [...always, ...optional];

    this.innerHTML = `<div data-cookie-consent role="dialog" aria-label="${escapeAttribute(title)}" class="w-full max-w-lg rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
      <h2 class="text-base font-bold text-zinc-900 dark:text-zinc-50">${escapeAttribute(title)}</h2>
      <p class="mt-1.5 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">${escapeAttribute(description)} <a href="#" class="font-medium text-indigo-600 underline underline-offset-2 dark:text-indigo-400">${escapeAttribute(policyLabel)}</a></p>
      <div class="mt-4 space-y-2">
        ${ordered
          .map(
            (category) => `<details class="group rounded-lg border border-zinc-200 bg-zinc-50/60 dark:border-zinc-800 dark:bg-zinc-800/50" data-consent-category="${escapeAttribute(category.id)}">
              <summary class="flex cursor-pointer list-none items-center gap-2.5 px-3 py-2.5 text-xs font-semibold text-zinc-800 dark:text-zinc-100 [&::-webkit-details-marker]:hidden">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-3.5 w-3.5 shrink-0 text-zinc-400 transition-transform group-open:rotate-180"><path d="m6 9 6 6 6-6"/></svg>
                ${escapeAttribute(category.label)}
                <span class="ml-auto shrink-0 text-[10px] font-medium text-zinc-400">${category.alwaysActive ? 'Always Active' : ''}</span>
                ${
                  category.alwaysActive
                    ? ''
                    : `<span class="flex h-4 w-7 shrink-0 items-center rounded-full bg-indigo-600 px-0.5" data-consent-toggle aria-hidden="true">
                        <span class="ml-auto flex h-3 w-3 items-center justify-center rounded-full bg-white">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" class="h-2 w-2 text-indigo-600"><path d="m5 12 4 4L19 6"/></svg>
                        </span>
                      </span>`
                }
              </summary>
              <div class="border-t border-zinc-200 px-3 py-2.5 text-xs leading-relaxed text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
                ${escapeAttribute(category.description || 'Used to deliver core functionality.')}
                ${category.cookies?.length ? `<p class="mt-1.5 text-[10px] font-mono text-zinc-400">${escapeAttribute(category.cookies.join(', '))}</p>` : ''}
              </div>
            </details>`,
          )
          .join('')}
      </div>
      <div class="mt-4 flex items-center justify-end gap-2" data-consent-actions>
        ${rejectLabel ? `<button type="button" data-consent-reject class="rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-semibold text-zinc-600 transition-colors hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800">${escapeAttribute(rejectLabel)}</button>` : ''}
        <button type="button" data-consent-accept class="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-indigo-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500">${escapeAttribute(acceptLabel)}</button>
        ${saveLabel ? `<button type="button" data-consent-save class="rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-semibold text-zinc-600 transition-colors hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800">${escapeAttribute(saveLabel)}</button>` : ''}
      </div>
    </div>`;

    const acceptedOf = (ids) => ids;
    const emitConfirm = (accepted) => this.dispatchEvent(new CustomEvent('confirm', { detail: { accepted } }));
    const acceptBtn = this.querySelector('[data-consent-accept]');
    if (acceptBtn) acceptBtn.addEventListener('click', () => emitConfirm(acceptedOf(this._categories.map((c) => c.id))));
    const rejectBtn = this.querySelector('[data-consent-reject]');
    if (rejectBtn) rejectBtn.addEventListener('click', () => emitConfirm(acceptedOf(always.map((c) => c.id))));
    const saveBtn = this.querySelector('[data-consent-save]');
    if (saveBtn) saveBtn.addEventListener('click', () => emitConfirm(acceptedOf(always.map((c) => c.id))));
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('cookie-consent')) {
  customElements.define('cookie-consent', CookieConsentElement);
}
export default CookieConsentElement;
