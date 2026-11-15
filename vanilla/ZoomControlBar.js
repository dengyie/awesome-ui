/**
 * ZoomControlBar - Vanilla Web Component
 * Usage: <zoom-control-bar value="100" variant="stepper|dropdown|slider"></zoom-control-bar>
 * Attributes: value, min, max, step, variant, presets (JSON number[]), show-fit, show-undo-redo
 * Properties: value
 * Events: zoom-change (detail {value}), fit, undo, redo
 */
const escapeAttribute = (value) =>
  String(value).replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  }[char]));

const ICON_BUTTON = 'flex h-7 w-7 items-center justify-center rounded-md text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-40';

const UNDO_SVG = '<svg viewBox="0 0 20 20" fill="none" width="16" height="16" aria-hidden="true"><path d="M7 5 3.5 8.5 7 12" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M3.5 8.5H12a4.5 4.5 0 0 1 0 9h-1" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>';
const REDO_SVG = '<svg viewBox="0 0 20 20" fill="none" width="16" height="16" aria-hidden="true"><path d="m13 5 3.5 3.5L13 12" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M16.5 8.5H8a4.5 4.5 0 0 0 0 9h1" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>';
const FIT_SVG = '<svg viewBox="0 0 20 20" fill="none" width="16" height="16" aria-hidden="true"><path d="M3 6V3h3M17 6V3h-3M3 14v3h3M17 14v3h-3" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const MINUS_SVG = '<svg viewBox="0 0 20 20" fill="none" width="16" height="16" aria-hidden="true"><path d="M5 10h10" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>';
const PLUS_SVG = '<svg viewBox="0 0 20 20" fill="none" width="16" height="16" aria-hidden="true"><path d="M10 5v10M5 10h10" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>';

export class ZoomControlBarElement extends HTMLElement {
  static get observedAttributes() {
    return ['value', 'variant', 'presets', 'show-fit', 'show-undo-redo'];
  }

  constructor() {
    super();
    this._zoom = null;
    this._open = false;
    this._bound = false;
  }

  connectedCallback() {
    this.render();
    if (!this._bound) {
      this._bound = true;
      this.addEventListener('click', (event) => {
        const clampZoom = (next) => {
          const min = Number(this.getAttribute('min')) || 10;
          const max = Number(this.getAttribute('max')) || 400;
          return Math.min(max, Math.max(min, Math.round(next)));
        };
        const change = (next) => {
          const final = clampZoom(next);
          this._zoom = final;
          this.setAttribute('value', String(final));
          this._open = false;
          this.render();
          this.dispatchEvent(new CustomEvent('zoom-change', { detail: { value: final } }));
        };
        const step = Number(this.getAttribute('step')) || 10;
        if (event.target.closest('[data-zoom-in]')) change(this.value + step);
        else if (event.target.closest('[data-zoom-out]')) change(this.value - step);
        else if (event.target.closest('[data-zoom-value]') && this.getAttribute('variant') === 'dropdown') {
          this._open = !this._open;
          this.render();
        } else if (event.target.closest('[data-zoom-preset]')) {
          change(Number(event.target.closest('[data-zoom-preset]').getAttribute('data-zoom-preset')));
        } else if (event.target.closest('[data-zoom-fit]')) {
          this._open = false;
          this.render();
          this.dispatchEvent(new CustomEvent('fit'));
        } else if (event.target.closest('[data-zoom-undo]')) {
          this.dispatchEvent(new CustomEvent('undo'));
        } else if (event.target.closest('[data-zoom-redo]')) {
          this.dispatchEvent(new CustomEvent('redo'));
        }
      });
      this.addEventListener('input', (event) => {
        const target = event.target;
        if (target.hasAttribute && target.hasAttribute('data-zoom-slider')) {
          const next = Number(target.value);
          const min = Number(this.getAttribute('min')) || 10;
          const max = Number(this.getAttribute('max')) || 400;
          const final = Math.min(max, Math.max(min, Math.round(next)));
          this._zoom = final;
          this.setAttribute('value', String(final));
          this.dispatchEvent(new CustomEvent('zoom-change', { detail: { value: final } }));
          const valueLabel = this.querySelector('[data-zoom-value]');
          if (valueLabel) valueLabel.textContent = `${final}%`;
        }
      });
    }
  }

  attributeChangedCallback(name) {
    if (name === 'value') this._zoom = null;
    this.render();
  }

  get value() {
    if (this._zoom !== null) return this._zoom;
    return Number(this.getAttribute('value')) || 100;
  }

  set value(v) {
    this._zoom = Number(v) || 100;
    this.setAttribute('value', String(this._zoom));
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
    const variant = this.getAttribute('variant') || 'stepper';
    const showFit = this.getAttribute('show-fit') === 'true';
    const showUndoRedo = this.getAttribute('show-undo-redo') === 'true';
    const zoom = this.value;
    const min = Number(this.getAttribute('min')) || 10;
    const max = Number(this.getAttribute('max')) || 400;
    const step = Number(this.getAttribute('step')) || 10;
    let presets = [25, 50, 75, 100, 200];
    const rawPresets = this.getAttribute('presets');
    if (rawPresets) {
      try {
        const parsed = JSON.parse(rawPresets);
        if (Array.isArray(parsed)) presets = parsed;
      } catch { /* keep default */ }
    }

    const hostClass = 'inline-flex items-center gap-0.5 rounded-lg border border-zinc-200 bg-white px-1 py-0.5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900';
    this._applyHostClass(hostClass);

    const percentButton = `<button type="button" data-zoom-value class="rounded px-1.5 py-0.5 text-xs font-medium text-zinc-700 tabular-nums${variant === 'dropdown' ? ' hover:bg-zinc-100' : ''}">${zoom}%${variant === 'dropdown' ? ' <span aria-hidden="true">▾</span>' : ''}</button>`;

    const undoRedoHtml = showUndoRedo
      ? `<button type="button" data-zoom-undo title="Undo" class="${ICON_BUTTON}">${UNDO_SVG}</button><button type="button" data-zoom-redo title="Redo" class="${ICON_BUTTON}">${REDO_SVG}</button><span class="mx-0.5 h-4 w-px bg-zinc-200"></span>`
      : '';

    let variantHtml = '';
    if (variant === 'stepper') {
      variantHtml = `<button type="button" data-zoom-out title="Zoom out"${zoom <= min ? ' disabled' : ''} class="${ICON_BUTTON}">${MINUS_SVG}</button>${percentButton}<button type="button" data-zoom-in title="Zoom in"${zoom >= max ? ' disabled' : ''} class="${ICON_BUTTON}">${PLUS_SVG}</button>`;
    } else if (variant === 'dropdown') {
      const menu = this._open
        ? `<div data-zoom-menu class="absolute bottom-full right-0 mb-1 w-24 rounded-lg border border-zinc-200 bg-white py-1 shadow-lg">${presets.map((preset) => `<button type="button" data-zoom-preset="${escapeAttribute(preset)}" class="block w-full px-3 py-1 text-left text-xs tabular-nums hover:bg-zinc-50 ${preset === zoom ? 'font-semibold text-blue-600' : 'text-zinc-700'}">${preset}%</button>`).join('')}${showFit ? '<button type="button" data-zoom-fit class="block w-full border-t border-zinc-100 px-3 py-1 text-left text-xs text-zinc-500 hover:bg-zinc-50">Fit</button>' : ''}</div>`
        : '';
      variantHtml = `<div class="relative">${percentButton}${menu}</div>`;
    } else {
      variantHtml = `<input data-zoom-slider type="range" min="${min}" max="${max}" step="${step}" value="${zoom}" class="h-1.5 w-24 cursor-pointer appearance-none rounded-full bg-zinc-200" aria-label="Zoom level"/>${percentButton}`;
    }

    const fitButton = showFit && variant !== 'dropdown' ? `<button type="button" data-zoom-fit title="Fit to page" class="${ICON_BUTTON}">${FIT_SVG}</button>` : '';

    this.innerHTML = `<div data-zoom-control class="${hostClass}">${undoRedoHtml}${variantHtml}${fitButton}</div>`;
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('zoom-control-bar')) {
  customElements.define('zoom-control-bar', ZoomControlBarElement);
}

export default ZoomControlBarElement;
