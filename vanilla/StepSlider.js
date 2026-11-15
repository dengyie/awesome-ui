/**
 * StepSlider - Vanilla Web Component
 * Usage: <step-slider label="Workflow credits" value="1" highlight-from="2" steps="+0k,+1k,+5k,+10k"></step-slider>
 * Attributes: steps (comma-separated), value (0-based index), highlight-from, label, disabled
 * Events: change (detail: { index, step })
 */
const escapeAttribute = (value) =>
  String(value).replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  }[char]));

export class StepSliderElement extends HTMLElement {
  static get observedAttributes() {
    return ['steps', 'value', 'highlight-from', 'label', 'disabled'];
  }

  get steps() {
    return (this.getAttribute('steps') || '').split(',').map((s) => s.trim()).filter(Boolean);
  }

  get value() {
    const raw = this.getAttribute('value');
    if (raw === null) return 0;
    const num = Number(raw);
    return Number.isFinite(num) ? Math.min(Math.max(Math.floor(num), 0), this.steps.length - 1) : 0;
  }

  set value(index) {
    this.setAttribute('value', String(index));
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
    this._applyHostClass('block w-full');
    const steps = this.steps;
    const value = this.value;
    const label = this.getAttribute('label') || '';
    const disabled = this.hasAttribute('disabled');
    const lastIndex = steps.length - 1;
    const ratio = steps.length > 1 ? value / lastIndex : 0;
    const highlightRaw = this.getAttribute('highlight-from');
    const highlightFrom = highlightRaw === null ? steps.length : Number(highlightRaw) || 0;

    const stops = steps
      .map((step, index) => {
        const reached = index <= value;
        const highlighted = index >= highlightFrom;
        return `<button type="button" data-step-index="${index}" ${disabled ? 'disabled' : ''} aria-label="${escapeAttribute(step)}" aria-pressed="${index === value}"
          class="relative z-10 flex flex-1 flex-col items-center focus-visible:outline-none">
          <span class="h-3 w-3 rounded-full border-2 transition-colors ${
            reached
              ? 'border-indigo-600 bg-indigo-600'
              : highlighted
                ? 'border-indigo-300 bg-white dark:border-indigo-700 dark:bg-zinc-900'
                : 'border-zinc-300 bg-white dark:border-zinc-600 dark:bg-zinc-900'
          } ${disabled ? 'opacity-50' : ''}"></span>
          <span class="mt-1.5 whitespace-nowrap font-mono text-[10px] ${index === value ? 'font-semibold text-indigo-600 dark:text-indigo-400' : 'text-zinc-400'}">${escapeAttribute(step)}</span>
        </button>`;
      })
      .join('');

    this.innerHTML = `<div class="w-full">
      ${label ? `<p class="mb-2 text-xs font-medium text-zinc-800 dark:text-zinc-200">${escapeAttribute(label)}</p>` : ''}
      <div role="slider" tabindex="${disabled ? -1 : 0}" aria-label="${escapeAttribute(label || 'Step slider')}"
        aria-valuemin="0" aria-valuemax="${lastIndex}" aria-valuenow="${value}" aria-valuetext="${escapeAttribute(steps[value] || '')}"
        ${disabled ? 'aria-disabled="true"' : ''}
        data-slider-track class="group relative flex cursor-pointer items-center pb-1 focus-visible:outline-none">
        <span aria-hidden="true" class="absolute left-0 right-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-zinc-200 dark:bg-zinc-700"></span>
        <span aria-hidden="true" class="absolute left-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-indigo-600 transition-[width] duration-150" style="width:${ratio * 100}%"></span>
        ${stops}
      </div>
    </div>`;

    const track = this.querySelector('[data-slider-track]');
    if (track && !disabled) {
      track.addEventListener('keydown', (event) => {
        if (event.key === 'ArrowRight' && value < lastIndex) this.value = value + 1;
        else if (event.key === 'ArrowLeft' && value > 0) this.value = value - 1;
        else if (event.key === 'Home') this.value = 0;
        else if (event.key === 'End') this.value = lastIndex;
        else return;
        const current = this.steps[this.value];
        this.dispatchEvent(new CustomEvent('change', { detail: { index: this.value, step: current } }));
      });
    }
    this.querySelectorAll('[data-step-index]').forEach((button) => {
      button.addEventListener('click', () => {
        if (disabled) return;
        const index = Number(button.getAttribute('data-step-index'));
        this.value = index;
        this.dispatchEvent(new CustomEvent('change', { detail: { index, step: this.steps[index] } }));
      });
    });
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('step-slider')) {
  customElements.define('step-slider', StepSliderElement);
}
export default StepSliderElement;
