/**
 * InboxList - Vanilla Web Component
 * Usage: <inbox-list></inbox-list> with `messages` property
 * Attributes: empty-text
 * Properties: messages ({ id, sender, count?, subject, snippet?, dateLabel, unread?, tag?, tagTone? }[])
 * Events: select (detail: { message })
 */
const escapeAttribute = (value) =>
  String(value).replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  }[char]));

const TAG_TONE = {
  rose: 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300',
  emerald: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300',
  indigo: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300',
};

export class InboxListElement extends HTMLElement {
  static get observedAttributes() {
    return ['empty-text'];
  }

  constructor() {
    super();
    this._messages = [];
  }

  get messages() {
    return this._messages;
  }

  set messages(value) {
    this._messages = Array.isArray(value) ? value : [];
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
    const emptyText = this.getAttribute('empty-text') || 'Inbox zero — enjoy your day';

    if (this._messages.length === 0) {
      this.innerHTML = `<div class="rounded-xl border border-zinc-200 bg-white px-4 py-8 text-center text-xs text-zinc-400 dark:border-zinc-800 dark:bg-zinc-900">${escapeAttribute(emptyText)}</div>`;
      return;
    }

    const rows = this._messages
      .map((message, index) => {
        const active = String(message.id) === String(this.getAttribute('active-id') ?? '');
        return `<div role="button" tabindex="0" data-inbox-index="${index}" ${active ? 'aria-current="true"' : ''}
          class="flex cursor-pointer items-start gap-3 px-4 py-2.5 transition-colors ${
            active ? 'bg-indigo-50/70 dark:bg-indigo-950/40' : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/60'
          }">
          <span class="flex w-2 shrink-0 pt-1.5">${
            message.unread ? '<span class="h-1.5 w-1.5 rounded-full bg-indigo-500" aria-label="Unread"></span>' : ''
          }</span>
          <span class="w-36 shrink-0 truncate text-xs font-semibold text-zinc-800 dark:text-zinc-200">${escapeAttribute(message.sender)}${
            message.count ? `<span class="ml-1 font-normal text-zinc-400">${escapeAttribute(message.count)}</span>` : ''
          }</span>
          <span class="min-w-0 flex-1 truncate text-xs text-zinc-600 dark:text-zinc-300">
            ${
              message.tag
                ? `<span class="mr-1.5 inline-block rounded px-1.5 py-px align-middle font-mono text-[9.5px] font-medium ${TAG_TONE[message.tagTone] || TAG_TONE.rose}">${escapeAttribute(message.tag)}</span>`
                : ''
            }<span class="${message.unread ? 'font-medium' : 'font-normal'} text-zinc-800 dark:text-zinc-200">${escapeAttribute(message.subject)}</span>${
              message.snippet ? `<span class="text-zinc-400"> — ${escapeAttribute(message.snippet)}</span>` : ''
            }</span>
          <span class="shrink-0 pt-px font-mono text-[10px] uppercase text-zinc-400">${escapeAttribute(message.dateLabel)}</span>
        </div>`;
      })
      .join('');

    this.innerHTML = `<div class="divide-y divide-zinc-100 overflow-hidden rounded-xl border border-zinc-200 bg-white dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-900">${rows}</div>`;

    this.querySelectorAll('[data-inbox-index]').forEach((row) => {
      row.addEventListener('click', () => {
        const message = this._messages[Number(row.getAttribute('data-inbox-index'))];
        this.dispatchEvent(new CustomEvent('select', { detail: { message } }));
      });
    });
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('inbox-list')) {
  customElements.define('inbox-list', InboxListElement);
}
export default InboxListElement;
