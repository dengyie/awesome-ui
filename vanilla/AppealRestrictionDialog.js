/**
 * AppealRestrictionDialog - Vanilla Web Component
 * Usage: <appeal-restriction-dialog reason-title="..." reason-detail="..."></appeal-restriction-dialog>
 * Attributes: open, reason-title, reason-detail, policy-label, appeal-label, back-label
 * Events: appeal, close, back
 */
const escapeAttribute = (value) =>
  String(value).replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  }[char]));

export class AppealRestrictionDialogElement extends HTMLElement {
  static get observedAttributes() {
    return ['open', 'reason-title', 'reason-detail', 'policy-label', 'appeal-label', 'back-label'];
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
        if (event.target.closest('[data-appeal-submit]')) {
          this.dispatchEvent(new CustomEvent('appeal'));
        } else if (event.target.closest('[data-appeal-close]')) {
          this.dispatchEvent(new CustomEvent('close'));
        } else if (event.target.closest('[data-appeal-back]')) {
          this.dispatchEvent(new CustomEvent('back'));
        }
      });
    }
  }

  attributeChangedCallback() {
    if (this._bound === false && this.innerHTML === '') return;
    this.render();
  }

  render() {
    if (this.getAttribute('open') === 'false') {
      this.innerHTML = '';
      return;
    }
    const reasonTitle = escapeAttribute(this.getAttribute('reason-title') || 'Unsafe Conduct');
    const reasonDetail = escapeAttribute(
      this.getAttribute('reason-detail') ||
        'This content contains depictions, instructions for, or explanations of dangerous stunts by non-professionals.'
    );
    const policyLabel = escapeAttribute(this.getAttribute('policy-label') || 'Content Policy');
    const appealLabel = escapeAttribute(this.getAttribute('appeal-label') || 'Appeal');
    const backLabel = escapeAttribute(this.getAttribute('back-label') || 'Request another review');

    this.innerHTML = `<div data-appeal-dialog role="dialog" aria-label="Request another review" class="w-full max-w-md overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
  <div class="flex items-center justify-between px-5 pt-4">
    <button type="button" data-appeal-back aria-label="Go back" class="rounded p-1 text-zinc-500 transition-colors hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800">←</button>
    <button type="button" data-appeal-close aria-label="Close" class="rounded p-1 text-zinc-500 transition-colors hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800">✕</button>
  </div>
  <div class="px-5 pb-5 pt-2">
    <h3 data-appeal-title class="text-lg font-bold text-zinc-900 dark:text-zinc-50">${backLabel}</h3>
    <p class="mt-1 text-xs text-zinc-500 dark:text-zinc-400">If you disagree with the content restriction, you have 180 days to appeal.</p>
    <div data-appeal-reason class="mt-4 rounded-lg bg-zinc-50 px-4 py-3 dark:bg-zinc-800/60">
      <span class="text-xs font-bold text-zinc-900 dark:text-zinc-50">Reason</span>
      <p data-appeal-reason-title class="mt-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-200">${reasonTitle}</p>
      <p data-appeal-reason-detail class="mt-1 text-[11px] leading-relaxed text-zinc-500 dark:text-zinc-400">${reasonDetail}</p>
    </div>
    <div class="mt-4 flex items-center justify-between">
      <p class="text-xs text-zinc-500 dark:text-zinc-400">Read our <a href="#" class="font-semibold text-zinc-800 underline dark:text-zinc-200">${policyLabel}</a></p>
      <button type="button" data-appeal-submit class="rounded-md bg-rose-500 px-4 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-rose-400">${appealLabel}</button>
    </div>
  </div>
</div>`;
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('appeal-restriction-dialog')) {
  customElements.define('appeal-restriction-dialog', AppealRestrictionDialogElement);
}

export default AppealRestrictionDialogElement;
