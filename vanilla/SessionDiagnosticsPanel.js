/**
 * SessionDiagnosticsPanel - Connection diagnostics: Browser / OS info cards,
 * media quality timeline bars and a searchable event log table (Whereby
 * insights pattern).
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

const DEFAULT_DEVICES = () => [
  { label: 'Browser', value: 'Chrome 126.0.0.0', emoji: '🌐' },
  { label: 'Operating system', value: 'Mac OS', emoji: '💻' },
];

const DEFAULT_TRACKS = () => [
  { id: 'camera', label: 'Camera', emoji: '📷', windows: [{ start: 0, width: 100, level: 'good' }] },
  { id: 'microphone', label: 'Microphone', emoji: '🎙', windows: [{ start: 0, width: 100, level: 'good' }] },
  { id: 'screenshare', label: 'Screenshare', emoji: '🖥', windows: [{ start: 0, width: 100, level: 'good' }] },
  { id: 'network', label: 'Poor Network', emoji: '📶', windows: [{ start: 20, width: 12, level: 'bad' }, { start: 55, width: 8, level: 'poor' }] },
];

const DEFAULT_EVENTS = () => [
  { id: 'e1', no: 1, message: 'organizationId: "244198"', time: '6/25/2024, 4:10:24 PM' },
  { id: 'e2', no: 2, message: 'clientId: "c43b3dfc-62e9-43f6-887f-d07c6ac9eddb"', time: '6/25/2024, 4:10:26 PM' },
  { id: 'e3', no: 3, message: 'roomSessionId: "bdc6cb01-24a4-4132-b23a-8ad28d049a76"', time: '6/25/2024, 4:16:23 PM' },
  { id: 'e4', no: 4, message: 'displayName: "Alex Smith"', time: '6/25/2024, 4:10:24 PM' },
  { id: 'e5', no: 5, message: 'userRole: "owner"', time: '6/25/2024, 4:10:26 PM' },
];

const LEVEL_CLS = {
  good: 'bg-emerald-400 dark:bg-emerald-500',
  poor: 'bg-amber-400 dark:bg-amber-500',
  bad: 'bg-rose-400 dark:bg-rose-500',
};

class SessionDiagnosticsPanelElement extends HTMLElement {
  static get observedAttributes() {
    return ['title', 'devices', 'tracks', 'events'];
  }

  constructor() {
    super();
    this._bound = false;
    this._query = '';
  }

  connectedCallback() {
    if (this._bound === false && this.innerHTML === '') {
      this._bound = true;
    }
    this._render();
    this.addEventListener('click', this._onClick);
    this.addEventListener('input', this._onInput);
  }

  disconnectedCallback() {
    this.removeEventListener('click', this._onClick);
    this.removeEventListener('input', this._onInput);
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;
    if (this._bound === false && this.innerHTML === '') return;
    this._render();
  }

  _onClick(event) {
    const row = event.target.closest('[data-sdiag-event]');
    if (row) {
      const no = Number(row.getAttribute('data-sdiag-event'));
      const events = parseJsonAttr(this.getAttribute('events'), DEFAULT_EVENTS());
      const found = events.find((e) => e.no === no);
      if (found) {
        this.dispatchEvent(new CustomEvent('event-click', { detail: found, bubbles: true }));
      }
    }
  }

  _onInput(event) {
    if (event.target && event.target.hasAttribute && event.target.hasAttribute('data-sdiag-search')) {
      this._query = event.target.value;
      // Re-render only the events list; keep the input's focus by not
      // re-rendering the whole component.
      const events = parseJsonAttr(this.getAttribute('events'), DEFAULT_EVENTS());
      const q = this._query.toLowerCase();
      const filtered = events.filter((e) => e.message.toLowerCase().includes(q));
      const list = this.querySelector('[data-sdiag-events]');
      if (list) {
        list.innerHTML = filtered.length === 0
          ? '<p data-sdiag-empty class="py-6 text-center text-sm text-zinc-400 dark:text-zinc-500">No events match your search.</p>'
          : filtered
              .map(
                (e) => `<button type="button" data-sdiag-event="${e.no}" class="grid w-full grid-cols-[60px_1fr_auto] items-center gap-2 py-3 text-left text-sm transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/40 sm:text-[13px]">
                    <span class="text-zinc-400 dark:text-zinc-500">${e.no}</span>
                    <span class="truncate font-mono text-[13px] text-zinc-700 dark:text-zinc-200">${escapeAttribute(e.message)}</span>
                    <span class="whitespace-nowrap text-xs text-zinc-400 dark:text-zinc-500">${escapeAttribute(e.time)}</span>
                  </button>`
              )
              .join('');
        this.dispatchEvent(new CustomEvent('search', { detail: { query: this._query }, bubbles: true }));
      }
    }
  }

  _render() {
    const title = this.getAttribute('title') || 'Events Timeline';
    const devices = parseJsonAttr(this.getAttribute('devices'), DEFAULT_DEVICES());
    const tracks = parseJsonAttr(this.getAttribute('tracks'), DEFAULT_TRACKS());
    const events = parseJsonAttr(this.getAttribute('events'), DEFAULT_EVENTS());

    const deviceCards = devices
      .map(
        (d) => `<div data-sdiag-device="${escapeAttribute(d.label)}" class="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
            <p class="text-lg font-bold text-zinc-900 dark:text-zinc-50">${escapeAttribute(d.label)}</p>
            <p class="mt-2 flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-300"><span aria-hidden="true">${d.emoji}</span>${escapeAttribute(d.value)}</p>
          </div>`
      )
      .join('');

    const trackRows = tracks
      .map((t) => {
        const windows = (t.windows || [])
          .map((w) => {
            const cls = LEVEL_CLS[w.level] ?? LEVEL_CLS.good;
            return `<div data-sdiag-window="${escapeAttribute(w.level)}" class="absolute inset-y-0 rounded-sm ${cls}" style="left:${w.start}%;width:${w.width}%"></div>`;
          })
          .join('');
        return `<div data-sdiag-track="${escapeAttribute(t.id)}" class="flex items-center gap-3">
            <span class="flex w-40 shrink-0 items-center gap-2 text-sm text-zinc-600 dark:text-zinc-300"><span aria-hidden="true">${t.emoji}</span>${escapeAttribute(t.label)}</span>
            <div class="relative h-6 flex-1 overflow-hidden rounded bg-zinc-100 dark:bg-zinc-800">${windows}</div>
          </div>`;
      })
      .join('');

    const eventRows = events
      .map(
        (e) => `<button type="button" data-sdiag-event="${e.no}" class="grid w-full grid-cols-[60px_1fr_auto] items-center gap-2 py-3 text-left text-sm transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/40 sm:text-[13px]">
            <span class="text-zinc-400 dark:text-zinc-500">${e.no}</span>
            <span class="truncate font-mono text-[13px] text-zinc-700 dark:text-zinc-200">${escapeAttribute(e.message)}</span>
            <span class="whitespace-nowrap text-xs text-zinc-400 dark:text-zinc-500">${escapeAttribute(e.time)}</span>
          </button>`
      )
      .join('');

    this.innerHTML = `
      <div data-sdiag class="w-full rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900 sm:p-6">
        <div data-sdiag-devices class="grid gap-4 sm:grid-cols-2">${deviceCards}</div>
        <h3 data-sdiag-title class="mt-6 text-xl font-bold text-zinc-900 dark:text-zinc-50">${escapeAttribute(title)}</h3>
        <div data-sdiag-tracks class="mt-4 space-y-2.5">${trackRows}</div>
        <div data-sdiag-log class="mt-6 flex items-center justify-between gap-4">
          <div class="grid flex-1 gap-1 text-sm font-bold text-zinc-800 dark:text-zinc-100 sm:grid-cols-[60px_1fr]">
            <span>Event no.</span>
            <span>Event message</span>
          </div>
          <input type="search" data-sdiag-search placeholder="Search for an event" class="w-56 rounded-full border border-zinc-300 bg-white px-4 py-1.5 text-sm text-zinc-700 outline-none transition-colors placeholder:text-zinc-400 focus:border-indigo-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200" />
        </div>
        <div data-sdiag-events class="mt-2 divide-y divide-zinc-100 dark:divide-zinc-800/60">${eventRows}</div>
      </div>`;
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('session-diagnostics-panel')) {
  customElements.define('session-diagnostics-panel', SessionDiagnosticsPanelElement);
}

export default SessionDiagnosticsPanelElement;
