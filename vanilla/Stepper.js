import uiIcon from './UiIcon.js';

const escapeAttribute = (value) =>
  String(value).replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  }[char]));

const CIRCLE = {
  complete: { cls: 'bg-indigo-600 text-white', icon: 'check' },
  current: { cls: 'border-2 border-indigo-600 text-indigo-600 dark:text-indigo-400', icon: null },
  upcoming: { cls: 'border border-zinc-300 text-zinc-400 dark:border-zinc-700', icon: null },
  error: { cls: 'bg-rose-500 text-white', icon: 'x' },
};

/**
 * Stepper - Vanilla Web Component
 * Usage: <step-flow current="2"></step-flow>
 * Properties: steps ({ id, label, description?, status? }[])
 * Attributes: current (1-based), static (disables click events)
 * Events: step-click (detail: { step, index })
 */
export class StepperElement extends HTMLElement {
  static get observedAttributes() {
    return ['current', 'static'];
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
    const value = Number(this.getAttribute('current'));
    return Number.isFinite(value) && value > 0 ? Math.floor(value) : 1;
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

  _statusFor(step, index) {
    if (step.status) return step.status;
    const current = this.current;
    return index + 1 < current ? 'complete' : index + 1 === current ? 'current' : 'upcoming';
  }

  render() {
    this._applyHostClass('flex items-start');
    const interactive = !this.hasAttribute('static');

    const items = this._steps
      .map((step, index) => {
        const status = this._statusFor(step, index);
        const styles = CIRCLE[status] || CIRCLE.upcoming;
        const last = index === this._steps.length - 1;
        const clickable = interactive && status !== 'upcoming';
        const circle = `<button type="button" data-step-index="${index}" ${clickable ? '' : 'disabled'}
          ${status === 'current' ? 'aria-current="step"' : ''}
          class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:cursor-default ${styles.cls}">
          ${styles.icon ? uiIcon(styles.icon, { size: 12 }) : index + 1}
        </button>`;
        const connector = last
          ? ''
          : `<span aria-hidden="true" class="mt-3.5 h-0.5 flex-1 rounded mr-2 ml-2 ${status === 'complete' ? 'bg-indigo-600' : 'bg-zinc-200 dark:bg-zinc-800'}"></span>`;
        return `<li class="flex min-w-0 ${last ? 'flex-none' : 'flex-1'}">
          <div class="flex flex-col items-center gap-1.5 text-center">${circle}
            <div class="max-w-28">
              <p class="text-[11px] font-medium leading-tight ${status === 'upcoming' ? 'text-zinc-400 dark:text-zinc-500' : 'text-zinc-800 dark:text-zinc-100'}">${escapeAttribute(step.label)}</p>
              ${step.description ? `<p class="mt-0.5 text-[10px] leading-tight text-zinc-400 dark:text-zinc-500">${escapeAttribute(step.description)}</p>` : ''}
            </div>
          </div>${connector}
        </li>`;
      })
      .join('');

    this.innerHTML = `<ol class="flex items-start">${items}</ol>`;

    if (interactive) {
      this.querySelectorAll('[data-step-index]').forEach((node) => {
        node.addEventListener('click', () => {
          if (node.disabled) return;
          const index = Number(node.getAttribute('data-step-index'));
          this.dispatchEvent(new CustomEvent('step-click', { detail: { step: this._steps[index], index } }));
        });
      });
    }
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('step-flow')) {
  customElements.define('step-flow', StepperElement);
}
export default StepperElement;
