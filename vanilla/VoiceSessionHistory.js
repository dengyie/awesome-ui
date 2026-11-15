/**
 * VoiceSessionHistory - ElevenLabs Voice "History" sidebar: session rows with
 * title, date/duration metadata, status badge and a replay button.
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

class VoiceSessionHistoryElement extends HTMLElement {
  static get observedAttributes() {
    return ['title', 'sessions', 'empty-label'];
  }

  constructor() {
    super();
    this._bound = false;
    this._sessions = [];
  }

  connectedCallback() {
    if (!this._sessions.length) {
      this._sessions = parseJsonAttr(this.getAttribute('sessions'), []);
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
    if (name === 'sessions' && !this._sessions.length) {
      this._sessions = parseJsonAttr(this.getAttribute('sessions'), []);
    }
    if (this._bound === false && this.innerHTML === '') return;
    this._render();
  }

  get title() {
    return this.getAttribute('title') ?? 'History';
  }
  set title(value) {
    this.setAttribute('title', value);
  }

  get emptyLabel() {
    return this.getAttribute('empty-label') ?? 'No sessions yet.';
  }
  set emptyLabel(value) {
    this.setAttribute('empty-label', value);
  }

  get sessions() {
    return this._sessions;
  }
  set sessions(value) {
    this._sessions = Array.isArray(value) ? value : [];
    this._render();
  }

  _onClick(event) {
    const sessionEl = event.target.closest('[data-voice-session]');
    if (!sessionEl) return;
    const session = this._sessions.find((s) => String(s.id) === sessionEl.getAttribute('data-voice-session'));
    if (!session) return;
    if (event.target.closest('[data-voice-session-play]')) {
      this.dispatchEvent(new CustomEvent('play', { detail: { session }, bubbles: true }));
      return;
    }
    this.dispatchEvent(new CustomEvent('select', { detail: { session }, bubbles: true }));
  }

  _render() {
    const sessions = this._sessions;
    const active = sessions.filter((s) => s.status !== 'failed').length;
    const statusMeta = (s) => {
      if (s.status === 'failed') return ['bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400', 'Failed'];
      if (s.status === 'in-progress') return ['bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400', 'Running'];
      return ['bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400', 'Completed'];
    };
    const rows = sessions.length
      ? sessions
          .map((s) => {
            const [statusClass, statusLabel] = statusMeta(s);
            const meta = [s.date, s.duration].filter(Boolean).join(' · ');
            return `
          <div data-voice-session="${escapeAttribute(s.id)}" class="flex items-center gap-3 px-4 py-2.5">
            <div class="min-w-0 flex-1">
              <p data-voice-session-title class="truncate text-xs font-medium text-zinc-900 dark:text-zinc-50">${escapeAttribute(s.title)}</p>
              <p data-voice-session-meta class="mt-0.5 truncate text-[11px] text-zinc-400 dark:text-zinc-500">${escapeAttribute(meta)}</p>
            </div>
            <span data-voice-session-status class="shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-medium ${statusClass}">${statusLabel}</span>
            <button type="button" data-voice-session-play aria-label="Play ${escapeAttribute(s.title)}" class="shrink-0 rounded p-1 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300">▶</button>
          </div>`;
          })
          .join('')
      : `<p data-voice-history-empty class="px-4 py-6 text-center text-xs text-zinc-400 dark:text-zinc-500">${escapeAttribute(this.emptyLabel)}</p>`;

    this.innerHTML = `
      <div data-voice-history class="w-full rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div class="flex items-center justify-between border-b border-zinc-100 px-4 py-3 dark:border-zinc-800">
          <h4 class="text-sm font-semibold text-zinc-900 dark:text-zinc-50">${escapeAttribute(this.title)} <span data-voice-history-count class="ml-1 rounded-full bg-zinc-100 px-1.5 py-0.5 text-[10px] font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">${active}</span></h4>
        </div>
        <div data-voice-history-list class="divide-y divide-zinc-100 dark:divide-zinc-800">${rows}</div>
      </div>`;
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('voice-session-history')) {
  customElements.define('voice-session-history', VoiceSessionHistoryElement);
}

export default VoiceSessionHistoryElement;
