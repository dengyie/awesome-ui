/**
 * WorkspaceSwitcherMenu - Vanilla Web Component
 * Usage: <workspace-switcher workspaces='[{"id":"acme","name":"Acme Inc","memberCount":12,"role":"Admin","current":true}]'></workspace-switcher>
 * Attributes: variant (page|dropdown), title, subtitle, create-label, logout-label, footer-name, footer-email, footer-initials
 * Properties: workspaces (Array<{id,name,logo?,memberCount?,role?,current?}>), footerUser ({name,email,initials?})
 * Events: select (detail {workspace}), create-new, logout
 */
const escapeAttribute = (value) =>
  String(value).replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  }[char]));

const initialsOf = (name) =>
  String(name || '')
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => (part[0] || '').toUpperCase())
    .join('');

export class WorkspaceSwitcherMenuElement extends HTMLElement {
  static get observedAttributes() {
    return ['variant', 'title', 'subtitle', 'create-label', 'logout-label', 'footer-name', 'footer-email', 'footer-initials'];
  }

  constructor() {
    super();
    this._workspaces = [];
    this._footerUser = null;
    this._bound = false;
  }

  get workspaces() {
    return this._workspaces;
  }

  set workspaces(list) {
    this._workspaces = Array.isArray(list) ? list : [];
    this.render();
  }

  get footerUser() {
    return this._footerUser;
  }

  set footerUser(user) {
    this._footerUser = user && typeof user === 'object' ? user : null;
    this.render();
  }

  connectedCallback() {
    if (!this._workspaces.length) {
      const raw = this.getAttribute('workspaces');
      if (raw) {
        try {
          this._workspaces = JSON.parse(raw);
        } catch {
          this._workspaces = [];
        }
      }
    }
    if (!this._footerUser) {
      const name = this.getAttribute('footer-name');
      if (name) {
        this._footerUser = {
          name,
          email: this.getAttribute('footer-email') || '',
          initials: this.getAttribute('footer-initials') || undefined,
        };
      }
    }
    this.render();
    if (!this._bound) {
      this._bound = true;
      this.addEventListener('click', (event) => {
        const option = event.target.closest('[data-workspace-option]');
        if (option) {
          const workspace = this._workspaces.find((item) => item.id === option.getAttribute('data-workspace-option'));
          if (workspace) this.dispatchEvent(new CustomEvent('select', { detail: { workspace } }));
        }
        if (event.target.closest('[data-workspace-create]')) this.dispatchEvent(new CustomEvent('create-new'));
        if (event.target.closest('[data-workspace-logout]')) this.dispatchEvent(new CustomEvent('logout'));
      });
    }
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
    const page = (this.getAttribute('variant') || 'page') === 'page';
    this._applyHostClass(page ? 'block' : 'block w-72');
    const title = this.getAttribute('title') || 'Workspaces';
    const subtitle = this.getAttribute('subtitle') || 'Choose the workspace you want to access';
    const createLabel = this.getAttribute('create-label') || '+ Create new workspace';
    const logoutLabel = this.getAttribute('logout-label') || 'Log out';
    const workspaces = Array.isArray(this._workspaces) ? this._workspaces : [];
    const footerUser = this._footerUser;

    const roleLine = (workspace) => {
      const count = workspace.memberCount ?? 1;
      let line = `${count} member${count === 1 ? '' : 's'}`;
      if (workspace.role) {
        const article = workspace.role.startsWith('A') || workspace.role.startsWith('E') ? 'an' : 'a';
        line += ` · You are ${article} ${workspace.role}`;
      }
      return line;
    };

    this.innerHTML = `<div data-workspace-switcher class="w-full overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 ${page ? 'p-5' : 'p-3'}">
      ${
        title
          ? `<div class="${page ? '' : 'px-2 pt-1'}">
              <p class="text-base font-bold text-zinc-900 dark:text-zinc-50">${escapeAttribute(title)}</p>
              ${subtitle ? `<p class="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">${escapeAttribute(subtitle)}</p>` : ''}
            </div>`
          : ''
      }
      <ul class="${page ? 'mt-4 space-y-2' : 'mt-3 space-y-1'}">
        ${workspaces
          .map(
            (workspace) => `<li>
              <button type="button" data-workspace-option="${escapeAttribute(workspace.id)}" class="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                workspace.current ? 'bg-zinc-100 dark:bg-zinc-800' : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/60'
              }">
                ${
                  workspace.logo
                    ? `<img src="${escapeAttribute(workspace.logo)}" alt="" class="h-9 w-9 shrink-0 rounded-lg" />`
                    : `<span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-xs font-bold text-white">${escapeAttribute(initialsOf(workspace.name))}</span>`
                }
                <span class="min-w-0 flex-1">
                  <span class="block truncate text-xs font-semibold text-zinc-900 dark:text-zinc-50">${escapeAttribute(workspace.name)}</span>
                  <span class="block text-[11px] text-zinc-500 dark:text-zinc-400">${escapeAttribute(roleLine(workspace))}</span>
                </span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-3.5 w-3.5 shrink-0 text-zinc-400"><path d="m9 18 6-6-6-6" /></svg>
              </button>
            </li>`,
          )
          .join('')}
      </ul>
      ${
        createLabel
          ? `<button type="button" data-workspace-create class="w-full rounded-lg border border-zinc-300 px-3 py-2 text-xs font-semibold text-zinc-700 transition-colors hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-800 ${page ? 'mt-4' : 'mt-2'}">${escapeAttribute(createLabel)}</button>`
          : ''
      }
      ${
        footerUser
          ? `<div class="flex items-center gap-2.5 border-t border-zinc-200 pt-3 dark:border-zinc-800 ${page ? 'mt-4' : 'mt-3'}">
              <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-200 text-xs font-bold text-zinc-600 dark:bg-zinc-700 dark:text-zinc-200">${escapeAttribute(footerUser.initials || initialsOf(footerUser.name))}</span>
              <span class="min-w-0 flex-1">
                <span class="block truncate text-xs font-semibold text-zinc-900 dark:text-zinc-50">${escapeAttribute(footerUser.name)}</span>
                <span class="block truncate text-[11px] text-zinc-500 dark:text-zinc-400">${escapeAttribute(footerUser.email)}</span>
              </span>
              ${
                logoutLabel
                  ? `<button type="button" data-workspace-logout class="shrink-0 rounded-lg border border-zinc-300 px-2.5 py-1.5 text-[11px] font-semibold text-zinc-600 transition-colors hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800">${escapeAttribute(logoutLabel)}</button>`
                  : ''
              }
            </div>`
          : ''
      }
    </div>`;
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('workspace-switcher')) {
  customElements.define('workspace-switcher', WorkspaceSwitcherMenuElement);
}
export default WorkspaceSwitcherMenuElement;
