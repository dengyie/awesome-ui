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
 * Accordion - Vanilla Web Component
 * Usage: <accordion-list allow-multiple></accordion-list>
 * Properties: items (AccordionItem[])
 * Events: toggle (detail: { id, open })
 */
export class AccordionElement extends HTMLElement {
  static get observedAttributes() {
    return ['allow-multiple', 'default-open-ids'];
  }

  constructor() {
    super();
    this._items = [];
    this._openIds = null;
  }

  get items() {
    return this._items;
  }

  set items(value) {
    this._items = Array.isArray(value) ? value : [];
    if (this._openIds === null) {
      this._openIds = this._items.filter((item) => item.defaultOpen).map((item) => item.id);
    }
    this.render();
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

  _openList() {
    if (this._openIds !== null) return this._openIds;
    const raw = this.getAttribute('default-open-ids');
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.map(String) : [];
    } catch {
      return [];
    }
  }

  _toggle(id) {
    const openIds = this._openList();
    const wasOpen = openIds.includes(id);
    const allowMultiple = this.hasAttribute('allow-multiple');
    this._openIds = wasOpen
      ? openIds.filter((entry) => entry !== id)
      : allowMultiple
        ? [...openIds, id]
        : [id];
    this.render();
    this.dispatchEvent(new CustomEvent('toggle', { detail: { id, open: !wasOpen } }));
  }

  render() {
    this._applyHostClass('block');

    const openIds = this._openList();

    const rows = this._items
      .map((item) => {
        const open = openIds.includes(item.id);
        return `<div>
          <h3>
            <button type="button" data-accordion-id="${escapeAttribute(item.id)}" aria-expanded="${open}"
              aria-controls="accordion-panel-${escapeAttribute(item.id)}"
              class="flex w-full items-center gap-2.5 px-4 py-3 text-left transition-colors hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-500 dark:hover:bg-zinc-800/50">
              ${item.icon ? `<span class="shrink-0 text-indigo-600 dark:text-indigo-400">${uiIcon(item.icon, { size: 14 })}</span>` : ''}
              <span class="min-w-0 flex-1">
                <span class="block text-xs font-medium text-zinc-800 dark:text-zinc-100">${escapeAttribute(item.title)}</span>
                ${item.description ? `<span class="mt-0.5 block text-[11px] text-zinc-500 dark:text-zinc-400">${escapeAttribute(item.description)}</span>` : ''}
              </span>
              <span class="shrink-0 text-zinc-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}">${uiIcon('chevron-down', { size: 14 })}</span>
            </button>
          </h3>
          ${
            open
              ? `<div id="accordion-panel-${escapeAttribute(item.id)}" role="region" aria-labelledby="accordion-trigger-${escapeAttribute(item.id)}"
                  class="px-4 pb-3 text-[11px] leading-relaxed text-zinc-600 dark:text-zinc-400">${escapeAttribute(item.content)}</div>`
              : ''
          }
        </div>`;
      })
      .join('');

    this.innerHTML = `<div class="divide-y divide-zinc-100 overflow-hidden rounded-xl border border-zinc-200 bg-white dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-900">${rows}</div>`;

    this.querySelectorAll('[data-accordion-id]').forEach((node) => {
      node.addEventListener('click', () => this._toggle(node.getAttribute('data-accordion-id')));
    });
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('accordion-list')) {
  customElements.define('accordion-list', AccordionElement);
}
export default AccordionElement;
