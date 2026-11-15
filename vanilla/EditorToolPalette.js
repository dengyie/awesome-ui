/**
 * EditorToolPalette - Vanilla Web Component
 * Usage: <editor-tool-palette tools='[...]' active-id="select"></editor-tool-palette>
 * Attributes: tools (JSON [{id,icon,label,kbd?,disabled?}]), active-id, orientation (horizontal|vertical), active-count, show-kbd-hints
 * Properties: tools, activeId
 * Events: select (detail {id})
 */
const escapeAttribute = (value) =>
  String(value).replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  }[char]));

export class EditorToolPaletteElement extends HTMLElement {
  static get observedAttributes() {
    return ['tools', 'active-id', 'orientation', 'active-count', 'show-kbd-hints'];
  }

  constructor() {
    super();
    this._tools = [];
    this._activeId = null;
    this._bound = false;
  }

  connectedCallback() {
    if (!this._tools.length) {
      const raw = this.getAttribute('tools');
      if (raw) {
        try { this._tools = JSON.parse(raw); } catch { this._tools = []; }
      }
    }
    this.render();
    if (!this._bound) {
      this._bound = true;
      this.addEventListener('click', (event) => {
        const button = event.target.closest('[data-tool]');
        if (!button || button.disabled) return;
        const id = button.getAttribute('data-tool');
        if (id) {
          this._activeId = id;
          this.setAttribute('active-id', id);
          this.render();
          this.dispatchEvent(new CustomEvent('select', { detail: { id } }));
        }
      });
    }
  }

  attributeChangedCallback(name) {
    if (name === 'tools') this._tools = [];
    if (name === 'active-id') this._activeId = null;
    this.render();
  }

  get tools() { return this._tools; }
  set tools(v) {
    this._tools = Array.isArray(v) ? v : [];
    this.render();
  }

  get activeId() {
    if (this._activeId !== null) return this._activeId;
    return this.getAttribute('active-id');
  }

  set activeId(id) {
    this._activeId = id;
    this.setAttribute('active-id', id || '');
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
    const vertical = this.getAttribute('orientation') === 'vertical';
    const activeId = this.activeId;
    const activeCount = this.getAttribute('active-count');
    const showKbd = this.getAttribute('show-kbd-hints') !== 'false';
    const hostClass = `inline-flex gap-0.5 rounded-xl border border-zinc-200 bg-white p-1 shadow-lg dark:border-zinc-800 dark:bg-zinc-900 ${vertical ? 'flex-col items-center' : 'items-center'}`;
    this._applyHostClass(hostClass);

    const buttons = this._tools
      .map((tool) => {
        const active = tool.id === activeId;
        const stateClass = active
          ? 'bg-blue-500 text-white'
          : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-50';
        const kbd = showKbd && tool.kbd
          ? `<span class="absolute -right-0.5 -top-0.5 rounded px-1 text-[9px] font-semibold leading-tight ${active ? 'bg-white/90 text-blue-600' : 'bg-zinc-100 text-zinc-400'}">${escapeAttribute(tool.kbd)}</span>`
          : '';
        const badge = active && activeCount != null && Number(activeCount) > 0
          ? `<span data-tool-badge class="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full bg-blue-600 px-1.5 text-[9px] font-semibold leading-tight text-white">${escapeAttribute(activeCount)}</span>`
          : '';
        return `<button type="button" data-tool="${escapeAttribute(tool.id)}" title="${escapeAttribute(tool.label)}"${tool.disabled ? ' disabled' : ''} class="relative flex h-9 w-9 items-center justify-center rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-40 ${stateClass}"><span class="pointer-events-none flex h-5 w-5 items-center justify-center [&>svg]:h-5 [&>svg]:w-5">${tool.icon || ''}</span>${kbd}${badge}<span class="sr-only">${escapeAttribute(tool.label)}</span></button>`;
      })
      .join('');

    this.innerHTML = `<div data-tool-palette role="toolbar" aria-orientation="${vertical ? 'vertical' : 'horizontal'}" class="${hostClass}">${buttons}</div>`;
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('editor-tool-palette')) {
  customElements.define('editor-tool-palette', EditorToolPaletteElement);
}

export default EditorToolPaletteElement;
