/**
 * ShareAccessDialog - Superhuman "Share Conversation" dialog: invite-by-email
 * input, a people-with-access list showing avatar / name / email / permission
 * role with per-row remove, plus a Copy link footer action.
 */
const escapeAttribute = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

const parseJsonAttr = (raw, fallback) => {
  if (typeof raw !== 'string' || raw.trim() === '') return fallback;
  try {
    const parsed = JSON.parse(raw);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
};

class ShareAccessDialogElement extends HTMLElement {
  static get observedAttributes() {
    return ['title', 'description', 'url', 'copy-label', 'people', 'open'];
  }

  constructor() {
    super();
    this._bound = false;
    this._people = [];
    this._open = true;
  }

  connectedCallback() {
    if (!this._people.length) {
      this._people = parseJsonAttr(this.getAttribute('people'), []);
    }
    const openAttr = this.getAttribute('open');
    if (openAttr !== null) {
      this._open = openAttr === 'true';
    }
    if (this._bound === false && this.innerHTML === '') {
      this._bound = true;
    }
    this._render();
    this.addEventListener('click', this._onClick);
  }

  disconnectedCallback() {
    this.removeEventListener('click', this._onClick);
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;
    if (name === 'people' && !this._people.length) {
      this._people = parseJsonAttr(this.getAttribute('people'), []);
    }
    if (name === 'open') {
      this._open = newValue === 'true';
    }
    if (this._bound === false && this.innerHTML === '') return;
    this._render();
  }

  get title() {
    return this.getAttribute('title') ?? 'Share Conversation';
  }
  set title(value) {
    this.setAttribute('title', value);
  }

  get description() {
    return this.getAttribute('description') ?? 'Invite teammates to view this conversation. Everyone with access will see future replies.';
  }
  set description(value) {
    this.setAttribute('description', value);
  }

  get url() {
    return this.getAttribute('url') ?? 'https://example.com/share/abc123';
  }
  set url(value) {
    this.setAttribute('url', value);
  }

  get copyLabel() {
    return this.getAttribute('copy-label') ?? 'COPY LINK';
  }
  set copyLabel(value) {
    this.setAttribute('copy-label', value);
  }

  get open() {
    return this._open;
  }
  set open(value) {
    this._open = Boolean(value);
    this.setAttribute('open', this._open ? 'true' : 'false');
    this._render();
  }

  get people() {
    return this._people;
  }
  set people(value) {
    this._people = Array.isArray(value) ? value : [];
    this._render();
  }

  _onClick(event) {
    if (!this._open) return;
    if (event.target.closest('[data-share-access-copy]')) {
      this.dispatchEvent(new CustomEvent('copy-link', { detail: { url: this.url }, bubbles: true }));
      return;
    }
    if (event.target.closest('[data-share-access-close]')) {
      this.open = false;
      this.dispatchEvent(new CustomEvent('close', { bubbles: true }));
      return;
    }
    const personEl = event.target.closest('[data-access-person]');
    if (personEl && event.target.closest('[data-access-person-remove]')) {
      const person = this._people.find((p) => String(p.id) === personEl.getAttribute('data-access-person'));
      if (person) {
        this._people = this._people.filter((p) => p.id !== person.id);
        this._render();
        this.dispatchEvent(new CustomEvent('remove-person', { detail: { person }, bubbles: true }));
      }
    }
  }

  _render() {
    if (!this._open) {
      this.innerHTML = '';
      return;
    }
    const initials = (name) =>
      String(name ?? '')
        .split(' ')
        .map((part) => part[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();

    const rows = this._people.length
      ? this._people
          .map((p) => {
            const role = p.role
              ? `<span data-access-person-role class="shrink-0 rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">${escapeAttribute(p.role)}</span>`
              : '';
            return `
          <div data-access-person="${escapeAttribute(p.id)}" class="flex items-center gap-3 px-3 py-2.5">
            <span aria-hidden="true" class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-zinc-200 text-[10px] font-semibold text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300">${initials(p.name)}</span>
            <div class="min-w-0 flex-1">
              <p data-access-person-name class="truncate text-xs font-medium text-zinc-900 dark:text-zinc-50">${escapeAttribute(p.name)}</p>
              <p data-access-person-email class="truncate text-[11px] text-zinc-400 dark:text-zinc-500">${escapeAttribute(p.email)}</p>
            </div>
            ${role}
            <button type="button" data-access-person-remove aria-label="Remove ${escapeAttribute(p.name)}" class="shrink-0 rounded p-1 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-red-500 dark:hover:bg-zinc-800">✕</button>
          </div>`;
          })
          .join('')
      : `<p data-share-access-empty class="px-3 py-4 text-center text-xs text-zinc-400 dark:text-zinc-500">No people have access yet.</p>`;

    this.innerHTML = `
      <div data-share-access-backdrop class="fixed inset-0 z-20 flex items-center justify-center bg-zinc-950/40 p-4">
        <div data-share-access-dialog class="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-5 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
          <div class="flex items-start justify-between gap-3">
            <div>
              <h4 data-share-access-title class="text-sm font-semibold text-zinc-900 dark:text-zinc-50">${escapeAttribute(this.title)}</h4>
              <p data-share-access-description class="mt-1 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">${escapeAttribute(this.description)}</p>
            </div>
            <button type="button" data-share-access-close aria-label="Close share dialog" class="rounded p-1 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300">✕</button>
          </div>
          <div data-share-access-invite class="mt-4">
            <input type="email" data-share-access-input placeholder="Add people by name or email" class="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-900 placeholder-zinc-400 focus:border-zinc-400 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder-zinc-500 dark:focus:border-zinc-500" />
          </div>
          <div data-share-access-people class="mt-3 divide-y divide-zinc-100 rounded-md border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-700">${rows}</div>
          <div data-share-access-url class="mt-4 flex items-center gap-2 rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-800/60">
            <span data-share-access-url-text class="min-w-0 flex-1 truncate font-mono text-[11px] text-zinc-500 dark:text-zinc-400">${escapeAttribute(this.url)}</span>
            <button type="button" data-share-access-copy class="shrink-0 rounded bg-zinc-900 px-2.5 py-1 text-[10px] font-semibold tracking-wide text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300">${escapeAttribute(this.copyLabel)}</button>
          </div>
        </div>
      </div>`;
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('share-access-dialog')) {
  customElements.define('share-access-dialog', ShareAccessDialogElement);
}

export default ShareAccessDialogElement;
