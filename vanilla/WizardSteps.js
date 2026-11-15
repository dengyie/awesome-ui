/**
 * WizardSteps - Vanilla Web Component
 * Usage: <wizard-steps current="1" variant="vertical"></wizard-steps> with `steps` property
 * Attributes: current, variant (vertical|bar), next-label
 * Properties: steps ({ label, hint?, optional? }[])
 * Events: step-click (detail: { index, step })
 */
import uiIcon from './UiIcon.js';

const escapeAttribute = (value) =>
  String(value).replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  }[char]));

export class WizardStepsElement extends HTMLElement {
  static get observedAttributes() {
    return ['current', 'variant', 'next-label'];
  }

  constructor() {
    super();
    this._steps = [];
  }

  get steps() {
    return this._steps;
  }

  set steps(value) {
    this._steps = Array.isArray(value) ? value : [];
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
    const current = this.current;
    const total = steps.length;
    const variant = this.getAttribute('variant') || 'vertical';
    const nextLabel = this.getAttribute('next-label') || '';
    const interactive = true;

    if (variant === 'bar') {
      const progress = total ? Math.round(((current + 1) / total) * 100) : 0;
      const nextStep = steps[current + 1];
      this.innerHTML = `<div data-wizard-steps role="group" aria-label="Wizard progress" class="flex flex-col gap-2">
        <p class="flex flex-wrap items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400">
          <span class="font-semibold text-zinc-900 dark:text-zinc-50">${current + 1} of ${total} steps</span>
          ${nextStep ? `<span aria-hidden="true" class="text-zinc-300 dark:text-zinc-700">|</span><span>Next: ${escapeAttribute(nextStep.label)}</span>` : ''}
        </p>
        <div role="progressbar" aria-valuemin="0" aria-valuemax="${total}" aria-valuenow="${current + 1}" class="h-2 overflow-hidden rounded-full bg-violet-100 dark:bg-violet-950/50">
          <div class="h-full rounded-full bg-violet-600 transition-all duration-300" style="width:${progress}%"></div>
        </div>
      </div>`;
      return;
    }

    this.innerHTML = `<ol data-wizard-steps class="flex flex-col">
      ${steps
        .map((step, index) => {
          const state = index < current ? 'done' : index === current ? 'active' : 'todo';
          const isLast = index === total - 1;
          return `<li class="relative flex gap-3 pb-4 ${isLast ? 'last:pb-0' : ''}">
            ${
              !isLast
                ? `<span aria-hidden="true" class="absolute left-[13px] top-7 bottom-0 w-px ${
                    index < current ? 'bg-emerald-500' : 'bg-zinc-200 dark:bg-zinc-700'
                  }"></span>`
                : ''
            }
            <button type="button" data-step-index="${index}" ${index === current ? 'aria-current="step"' : ''} ${
              interactive && index <= current ? '' : 'disabled'
            }
              class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-[11px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                state === 'done'
                  ? 'border-emerald-500 bg-emerald-500 text-white'
                  : state === 'active'
                    ? 'border-zinc-900 bg-zinc-900 text-white dark:border-zinc-50 dark:bg-zinc-50 dark:text-zinc-900'
                    : 'border-zinc-300 bg-white text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400'
              } ${interactive && index <= current ? 'cursor-pointer' : 'cursor-default'}">
              ${state === 'done' ? uiIcon('check', { size: 13 }) : index + 1}
            </button>
            <span class="min-w-0 pt-1">
              <span class="block truncate text-sm font-medium ${
                state === 'active'
                  ? 'text-zinc-900 dark:text-zinc-50'
                  : state === 'done'
                    ? 'text-zinc-700 dark:text-zinc-300'
                    : 'text-zinc-500 dark:text-zinc-400'
              }">
                ${escapeAttribute(step.label)}${step.optional ? '<span class="ml-1.5 text-xs font-normal text-zinc-400">(Optional)</span>' : ''}
              </span>
              ${step.hint ? `<span class="mt-0.5 block truncate text-xs text-zinc-400">${escapeAttribute(step.hint)}</span>` : ''}
            </span>
          </li>`;
        })
        .join('')}
      ${nextLabel ? `<li class="pt-1 pl-10 text-xs text-zinc-400">${escapeAttribute(nextLabel)}</li>` : ''}
    </ol>`;

    this.querySelectorAll('[data-step-index]').forEach((button) => {
      button.addEventListener('click', () => {
        const index = Number(button.getAttribute('data-step-index'));
        if (index > current) return;
        if (typeof this.onStepClick === 'function') this.onStepClick(index, this._steps[index]);
        this.dispatchEvent(new CustomEvent('step-click', { detail: { index, step: this._steps[index] } }));
      });
    });
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('wizard-steps')) {
  customElements.define('wizard-steps', WizardStepsElement);
}
export default WizardStepsElement;
