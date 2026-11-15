/**
 * TourTooltip - Vanilla Web Component
 * Usage: <tour-tooltip step="1" total-steps="4" title="…" body="…" theme="light|dark" caret="top|bottom|none" feedback></tour-tooltip>
 * Attributes: step, total-steps, title, body, theme, caret, feedback
 * Events: prev, next, dismiss, feedback (detail {helpful})
 */
const escapeAttribute = (value) =>
  String(value).replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  }[char]));

export class TourTooltipElement extends HTMLElement {
  static get observedAttributes() {
    return ['step', 'total-steps', 'title', 'body', 'theme', 'caret', 'feedback'];
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
    const step = Number(this.getAttribute('step')) || 1;
    const totalSteps = Number(this.getAttribute('total-steps')) || 1;
    const title = this.getAttribute('title') || '';
    const body = this.getAttribute('body') || '';
    const dark = this.getAttribute('theme') === 'dark';
    const caret = this.getAttribute('caret') || 'top';
    const feedback = this.hasAttribute('feedback');

    const caretClass =
      caret === 'top'
        ? 'before:absolute before:-top-1.5 before:left-8 before:h-3 before:w-3 before:rotate-45 before:rounded-[2px] before:border-l before:border-t'
        : caret === 'bottom'
          ? 'after:absolute after:-bottom-1.5 after:left-8 after:h-3 after:w-3 after:rotate-45 after:rounded-[2px] after:border-r after:border-b'
          : '';
    const caretBorder = dark ? 'before:border-zinc-700 after:border-zinc-700' : 'before:border-zinc-200 after:border-zinc-200';
    const caretBg = dark ? 'before:bg-zinc-900 after:bg-zinc-900' : 'before:bg-white after:bg-white';
    const borderTone = dark ? 'border-zinc-700' : 'border-zinc-200';
    const surface = dark ? 'bg-zinc-900 text-zinc-50 border-zinc-700' : 'bg-white text-zinc-900 border-zinc-200';
    const bodyTone = dark ? 'text-zinc-300' : 'text-zinc-500';

    this.innerHTML = `<div data-tour-tooltip role="dialog" aria-label="${escapeAttribute(title)}"
      class="relative w-80 rounded-xl border p-4 shadow-xl ${surface} ${caretClass} ${caretBorder} ${caretBg}">
      <div class="flex items-start justify-between gap-3">
        <p class="text-[11px] font-semibold uppercase tracking-wide text-zinc-400">Step ${step} of ${totalSteps}</p>
        <button type="button" data-tour-dismiss aria-label="Dismiss" class="rounded-md p-0.5 transition-colors ${dark ? 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200' : 'text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600'}">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-4 w-4"><path d="M18 6 6 18M6 6l12 12"/></svg>
        </button>
      </div>
      <p class="mt-2 text-sm font-bold leading-snug">${escapeAttribute(title)}</p>
      <p class="mt-1.5 text-xs leading-relaxed ${bodyTone}">${escapeAttribute(body)}</p>
      <div class="mt-4 flex items-center justify-between border-t pt-3 ${borderTone}">
        ${
          feedback
            ? `<div class="flex items-center gap-1.5">
                <span class="text-[11px] ${dark ? 'text-zinc-400' : 'text-zinc-500'}">Was this helpful?</span>
                <button type="button" data-tour-feedback-up aria-label="Yes" class="rounded-md border px-1.5 py-0.5 text-xs transition-colors ${dark ? 'border-zinc-600 hover:bg-zinc-800' : 'border-zinc-300 hover:bg-zinc-50'}">👍</button>
                <button type="button" data-tour-feedback-down aria-label="No" class="rounded-md border px-1.5 py-0.5 text-xs transition-colors ${dark ? 'border-zinc-600 hover:bg-zinc-800' : 'border-zinc-300 hover:bg-zinc-50'}">👎</button>
              </div>`
            : `<span class="text-[11px] ${dark ? 'text-zinc-400' : 'text-zinc-400'}">${step}/${totalSteps}</span>`
        }
        <div class="flex items-center gap-2">
          ${step > 1 ? `<button type="button" data-tour-prev class="text-xs font-medium transition-colors ${dark ? 'text-zinc-300 hover:text-white' : 'text-zinc-600 hover:text-zinc-900'}">Previous</button>` : ''}
          <button type="button" data-tour-next class="rounded-lg px-3 py-1.5 text-xs font-semibold text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
            step >= totalSteps ? 'bg-indigo-600 hover:bg-indigo-500' : 'bg-zinc-900 hover:bg-zinc-700 dark:bg-indigo-600 dark:hover:bg-indigo-500'
          }">${step >= totalSteps ? 'Finish tour' : 'Next'}</button>
        </div>
      </div>
    </div>`;

    const on = (selector, eventName, detail) => {
      const node = this.querySelector(selector);
      if (node) node.addEventListener('click', () => this.dispatchEvent(new CustomEvent(eventName, detail ? { detail } : undefined)));
    };
    on('[data-tour-dismiss]', 'dismiss');
    on('[data-tour-prev]', 'prev');
    on('[data-tour-next]', 'next');
    on('[data-tour-feedback-up]', 'feedback', { helpful: true });
    on('[data-tour-feedback-down]', 'feedback', { helpful: false });
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('tour-tooltip')) {
  customElements.define('tour-tooltip', TourTooltipElement);
}
export default TourTooltipElement;
