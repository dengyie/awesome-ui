/**
 * ClarifyQuestionCard - Vanilla Web Component
 * Usage: <clarify-question question="..." title="..." index="1" total="3" answered="false"></clarify-question>
 * Attributes: question, title, value, placeholder, index, total, answered (true|false), step-label
 * Events: answer (detail {value}), prev, next
 */
const escapeAttribute = (value) =>
  String(value).replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  }[char]));

export class ClarifyQuestionCardElement extends HTMLElement {
  static get observedAttributes() {
    return ['question', 'title', 'value', 'placeholder', 'index', 'total', 'answered', 'step-label'];
  }

  constructor() {
    super();
    this._bound = false;
  }

  get value() {
    return this.getAttribute('value') || '';
  }

  set value(text) {
    this.setAttribute('value', String(text ?? ''));
  }

  get answered() {
    return this.getAttribute('answered') === 'true';
  }

  set answered(flag) {
    this.setAttribute('answered', flag ? 'true' : 'false');
  }

  connectedCallback() {
    this.render();
    if (!this._bound) {
      this._bound = true;
      this.addEventListener('click', (event) => {
        if (event.target.closest('[data-clarify-prev]')) this.dispatchEvent(new CustomEvent('prev'));
        if (event.target.closest('[data-clarify-next]')) this.dispatchEvent(new CustomEvent('next'));
      });
      this.addEventListener('keydown', (event) => {
        const input = event.target.closest('[data-clarify-input]');
        if (input && event.key === 'Enter') {
          this.dispatchEvent(new CustomEvent('answer', { detail: { value: input.value } }));
        }
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
    const question = this.getAttribute('question') || '';
    const title = this.getAttribute('title') || '';
    const value = this.getAttribute('value') || '';
    const placeholder = this.getAttribute('placeholder') || 'Type your answer…';
    const index = Number(this.getAttribute('index')) || 1;
    const total = Number(this.getAttribute('total')) || 1;
    const answered = this.answered;
    const stepLabel = this.getAttribute('step-label') || 'Used ask user question';

    this.innerHTML = `<div data-clarify-card class="w-full rounded-lg border border-indigo-300 bg-white p-3 dark:border-indigo-500/60 dark:bg-zinc-900">
      <div class="flex items-start gap-2.5">
        <span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-xs font-bold text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-300">?</span>
        <div class="min-w-0 flex-1">
          <p class="text-sm font-bold text-zinc-900 dark:text-zinc-50">${escapeAttribute(title || question)}</p>
          ${title ? `<p class="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">${escapeAttribute(question)}</p>` : ''}
        </div>
        ${
          total > 1
            ? `<span data-clarify-paging class="flex shrink-0 items-center gap-1 text-[11px] font-medium text-indigo-500 dark:text-indigo-400">
                <button type="button" data-clarify-prev aria-label="Previous question" class="rounded px-1 transition-colors hover:bg-indigo-50 dark:hover:bg-indigo-950/60">‹</button>
                ${index} of ${total}
                <button type="button" data-clarify-next aria-label="Next question" class="rounded px-1 transition-colors hover:bg-indigo-50 dark:hover:bg-indigo-950/60">›</button>
              </span>`
            : ''
        }
      </div>
      ${
        answered
          ? `<p data-clarify-value class="mt-2.5 rounded-md bg-zinc-100 px-3 py-2 text-xs text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">${escapeAttribute(value || '—')}</p>`
          : `<input type="text" value="${escapeAttribute(value)}" placeholder="${escapeAttribute(placeholder)}" data-clarify-input class="mt-2.5 w-full rounded-md bg-zinc-100 px-3 py-2 text-xs text-zinc-900 placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:bg-zinc-800 dark:text-zinc-50" />`
      }
      <p data-clarify-step class="mt-2 flex items-center gap-1.5 text-[11px] text-zinc-400 dark:text-zinc-500">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-3 w-3 text-emerald-500"><path d="m5 12 4 4L19 6" /></svg>
        ${escapeAttribute(stepLabel)}
      </p>
    </div>`;
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('clarify-question')) {
  customElements.define('clarify-question', ClarifyQuestionCardElement);
}
export default ClarifyQuestionCardElement;
