/**
 * PageHeader - Vanilla Web Component
 * Usage: <page-header title="Acme Analytics" description="…" status-text="Live" active-tab="Overview"></page-header>
 * Attributes: title, description, status-text, active-tab
 * Properties: actions ({ label, variant?, icon? }[]), tabs ({ label, count? }[]) — also accepted as JSON attributes
 * Events: action (detail: { label, variant }), tab-change (detail: { label, count })
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

const ACTION_VARIANT = {
  primary: 'bg-indigo-600 text-white hover:bg-indigo-500 focus-visible:ring-indigo-500',
  secondary:
    'border border-zinc-300 text-zinc-700 hover:bg-zinc-100 focus-visible:ring-zinc-400 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800',
  ghost:
    'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 focus-visible:ring-zinc-400 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200',
};

const parseJsonAttr = (raw) => {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export class PageHeaderElement extends HTMLElement {
  static get observedAttributes() {
    return ['title', 'description', 'status-text', 'active-tab'];
  }

  constructor() {
    super();
    this._actions = null;
    this._tabs = null;
  }

  get actions() {
    return this._actions ?? parseJsonAttr(this.getAttribute('actions'));
  }

  set actions(value) {
    this._actions = Array.isArray(value) ? value : [];
    this.render();
  }

  get tabs() {
    return this._tabs ?? parseJsonAttr(this.getAttribute('tabs'));
  }

  set tabs(value) {
    this._tabs = Array.isArray(value) ? value : [];
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
    const title = this.getAttribute('title') || '';
    const description = this.getAttribute('description') || '';
    const statusText = this.getAttribute('status-text') || '';
    const actions = this.actions;
    const tabs = this.tabs;
    const activeTab = this.getAttribute('active-tab') ?? '';

    this.innerHTML = `<header data-page-header class="flex flex-col gap-3">
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div class="min-w-0">
          <div class="flex items-center gap-2">
            <h2 class="truncate text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">${escapeAttribute(title)}</h2>
            ${
              statusText
                ? `<span class="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"><span aria-hidden="true" class="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>${escapeAttribute(statusText)}</span>`
                : ''
            }
          </div>
          ${description ? `<p class="mt-0.5 max-w-2xl text-xs text-zinc-500 dark:text-zinc-400">${escapeAttribute(description)}</p>` : ''}
        </div>
        ${
          actions.length
            ? `<div class="flex shrink-0 flex-wrap items-center gap-2">${actions
                .map(
                  (action) => `<button type="button" data-action-label="${escapeAttribute(action.label)}"
                    class="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 ${ACTION_VARIANT[action.variant || 'secondary']}">
                    ${action.icon ? uiIcon(action.icon, { size: 13 }) : ''}${escapeAttribute(action.label)}
                  </button>`,
                )
                .join('')}</div>`
            : ''
        }
      </div>
      ${
        tabs.length
          ? `<nav data-page-header-tabs class="flex flex-wrap items-center gap-1 border-b border-zinc-200 dark:border-zinc-800">${tabs
              .map((tab) => {
                const active = tab.label === activeTab;
                return `<button type="button" data-tab-label="${escapeAttribute(tab.label)}" ${active ? 'aria-current="page"' : ''}
                  class="-mb-px flex items-center gap-1.5 border-b-2 px-3 py-2 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                    active
                      ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                      : 'border-transparent text-zinc-500 hover:border-zinc-300 hover:text-zinc-800 dark:text-zinc-400 dark:hover:border-zinc-600 dark:hover:text-zinc-200'
                  }">
                  ${escapeAttribute(tab.label)}
                  ${
                    tab.count !== undefined
                      ? `<span class="rounded-full bg-zinc-100 px-1.5 py-px font-mono text-[9.5px] font-semibold text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">${escapeAttribute(tab.count)}</span>`
                      : ''
                  }
                </button>`;
              })
              .join('')}</nav>`
          : ''
      }
    </header>`;

    this.querySelectorAll('[data-action-label]').forEach((button) => {
      button.addEventListener('click', () => {
        const label = button.getAttribute('data-action-label');
        const action = actions.find((item) => item.label === label) || { label, variant: 'secondary' };
        this.dispatchEvent(new CustomEvent('action', { detail: { label, variant: action.variant || 'secondary' } }));
      });
    });
    this.querySelectorAll('[data-tab-label]').forEach((button) => {
      button.addEventListener('click', () => {
        const label = button.getAttribute('data-tab-label');
        this.setAttribute('active-tab', label);
        const tab = tabs.find((item) => item.label === label) || { label };
        this.dispatchEvent(new CustomEvent('tab-change', { detail: { label, count: tab.count } }));
      });
    });
  }
}
if (typeof customElements !== 'undefined' && !customElements.get('page-header')) {
  customElements.define('page-header', PageHeaderElement);
}
export default PageHeaderElement;
