/**
 * AIInlineMenu - Vanilla Web Component
 * Usage: <ai-inline-menu actions='[...]' loading="false" tone="neutral|brand"></ai-inline-menu>
 * Attributes: actions (JSON [{id,label,options?[]}]), loading, error, tone
 * Properties: actions
 * Events: action (detail {id, option?}), dismiss
 */
const escapeAttribute = (value) =>
  String(value).replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  }[char]));

const SPARKLE_SVG = '<svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14" aria-hidden="true"><path d="M10 2.5l1.4 4.1L15.5 8l-4.1 1.4L10 13.5 8.6 9.4 4.5 8l4.1-1.4L10 2.5Z"/><path d="M15.8 12.6l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7.7-2Z" opacity="0.7"/></svg>';
const CARET_SVG = '<svg viewBox="0 0 20 20" fill="none" width="14" height="14" aria-hidden="true"><path d="m6 8 4 4 4-4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const CLOSE_SVG = '<svg viewBox="0 0 20 20" fill="none" width="12" height="12" aria-hidden="true"><path d="m5 5 10 10M15 5 5 15" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';

export class AIInlineMenuElement extends HTMLElement {
  static get observedAttributes() {
    return ['actions', 'loading', 'error', 'tone'];
  }

  constructor() {
    super();
    this._actions = [];
    this._openId = null;
    this._lastRun = null;
    this._bound = false;
  }

  connectedCallback() {
    if (!this._actions.length) {
      const raw = this.getAttribute('actions');
      if (raw) {
        try { this._actions = JSON.parse(raw); } catch { this._actions = []; }
      }
    }
    this.render();
    if (!this._bound) {
      this._bound = true;
      this.addEventListener('click', (event) => {
        const dismiss = event.target.closest('[data-ai-dismiss]');
        if (dismiss) {
          this._openId = null;
          this.render();
          this.dispatchEvent(new CustomEvent('dismiss'));
          return;
        }
        const optionButton = event.target.closest('[data-ai-option]');
        if (optionButton) {
          const option = optionButton.getAttribute('data-ai-option');
          const actionId = optionButton.closest('[data-ai-menu]').getAttribute('data-ai-menu');
          this._openId = null;
          this._lastRun = `${actionId}:${option}`;
          this.render();
          this.dispatchEvent(new CustomEvent('action', { detail: { id: actionId, option } }));
          return;
        }
        const actionButton = event.target.closest('[data-ai-action]');
        if (actionButton && !this.getAttribute('loading')) {
          const id = actionButton.getAttribute('data-ai-action');
          const action = this._resolvedActions().find((a) => a.id === id);
          if (action && action.options && action.options.length) {
            this._openId = this._openId === id ? null : id;
            this.render();
          } else if (action) {
            this._openId = null;
            this._lastRun = id;
            this.render();
            this.dispatchEvent(new CustomEvent('action', { detail: { id } }));
          }
        }
      });
    }
  }

  attributeChangedCallback(name) {
    if (name === 'actions') this._actions = [];
    if (name === 'loading') this.render();
    this.render();
  }

  get actions() { return this._actions; }
  set actions(v) {
    this._actions = Array.isArray(v) ? v : [];
    this.render();
  }

  _resolvedActions() {
    return this._actions.length
      ? this._actions
      : [{ id: 'edit', label: 'Edit' }, { id: 'tone', label: 'Change tone', options: ['Professional', 'Friendly', 'Concise'] }];
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
    const loading = this.getAttribute('loading') === 'true';
    const error = this.getAttribute('error') || '';
    const brand = this.getAttribute('tone') === 'brand';
    const actions = this._resolvedActions();

    const hostClass = 'inline-flex max-w-full items-center gap-1 rounded-full border bg-white py-1 pl-1.5 pr-1 shadow-lg dark:bg-zinc-900';
    this._applyHostClass(hostClass);

    const chipClass = brand
      ? 'bg-emerald-50 text-emerald-700'
      : 'bg-indigo-50 text-indigo-600';

    const actionButtons = actions
      .map((action) => {
        const menu = this._openId === action.id && action.options && action.options.length
          ? `<div data-ai-menu="${escapeAttribute(action.id)}" class="absolute bottom-full left-0 z-10 mb-1 w-40 rounded-lg border border-zinc-200 bg-white py-1 shadow-lg">${action.options.map((option) => `<button type="button" data-ai-option="${escapeAttribute(option)}" class="block w-full px-3 py-1.5 text-left text-xs text-zinc-700 hover:bg-indigo-50 hover:text-indigo-700">${escapeAttribute(option)}</button>`).join('')}</div>`
          : '';
        return `<div class="relative"><button type="button" data-ai-action="${escapeAttribute(action.id)}"${loading ? ' disabled' : ''} class="inline-flex items-center gap-0.5 rounded-md px-1.5 py-1 text-xs font-medium text-indigo-600 transition-colors hover:bg-indigo-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50">${escapeAttribute(action.label)}${action.options && action.options.length ? CARET_SVG : ''}</button>${menu}</div>`;
      })
      .join('');

    const status = this._lastRun && !loading && !error
      ? `<span data-ai-status class="max-w-[160px] truncate px-1 text-[10px] text-zinc-400" title="${escapeAttribute(this._lastRun)}">${escapeAttribute(this._lastRun)}</span>`
      : '';
    const loadingLabel = loading ? '<span data-ai-loading class="px-1 text-[10px] text-indigo-500">Working…</span>' : '';
    const errorLabel = error ? `<span data-ai-error class="px-1 text-[10px] text-red-600">${escapeAttribute(error)}</span>` : '';

    this.innerHTML = `<div data-ai-inline-menu class="${hostClass}">
  <span class="inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${chipClass}"><span style="display:inline-flex${loading ? ';animation:pulse 2s cubic-bezier(0.4,0,0.6,1) infinite' : ''}">${SPARKLE_SVG}</span>AI</span>
  <span class="mx-0.5 h-4 w-px bg-zinc-200"></span>
  ${actionButtons}
  ${status}${loadingLabel}${errorLabel}
  <button type="button" data-ai-dismiss title="Dismiss" class="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500">${CLOSE_SVG}</button>
</div>`;
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('ai-inline-menu')) {
  customElements.define('ai-inline-menu', AIInlineMenuElement);
}

export default AIInlineMenuElement;
