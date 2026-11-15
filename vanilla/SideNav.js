/**
 * SideNav - Vanilla Web Component
 * Usage: <side-nav heading="Workspace" active-id="overview" groups='[{"title":"Main","items":[{"id":"overview","label":"Overview","icon":"eye"}]}]'></side-nav>
 * Attributes: heading, active-id, groups (JSON)
 * Events: navigate (detail: { id, entry })
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

const parseJsonAttr = (raw) => {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export class SideNavElement extends HTMLElement {
  static get observedAttributes() {
    return ['heading', 'active-id'];
  }

  constructor() {
    super();
    this._groups = [];
  }

  get groups() {
    return this._groups;
  }

  set groups(value) {
    this._groups = Array.isArray(value) ? value : [];
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

  render() {
    this._applyHostClass('block');
    const heading = this.getAttribute('heading') || '';
    const activeId = this.getAttribute('active-id') ?? '';

    const groupHtml = (() => {
      const groups = this._groups.length ? this._groups : parseJsonAttr(this.getAttribute('groups'));
      return groups
      .map(
        (group, groupIndex) => `<div class="flex flex-col gap-0.5">
          ${group.title ? `<p class="px-2.5 pb-1 text-[10px] font-semibold uppercase tracking-wide text-zinc-400">${escapeAttribute(group.title)}</p>` : ''}
          ${Array.isArray(group.items)
            ? group.items
                .map((entry) => {
                  const active = String(entry.id) === String(activeId);
                  return `<button type="button" data-nav-id="${escapeAttribute(entry.id)}" ${active ? 'aria-current="page"' : ''}
                    class="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                      active
                        ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
                        : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/60 dark:hover:text-zinc-200'
                    }">
                    ${entry.icon ? uiIcon(entry.icon, { size: 14, className: active ? 'text-indigo-500' : 'text-zinc-400' }) : ''}
                    <span class="min-w-0 flex-1 truncate">${escapeAttribute(entry.label)}</span>
                    ${
                      entry.count !== undefined
                        ? `<span class="rounded-full px-1.5 py-px font-mono text-[9.5px] font-semibold ${
                            entry.count > 0
                              ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                              : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400'
                          }">${escapeAttribute(entry.count)}</span>`
                        : ''
                    }
                  </button>`;
                })
                .join('')
            : ''}
        </div>`,
      )
      .join('');
    })();

    this.innerHTML = `<nav data-side-nav aria-label="${escapeAttribute(heading || 'Side navigation')}" class="flex flex-col gap-4 rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900">
      ${heading ? `<p class="px-2.5 text-[10px] font-semibold uppercase tracking-wide text-zinc-400">${escapeAttribute(heading)}</p>` : ''}
      ${groupHtml}
    </nav>`;

    this.querySelectorAll('[data-nav-id]').forEach((button) => {
      button.addEventListener('click', () => {
        const id = button.getAttribute('data-nav-id');
        const entry = this._findEntry(id);
        this.dispatchEvent(new CustomEvent('navigate', { detail: { id, entry } }));
      });
    });
  }

  _findEntry(id) {
    const groups = this._groups.length ? this._groups : parseJsonAttr(this.getAttribute('groups'));
    for (const group of groups) {
      for (const entry of Array.isArray(group.items) ? group.items : []) {
        if (String(entry.id) === String(id)) return entry;
      }
    }
    return null;
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('side-nav')) {
  customElements.define('side-nav', SideNavElement);
}
export default SideNavElement;
