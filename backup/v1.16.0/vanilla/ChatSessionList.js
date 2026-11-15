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
 * ChatSessionList - Vanilla Web Component
 * Usage: <chat-session-list active-id="2"></chat-session-list>
 * Sessions: property [{ id, title, timeLabel?, group? }] — optional `group`
 * labels (e.g. "Today") render collapsible headers; sessions without one go
 * to an uncollapsible "Recent" bucket. `user` property { name, email?,
 * avatarUrl? } renders a bottom user card. Events: select (detail: session),
 * delete (detail: { id }), user-click. Group collapse is internal view state.
 */
export class ChatSessionListElement extends HTMLElement {
  static get observedAttributes() {
    return ['active-id', 'title', 'empty-text'];
  }

  constructor() {
    super();
    this._sessions = [];
    this._user = null;
    this._collapsedGroups = new Set();
  }

  get sessions() {
    return this._sessions;
  }

  set sessions(val) {
    this._sessions = Array.isArray(val) ? val : [];
    this.render();
  }

  get user() {
    return this._user;
  }

  set user(val) {
    this._user = val && typeof val === 'object' ? val : null;
    this.render();
  }

  get activeId() {
    return this.getAttribute('active-id');
  }

  set activeId(val) {
    if (val === null || val === undefined) this.removeAttribute('active-id');
    else this.setAttribute('active-id', String(val));
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback() {
    this.render();
  }

  _applyHostClass(layoutClass) {
    const prev = this._appliedLayout || '';
    let user = this.className || '';
    if (prev && user.startsWith(prev)) user = user.slice(prev.length).trim();
    this._appliedLayout = layoutClass;
    const next = `${layoutClass}${user ? ` ${user}` : ''}`;
    if (this.className !== next) this.className = next;
  }

  _sessionRow(s) {
    const isActive = String(s.id) === String(this.activeId);
    return `
      <li>
        <div
          role="button"
          tabindex="0"
          data-session-id="${escapeAttribute(s.id)}"
          class="session-item group w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-left text-sm cursor-pointer transition-colors ${
            isActive
              ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300'
              : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/70'
          }"
        >
          <span class="flex-1 min-w-0">
            <span class="block truncate font-medium">${escapeAttribute(s.title)}</span>
            ${s.timeLabel ? `<span class="block text-[11px] text-zinc-400">${escapeAttribute(s.timeLabel)}</span>` : ''}
          </span>
          <button
            type="button"
            data-delete-id="${escapeAttribute(s.id)}"
            aria-label="Delete session"
            class="session-delete opacity-0 group-hover:opacity-100 focus:opacity-100 p-1 rounded-md text-zinc-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all shrink-0"
          >${uiIcon('x', { size: 13 })}</button>
        </div>
      </li>`;
  }

  render() {
    const title = this.getAttribute('title') || 'Chats';
    const emptyText = this.getAttribute('empty-text') || 'No conversations yet';

    const headerHtml = `
      <div class="flex items-center gap-2 px-4 py-3 border-b border-zinc-100 dark:border-zinc-800 text-sm font-semibold text-zinc-800 dark:text-zinc-200">
        ${uiIcon('sparkles', { size: 15, className: 'text-indigo-500' })}
        ${escapeAttribute(title)}
        <span class="ml-auto text-[11px] font-mono font-normal text-zinc-400">${this._sessions.length}</span>
      </div>`;

    // Bottom user card
    let userHtml = '';
    if (this._user) {
      const initials = (this._user.name || '?')
        .trim()
        .split(/\s+/)
        .map((w) => w[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();
      userHtml = `
        <button type="button" class="user-card flex items-center gap-2.5 px-3.5 py-3 border-t border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors text-left">
          ${
            this._user.avatarUrl
              ? `<img src="${escapeAttribute(this._user.avatarUrl)}" alt="" class="h-7 w-7 rounded-full object-cover shrink-0" />`
              : `<span class="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 shrink-0">${escapeAttribute(initials)}</span>`
          }
          <span class="flex-1 min-w-0">
            <span class="block truncate text-xs font-medium text-zinc-800 dark:text-zinc-200">${escapeAttribute(this._user.name)}</span>
            ${this._user.email ? `<span class="block truncate text-[11px] text-zinc-400">${escapeAttribute(this._user.email)}</span>` : ''}
          </span>
          ${uiIcon('settings', { size: 14, className: 'text-zinc-400 shrink-0' })}
        </button>`;
    }

    if (this._sessions.length === 0) {
      this._applyHostClass('flex flex-col w-64 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden');
      this.innerHTML = `${headerHtml}<div class="p-6 text-center text-xs text-zinc-400">${escapeAttribute(emptyText)}</div>${userHtml}`;
      this._bindUserCard();
      return;
    }

    // Preserve the sessions' original order; group headers appear on first occurrence.
    const groups = [];
    this._sessions.forEach((s) => {
      const label = s.group || 'Recent';
      const existing = groups.find((g) => g.label === label);
      if (existing) existing.items.push(s);
      else groups.push({ label, items: [s] });
    });

    const groupsHtml = groups
      .map((group) => {
        if (group.label === 'Recent') {
          return `<div class="mb-1 last:mb-0"><ul class="space-y-0.5">${group.items.map((s) => this._sessionRow(s)).join('')}</ul></div>`;
        }
        const isCollapsed = this._collapsedGroups.has(group.label);
        return `
          <div class="mb-1 last:mb-0">
            <button type="button" data-group-label="${escapeAttribute(group.label)}" aria-expanded="${!isCollapsed}"
              class="group-toggle flex w-full items-center gap-1 px-2.5 pt-2 pb-1 text-[10px] uppercase font-semibold tracking-wider text-zinc-400 hover:text-zinc-500 dark:hover:text-zinc-300 transition-colors select-none">
              <span class="inline-flex transition-transform duration-150 ${isCollapsed ? '-rotate-90' : ''}">${uiIcon('chevron-down', { size: 11 })}</span>
              <span class="flex-1 text-left">${escapeAttribute(group.label)}</span>
              <span class="font-mono font-normal">${group.items.length}</span>
            </button>
            ${isCollapsed ? '' : `<ul class="space-y-0.5">${group.items.map((s) => this._sessionRow(s)).join('')}</ul>`}
          </div>`;
      })
      .join('');

    this._applyHostClass('flex flex-col w-64 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden');
    this.innerHTML = `${headerHtml}<div class="flex-1 overflow-y-auto p-1.5">${groupsHtml}</div>${userHtml}`;

    this.querySelectorAll('.group-toggle').forEach((btn) => {
      btn.addEventListener('click', () => {
        const label = btn.getAttribute('data-group-label');
        if (this._collapsedGroups.has(label)) this._collapsedGroups.delete(label);
        else this._collapsedGroups.add(label);
        this.render();
      });
    });

    this.querySelectorAll('.session-item').forEach((row) => {
      const id = row.getAttribute('data-session-id');
      const session = this._sessions.find((s) => String(s.id) === String(id));
      if (!session) return;
      const select = () => this.dispatchEvent(new CustomEvent('select', { detail: session }));
      row.addEventListener('click', select);
      row.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          select();
        }
      });
    });

    this.querySelectorAll('.session-delete').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-delete-id');
        const session = this._sessions.find((s) => String(s.id) === String(id));
        if (session) this.dispatchEvent(new CustomEvent('delete', { detail: { id: session.id } }));
      });
    });

    this._bindUserCard();
  }

  _bindUserCard() {
    const card = this.querySelector('.user-card');
    if (card) {
      card.addEventListener('click', () => this.dispatchEvent(new CustomEvent('user-click')));
    }
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('chat-session-list')) {
  customElements.define('chat-session-list', ChatSessionListElement);
}
export default ChatSessionListElement;
