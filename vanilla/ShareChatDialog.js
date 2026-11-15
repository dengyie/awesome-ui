/**
 * ShareChatDialog - Vanilla Web Component
 * Usage: <share-chat-dialog title="Share chat" link="..." shared="true"></share-chat-dialog>
 * Attributes: open, title, description, link, shared
 * Events: create-link, copy-link, toggle-shared (detail {shared}), close
 */
const escapeAttribute = (value) =>
  String(value).replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  }[char]));

export class ShareChatDialogElement extends HTMLElement {
  static get observedAttributes() {
    return ['open', 'title', 'description', 'link', 'shared'];
  }

  constructor() {
    super();
    this._bound = false;
  }

  connectedCallback() {
    this.render();
    if (!this._bound) {
      this._bound = true;
      this.addEventListener('click', (event) => {
        if (event.target.closest('[data-share-close]')) {
          this.setAttribute('open', 'false');
          this.dispatchEvent(new CustomEvent('close'));
          return;
        }
        if (event.target.closest('[data-share-private]')) {
          this.setAttribute('shared', 'false');
          this.dispatchEvent(new CustomEvent('toggle-shared', { detail: { shared: false } }));
          return;
        }
        if (event.target.closest('[data-share-public]')) {
          this.setAttribute('shared', 'true');
          this.dispatchEvent(new CustomEvent('toggle-shared', { detail: { shared: true } }));
          return;
        }
        if (event.target.closest('[data-share-create]')) {
          this.dispatchEvent(new CustomEvent('create-link'));
          return;
        }
        if (event.target.closest('[data-share-copy]')) {
          this.dispatchEvent(new CustomEvent('copy-link', { detail: { link: this.getAttribute('link') || '' } }));
        }
      });
    }
  }

  attributeChangedCallback() {
    if (this._bound === false && this.innerHTML === '') return;
    this.render();
  }

  render() {
    if ((this.getAttribute('open') || 'true') === 'false') {
      this.innerHTML = '';
      return;
    }
    const title = escapeAttribute(this.getAttribute('title') || 'Share chat');
    const description = escapeAttribute(this.getAttribute('description') || 'Anyone with the link can view this conversation. Future messages aren\'t included.');
    const link = this.getAttribute('link') || '';
    const shared = this.getAttribute('shared') === 'true';

    const linkRow = shared ? (link ? `
      <div class="mt-3 flex items-center gap-2">
        <code data-share-link class="min-w-0 flex-1 truncate rounded-md bg-zinc-100 px-2.5 py-2 font-mono text-[11px] text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">${escapeAttribute(link)}</code>
        <button type="button" data-share-copy class="shrink-0 rounded-md bg-zinc-900 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200">Copy link</button>
      </div>` : `
      <div class="mt-3 flex items-center gap-2">
        <button type="button" data-share-create class="w-full rounded-md bg-indigo-600 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-indigo-500">Create link</button>
      </div>`) : '';

    this.innerHTML = `<div data-share-chat role="dialog" aria-modal="true" class="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-4 shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
  <div class="flex items-start justify-between">
    <h3 class="text-sm font-semibold text-zinc-900 dark:text-zinc-50">${title}</h3>
    <button type="button" data-share-close aria-label="Close" class="rounded p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300">✕</button>
  </div>
  <p class="mt-1 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">${description}</p>
  <div class="mt-3 space-y-1 rounded-lg border border-zinc-200 p-1 dark:border-zinc-800">
    <button type="button" data-share-private class="flex w-full items-center gap-3 rounded-md px-2.5 py-2 text-left transition-colors ${!shared ? 'bg-zinc-100 dark:bg-zinc-800' : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/60'}">
      <span aria-hidden="true">🔒</span>
      <span class="min-w-0 flex-1">
        <span class="block text-xs font-semibold text-zinc-800 dark:text-zinc-100">Keep private</span>
        <span class="block text-[11px] text-zinc-500 dark:text-zinc-400">Only you have access</span>
      </span>
      ${!shared ? '<span class="text-indigo-600 dark:text-indigo-400" aria-hidden="true">✓</span>' : ''}
    </button>
    <button type="button" data-share-public class="flex w-full items-center gap-3 rounded-md px-2.5 py-2 text-left transition-colors ${shared ? 'bg-zinc-100 dark:bg-zinc-800' : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/60'}">
      <span aria-hidden="true">🌐</span>
      <span class="min-w-0 flex-1">
        <span class="block text-xs font-semibold text-zinc-800 dark:text-zinc-100">Create public link</span>
        <span class="block text-[11px] text-zinc-500 dark:text-zinc-400">Anyone with the link can view</span>
      </span>
      ${shared ? '<span class="text-indigo-600 dark:text-indigo-400" aria-hidden="true">✓</span>' : ''}
    </button>
  </div>
  ${linkRow}
</div>`;
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('share-chat-dialog')) {
  customElements.define('share-chat-dialog', ShareChatDialogElement);
}

export default ShareChatDialogElement;
