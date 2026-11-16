/**
 * EventStreamPanel - Audit event stream: filter input, two-column event list
 * (event name / date and time), right metadata panel with actor info and
 * "View event" button, event details JSON block with line numbers and
 * Previous/Next pager
 * (WorkOS Events pattern).
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

const DEFAULT_EVENTS = () => [
  {
    id: 'ev1',
    name: 'user.updated',
    date: 'Nov 14, 2026 3:12 PM',
    metadata: [
      { label: 'User', value: 'Sama Lee' },
      { label: 'Email', value: 'sama@example.com' },
      { label: 'Environment', value: 'Production' },
    ],
    details: '{\n  "event": "user.updated",\n  "user": {\n    "id": "user_01H9",\n    "email": "sama@example.com",\n    "first_name": "Sama",\n    "last_name": "Lee",\n    "email_verified": true\n  }\n}',
  },
  {
    id: 'ev2',
    name: 'organization_membership.updated',
    date: 'Nov 14, 2026 2:48 PM',
    metadata: [
      { label: 'Organization', value: 'Acme Inc' },
      { label: 'Role', value: 'admin' },
    ],
    details: '{\n  "event": "organization_membership.updated",\n  "role": "admin"\n}',
  },
  {
    id: 'ev3',
    name: 'invitation.created',
    date: 'Nov 14, 2026 11:05 AM',
    metadata: [{ label: 'Email', value: 'new hire' }],
    details: '{\n  "event": "invitation.created"\n}',
  },
  {
    id: 'ev4',
    name: 'connection.activated',
    date: 'Nov 13, 2026 5:30 PM',
    metadata: [{ label: 'Connection', value: 'Okta SSO' }],
    details: '{\n  "event": "connection.activated"\n}',
  },
  {
    id: 'ev5',
    name: 'session.created',
    date: 'Nov 13, 2026 9:02 AM',
    metadata: [{ label: 'User', value: 'Sama Lee' }],
    details: '{\n  "event": "session.created"\n}',
  },
];

class EventStreamPanelElement extends HTMLElement {
  static get observedAttributes() {
    return ['filter-placeholder', 'event-column-label', 'date-column-label', 'events', 'metadata-title', 'details-title', 'details-lines', 'active-event-id'];
  }

  constructor() {
    super();
    this._bound = false;
    this._filter = '';
    this._activeId = '';
  }

  connectedCallback() {
    this._activeId = this.getAttribute('active-event-id') || '';
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
    if (name === 'active-event-id') this._activeId = newValue || '';
    this._render();
  }

  _onClick(event) {
    const evBtn = event.target.closest('[data-stream-event]');
    if (evBtn) {
      this._activeId = evBtn.getAttribute('data-stream-event');
      const found = this._events().find((ev) => ev.id === this._activeId);
      this._render();
      if (found) this.dispatchEvent(new CustomEvent('event-select', { detail: { event: found }, bubbles: true }));
      return;
    }
    if (event.target.closest('[data-stream-view-event]')) {
      const found = this._events().find((ev) => ev.id === this._activeId);
      if (found) this.dispatchEvent(new CustomEvent('view-event', { detail: { event: found }, bubbles: true }));
    }
  }

  _onInput(event) {
    const input = event.target.closest('[data-stream-filter]');
    if (input) {
      this._filter = input.value;
      this._render();
      this.dispatchEvent(new CustomEvent('filter-change', { detail: { value: input.value }, bubbles: true }));
    }
  }

  _events() {
    return parseJsonAttr(this.getAttribute('events'), DEFAULT_EVENTS());
  }

  _render() {
    const filterPlaceholder = this.getAttribute('filter-placeholder') || 'Filter by event name, data, or date range';
    const eventColumnLabel = this.getAttribute('event-column-label') || 'Event';
    const dateColumnLabel = this.getAttribute('date-column-label') || 'Date and time';
    const metadataTitle = this.getAttribute('metadata-title') || 'Metadata';
    const detailsTitle = this.getAttribute('details-title') || 'Event Details';
    const detailsLines = Number(this.getAttribute('details-lines') ?? 10);
    const events = this._events();
    const q = this._filter.toLowerCase();
    const filtered = q ? events.filter((ev) => ev.name.toLowerCase().includes(q)) : events;
    const active = events.find((ev) => ev.id === this._activeId) ?? events[0] ?? null;

    const itemsHtml = filtered.length === 0
      ? '<li class="px-4 py-6 text-center text-sm text-zinc-400 dark:text-zinc-500">No events match this filter</li>'
      : filtered
          .map((ev) => {
            const activeCls = active && ev.id === active.id ? 'bg-zinc-50 dark:bg-zinc-800/60' : 'hover:bg-zinc-50/60 dark:hover:bg-zinc-800/40';
            return `<li><button data-stream-event="${escapeAttribute(ev.id)}" type="button" class="grid w-full grid-cols-2 items-center px-4 py-3 text-left text-sm transition-colors ${activeCls}">
                <span class="truncate font-mono text-xs font-semibold text-zinc-800 dark:text-zinc-100">${escapeAttribute(ev.name)}</span>
                <span class="truncate text-xs text-zinc-500 dark:text-zinc-400">${escapeAttribute(ev.date)}</span>
              </button></li>`;
          })
          .join('');

    const metadataHtml = active
      ? (active.metadata ?? [])
          .map((m) => `<div class="flex items-baseline justify-between gap-3">
              <dt class="text-xs text-zinc-500 dark:text-zinc-400">${escapeAttribute(m.label)}</dt>
              <dd class="truncate text-xs font-medium text-zinc-800 dark:text-zinc-100">${escapeAttribute(m.value)}</dd>
            </div>`)
          .join('')
      : '';

    const lineCount = Math.max(detailsLines, active ? String(active.details).split('\n').length : 1);
    const lineNumbers = Array.from({ length: lineCount }, (_, i) => i + 1).join('\n');

    this.innerHTML = `
      <div data-stream-panel class="grid w-full gap-4 lg:grid-cols-5">
        <div data-stream-list class="rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900 lg:col-span-3">
          <div class="border-b border-zinc-100 p-3 dark:border-zinc-800">
            <input data-stream-filter type="text" placeholder="${escapeAttribute(filterPlaceholder)}" class="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-800 placeholder-zinc-400 outline-none focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-950/60 dark:text-zinc-100 dark:placeholder-zinc-500">
          </div>
          <div data-stream-columns class="grid grid-cols-2 border-b border-zinc-100 px-4 py-2 text-xs font-semibold text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
            <span>${escapeAttribute(eventColumnLabel)}</span>
            <span>${escapeAttribute(dateColumnLabel)}</span>
          </div>
          <ul data-stream-items>${itemsHtml}</ul>
        </div>
        <div data-stream-details class="space-y-4 lg:col-span-2">
          <div class="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <p data-stream-metadata-title class="text-sm font-bold text-zinc-900 dark:text-zinc-50">${escapeAttribute(metadataTitle)}</p>
            <dl data-stream-metadata class="mt-3 space-y-2">${metadataHtml}</dl>
            <button data-stream-view-event type="button" class="mt-4 w-full rounded-lg bg-zinc-900 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200">View event</button>
          </div>
          <div class="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <p data-stream-details-title class="border-b border-zinc-100 px-4 py-2.5 text-sm font-bold text-zinc-900 dark:border-zinc-800 dark:text-zinc-50">${escapeAttribute(detailsTitle)}</p>
            <div data-stream-json class="flex gap-3 overflow-x-auto px-4 py-3 font-mono text-[11px] leading-5">
              <span data-stream-json-lines aria-hidden="true" class="select-none whitespace-pre text-right text-zinc-300 dark:text-zinc-600">${escapeAttribute(lineNumbers)}</span>
              <pre class="whitespace-pre text-sky-700 dark:text-sky-300">${active ? escapeAttribute(active.details) : ''}</pre>
            </div>
            <div data-stream-pager class="flex items-center justify-between border-t border-zinc-100 px-4 py-2.5 dark:border-zinc-800">
              <button type="button" class="text-xs font-semibold text-zinc-400 transition-colors hover:text-zinc-600 dark:hover:text-zinc-200">← Previous</button>
              <button type="button" class="text-xs font-semibold text-zinc-400 transition-colors hover:text-zinc-600 dark:hover:text-zinc-200">Next →</button>
            </div>
          </div>
        </div>
      </div>`;
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('event-stream-panel')) {
  customElements.define('event-stream-panel', EventStreamPanelElement);
}

export default EventStreamPanelElement;
