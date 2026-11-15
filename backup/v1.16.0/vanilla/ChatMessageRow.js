import uiIcon from './UiIcon.js';

const escapeAttribute = (value) =>
  String(value).replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  }[char]));

export class ChatMessageRowElement extends HTMLElement {
  static get observedAttributes() {
    return ['role', 'name', 'avatar', 'timestamp', 'content'];
  }

  constructor() {
    super();
    this._content = '';
    this._appliedLayout = '';
  }

  get content() {
    return this._content;
  }

  set content(val) {
    this._content = String(val ?? '');
    this.render();
  }

  connectedCallback() {
    if (!this._content) {
      const attr = this.getAttribute('content');
      if (attr !== null) this._content = attr;
      else if (this.textContent.trim()) this._content = this.textContent;
    }
    this.render();
  }

  attributeChangedCallback(name, oldVal, newVal) {
    if (name === 'content' && newVal !== null && newVal !== oldVal) {
      this._content = newVal;
    }
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
    const role = this.getAttribute('role') || 'assistant';
    const name = this.getAttribute('name') || '';
    const avatar = this.getAttribute('avatar') || '';
    const timestamp = this.getAttribute('timestamp') || '';

    if (role === 'system') {
      this._applyHostClass('flex justify-center py-2');
      this.innerHTML = `
        <span class="text-xs text-zinc-400 dark:text-zinc-500 bg-zinc-100 dark:bg-zinc-800/60 px-3 py-1 rounded-full">${escapeAttribute(this._content)}</span>
      `;
      return;
    }

    const isUser = role === 'user';

    const avatarHtml = avatar
      ? `<img src="${escapeAttribute(avatar)}" alt="${escapeAttribute(name || role)}" class="w-8 h-8 rounded-lg object-cover shrink-0 border border-zinc-200 dark:border-zinc-700" />`
      : `<div class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
          isUser
            ? 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400'
            : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
        }">${uiIcon(isUser ? 'user' : 'sparkles', { size: 16 })}</div>`;

    this._applyHostClass(`flex gap-3 py-3 ${isUser ? 'flex-row-reverse' : ''}`);
    this.innerHTML = `
      ${avatarHtml}
      <div class="flex flex-col min-w-0 max-w-[85%] ${isUser ? 'items-end' : 'items-start'}">
        ${(name || timestamp) ? `
          <div class="flex items-center gap-2 mb-1 text-[11px] text-zinc-400 dark:text-zinc-500">
            ${name ? `<span class="font-medium">${escapeAttribute(name)}</span>` : ''}
            ${timestamp ? `<span class="font-mono">${escapeAttribute(timestamp)}</span>` : ''}
          </div>
        ` : ''}
        <div class="rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed break-words whitespace-pre-wrap ${
          isUser
            ? 'bg-indigo-600 text-white rounded-tr-sm'
            : 'bg-zinc-100 dark:bg-zinc-800/80 text-zinc-800 dark:text-zinc-200 rounded-tl-sm'
        }">${escapeAttribute(this._content)}</div>
      </div>
    `;
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('chat-message-row')) {
  customElements.define('chat-message-row', ChatMessageRowElement);
}
export default ChatMessageRowElement;
