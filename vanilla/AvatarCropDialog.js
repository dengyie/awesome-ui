/**
 * AvatarCropDialog - Vanilla Web Component
 * Avatar crop dialog: circular preview with initials/image fallback, zoom
 * slider with -/+ steppers, hint line, saved confirmation state.
 *
 * Usage: <avatar-crop-dialog initials="AS" default-open></avatar-crop-dialog>
 * Attributes: trigger-label, title, hint, initials, avatar-url, default-zoom,
 *             min-zoom, max-zoom, confirm-label, cancel-label, default-open
 * Events: avatar-crop-confirm (detail {zoom}), avatar-crop-cancel
 */
const escapeAttribute = (value) =>
  String(value).replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  }[char]));

export class AvatarCropDialogElement extends HTMLElement {
  static get observedAttributes() {
    return ['trigger-label', 'title', 'hint', 'initials', 'avatar-url', 'min-zoom', 'max-zoom', 'confirm-label', 'cancel-label'];
  }

  constructor() {
    super();
    this._open = false;
    this._zoom = 50;
    this._saved = null;
    this._bound = false;
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;
    this.render();
  }

  connectedCallback() {
    if (this.hasAttribute('default-open')) this._open = true;
    this._zoom = Number.parseInt(this.getAttribute('default-zoom') || '50', 10) || 50;
    this.render();
    if (!this._bound) {
      this._bound = true;
      this.addEventListener('click', (event) => {
        if (event.target.closest('[data-avatar-crop-open]')) {
          this._open = true;
          this._saved = null;
          this.render();
          return;
        }
        if (event.target.closest('[data-avatar-crop-close]') || event.target.closest('[data-avatar-crop-done]')) {
          this._close();
          return;
        }
        if (event.target.closest('[data-avatar-crop-cancel]')) {
          this.dispatchEvent(new CustomEvent('avatar-crop-cancel'));
          this._close();
          return;
        }
        if (event.target.closest('[data-avatar-crop-zoom-in]')) {
          this._step(10);
          return;
        }
        if (event.target.closest('[data-avatar-crop-zoom-out]')) {
          this._step(-10);
          return;
        }
        if (event.target.closest('[data-avatar-crop-confirm]')) {
          this._confirm();
          return;
        }
        if (event.target === this.querySelector('[data-avatar-crop-overlay]')) {
          this._close();
        }
      });
      this.addEventListener('input', (event) => {
        const slider = event.target.closest('[data-avatar-crop-zoom]');
        if (!slider) return;
        this._zoom = Number.parseInt(slider.value, 10) || 0;
        this._updatePreview();
      });
    }
  }

  _close() {
    this._open = false;
    this._saved = null;
    this._zoom = Number.parseInt(this.getAttribute('default-zoom') || '50', 10) || 50;
    this.render();
  }

  _step(delta) {
    const min = Number.parseInt(this.getAttribute('min-zoom') || '0', 10) || 0;
    const max = Number.parseInt(this.getAttribute('max-zoom') || '100', 10) || 100;
    this._zoom = Math.min(max, Math.max(min, this._zoom + delta));
    const slider = this.querySelector('[data-avatar-crop-zoom]');
    if (slider) slider.value = String(this._zoom);
    this._updatePreview();
  }

  _updatePreview() {
    const inner = this.querySelector('[data-avatar-crop-inner]');
    if (inner) inner.style.transform = `scale(${(0.8 + (this._zoom / 100) * 0.6).toFixed(2)})`;
  }

  _confirm() {
    this._saved = this._zoom;
    this.render();
    this.dispatchEvent(new CustomEvent('avatar-crop-confirm', { detail: { zoom: this._zoom } }));
  }

  render() {
    const title = this.getAttribute('title') || 'Avatar preview';
    const trigger = this.getAttribute('trigger-label') || title;
    const hint = this.getAttribute('hint') || 'For best results, upload images of at least 1000×1000 pixels.';
    const initials = this.getAttribute('initials') || 'AS';
    const avatarUrl = this.getAttribute('avatar-url') || '';
    const min = Number.parseInt(this.getAttribute('min-zoom') || '0', 10) || 0;
    const max = Number.parseInt(this.getAttribute('max-zoom') || '100', 10) || 100;
    const confirmLabel = this.getAttribute('confirm-label') || 'Save';
    const cancelLabel = this.getAttribute('cancel-label') || 'Cancel';

    if (!this._open) {
      this.innerHTML = `
        <div data-avatar-crop-dialog>
          <button type="button" data-avatar-crop-open class="rounded-md bg-indigo-600 px-3 py-1.5 text-[11px] font-semibold text-white transition-colors hover:bg-indigo-500">${escapeAttribute(trigger)}</button>
        </div>`;
      return;
    }

    if (this._saved !== null) {
      this.innerHTML = `
        <div data-avatar-crop-dialog>
          <button type="button" data-avatar-crop-open class="rounded-md bg-indigo-600 px-3 py-1.5 text-[11px] font-semibold text-white transition-colors hover:bg-indigo-500">${escapeAttribute(trigger)}</button>
          <div data-avatar-crop-overlay class="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/50 p-4">
            <div data-avatar-crop-panel role="dialog" aria-modal="true" aria-label="${escapeAttribute(title)}" class="w-full max-w-sm rounded-xl border border-zinc-200 bg-white p-4 shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
              <p data-avatar-crop-saved class="text-sm font-semibold text-emerald-600 dark:text-emerald-400">Avatar updated</p>
              <p class="mt-1 text-xs text-zinc-500 dark:text-zinc-400">Your new profile picture has been saved.</p>
              <div class="mt-3 flex justify-end">
                <button type="button" data-avatar-crop-done class="rounded-md bg-zinc-900 px-3 py-1.5 text-[11px] font-semibold text-white dark:bg-zinc-100 dark:text-zinc-900">Done</button>
              </div>
            </div>
          </div>
        </div>`;
      return;
    }

    const previewInner = avatarUrl
      ? `<img data-avatar-crop-inner src="${escapeAttribute(avatarUrl)}" alt="" class="h-full w-full object-cover" style="transform: scale(${(0.8 + (this._zoom / 100) * 0.6).toFixed(2)})" />`
      : `<span data-avatar-crop-inner class="flex h-full w-full items-center justify-center rounded-full bg-indigo-100 text-2xl font-semibold text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400" style="transform: scale(${(0.8 + (this._zoom / 100) * 0.6).toFixed(2)})">${escapeAttribute(initials)}</span>`;

    this.innerHTML = `
      <div data-avatar-crop-dialog>
        <button type="button" data-avatar-crop-open class="rounded-md bg-indigo-600 px-3 py-1.5 text-[11px] font-semibold text-white transition-colors hover:bg-indigo-500">${escapeAttribute(trigger)}</button>
        <div data-avatar-crop-overlay class="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/50 p-4">
          <div data-avatar-crop-panel role="dialog" aria-modal="true" aria-label="${escapeAttribute(title)}" class="w-full max-w-sm rounded-xl border border-zinc-200 bg-white p-4 shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
            <div class="flex items-center justify-between">
              <p data-avatar-crop-title class="text-sm font-semibold text-zinc-900 dark:text-zinc-50">${escapeAttribute(title)}</p>
              <button type="button" data-avatar-crop-close aria-label="Close" class="rounded p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300">✕</button>
            </div>

            <p class="mt-1 text-[11px] text-zinc-500 dark:text-zinc-400">${escapeAttribute(hint)}</p>

            <div data-avatar-crop-preview class="mt-3 flex justify-center">
              <div class="flex h-40 w-40 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-zinc-100 shadow-inner dark:border-zinc-800 dark:bg-zinc-800">${previewInner}</div>
            </div>

            <div data-avatar-crop-zoom-row class="mt-3 flex items-center gap-2">
              <button type="button" data-avatar-crop-zoom-out aria-label="Zoom out" class="h-6 w-6 rounded border border-zinc-200 text-xs font-semibold text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800">−</button>
              <input data-avatar-crop-zoom type="range" min="${min}" max="${max}" value="${this._zoom}" aria-label="Zoom" class="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-zinc-200 accent-indigo-600 dark:bg-zinc-700" />
              <button type="button" data-avatar-crop-zoom-in aria-label="Zoom in" class="h-6 w-6 rounded border border-zinc-200 text-xs font-semibold text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800">+</button>
            </div>

            <div class="mt-3 flex items-center justify-end gap-2">
              <button type="button" data-avatar-crop-cancel class="rounded-md border border-zinc-200 px-3 py-1.5 text-[11px] font-semibold text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800">${escapeAttribute(cancelLabel)}</button>
              <button type="button" data-avatar-crop-confirm class="rounded-md bg-indigo-600 px-3 py-1.5 text-[11px] font-semibold text-white transition-colors hover:bg-indigo-500">${escapeAttribute(confirmLabel)}</button>
            </div>
          </div>
        </div>
      </div>`;
  }
}

export default AvatarCropDialogElement;

if (!customElements.get('avatar-crop-dialog')) {
  customElements.define('avatar-crop-dialog', AvatarCropDialogElement);
}
