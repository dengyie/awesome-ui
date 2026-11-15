/**
 * TimeframePicker - Vanilla Web Component
 * Usage: <timeframe-picker value="7d" range-label="Nov 8 – Nov 14"></timeframe-picker>
 * Attributes: presets (comma-separated), value, range-label, disabled
 * Events: change (detail: { value }), step (detail: { direction, value })
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

export class TimeframePickerElement extends HTMLElement {
  static get observedAttributes() {
    return ['presets', 'value', 'range-label', 'disabled'];
  }

  get presets() {
    return (this.getAttribute('presets') || 'Today,7d,30d,90d,12mo')
      .split(',')
      .map((preset) => preset.trim())
      .filter(Boolean);
  }

  get value() {
    const raw = this.getAttribute('value');
    if (raw) return raw;
    return this.presets[0] || '';
  }

  set value(preset) {
    this.setAttribute('value', preset);
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
    const presets = this.presets;
    const current = this.value;
    const rangeLabel = this.getAttribute('range-label') || '';
    const disabled = this.hasAttribute('disabled');

    this.innerHTML = `<div data-timeframe-picker role="group" aria-label="Timeframe" class="flex flex-wrap items-center gap-2">
      <div class="flex items-center overflow-hidden rounded-lg border border-zinc-300 bg-white dark:border-zinc-700 dark:bg-zinc-900">
        ${presets
          .map((preset) => {
            const active = preset === current;
            return `<button type="button" data-preset="${escapeAttribute(preset)}" aria-pressed="${active ? 'true' : 'false'}" ${disabled ? 'disabled' : ''}
              class="px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-500 ${
                active
                  ? 'bg-indigo-600 text-white'
                  : 'text-zinc-600 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-800/60'
              } ${disabled ? 'cursor-not-allowed opacity-50' : ''}">${escapeAttribute(preset)}</button>`;
          })
          .join('')}
      </div>
      <div class="flex items-center overflow-hidden rounded-lg border border-zinc-300 bg-white dark:border-zinc-700 dark:bg-zinc-900">
        <button type="button" data-step="-1" aria-label="Previous period" ${disabled ? 'disabled' : ''}
          class="px-2 py-1.5 text-zinc-500 transition-colors hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-500 dark:text-zinc-400 dark:hover:bg-zinc-800/60">${uiIcon('chevron-left', { size: 13 })}</button>
        ${
          rangeLabel
            ? `<span class="flex items-center gap-1.5 border-x border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-700 dark:border-zinc-800 dark:text-zinc-200">${uiIcon('calendar', { size: 12, className: 'text-zinc-400' })}${escapeAttribute(rangeLabel)}</span>`
            : ''
        }
        <button type="button" data-step="1" aria-label="Next period" ${disabled ? 'disabled' : ''}
          class="px-2 py-1.5 text-zinc-500 transition-colors hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-500 dark:text-zinc-400 dark:hover:bg-zinc-800/60">${uiIcon('chevron-right', { size: 13 })}</button>
      </div>
    </div>`;

    this.querySelectorAll('[data-preset]').forEach((button) => {
      button.addEventListener('click', () => {
        if (disabled) return;
        const preset = button.getAttribute('data-preset');
        this.value = preset;
        this.dispatchEvent(new CustomEvent('change', { detail: { value: preset } }));
      });
    });
    this.querySelectorAll('[data-step]').forEach((button) => {
      button.addEventListener('click', () => {
        if (disabled) return;
        const direction = Number(button.getAttribute('data-step')) === -1 ? -1 : 1;
        this.dispatchEvent(new CustomEvent('step', { detail: { direction, value: this.value } }));
      });
    });
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('timeframe-picker')) {
  customElements.define('timeframe-picker', TimeframePickerElement);
}
export default TimeframePickerElement;
