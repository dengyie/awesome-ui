/**
 * StatusCountTabs - Vanilla Web Component
 * Usage: <status-count-tabs tabs='[...]' value="all"></status-count-tabs>
 * Attributes: tabs (JSON [{id,label,count?,disabled?}]), value, size (sm|md), full-width
 * Property: tabs, value
 * Events: change (detail {id})
 */
const escapeAttribute = (value) =>
  String(value).replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  }[char]));

export class StatusCountTabsElement extends HTMLElement {
  static get observedAttributes() {
    return ['tabs', 'value', 'size', 'full-width'];
  }

  constructor() {
    super();
    this._tabs = [];
    this._bound = false;
  }

  connectedCallback() {
    if (!this._tabs.length) {
      const raw = this.getAttribute('tabs');
      if (raw) {
        try { this._tabs = JSON.parse(raw); } catch { this._tabs = []; }
      }
    }
    this.render();
    if (!this._bound) {
      this._bound = true;
      this.addEventListener('click', (event) => {
        const tab = event.target.closest('[data-status-tab]');
        if (!tab || tab.disabled) return;
        const id = tab.getAttribute('data-status-tab');
        if (id && id !== this._value && id !== this.getAttribute('value')) {
          this._value = id;
          this.setAttribute('value', id);
          this.render();
          this.dispatchEvent(new CustomEvent('change', { detail: { id } }));
        }
      });
    }
  }

  attributeChangedCallback(name) {
    if (name === 'value') this._value = undefined;
    this.render();
  }

  get tabs() {
    return this._tabs;
  }

  set tabs(value) {
    this._tabs = Array.isArray(value) ? value : [];
    this.render();
  }

  get value() {
    return this._value !== undefined ? this._value : this.getAttribute('value') || '';
  }

  set value(id) {
    this._value = id;
    this.setAttribute('value', id);
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
    const size = this.getAttribute('size') || 'md';
    const fullWidth = this.getAttribute('full-width') === 'true';
    const value = this.value;
    const sizeClass = size === 'sm' ? 'px-3 py-1.5 text-xs' : 'px-4 py-2.5 text-sm';
    const hostClass = `flex items-stretch overflow-hidden rounded-t-lg border border-b-0 border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-800/60 ${fullWidth ? 'w-full' : 'inline-flex max-w-full'}`;
    this._applyHostClass(hostClass);
    const tabsHtml = this._tabs
      .map((tab) => {
        const active = tab.id === value;
        const stateClass = active
          ? 'bg-white text-zinc-900 shadow-[inset_0_-2px_0_0_#18181b] dark:bg-zinc-900 dark:text-zinc-50 dark:shadow-[inset_0_-2px_0_0_#fafafa]'
          : 'bg-zinc-50 text-sky-600 hover:bg-zinc-100 dark:bg-zinc-800/60 dark:text-sky-400 dark:hover:bg-zinc-800';
        const count = tab.count != null ? `<span class="font-normal ${active ? 'text-zinc-400 dark:text-zinc-500' : 'text-zinc-400/80'}">(${tab.count})</span>` : '';
        return `<button type="button" role="tab" aria-selected="${active}" data-status-tab="${escapeAttribute(tab.id)}"${tab.disabled ? ' disabled' : ''} class="flex items-center gap-1 whitespace-nowrap border-r border-zinc-200 font-semibold transition-colors last:border-r-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-700 ${sizeClass} ${stateClass}">${escapeAttribute(tab.label)}${count}</button>`;
      })
      .join('');

    this.innerHTML = `<div data-status-count-tabs role="tablist" class="${hostClass}">${tabsHtml}</div>`;
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('status-count-tabs')) {
  customElements.define('status-count-tabs', StatusCountTabsElement);
}

export default StatusCountTabsElement;
