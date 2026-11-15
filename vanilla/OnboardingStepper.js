/**
 * OnboardingStepper - Vanilla Web Component
 * Usage: <onboarding-stepper current="1" title="Transaction types" continue-label="Continue"></onboarding-stepper> with `steps` and `segments` properties
 * Attributes: current, title, continue-label
 * Properties: steps (string[]), segments ({ label, description, examples? }[])
 * Events: step-click (detail {index}), continue
 */
const escapeAttribute = (value) =>
  String(value).replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  }[char]));

export class OnboardingStepperElement extends HTMLElement {
  static get observedAttributes() {
    return ['current', 'title', 'continue-label'];
  }

  constructor() {
    super();
    this._steps = [];
    this._segments = [];
    this._activeSegment = 0;
  }

  get steps() {
    return this._steps;
  }

  set steps(value) {
    this._steps = Array.isArray(value) ? value.map(String) : [];
    this.render();
  }

  get segments() {
    return this._segments;
  }

  set segments(value) {
    this._segments = Array.isArray(value) ? value : [];
    this._activeSegment = 0;
    this.render();
  }

  get current() {
    return Number(this.getAttribute('current')) || 0;
  }

  set current(index) {
    this.setAttribute('current', String(index));
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
    const steps = this._steps;
    const segments = this._segments;
    const total = steps.length;
    const active = Math.min(Math.max(this.current, 0), Math.max(total - 1, 0));
    const title = this.getAttribute('title') || 'Transaction types';
    const continueLabel = this.getAttribute('continue-label') || 'Continue';
    const segment = segments[Math.min(this._activeSegment, Math.max(segments.length - 1, 0))];

    const stepHtml = steps
      .map((step, index) => {
        const done = index < active;
        const isCurrent = index === active;
        return `<li class="flex items-center gap-1.5">
          ${index > 0 ? '<span aria-hidden="true" class="text-zinc-300 dark:text-zinc-700">&gt;</span>' : ''}
          <button type="button" data-step-index="${index}" ${isCurrent ? 'aria-current="step"' : ''}
            class="rounded-md px-2 py-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
              isCurrent
                ? 'border-b-2 border-indigo-500 font-semibold text-zinc-900 dark:text-zinc-50'
                : done
                  ? 'text-zinc-500 dark:text-zinc-400'
                  : 'text-zinc-400'
            }">${escapeAttribute(step)}</button>
        </li>`;
      })
      .join('');

    const segmentHtml = segments.length
      ? `<div class="mt-4">
          <p class="text-sm font-semibold text-zinc-900 dark:text-zinc-50">${escapeAttribute(title)}</p>
          <div role="tablist" aria-label="${escapeAttribute(title)}" class="mt-2 inline-flex rounded-lg bg-zinc-100 p-1 dark:bg-zinc-800">
            ${segments
              .map(
                (seg, index) => `<button type="button" role="tab" aria-selected="${index === this._activeSegment}" data-segment-index="${index}"
                  class="rounded-md px-3 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                    index === this._activeSegment
                      ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-900 dark:text-zinc-50'
                      : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200'
                  }">${escapeAttribute(seg.label)}</button>`,
              )
              .join('')}
          </div>
          ${
            segment
              ? `<div data-segment-description class="mt-3 rounded-lg border border-zinc-200 p-3 dark:border-zinc-800">
                  <p class="text-xs leading-relaxed text-zinc-600 dark:text-zinc-300">${escapeAttribute(segment.description)}</p>
                  ${
                    segment.examples?.length
                      ? `<ul class="mt-3 space-y-2">${segment.examples
                          .map(
                            (example, index) => `<li class="flex items-center justify-between gap-3 text-xs">
                              <span class="flex min-w-0 items-center gap-2 text-zinc-700 dark:text-zinc-200">
                                <span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-[10px] font-bold text-zinc-500 dark:bg-zinc-800 dark:text-zinc-300">${index + 1}</span>
                                <span class="truncate">${escapeAttribute(example.label)}</span>
                              </span>
                              <span class="shrink-0 font-medium tabular-nums text-zinc-900 dark:text-zinc-50">${escapeAttribute(example.value)}</span>
                            </li>`,
                          )
                          .join('')}</ul>`
                      : ''
                  }
                </div>`
              : ''
          }
        </div>`
      : '';

    this.innerHTML = `<div data-onboarding-stepper class="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
      <ol class="flex flex-wrap items-center gap-1.5 text-xs" aria-label="Setup steps">${stepHtml}</ol>
      <div class="mt-2 h-1 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
        <div data-stepper-progress class="h-full rounded-full bg-indigo-500 transition-all duration-300" style="width:${((active + 1) / total) * 100}%"></div>
      </div>
      ${segmentHtml}
      <button type="button" data-stepper-continue class="mt-5 w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500">${escapeAttribute(continueLabel)}</button>
    </div>`;

    this.querySelectorAll('[data-step-index]').forEach((button) => {
      button.addEventListener('click', () => {
        const index = Number(button.getAttribute('data-step-index'));
        if (typeof this.onStepClick === 'function') this.onStepClick(index);
        this.dispatchEvent(new CustomEvent('step-click', { detail: { index } }));
      });
    });
    this.querySelectorAll('[data-segment-index]').forEach((button) => {
      button.addEventListener('click', () => {
        this._activeSegment = Number(button.getAttribute('data-segment-index'));
        this.render();
      });
    });
    const continueBtn = this.querySelector('[data-stepper-continue]');
    if (continueBtn) {
      continueBtn.addEventListener('click', () => {
        if (typeof this.onContinue === 'function') this.onContinue();
        this.dispatchEvent(new CustomEvent('continue'));
      });
    }
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('onboarding-stepper')) {
  customElements.define('onboarding-stepper', OnboardingStepperElement);
}
export default OnboardingStepperElement;
