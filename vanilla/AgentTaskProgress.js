/**
 * AgentTaskProgress - Vanilla Web Component
 * Usage: <agent-task-progress title="..." steps='[{"label":"...","state":"done"}]'></agent-task-progress>
 * Attributes: title, context-label, context-text, hint, refine-label, next-label, feedback-label
 * Properties: steps (Array<{label, state: done|active|pending, substeps?}>)
 * Events: refine, next
 */
const escapeAttribute = (value) =>
  String(value).replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  }[char]));

export class AgentTaskProgressElement extends HTMLElement {
  static get observedAttributes() {
    return ['title', 'context-label', 'context-text', 'hint', 'refine-label', 'next-label', 'feedback-label'];
  }

  constructor() {
    super();
    this._steps = [];
    this._bound = false;
  }

  get steps() {
    return this._steps;
  }

  set steps(list) {
    this._steps = Array.isArray(list) ? list : [];
    this.render();
  }

  connectedCallback() {
    if (!this._steps.length) {
      const raw = this.getAttribute('steps');
      if (raw) {
        try {
          this._steps = JSON.parse(raw);
        } catch {
          this._steps = [];
        }
      }
    }
    this.render();
    if (!this._bound) {
      this._bound = true;
      this.addEventListener('click', (event) => {
        if (event.target.closest('[data-task-refine]')) this.dispatchEvent(new CustomEvent('refine'));
        if (event.target.closest('[data-task-next]')) this.dispatchEvent(new CustomEvent('next'));
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
    const title = this.getAttribute('title') || '';
    const contextLabel = this.getAttribute('context-label') || '';
    const contextText = this.getAttribute('context-text') || '';
    const hint = this.getAttribute('hint') || 'This may take a few minutes, you can come back later.';
    const refineLabel = this.getAttribute('refine-label') || 'Refine';
    const nextLabel = this.getAttribute('next-label') || 'Next';
    const feedbackLabel = this.getAttribute('feedback-label') || 'Send feedback';
    const steps = Array.isArray(this._steps) ? this._steps : [];

    const iconFor = (state) => {
      if (state === 'done') return '<svg viewBox="0 0 24 24" fill="currentColor" class="h-3.5 w-3.5 shrink-0 text-zinc-900 dark:text-zinc-50"><path d="M8 5v14l11-7z" /></svg>';
      if (state === 'active') return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-3.5 w-3.5 shrink-0 animate-spin text-indigo-500"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>';
      return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-3.5 w-3.5 shrink-0 text-zinc-400"><path d="m9 18 6-6-6-6" /></svg>';
    };

    this.innerHTML = `<div data-agent-task-progress class="w-full rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      ${title ? `<p class="text-sm font-bold text-zinc-900 dark:text-zinc-50">${escapeAttribute(title)}</p>` : ''}
      ${
        contextText
          ? `<div class="mt-2 rounded-lg bg-zinc-100 px-3 py-2 dark:bg-zinc-800">
              ${contextLabel ? `<p class="text-[10px] font-medium uppercase tracking-wide text-zinc-400">${escapeAttribute(contextLabel)}</p>` : ''}
              <p class="text-xs font-medium text-zinc-800 dark:text-zinc-100">${escapeAttribute(contextText)}</p>
            </div>`
          : ''
      }
      ${hint ? `<p class="mt-2 text-[11px] text-zinc-500 dark:text-zinc-400">${escapeAttribute(hint)}</p>` : ''}
      <ul class="mt-3 space-y-2">
        ${steps
          .map(
            (step, index) => `<li data-task-step="${index}" data-task-state="${escapeAttribute(step.state)}" class="rounded-lg border border-zinc-200 p-3 dark:border-zinc-700">
              <div class="flex items-center gap-2 text-xs font-semibold text-zinc-800 dark:text-zinc-100">${iconFor(step.state)}${escapeAttribute(step.label)}</div>
              ${
                step.state === 'active' && Array.isArray(step.substeps) && step.substeps.length
                  ? `<ul data-task-substeps class="mt-2 space-y-1 border-l-2 border-zinc-200 pl-3 dark:border-zinc-700">
                      ${step.substeps.map((sub) => `<li class="text-[11px] text-zinc-500 dark:text-zinc-400">${escapeAttribute(sub)}</li>`).join('')}
                    </ul>`
                  : ''
              }
            </li>`,
          )
          .join('')}
      </ul>
      <div class="mt-4 flex items-center justify-between border-t border-zinc-200 pt-3 dark:border-zinc-800">
        <a href="#" data-task-feedback class="text-[11px] text-zinc-500 underline underline-offset-2 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200">${escapeAttribute(feedbackLabel)}</a>
        <div class="flex items-center gap-2">
          <button type="button" data-task-refine class="rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-semibold text-zinc-600 transition-colors hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800">${escapeAttribute(refineLabel)}</button>
          <button type="button" data-task-next class="rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-white">${escapeAttribute(nextLabel)}</button>
        </div>
      </div>
    </div>`;
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('agent-task-progress')) {
  customElements.define('agent-task-progress', AgentTaskProgressElement);
}
export default AgentTaskProgressElement;
