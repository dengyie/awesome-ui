/**
 * NotificationPrefsMatrix - Notification preference matrix: rows are event
 * types, columns are channels (In-app / Email / Push) rendered as
 * checkboxes, with per-row channel quick toggles (notification settings
 * pattern).
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
  { id: 'mentions', label: 'Mentions & replies', channels: { inapp: true, email: true, push: false } },
  { id: 'assigns', label: 'Assigned to me', channels: { inapp: true, email: false, push: true } },
  { id: 'comments', label: 'Thread comments', channels: { inapp: true, email: true, push: false } },
  { id: 'digest', label: 'Weekly digest', channels: { inapp: false, email: true, push: false } },
];

const CHANNELS = [
  { key: 'inapp', label: 'In-app' },
  { key: 'email', label: 'Email' },
  { key: 'push', label: 'Push' },
];

class NotificationPrefsMatrixElement extends HTMLElement {
  static get observedAttributes() {
    return ['title', 'description', 'events', 'columns'];
  }

  constructor() {
    super();
    this._title = 'Notification preferences';
    this._description = 'Choose which events reach you and through which channels.';
    this._events = DEFAULT_EVENTS();
    this._columns = CHANNELS;
    this._onChange = this._onChange.bind(this);
  }

  connectedCallback() {
    const t = this.getAttribute('title');
    if (t) this._title = t;
    const d = this.getAttribute('description');
    if (d) this._description = d;
    this._events = parseJsonAttr(this.getAttribute('events'), DEFAULT_EVENTS());
    const cols = parseJsonAttr(this.getAttribute('columns'), null);
    if (Array.isArray(cols) && cols.length) this._columns = cols;
    this._render();
    this.addEventListener('change', this._onChange);
  }

  disconnectedCallback() {
    this.removeEventListener('change', this._onChange);
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;
    if (name === 'title') this._title = newValue || 'Notification preferences';
    if (name === 'description') this._description = newValue || '';
    if (name === 'events') this._events = parseJsonAttr(newValue, DEFAULT_EVENTS());
    this._render();
  }

  get events() { return this._events; }
  set events(value) { this._events = Array.isArray(value) ? value : []; this._render(); }

  _onChange(event) {
    const box = event.target.closest('input[data-pref-cell]');
    if (!box) return;
    const [eventId, channel] = String(box.getAttribute('data-pref-cell')).split('|');
    const row = this._events.find((ev) => ev.id === eventId);
    if (row && row.channels) {
      row.channels[channel] = box.checked;
      this.dispatchEvent(new CustomEvent('pref-change', {
        detail: { event: row, channel, enabled: box.checked },
        bubbles: true,
      }));
    }
  }

  _render() {
    const events = Array.isArray(this._events) ? this._events : [];
    const headCells = this._columns
      .map((col) => `<th data-pref-col="${escapeAttribute(col.key)}" class="w-20 px-2 py-2.5 text-center font-semibold">${escapeAttribute(col.label)}</th>`)
      .join('');

    const rowsHtml = events
      .map((ev) => {
        const cells = this._columns
          .map((col) => {
            const checked = Boolean(ev.channels && ev.channels[col.key]);
            return `<td data-pref-cell-state="${escapeAttribute(ev.id)}|${escapeAttribute(col.key)}" class="px-2 py-3 text-center">
              <input type="checkbox" data-pref-cell="${escapeAttribute(ev.id)}|${escapeAttribute(col.key)}" ${checked ? 'checked' : ''} class="h-4 w-4 accent-violet-600" aria-label="${escapeAttribute(ev.label)} via ${escapeAttribute(col.label)}" />
            </td>`;
          })
          .join('');
        return `<tr data-pref-row="${escapeAttribute(ev.id)}" class="border-b border-zinc-50 transition-colors last:border-b-0 hover:bg-zinc-50 dark:border-zinc-800/60 dark:hover:bg-zinc-800/60">
          <td data-pref-label="${escapeAttribute(ev.label)}" class="px-5 py-3 text-sm font-medium text-zinc-800 dark:text-zinc-100">${escapeAttribute(ev.label)}</td>
          ${cells}
        </tr>`;
      })
      .join('');

    this.innerHTML = `
      <div data-pref-matrix class="w-full rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div data-pref-header class="border-b border-zinc-100 px-5 py-4 dark:border-zinc-800">
          <p data-pref-title class="text-base font-semibold text-zinc-900 dark:text-zinc-50">${escapeAttribute(this._title)}</p>
          <p data-pref-description class="mt-1 text-sm leading-5 text-zinc-500 dark:text-zinc-400">${escapeAttribute(this._description)}</p>
        </div>
        <table data-pref-table-body class="w-full text-left text-xs">
          <thead>
            <tr class="border-b border-zinc-100 text-[11px] font-semibold uppercase tracking-wide text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
              <th class="px-5 py-2.5 font-semibold">Event</th>
              ${headCells}
            </tr>
          </thead>
          <tbody>${rowsHtml}</tbody>
        </table>
      </div>`;
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('notification-prefs-matrix')) {
  customElements.define('notification-prefs-matrix', NotificationPrefsMatrixElement);
}

export default NotificationPrefsMatrixElement;
