/**
 * SettingsSideDrawer - Vanilla Web Component
 * Usage: <settings-side-drawer title="Settings" side="right|left" footer-primary="Deploy" footer-secondary="Cancel"></settings-side-drawer>
 * Attributes: title, side, footer-primary, footer-secondary
 * Properties: tabs ({ id, label }[]), active-tab (string attr), sections ({ title?, rows: { label, description?, control?, value?, options?, buttonLabel?, buttonTone?, enabled? }[] }[])
 * Events: close, tab-change (detail {id}), row-toggle (detail {label, enabled}), row-action (detail {label}), footer-primary
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

const BUTTON_TONE = {
  indigo: 'bg-indigo-600 text-white hover:bg-indigo-500',
  danger: 'border border-rose-300 text-rose-600 hover:bg-rose-50 dark:border-rose-500/50 dark:hover:bg-rose-950/40',
  outline: 'border border-zinc-300 text-zinc-600 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800',
};

export class SettingsSideDrawerElement extends HTMLElement {
  static get observedAttributes() {
    return ['title', 'side', 'active-tab', 'footer-primary', 'footer-secondary'];
  }

  constructor() {
    super();
    this._tabs = [];
    this._sections = [];
  }

  get tabs() {
    return this._tabs;
  }

  set tabs(value) {
    this._tabs = Array.isArray(value) ? value : [];
    this.render();
  }

  get sections() {
    return this._sections;
  }

  set sections(value) {
    this._sections = Array.isArray(value) ? value : [];
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
    const title = this.getAttribute('title') || 'Settings';
    const side = this.getAttribute('side') || 'right';
    const activeTab = this.getAttribute('active-tab') || '';
    const footerPrimary = this.getAttribute('footer-primary') || '';
    const footerSecondary = this.getAttribute('footer-secondary') || '';
    const sideClass = side === 'left' ? 'left-0 rounded-r-2xl' : 'right-0 rounded-l-2xl';

    const rowControl = (row) => {
      if (row.control === 'toggle') {
        return `<button type="button" role="switch" aria-checked="${Boolean(row.enabled)}" data-row-toggle
          class="flex h-5 w-9 shrink-0 items-center rounded-full px-0.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${row.enabled ? 'bg-indigo-600' : 'bg-zinc-300 dark:bg-zinc-700'}">
          <span class="h-4 w-4 rounded-full bg-white shadow transition-transform ${row.enabled ? 'translate-x-4' : ''}"></span>
        </button>`;
      }
      if (row.control === 'select') {
        return `<select data-row-select class="shrink-0 rounded-lg border border-zinc-300 bg-white px-2 py-1 text-xs font-medium text-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-200">
          ${(row.options || []).map((option) => `<option>${escapeAttribute(option)}</option>`).join('')}
        </select>`;
      }
      if (row.control === 'button') {
        return `<button type="button" data-row-button class="shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${BUTTON_TONE[row.buttonTone || 'outline']}">${escapeAttribute(row.buttonLabel || 'Open')}</button>`;
      }
      return '';
    };

    this.innerHTML = `<div data-side-drawer data-side="${escapeAttribute(side)}" class="fixed inset-0 z-40">
      <div class="absolute inset-0 bg-zinc-950/50" data-drawer-overlay></div>
      <aside data-drawer-panel role="dialog" aria-label="${escapeAttribute(title)}" class="absolute top-0 flex h-full w-full max-w-md flex-col border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-900 ${sideClass}">
        <div class="flex items-center justify-between border-b border-zinc-200 px-5 py-4 dark:border-zinc-800">
          <h2 class="text-base font-bold text-zinc-900 dark:text-zinc-50">${escapeAttribute(title)}</h2>
          <button type="button" data-drawer-close aria-label="Close settings" class="rounded-md p-1 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800">${uiIcon('x', { size: 16 })}</button>
        </div>
        ${
          this._tabs.length
            ? `<div class="flex gap-1 border-b border-zinc-200 px-5 pt-1 dark:border-zinc-800" role="tablist" data-drawer-tabs>
                ${this._tabs
                  .map(
                    (tab) => `<button type="button" role="tab" aria-selected="${tab.id === activeTab}" data-drawer-tab="${escapeAttribute(tab.id)}"
                      class="-mb-px border-b-2 px-3 py-2 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                        tab.id === activeTab
                          ? 'border-indigo-500 text-zinc-900 dark:text-zinc-50'
                          : 'border-transparent text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200'
                      }">${escapeAttribute(tab.label)}</button>`,
                  )
                  .join('')}
              </div>`
            : ''
        }
        <div class="flex-1 overflow-y-auto px-5 py-4" data-drawer-body>
          ${this._sections
            .map(
              (section, sectionIndex) => `<section class="${sectionIndex > 0 ? 'mt-5 border-t border-zinc-200 pt-4 dark:border-zinc-800' : ''}">
                ${section.title ? `<h3 class="text-sm font-bold text-zinc-900 dark:text-zinc-50">${escapeAttribute(section.title)}</h3>` : ''}
                <ul class="${section.title ? 'mt-2 space-y-3' : 'space-y-3'}">
                  ${(section.rows || [])
                    .map(
                      (row) => `<li class="flex items-center justify-between gap-4" data-settings-row="${escapeAttribute(row.label)}">
                        <span class="min-w-0">
                          <span class="block text-xs font-semibold text-zinc-800 dark:text-zinc-100">${escapeAttribute(row.label)}</span>
                          ${row.description ? `<span class="mt-0.5 block text-[11px] leading-relaxed text-zinc-500 dark:text-zinc-400">${escapeAttribute(row.description)}</span>` : ''}
                        </span>
                        ${rowControl(row)}
                      </li>`,
                    )
                    .join('')}
                </ul>
              </section>`,
            )
            .join('')}
        </div>
        ${
          footerPrimary || footerSecondary
            ? `<div class="flex items-center justify-end gap-2 border-t border-zinc-200 px-5 py-3 dark:border-zinc-800" data-drawer-footer>
                ${footerSecondary ? `<button type="button" data-drawer-secondary class="rounded-lg px-3 py-1.5 text-xs font-semibold text-zinc-500 transition-colors hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200">${escapeAttribute(footerSecondary)}</button>` : ''}
                ${footerPrimary ? `<button type="button" data-drawer-primary class="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-indigo-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500">${escapeAttribute(footerPrimary)}</button>` : ''}
              </div>`
            : ''
        }
      </aside>
    </div>`;

    const overlay = this.querySelector('[data-drawer-overlay]');
    if (overlay) overlay.addEventListener('click', () => this.dispatchEvent(new CustomEvent('close')));
    const closeBtn = this.querySelector('[data-drawer-close]');
    if (closeBtn) closeBtn.addEventListener('click', () => this.dispatchEvent(new CustomEvent('close')));
    this.querySelectorAll('[data-drawer-tab]').forEach((button) => {
      button.addEventListener('click', () => {
        const id = button.getAttribute('data-drawer-tab');
        this.setAttribute('active-tab', id);
        this.dispatchEvent(new CustomEvent('tab-change', { detail: { id } }));
      });
    });
    this.querySelectorAll('[data-row-toggle]').forEach((button) => {
      button.addEventListener('click', () => {
        const row = button.closest('[data-settings-row]');
        const label = row?.getAttribute('data-settings-row') || '';
        const enabled = button.getAttribute('aria-checked') !== 'true';
        this.dispatchEvent(new CustomEvent('row-toggle', { detail: { label, enabled } }));
      });
    });
    this.querySelectorAll('[data-row-button]').forEach((button) => {
      button.addEventListener('click', () => {
        const row = button.closest('[data-settings-row]');
        this.dispatchEvent(new CustomEvent('row-action', { detail: { label: row?.getAttribute('data-settings-row') || '' } }));
      });
    });
    const primary = this.querySelector('[data-drawer-primary]');
    if (primary) primary.addEventListener('click', () => this.dispatchEvent(new CustomEvent('footer-primary')));
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('settings-side-drawer')) {
  customElements.define('settings-side-drawer', SettingsSideDrawerElement);
}
export default SettingsSideDrawerElement;
