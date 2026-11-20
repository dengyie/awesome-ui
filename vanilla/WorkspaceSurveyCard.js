import uiIcon from './UiIcon.js';

const escapeAttribute = (value) =>
  String(value).replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  }[char]));

export class WorkspaceSurveyCardElement extends HTMLElement {
  static get observedAttributes() {
    return ['questions', 'answers', 'title', 'step-label', 'next-label'];
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback() {
    this.render();
  }

  get questions() {
    if (this._questions) return this._questions;
    try {
      return JSON.parse(this.getAttribute('questions') || '[]');
    } catch {
      return [];
    }
  }

  set questions(value) {
    this._questions = Array.isArray(value) ? value : [];
    this.render();
  }

  get answers() {
    if (this._answers) return this._answers;
    try {
      return JSON.parse(this.getAttribute('answers') || '{}');
    } catch {
      return {};
    }
  }

  set answers(value) {
    this._answers = value && typeof value === 'object' ? value : {};
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

  _selectedIds(q) {
    const a = this.answers[q.id];
    if (Array.isArray(a)) return a;
    return typeof a === 'string' && a.length > 0 ? [a] : [];
  }

  render() {
    const questions = this.questions;
    const answers = this.answers;
    const title = this.getAttribute('title') || 'Tell us about your workspace';
    const stepLabel = this.getAttribute('step-label') || '';
    const nextLabel = this.getAttribute('next-label') || 'Continue';

    const answeredCount = questions.filter((q) => this._selectedIds(q).length > 0).length;
    const allAnswered = questions.length > 0 && answeredCount === questions.length;

    this._applyHostClass('block');

    const dots = questions
      .map((q) => {
        const filled = this._selectedIds(q).length > 0;
        return `<span title="${escapeAttribute(q.label)}" class="h-1.5 w-6 rounded-full transition-colors ${filled ? 'bg-indigo-600' : 'bg-zinc-200 dark:bg-zinc-700'}"></span>`;
      })
      .join('');

    const blocks = questions
      .map((q) => {
        const selected = this._selectedIds(q);
        const options = q.options
          .map((opt) => {
            const active = selected.includes(opt.id);
            return `<button type="button" data-workspace-survey-option="${escapeAttribute(opt.id)}"
              ${q.multi ? `aria-pressed="${active}"` : `aria-checked="${active}"`}
              class="rounded-full border px-3 py-1 text-[11px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                active
                  ? 'border-indigo-600 bg-indigo-600 text-white'
                  : 'border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-400'
              }">${escapeAttribute(opt.label)}</button>`;
          })
          .join('');
        return `
        <div data-workspace-survey-question="${escapeAttribute(q.id)}" class="px-5 py-4">
          <div class="text-xs font-medium text-zinc-800 dark:text-zinc-200">${escapeAttribute(q.label)}</div>
          ${q.description ? `<p class="mt-0.5 text-[11px] text-zinc-500 dark:text-zinc-400">${escapeAttribute(q.description)}</p>` : ''}
          <div data-workspace-survey-options="${escapeAttribute(q.id)}" role="${q.multi ? 'group' : 'radiogroup'}"
            aria-label="${escapeAttribute(q.label)}" class="mt-2.5 flex flex-wrap gap-1.5">${options}</div>
          ${q.placeholder ? `<input type="text" data-workspace-survey-input="${escapeAttribute(q.id)}" placeholder="${escapeAttribute(q.placeholder)}"
            class="mt-2.5 w-full rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-xs text-zinc-900 placeholder-zinc-400 focus:border-indigo-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder-zinc-500" />` : ''}
        </div>`;
      })
      .join('');

    this.innerHTML = `
      <div data-workspace-survey class="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <div class="border-b border-zinc-100 dark:border-zinc-800 px-5 py-4">
          <h4 data-workspace-survey-title class="text-sm font-semibold text-zinc-900 dark:text-zinc-50">${escapeAttribute(title)}</h4>
          ${stepLabel ? `<p data-workspace-survey-step class="mt-0.5 text-[11px] text-zinc-500 dark:text-zinc-400">${escapeAttribute(stepLabel)}</p>` : ''}
          <div data-workspace-survey-dots class="mt-3 flex items-center gap-1.5">${dots}
            <span class="ml-1 text-[11px] tabular-nums text-zinc-400 dark:text-zinc-500">${answeredCount}/${questions.length}</span>
          </div>
        </div>
        <div class="divide-y divide-zinc-100 dark:divide-zinc-800">${blocks}</div>
        <div class="border-t border-zinc-100 dark:border-zinc-800 px-5 py-3">
          <button type="button" data-workspace-survey-next ${allAnswered ? '' : 'disabled'}
            class="w-full rounded-md px-3 py-2 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
              allAnswered
                ? 'bg-indigo-600 text-white hover:bg-indigo-500'
                : 'cursor-not-allowed bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500'
            }">${escapeAttribute(nextLabel)}</button>
          ${allAnswered ? '' : `<p class="mt-1.5 text-center text-[11px] text-zinc-400 dark:text-zinc-500">Answer all ${questions.length} questions to continue.</p>`}
        </div>
      </div>`;

    this.querySelectorAll('[data-workspace-survey-option]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const container = btn.closest('[data-workspace-survey-options]');
        const q = questions.find((entry) => entry.id === container.getAttribute('data-workspace-survey-options'));
        if (q) this.dispatchEvent(new CustomEvent('answer', { detail: { questionId: q.id, optionId: btn.getAttribute('data-workspace-survey-option') } }));
      });
    });

    this.querySelectorAll('[data-workspace-survey-input]').forEach((input) => {
      input.addEventListener('input', () => {
        const qid = input.getAttribute('data-workspace-survey-input');
        this.dispatchEvent(new CustomEvent('text', { detail: { questionId: qid, text: input.value } }));
      });
    });

    const nextBtn = this.querySelector('[data-workspace-survey-next]');
    if (nextBtn && allAnswered) {
      nextBtn.addEventListener('click', () => {
        this.dispatchEvent(new CustomEvent('next', { detail: { answers } }));
      });
    }
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('workspace-survey-card')) {
  customElements.define('workspace-survey-card', WorkspaceSurveyCardElement);
}
export default WorkspaceSurveyCardElement;
