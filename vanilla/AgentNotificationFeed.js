/**
 * AgentNotificationFeed - Vanilla Web Component
 * Agent run/training notification feed: status-dot rows with title +
 * highlighted status text, caption, relative time and unread markers.
 *
 * Usage: <agent-notification-feed title="Notifications"></agent-notification-feed>
 * Property: items ([{id, kind, title, statusText?, caption?, time, unread?}])
 * Attributes: title
 * Events: open (detail {item})
 */
const escapeAttribute = (value) =>
  String(value).replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  }[char]));

const KIND_DOT = {
  started: 'bg-sky-500',
  completed: 'bg-emerald-500',
  failed: 'bg-rose-500',
  info: 'bg-zinc-400',
};
const KIND_TEXT = {
  started: 'text-sky-600 dark:text-sky-400',
  completed: 'text-emerald-600 dark:text-emerald-400',
  failed: 'text-rose-600 dark:text-rose-400',
  info: 'text-zinc-500 dark:text-zinc-400',
};

export class AgentNotificationFeedElement extends HTMLElement {
  static get observedAttributes() {
    return ['title'];
  }

  constructor() {
    super();
    this._items = [];
    this._read = {};
    this._bound = false;
  }

  connectedCallback() {
    this.render();
    if (!this._bound) {
      this._bound = true;
      this.addEventListener('click', (event) => {
        const row = event.target.closest('[data-agent-feed-item]');
        if (!row) return;
        const id = row.getAttribute('data-agent-feed-item');
        const item = this._items.find((it) => it.id === id);
        if (!item) return;
        this._read[id] = true;
        this.dispatchEvent(new CustomEvent('open', { detail: { item } }));
        this.render();
      });
    }
  }

  get items() { return this._items; }
  set items(v) {
    this._items = Array.isArray(v) ? v.map((it) => ({ ...it })) : [];
    this.render();
  }

  attributeChangedCallback() {
    // Fires before connectedCallback when an already-connected element upgrades;
    // rendering then would wipe light-DOM children before items are captured.
    if (this._items.length === 0 && this.innerHTML === '') return;
    this.render();
  }

  render() {
    const title = escapeAttribute(this.getAttribute('title') || 'Notifications');
    const isUnread = (item) => !!item.unread && !this._read[item.id];
    const unreadCount = this._items.filter(isUnread).length;

    const rows = this._items.map((item) => {
      const unread = isUnread(item);
      const dot = unread ? (KIND_DOT[item.kind] || KIND_DOT.info) : 'bg-zinc-300 dark:bg-zinc-600';
      const statusText = item.statusText
        ? `<span class="font-semibold ${KIND_TEXT[item.kind] || KIND_TEXT.info}"> ${escapeAttribute(item.statusText)}</span>`
        : '';
      const caption = item.caption
        ? `<span class="mt-0.5 block text-[11px] text-zinc-500 dark:text-zinc-400">${escapeAttribute(item.caption)}</span>`
        : '';
      return `
        <button type="button" data-agent-feed-item="${escapeAttribute(item.id)}" data-unread="${unread ? 'true' : 'false'}" class="flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
          <span aria-hidden="true" class="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${dot}"></span>
          <span class="min-w-0 flex-1">
            <span class="block text-xs font-medium text-zinc-900 dark:text-zinc-50">${escapeAttribute(item.title)}${statusText}</span>
            ${caption}
          </span>
          <span class="shrink-0 text-[11px] text-zinc-400 dark:text-zinc-500">${escapeAttribute(item.time)}</span>
        </button>`;
    }).join('');

    const countBadge = unreadCount > 0
      ? `<span data-agent-feed-count class="rounded-full bg-indigo-50 px-2 py-0.5 text-[11px] font-semibold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">${unreadCount} new</span>`
      : '';
    const empty = this._items.length === 0
      ? '<p data-agent-feed-empty class="px-4 py-6 text-center text-xs text-zinc-400 dark:text-zinc-500">No notifications yet</p>'
      : '';

    this.innerHTML = `<div data-agent-feed class="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
  <div class="flex items-center justify-between border-b border-zinc-100 px-4 py-3 dark:border-zinc-800">
    <p data-agent-feed-title class="text-sm font-semibold text-zinc-900 dark:text-zinc-50">${title}</p>
    ${countBadge}
  </div>
  <div data-agent-feed-list class="divide-y divide-zinc-100 dark:divide-zinc-800">${rows}${empty}</div>
</div>`;
  }
}

if (!customElements.get('agent-notification-feed')) {
  customElements.define('agent-notification-feed', AgentNotificationFeedElement);
}
