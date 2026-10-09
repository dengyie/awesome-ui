import uiIcon from './UiIcon.js';

const escapeAttribute = (value) =>
  String(value).replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  }[char]));

export class ChatSessionListElement extends HTMLElement {
  static get observedAttributes() {
    return ['active-id', 'title', 'empty-text'];
  }

  constructor() {
    super();
    this._sessions = [];
  }

  get sessions() {
    return this._sessions;
  }

  set sessions(val) {
    this._sessions = Array.isArray(val) ? val : [];
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

  render() {
    const title = this.getAttribute('title') || 'Chats';
    const emptyText = this.getAttribute('empty-text') || 'No conversations yet';

    const headerHtml = `
      <div class="flex items-center gap-2 px-4 py-3 border-b border-zinc-100 dark:border-zinc-800 text-sm font-semibold text-zinc-800 dark:text-zinc-200">
        ${uiIcon('sparkles', { size: 15, className: 'text-indigo-500' })}
        ${escapeAttribute(title)}
        <span class="ml-auto text-[11px] font-mono font-normal text-zinc-400">${this._sessions.length}</span>
      </div>`;

    if (this._sessions.length === 0) {
      this._applyHostClass('flex flex-col w-64 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden');
      this.innerHTML = `${headerHtml}<div class="p-6 text-center text-xs text-zinc-400">${escapeAttribute(emptyText)}</div>`;
      return;
    }

    const itemsHtml = this._sessions
      .map((s) => {
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
      })
      .join('');

    this._applyHostClass('flex flex-col w-64 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden');
    this.innerHTML = `${headerHtml}<ul class="flex-1 overflow-y-auto p-1.5 space-y-0.5">${itemsHtml}</ul>`;

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
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('chat-session-list')) {
  customElements.define('chat-session-list', ChatSessionListElement);
}
export default ChatSessionListElement;
