/**
 * FormField - Vanilla Web Component (wrapper for one labeled field)
 * Usage: <form-field label="Policy name" required counter-value="19" counter-max="70" hint="…"><input/></form-field>
 * Attributes: label, for, required, optional, hint, error, counter-value, counter-max, helper-footer
 * Slots: default (the control)
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

export class FormFieldElement extends HTMLElement {
  static get observedAttributes() {
    return ['label', 'for', 'required', 'optional', 'hint', 'error', 'counter-value', 'counter-max', 'helper-footer'];
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
    this._applyHostClass('flex flex-col gap-1.5');
    const label = this.getAttribute('label') || '';
    const htmlFor = this.getAttribute('for') || '';
    const required = this.hasAttribute('required');
    const optional = this.hasAttribute('optional');
    const hint = this.getAttribute('hint') || '';
    const error = this.getAttribute('error') || '';
    const helperFooter = this.getAttribute('helper-footer') || '';
    const counterRaw = this.getAttribute('counter-value');
    const counterMax = this.getAttribute('counter-max');
    const counter =
      counterRaw !== null && counterMax !== null
        ? `<p class="self-end text-xs tabular-nums text-zinc-400">${escapeAttribute(counterRaw)}/${escapeAttribute(counterMax)}</p>`
        : '';

    // Insert slotted controls after the label (preserves live state); render() re-runs
    // are safe because nodes are moved, not cloned.
    const slotNodes = Array.from(this.childNodes).filter((node) => node.nodeType === 1);
    const previousWrapper = this.querySelector('[data-form-field]');

    const wrapper = document.createElement('div');
    wrapper.setAttribute('data-form-field', '');
    wrapper.className = 'flex flex-col gap-1.5';
    if (error) wrapper.setAttribute('aria-invalid', 'true');
    wrapper.innerHTML = `<label ${htmlFor ? `for="${escapeAttribute(htmlFor)}"` : ''} class="flex items-center gap-1.5 text-sm font-medium text-zinc-800 dark:text-zinc-200">
        ${required ? '<span aria-hidden="true" class="text-rose-500">*</span>' : ''}
        ${escapeAttribute(label)}
        ${optional ? '<span class="text-xs font-normal text-zinc-400">(Optional)</span>' : ''}
      </label>
      ${
        error
          ? `<p class="flex items-center gap-1 text-xs font-medium text-rose-600 dark:text-rose-400">${uiIcon('alert-triangle', { size: 12 })}${escapeAttribute(error)}</p>`
          : hint
            ? `<p class="text-xs text-zinc-400">${escapeAttribute(hint)}</p>`
            : ''
      }
      ${counter}
      ${helperFooter ? `<p class="text-xs text-zinc-400">${escapeAttribute(helperFooter)}</p>` : ''}`;
    const labelEl = wrapper.querySelector('label');
    for (const node of slotNodes) {
      if (node === previousWrapper) continue;
      labelEl.insertAdjacentElement('afterend', node);
    }
    this.replaceChildren(wrapper);
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('form-field')) {
  customElements.define('form-field', FormFieldElement);
}
export default FormFieldElement;
