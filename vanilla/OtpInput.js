/**
 * OtpInput - Vanilla Web Component
 * Usage: <otp-input heading="Check your email for a code" status="idle|error"></otp-input>
 * Attributes: heading, subtext, status (idle|error), error-text, continue-label, resend-hint, length
 * Properties: value (string)
 * Events: change (detail {value}), complete (detail {value}), continue, resend
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

export class OtpInputElement extends HTMLElement {
  static get observedAttributes() {
    return ['heading', 'subtext', 'status', 'error-text', 'continue-label', 'resend-hint', 'length'];
  }

  constructor() {
    super();
    this._value = '';
    this._bound = false;
  }

  get value() {
    return this._value;
  }

  set value(text) {
    this._value = String(text ?? '').replace(/\D/g, '');
    this.render();
  }

  connectedCallback() {
    this.render();
    if (!this._bound) {
      this._bound = true;
      this.addEventListener('click', (event) => {
        if (event.target.closest('[data-otp-continue]')) this.dispatchEvent(new CustomEvent('continue'));
        if (event.target.closest('[data-otp-resend]')) this.dispatchEvent(new CustomEvent('resend'));
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
    const length = Number(this.getAttribute('length')) || 6;
    const heading = this.getAttribute('heading') || '';
    const subtext = this.getAttribute('subtext') || '';
    const errored = this.getAttribute('status') === 'error';
    const errorText = this.getAttribute('error-text') || '';
    const continueLabel = this.getAttribute('continue-label') || 'Continue';
    const resendHint = this.getAttribute('resend-hint') || '';
    const chars = Array.from({ length }, (_, i) => this._value[i] ?? '');

    const cellClass = (filled) =>
      `h-12 w-11 rounded-lg border text-center text-lg font-semibold tabular-nums transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
        errored
          ? 'border-rose-400 bg-rose-50/60 text-rose-700 dark:border-rose-500/70 dark:bg-rose-950/40 dark:text-rose-200'
          : filled
            ? 'border-zinc-300 bg-white text-zinc-900 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50'
            : 'border-zinc-300 bg-white text-zinc-400 placeholder:text-zinc-300 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-500'
      }`;

    this.innerHTML = `<div data-otp-input class="w-full max-w-sm">
      ${heading ? `<h2 class="text-lg font-bold text-zinc-900 dark:text-zinc-50">${escapeAttribute(heading)}</h2>` : ''}
      ${subtext ? `<p class="mt-1 text-xs text-zinc-500 dark:text-zinc-400">${escapeAttribute(subtext)}</p>` : ''}
      <div data-otp-cells class="flex gap-1.5${heading || subtext ? ' mt-4' : ''}">
        ${chars
          .map(
            (char, index) => `<input type="text" inputmode="numeric" maxlength="1" value="${escapeAttribute(char)}" aria-label="Digit ${index + 1}" data-otp-cell="${index}" class="${cellClass(Boolean(char))}" />`,
          )
          .join('')}
      </div>
      ${errored && errorText ? `<p data-otp-error class="mt-3 flex items-center gap-1.5 text-xs font-medium text-rose-600 dark:text-rose-400">${uiIcon('alert-triangle', { size: 14 })}${escapeAttribute(errorText)}</p>` : ''}
      <button type="button" data-otp-continue class="mt-4 w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500">${escapeAttribute(continueLabel)}</button>
      ${resendHint ? `<p class="mt-3 text-center text-xs text-zinc-500 dark:text-zinc-400"><a href="#" data-otp-resend class="font-medium text-indigo-600 underline-offset-2 hover:underline dark:text-indigo-400">Resend code</a> · ${escapeAttribute(resendHint)}</p>` : ''}
    </div>`;

    this.querySelectorAll('[data-otp-cell]').forEach((cell, index) => {
      cell.addEventListener('input', () => {
        const char = cell.value.replace(/\D/g, '').slice(-1);
        if (!char) return;
        const digits = chars.slice();
        digits[index] = char;
        this._value = digits.join('').slice(0, length);
        this.dispatchEvent(new CustomEvent('change', { detail: { value: this._value } }));
        if (this._value.length >= length) this.dispatchEvent(new CustomEvent('complete', { detail: { value: this._value } }));
        this.render();
        const next = this.querySelectorAll('[data-otp-cell]')[Math.min(index + 1, length - 1)];
        if (next) next.focus();
      });
      cell.addEventListener('keydown', (event) => {
        if (event.key !== 'Backspace') return;
        event.preventDefault();
        if (chars[index]) {
          const digits = chars.slice();
          digits[index] = '';
          this._value = digits.join('').slice(0, length);
        } else if (index > 0) {
          const digits = chars.slice();
          digits[index - 1] = '';
          this._value = digits.join('').slice(0, length);
          this.render();
          const prev = this.querySelectorAll('[data-otp-cell]')[index - 1];
          if (prev) prev.focus();
          return;
        }
        this.dispatchEvent(new CustomEvent('change', { detail: { value: this._value } }));
        this.render();
      });
      cell.addEventListener('paste', (event) => {
        const pasted = (event.clipboardData?.getData('text') || '').replace(/\D/g, '').slice(0, length);
        if (pasted.length > 1) {
          event.preventDefault();
          this._value = pasted;
          this.dispatchEvent(new CustomEvent('change', { detail: { value: this._value } }));
          if (this._value.length >= length) this.dispatchEvent(new CustomEvent('complete', { detail: { value: this._value } }));
          this.render();
        }
      });
    });
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('otp-input')) {
  customElements.define('otp-input', OtpInputElement);
}
export default OtpInputElement;
