/**
 * SharedChatViewer - Vanilla Web Component
 * Usage: <shared-chat-viewer app-name="ChatApp" title="..." meta="..." cta-text="..."></shared-chat-viewer>
 * Property: messages ([{id, role: 'user'|'assistant', text}])
 * Events: cta
 */
const escapeAttribute = (value) =>
  String(value).replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  }[char]));

export class SharedChatViewerElement extends HTMLElement {
  static get observedAttributes() {
    return ['app-name', 'title', 'meta', 'cta-text', 'cta-note'];
  }

  constructor() {
    super();
    this._messages = [];
    this._bound = false;
  }

  connectedCallback() {
    this.render();
    if (!this._bound) {
      this._bound = true;
      this.addEventListener('click', (event) => {
        if (event.target.closest('[data-shared-cta]')) {
          this.dispatchEvent(new CustomEvent('cta'));
        }
      });
    }
  }

  get messages() { return this._messages; }
  set messages(v) {
    this._messages = Array.isArray(v) ? v : [];
    this.render();
  }

  attributeChangedCallback() {
    // Fires before connectedCallback when an already-connected element upgrades;
    // rendering then would wipe light-DOM children before messages are captured.
    if (this._messages.length === 0 && this.innerHTML === '') return;
    this.render();
  }

  render() {
    const appName = escapeAttribute(this.getAttribute('app-name') || 'ChatApp');
    const title = escapeAttribute(this.getAttribute('title') || 'Shared conversation');
    const meta = escapeAttribute(this.getAttribute('meta') || '');
    const ctaText = escapeAttribute(this.getAttribute('cta-text') || 'Try it yourself');
    const ctaNote = escapeAttribute(this.getAttribute('cta-note') || 'This conversation is read-only.');

    const bubbles = this._messages.map((msg) => {
      const isUser = msg.role === 'user';
      return `
        <div data-shared-msg="${escapeAttribute(msg.id)}" class="flex ${isUser ? 'justify-end' : 'justify-start'}">
          <p data-shared-role="${isUser ? 'user' : 'assistant'}" class="max-w-[80%] whitespace-pre-wrap rounded-2xl px-3.5 py-2 text-sm leading-relaxed ${isUser ? 'rounded-br-sm bg-indigo-600 text-white' : 'rounded-bl-sm bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-100'}">${escapeAttribute(msg.text)}</p>
        </div>`;
    }).join('');

    this.innerHTML = `<div data-shared-chat class="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
  <div data-shared-header class="flex items-center gap-3 border-b border-zinc-100 px-4 py-3 dark:border-zinc-800">
    <span class="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-xs font-bold text-white" aria-hidden="true">${escapeAttribute(appName.slice(0, 1))}</span>
    <div class="min-w-0">
      <p class="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-50">${title}</p>
      ${meta ? `<p data-shared-meta class="text-xs text-zinc-500 dark:text-zinc-400">${appName} · ${meta}</p>` : ''}
    </div>
  </div>
  <div class="space-y-3 px-4 py-4">${bubbles}
  </div>
  <div class="flex items-center justify-between gap-3 border-t border-zinc-100 bg-zinc-50 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-800/60">
    <p class="text-xs text-zinc-500 dark:text-zinc-400">${ctaNote}</p>
    <button type="button" data-shared-cta class="shrink-0 rounded-md bg-zinc-900 px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200">${ctaText}</button>
  </div>
</div>`;
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('shared-chat-viewer')) {
  customElements.define('shared-chat-viewer', SharedChatViewerElement);
}

export default SharedChatViewerElement;
