import uiIcon from './UiIcon.js';

const escapeAttribute = (value) =>
  String(value).replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  }[char]));

const TYPE_META = {
  info: { chip: 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400', icon: 'info' },
  success: { chip: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400', icon: 'check-circle' },
  warning: { chip: 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400', icon: 'alert-triangle' },
  error: { chip: 'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400', icon: 'circle-x' },
};

/**
 * NotificationCenter - Vanilla Web Component
 * Usage: <notification-center open></notification-center>
 * Properties: notifications (NotificationItem[])
 * Events: select (detail: item), mark-read (detail: ids[]), mark-all-read, close, open-preferences
 * Attrs: show-prefs-button — renders a gear button that emits open-preferences
 */
export class NotificationCenterElement extends HTMLElement {
  static get observedAttributes() {
    return ['open', 'title', 'empty-text', 'show-filter', 'show-prefs-button'];
  }

  constructor() {
    super();
    this._notifications = [];
    this._filter = 'all';
  }

  get notifications() {
    return this._notifications;
  }

  set notifications(value) {
    this._notifications = Array.isArray(value) ? value : [];
    this.render();
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback() {
    if (this.hasAttribute('open')) this._filter = 'all';
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

  _unreadIds() {
    return this._notifications.filter((item) => item.unread).map((item) => item.id);
  }

  render() {
    this._applyHostClass('block');

    if (!this.hasAttribute('open')) {
      this.innerHTML = '';
      return;
    }

    const title = this.getAttribute('title') || 'Notifications';
    const emptyText = this.getAttribute('empty-text') || "You're all caught up";
    const showFilter = this.getAttribute('show-filter') !== 'false';
    const unreadIds = this._unreadIds();
    const visible =
      this._filter === 'unread' ? this._notifications.filter((item) => item.unread) : this._notifications;

    const filterRow = showFilter
      ? `<div class="flex gap-1 border-b border-zinc-100 dark:border-zinc-800 px-3 py-1.5">
          ${['all', 'unread']
            .map((key) => {
              const active = this._filter === key;
              const count = key === 'all' ? this._notifications.length : unreadIds.length;
              return `<button type="button" class="notif-filter rounded-md px-2 py-1 text-[11px] font-medium capitalize transition-colors ${
                active
                  ? 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-100'
                  : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200'
              }" data-filter="${key}" aria-pressed="${active}">${key}<span class="ml-1 tabular-nums text-zinc-400">${count}</span></button>`;
            })
            .join('')}
        </div>`
      : '';

    const body = visible.length
      ? `<ul class="divide-y divide-zinc-100 dark:divide-zinc-800">
          ${visible
            .map((item) => {
              const meta = TYPE_META[item.type] || TYPE_META.info;
              return `<li>
                <button type="button" class="notif-item flex w-full items-start gap-2.5 px-3 py-2.5 text-left transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50" data-id="${escapeAttribute(item.id)}">
                  <span class="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${meta.chip}">${uiIcon(item.icon || meta.icon, { size: 13 })}</span>
                  <span class="min-w-0 flex-1">
                    <span class="flex items-center gap-1.5">
                      <span class="truncate text-[11px] font-medium text-zinc-800 dark:text-zinc-100">${escapeAttribute(item.title)}</span>
                      ${item.unread ? '<span class="h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-500" aria-label="Unread"></span>' : ''}
                    </span>
                    ${item.description ? `<span class="mt-0.5 block text-[11px] leading-snug text-zinc-500 dark:text-zinc-400">${escapeAttribute(item.description)}</span>` : ''}
                    ${item.time ? `<span class="mt-0.5 block text-[10px] text-zinc-400">${escapeAttribute(item.time)}</span>` : ''}
                  </span>
                </button>
              </li>`;
            })
            .join('')}
        </ul>`
      : `<div class="px-3 py-8 text-center">
          <span class="mx-auto mb-1.5 block text-emerald-500">${uiIcon('check-circle', { size: 20 })}</span>
          <p class="text-[11px] text-zinc-400">${escapeAttribute(emptyText)}</p>
        </div>`;

    this.innerHTML = `
      <div class="w-full max-w-sm overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-lg" role="region" aria-label="${escapeAttribute(title)}">
        <div class="flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800 px-3 py-2.5">
          <span class="shrink-0 text-zinc-400">${uiIcon('bell', { size: 14 })}</span>
          <h3 class="text-xs font-semibold text-zinc-800 dark:text-zinc-200">${escapeAttribute(title)}</h3>
          ${
            unreadIds.length
              ? `<span class="rounded-full bg-indigo-100 px-1.5 py-0.5 text-[10px] font-medium tabular-nums text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">${unreadIds.length} new</span>`
              : ''
          }
          ${this.hasAttribute('show-prefs-button') ? `<button type="button" class="notif-prefs rounded-md p-1 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-200" aria-label="Notification preferences">${uiIcon('settings', { size: 12 })}</button>` : ''}
          <button type="button" class="notif-mark-all ml-auto text-[11px] font-medium text-indigo-600 transition-colors hover:text-indigo-500 disabled:cursor-not-allowed disabled:text-zinc-300 dark:text-indigo-400 dark:disabled:text-zinc-600" ${unreadIds.length ? '' : 'disabled'}>Mark all read</button>
          <button type="button" class="notif-close rounded-md p-1 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-200" aria-label="Close notifications">${uiIcon('x', { size: 12 })}</button>
        </div>
        ${filterRow}
        <div class="max-h-72 overflow-y-auto">${body}</div>
      </div>`;

    this.querySelectorAll('.notif-filter').forEach((button) => {
      button.addEventListener('click', () => {
        this._filter = button.getAttribute('data-filter');
        this.render();
      });
    });

    this.querySelectorAll('.notif-item').forEach((button) => {
      button.addEventListener('click', () => {
        const id = button.getAttribute('data-id');
        const item = this._notifications.find((entry) => String(entry.id) === String(id));
        if (!item) return;
        if (item.unread) this.dispatchEvent(new CustomEvent('mark-read', { detail: [item.id] }));
        this.dispatchEvent(new CustomEvent('select', { detail: item }));
      });
    });

    const markAll = this.querySelector('.notif-mark-all');
    markAll.addEventListener('click', () => {
      if (!this._unreadIds().length) return;
      this.dispatchEvent(new CustomEvent('mark-all-read'));
    });

    const prefsBtn = this.querySelector('.notif-prefs');
    if (prefsBtn) {
      prefsBtn.addEventListener('click', () => {
        this.dispatchEvent(new CustomEvent('open-preferences', { bubbles: true }));
      });
    }

    this.querySelector('.notif-close').addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('close'));
    });
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('notification-center')) {
  customElements.define('notification-center', NotificationCenterElement);
}
export default NotificationCenterElement;
