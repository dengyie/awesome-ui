import uiIcon from './UiIcon.js';

const escapeAttribute = (value) =>
  String(value).replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  }[char]));

/**
 * ToggleSwitch - Vanilla Web Component
 * Usage: <toggle-switch label="Email alerts" description="…" checked></toggle-switch>
 * Properties: checked
 * Attributes: label, description, checked, disabled, size (sm|md)
 * Events: change (detail: { checked })
 */
export class ToggleSwitchElement extends HTMLElement {
  static get observedAttributes() {
    return ['label', 'description', 'checked', 'disabled', 'size'];
  }

  constructor() {
    super();
    this._checked = null;
  }

  get checked() {
    if (this._checked !== null) return this._checked;
    return this.hasAttribute('checked');
  }

  set checked(value) {
    this._checked = Boolean(value);
    this.render();
  }

  get size() {
    return this.getAttribute('size') === 'sm' ? 'sm' : 'md';
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

  _control() {
    const checked = this.checked;
    const track = this.size === 'sm' ? 'h-4 w-8' : 'h-5 w-9';
    const knob = this.size === 'sm' ? 'h-3 w-3' : 'h-4 w-4';
    const shift = checked ? 'translate-x-4' : 'translate-x-0.5';
    return `<button type="button" role="switch" aria-checked="${checked}" aria-label="${escapeAttribute(this.getAttribute('label') || '')}"
      ${this.hasAttribute('disabled') ? 'disabled' : ''}
      data-toggle-control
      class="relative inline-flex shrink-0 items-center rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-zinc-900 disabled:cursor-not-allowed disabled:opacity-40 ${
        checked ? 'bg-indigo-600' : 'bg-zinc-300 dark:bg-zinc-700'
      } ${track}">
      <span class="inline-block transform rounded-full bg-white shadow transition-transform duration-200 ${shift} ${knob}"></span>
    </button>`;
  }

  render() {
    const label = this.getAttribute('label');
    const description = this.getAttribute('description');
    const disabled = this.hasAttribute('disabled');

    if (!label && !description) {
      this._applyHostClass('inline-flex');
      this.innerHTML = this._control();
    } else {
      this._applyHostClass('flex items-start gap-2.5');
      this.innerHTML = `${this._control()}
        <span class="min-w-0">
          ${label ? `<span class="block text-xs font-medium text-zinc-800 dark:text-zinc-100">${escapeAttribute(label)}</span>` : ''}
          ${description ? `<span class="mt-0.5 block text-[10.5px] leading-relaxed text-zinc-500 dark:text-zinc-400">${escapeAttribute(description)}</span>` : ''}
        </span>`;
    }

    const control = this.querySelector('[data-toggle-control]');
    if (control) {
      control.addEventListener('click', () => {
        if (disabled) return;
        this.checked = !this.checked;
        this.dispatchEvent(new CustomEvent('change', { detail: { checked: this.checked } }));
      });
    }
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('toggle-switch')) {
  customElements.define('toggle-switch', ToggleSwitchElement);
}
export default ToggleSwitchElement;
