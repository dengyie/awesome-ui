/**
 * ColorPickerPopover - Vanilla Web Component
 * Usage: <color-picker-popover value="#2563eb" swatches='[...]' document-colors='[...]' custom-colors='[...]'></color-picker-popover>
 * Attributes: value, swatches (JSON string[]), document-colors, custom-colors, show-eyedropper, show-rgb-inputs, show-hex-input
 * Properties: value, swatches, documentColors, customColors
 * Events: change (detail {hex}), eyedropper-click, add-custom (detail {hex})
 */
const escapeAttribute = (value) =>
  String(value).replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  }[char]));

const DEFAULT_ROWS = [
  ['#000000', '#374151', '#6b7280', '#9ca3af', '#d1d5db', '#f3f4f6'],
  ['#dc2626', '#ef4444', '#f87171', '#fca5a5', '#fecaca', '#fee2e2'],
  ['#ea580c', '#f97316', '#fb923c', '#fdba74', '#fed7aa', '#ffedd5'],
  ['#16a34a', '#22c55e', '#4ade80', '#86efac', '#bbf7d0', '#dcfce7'],
  ['#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe', '#dbeafe'],
  ['#7c3aed', '#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe', '#ede9fe'],
];

const normalizeHex = (input) => {
  const match = /^#?([0-9a-f]{6})$/i.exec(String(input || '').trim());
  return match ? `#${match[1].toLowerCase()}` : null;
};

const hexToRgb = (hex) => {
  const match = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!match) return null;
  const int = parseInt(match[1], 16);
  return { r: (int >> 16) & 255, g: (int >> 8) & 255, b: int & 255 };
};

const rgbToHex = (r, g, b) =>
  `#${[r, g, b].map((c) => Math.max(0, Math.min(255, Math.round(c))).toString(16).padStart(2, '0')).join('')}`;

export class ColorPickerPopoverElement extends HTMLElement {
  static get observedAttributes() {
    return ['value', 'swatches', 'document-colors', 'custom-colors'];
  }

  constructor() {
    super();
    this._swatches = [];
    this._documentColors = [];
    this._customColors = [];
    this._bound = false;
  }

  connectedCallback() {
    if (!this._swatches.length) this._parseAttr('swatches', '_swatches');
    if (!this._documentColors.length) this._parseAttr('document-colors', '_documentColors');
    if (!this._customColors.length) this._parseAttr('custom-colors', '_customColors');
    this.render();
    if (!this._bound) {
      this._bound = true;
      this.addEventListener('click', (event) => {
        const swatch = event.target.closest('[data-color-swatch]');
        if (swatch) {
          const color = swatch.getAttribute('data-color-swatch');
          if (normalizeHex(color)) this._apply(color.toLowerCase());
          return;
        }
        if (event.target.closest('[data-color-eyedropper]')) {
          this.dispatchEvent(new CustomEvent('eyedropper-click'));
          return;
        }
        if (event.target.closest('[data-color-custom-add]')) {
          this.dispatchEvent(new CustomEvent('add-custom', { detail: { hex: this._hex } }));
        }
      });
      this.addEventListener('input', (event) => {
        const target = event.target;
        if (target.hasAttribute && target.hasAttribute('data-color-hex-input')) {
          const raw = target.value;
          this._draft = raw;
          const parsed = normalizeHex(raw);
          if (parsed) {
            this._hex = parsed;
            this.dispatchEvent(new CustomEvent('change', { detail: { hex: parsed } }));
            this.render();
            const input = this.querySelector('[data-color-hex-input]');
            if (input) {
              input.value = raw;
              input.focus();
            }
          }
        } else if (target.hasAttribute && target.hasAttribute('data-color-channel')) {
          const channel = target.getAttribute('data-color-channel');
          const num = parseInt(target.value, 10);
          if (Number.isNaN(num)) return;
          const rgb = hexToRgb(this._hex) || { r: 37, g: 99, b: 235 };
          const next = rgbToHex(
            channel === 'r' ? num : rgb.r,
            channel === 'g' ? num : rgb.g,
            channel === 'b' ? num : rgb.b,
          );
          this._apply(next);
        }
      });
    }
  }

  attributeChangedCallback(name) {
    if (name === 'value') this._value = undefined;
    if (name === 'swatches') this._swatches = [];
    if (name === 'document-colors') this._documentColors = [];
    if (name === 'custom-colors') this._customColors = [];
    this.render();
  }

  _parseAttr(name, field) {
    const raw = this.getAttribute(name);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) this[field] = parsed;
    } catch { /* keep default */ }
  }

  get value() {
    return this._value !== undefined ? this._value : normalizeHex(this.getAttribute('value')) || '#2563eb';
  }

  set value(hex) {
    this._value = normalizeHex(hex);
    this.setAttribute('value', this._value || '');
    this.render();
  }

  get swatches() { return this._swatches; }
  set swatches(v) { this._swatches = Array.isArray(v) ? v : []; this.render(); }
  get documentColors() { return this._documentColors; }
  set documentColors(v) { this._documentColors = Array.isArray(v) ? v : []; this.render(); }
  get customColors() { return this._customColors; }
  set customColors(v) { this._customColors = Array.isArray(v) ? v : []; this.render(); }

  _apply(next) {
    this._hex = next;
    this._value = next;
    this.setAttribute('value', next);
    this.dispatchEvent(new CustomEvent('change', { detail: { hex: next } }));
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
    const hex = this.value;
    this._hex = hex;
    const rows = this._swatches.length ? [this._swatches] : DEFAULT_ROWS;
    const showEyedropper = this.getAttribute('show-eyedropper') === 'true';
    const showRgb = this.getAttribute('show-rgb-inputs') === 'true';
    const showHexInput = this.getAttribute('show-hex-input') !== 'false';
    const rgb = hexToRgb(hex) || { r: 37, g: 99, b: 235 };

    const hostClass = 'w-64 rounded-xl border border-zinc-200 bg-white p-3 shadow-lg dark:border-zinc-800 dark:bg-zinc-900';
    this._applyHostClass(hostClass);

    const swatchButton = (color, key) => {
      const selected = color.toLowerCase() === hex;
      const lightSwatch = color.toLowerCase() === '#ffffff' || color.toLowerCase() === '#f3f4f6';
      const check = selected
        ? `<span style="color:${lightSwatch ? '#71717a' : '#ffffff'};display:inline-flex"><svg viewBox="0 0 20 20" fill="none" width="14" height="14" aria-hidden="true"><path d="M4 10.5 8 14.5 16 6" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg></span>`
        : '';
      return `<button type="button" data-color-swatch="${escapeAttribute(color)}" key="${escapeAttribute(key)}" title="${escapeAttribute(color)}" class="relative flex h-6 w-6 items-center justify-center rounded-md border transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${selected ? 'border-indigo-600' : 'border-zinc-200'}" style="background-color:${escapeAttribute(color)};${selected ? 'box-shadow:0 0 0 2px rgba(199,210,254,1);' : ''}">${check}</button>`;
    };

    const gridHtml = rows
      .map((row, index) => `<div class="flex justify-between">${row.map((color, i) => swatchButton(color, `${index}-${i}`)).join('')}</div>`)
      .join('');

    const docSection = this._documentColors.length
      ? `<div class="mt-3"><p class="text-[10px] font-semibold uppercase tracking-wide text-zinc-400">Document colors</p><div class="mt-1.5 flex flex-wrap gap-1.5">${this._documentColors.map((color, i) => swatchButton(color, `doc-${i}`)).join('')}</div></div>`
      : '';

    const customSection = `<div class="mt-3"><p class="text-[10px] font-semibold uppercase tracking-wide text-zinc-400">Custom colors</p><div class="mt-1.5 flex flex-wrap items-center gap-1.5">${this._customColors.map((color, i) => swatchButton(color, `custom-${i}`)).join('')}<button type="button" data-color-custom-add title="Add ${escapeAttribute(hex)}" class="flex h-6 w-6 items-center justify-center rounded-md border border-dashed border-zinc-300 text-zinc-400 hover:border-indigo-500 hover:text-indigo-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"><svg viewBox="0 0 20 20" fill="none" width="14" height="14" aria-hidden="true"><path d="M10 4v12M4 10h12" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg></button></div></div>`;

    const rgbSection = showRgb
      ? `<div class="mt-2 grid grid-cols-3 gap-1.5">${['r', 'g', 'b'].map((channel) => `<label class="flex items-center gap-1 rounded-md border border-zinc-200 px-1.5 py-1"><span class="text-[10px] font-semibold uppercase text-zinc-400">${channel}</span><input data-color-channel="${channel}" type="number" min="0" max="255" value="${rgb[channel]}" class="w-full min-w-0 bg-transparent text-xs text-zinc-700 focus:outline-none"/></label>`).join('')}</div>`
      : '';

    const eyedropperBtn = showEyedropper
      ? `<button type="button" data-color-eyedropper title="Pick color from page" class="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"><svg viewBox="0 0 20 20" fill="none" width="16" height="16" aria-hidden="true"><path d="M12.7 3.3a2.1 2.1 0 0 1 3 3l-1.2 1.2 1.1 1.1-1.5 1.5-1.1-1.1-6.3 6.3c-.3.3-.6.4-1 .4H4v-2.7c0-.4.1-.7.4-1l6.3-6.3-1.1-1.1L10.1 4l1.1 1.1 1.5-1.8Z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/></svg></button>`
      : '';

    this.innerHTML = `<div data-color-picker class="${hostClass}">
  <div class="flex items-center gap-1.5">
    <span class="h-6 w-6 shrink-0 rounded-md border border-zinc-200" style="background-color:${escapeAttribute(hex)}"></span>
    ${showHexInput ? `<input data-color-hex-input type="text" value="${escapeAttribute(hex)}" placeholder="#2563eb" aria-label="Hex color" class="min-w-0 flex-1 rounded-md border border-zinc-200 bg-white px-2 py-1 font-mono text-xs text-zinc-700 focus:border-indigo-500 focus:outline-none"/>` : ''}
    ${eyedropperBtn}
  </div>
  ${rgbSection}
  <div data-color-grid class="mt-3 space-y-1.5">${gridHtml}</div>
  ${docSection}
  ${customSection}
</div>`;
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('color-picker-popover')) {
  customElements.define('color-picker-popover', ColorPickerPopoverElement);
}

export default ColorPickerPopoverElement;
