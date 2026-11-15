const escapeAttribute = (value) =>
  String(value).replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  }[char]));

/**
 * Modal - Vanilla Web Component
 * Usage:
 *   <modal-dialog title="Delete project?" description="This cannot be undone.">
 *     <p>Body copy…</p>
 *     <button slot="footer">Cancel</button>
 *   </modal-dialog>
 * Properties: open (boolean)
 * Attributes: open, title, description, dismissible (default true), show-close (default true)
 * Events: close
 * Light-DOM children are kept as body content; children with slot="footer" render in the footer bar.
 */
export class ModalElement extends HTMLElement {
  static get observedAttributes() {
    return ['open', 'title', 'description', 'dismissible', 'show-close'];
  }

  constructor() {
    super();
    this._bodyNodes = [];
    this._footerNodes = [];
    this._onKey = (event) => {
      if (event.key === 'Escape' && this.open && this.dismissible) {
        this._close();
      }
    };
  }

  get open() {
    return this.hasAttribute('open');
  }

  set open(value) {
    if (value) this.setAttribute('open', '');
    else this.removeAttribute('open');
  }

  get dismissible() {
    return !this.hasAttribute('dismissible') || this.getAttribute('dismissible') !== 'false';
  }

  get showClose() {
    return !this.hasAttribute('show-close') || this.getAttribute('show-close') !== 'false';
  }

  connectedCallback() {
    this._captureSlots();
    document.addEventListener('keydown', this._onKey);
    this.render();
  }

  disconnectedCallback() {
    document.removeEventListener('keydown', this._onKey);
  }

  attributeChangedCallback() {
    this.render();
  }

  _captureSlots() {
    const seen = new Set(this._bodyNodes);
    this._footerNodes.forEach((node) => seen.add(node));
    Array.from(this.childNodes).forEach((node) => {
      if (seen.has(node)) return;
      if (node.nodeType === 1 && node.hasAttribute && node.hasAttribute('data-modal-root')) return;
      if (node.nodeType === 1 && node.getAttribute('slot') === 'footer') this._footerNodes.push(node);
      else this._bodyNodes.push(node);
    });
  }

  _detach(nodes) {
    nodes.forEach((node) => {
      if (node.parentNode) node.parentNode.removeChild(node);
    });
  }

  _close() {
    this.open = false;
    this.dispatchEvent(new CustomEvent('close'));
  }

  render() {
    this._captureSlots();
    const open = this.open;
    const title = this.getAttribute('title') || '';
    const description = this.getAttribute('description') || '';

    if (!open) {
      this._detach(this._bodyNodes);
      this._detach(this._footerNodes);
      if (this.innerHTML !== '') this.innerHTML = '';
      return;
    }

    this.innerHTML = `<div data-modal-root class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div aria-hidden="true" data-modal-backdrop class="absolute inset-0 bg-zinc-950/50 backdrop-blur-[2px]"></div>
      <div role="dialog" aria-modal="true" aria-label="${escapeAttribute(title)}" data-modal-panel
        class="relative w-full max-w-md overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-700 dark:bg-zinc-900">
        <div class="flex items-start justify-between gap-3 px-5 pt-4">
          <div class="min-w-0">
            <h2 class="text-sm font-semibold text-zinc-900 dark:text-zinc-50">${escapeAttribute(title)}</h2>
            ${description ? `<p class="mt-1 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">${escapeAttribute(description)}</p>` : ''}
          </div>
          ${this.showClose ? `<button type="button" data-modal-close aria-label="Close"
            class="shrink-0 rounded-md p-1 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:hover:bg-zinc-800">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>` : ''}
        </div>
        ${this._bodyNodes.length ? '<div data-modal-body class="px-5 py-4 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400"></div>' : ''}
        ${this._footerNodes.length ? '<div data-modal-footer class="flex items-center justify-end gap-2 border-t border-zinc-100 bg-zinc-50 px-5 py-3 dark:border-zinc-800 dark:bg-zinc-950/50"></div>' : ''}
      </div>
    </div>`;

    const body = this.querySelector('[data-modal-body]');
    if (body) this._bodyNodes.forEach((node) => body.appendChild(node));
    const footer = this.querySelector('[data-modal-footer]');
    if (footer) this._footerNodes.forEach((node) => footer.appendChild(node));

    const close = this.querySelector('[data-modal-close]');
    if (close) close.addEventListener('click', () => this._close());
    this.querySelector('[data-modal-root]').addEventListener('mousedown', (event) => {
      if (!this.dismissible) return;
      const panel = this.querySelector('[data-modal-panel]');
      if (panel && !panel.contains(event.target)) this._close();
    });
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('modal-dialog')) {
  customElements.define('modal-dialog', ModalElement);
}
export default ModalElement;
