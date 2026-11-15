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
 * SideDrawer - Vanilla Web Component
 * Usage: <side-drawer open title="Filters" side="right"><p>Body</p></side-drawer>
 * Attributes: open, title, description, side (left|right), size (sm|md|lg)
 * Events: close
 * Light-DOM children are moved into the scrollable body; an element with
 * slot="footer" becomes the sticky footer row.
 */
export class SideDrawerElement extends HTMLElement {
  static get observedAttributes() {
    return ['open', 'title', 'description', 'side', 'size'];
  }

  constructor() {
    super();
    this._onKeyDown = this._onKeyDown.bind(this);
  }

  connectedCallback() {
    // Capture light-DOM children before the first render moves them.
    this._bodyNodes = Array.from(this.childNodes);
    this.render();
    document.addEventListener('keydown', this._onKeyDown);
  }

  disconnectedCallback() {
    document.removeEventListener('keydown', this._onKeyDown);
  }

  attributeChangedCallback() {
    if (this._bodyNodes) this.render();
  }

  _onKeyDown(event) {
    if (event.key !== 'Escape') return;
    if (!this.hasAttribute('open')) return;
    event.preventDefault();
    this.dispatchEvent(new CustomEvent('close'));
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

    // Re-capture the host's own nodes: after the first render they live inside
    // our slots, so pull them back out before the shell is rebuilt.
    const existingBody = this.querySelector('.drawer-body-content');
    const existingFooter = this.querySelector('.drawer-footer');
    if (existingBody || existingFooter) {
      this._bodyNodes = [
        ...(existingBody ? Array.from(existingBody.childNodes) : []),
        ...(existingFooter ? Array.from(existingFooter.childNodes) : []),
      ];
    }

    const open = this.hasAttribute('open') && this.getAttribute('open') !== 'false';
    if (!open) {
      this.innerHTML = '';
      return;
    }

    const title = this.getAttribute('title') || 'Drawer';
    const description = this.getAttribute('description') || '';
    const side = this.getAttribute('side') === 'left' ? 'left' : 'right';
    const size = ['sm', 'md', 'lg'].includes(this.getAttribute('size')) ? this.getAttribute('size') : 'md';

    const nodes = this._bodyNodes || [];
    const footerNodes = nodes.filter((node) => node.nodeType === 1 && node.getAttribute('slot') === 'footer');
    const bodyNodes = nodes.filter((node) => !footerNodes.includes(node));
    const hasFooter = footerNodes.length > 0;

    this.innerHTML = `
      <div class="fixed inset-0 z-50 flex">
        <div class="drawer-backdrop absolute inset-0 bg-zinc-950/40 backdrop-blur-[1px]" aria-hidden="true"></div>
        <div role="dialog" aria-modal="true" aria-label="${escapeAttribute(title)}"
          class="relative z-10 flex h-full w-full flex-col border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-900 ${
            size === 'sm' ? 'max-w-xs' : size === 'lg' ? 'max-w-xl' : 'max-w-md'
          } ${side === 'right' ? 'ml-auto border-l' : 'mr-auto border-r'}">
          <header class="flex items-start gap-2 border-b border-zinc-100 px-4 py-3 dark:border-zinc-800">
            <div class="min-w-0 flex-1">
              <h2 class="truncate text-sm font-semibold text-zinc-800 dark:text-zinc-100">${escapeAttribute(title)}</h2>
              ${description ? `<p class="mt-0.5 text-[11px] leading-snug text-zinc-500 dark:text-zinc-400">${escapeAttribute(description)}</p>` : ''}
            </div>
            <button type="button" class="drawer-close shrink-0 rounded-md p-1 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
              aria-label="Close drawer">${uiIcon('x', { size: 14 })}</button>
          </header>
          <div class="drawer-body-content flex-1 overflow-y-auto px-4 py-3 text-xs leading-relaxed text-zinc-600 dark:text-zinc-300"></div>
          ${hasFooter ? '<footer class="drawer-footer border-t border-zinc-100 px-4 py-3 dark:border-zinc-800"></footer>' : ''}
        </div>
      </div>`;

    const bodySlot = this.querySelector('.drawer-body-content');
    bodyNodes.forEach((node) => bodySlot.appendChild(node));

    if (hasFooter) {
      const footerSlot = this.querySelector('.drawer-footer');
      footerNodes.forEach((node) => footerSlot.appendChild(node));
    }

    this.querySelector('.drawer-backdrop').addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('close'));
    });
    this.querySelector('.drawer-close').addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('close'));
    });
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('side-drawer')) {
  customElements.define('side-drawer', SideDrawerElement);
}
export default SideDrawerElement;
