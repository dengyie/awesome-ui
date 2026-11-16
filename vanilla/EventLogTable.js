/**
 * EventLogTable - Administrative event log: dropdown filter row (Type /
 * Source / Action / Target / date-range) with an Export CSV button, a
 * six-column log table (type / date-time / source with role / action /
 * targets / details) with muted-gray rows for older entries
 * (Vanta event log pattern).
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

const DEFAULT_ENTRIES = () => [
  { id: 'l1', type: 'User', date: 'Sep 11, 2024', time: '11:08 AM', source: 'Jane Smith', role: 'View-only Admin', action: 'Login', targets: 'Authentication method', details: 'Jane Smith logged in via Google.' },
  { id: 'l2', type: 'User', date: 'Sep 4, 2024', time: '5:06 PM', source: 'Alexia Smith', role: 'Admin', action: 'Send personnel reminder', targets: 'User', details: 'Alexia Smith sent a reminder to complete security tasks.' },
  { id: 'l3', type: 'User', date: 'Aug 29, 2024', time: '9:14 AM', source: 'Marcus Lee', role: 'Editor', action: 'Update vendor', targets: 'Vendor', details: 'Marcus Lee updated renewal date for Figma.', muted: true },
  { id: 'l4', type: 'User', date: 'Aug 22, 2024', time: '2:47 PM', source: 'Priya Patel', role: 'Admin', action: 'Create integrations', targets: 'Integration', details: 'Priya Patel connected Okta to the workspace.', muted: true },
  { id: 'l5', type: 'User', date: 'Aug 15, 2024', time: '10:02 AM', source: 'Sam Ortiz', role: 'Viewer', action: 'Export report', targets: 'Report', details: 'Sam Ortiz exported the SOC 2 readiness report.', muted: true },
];

class EventLogTableElement extends HTMLElement {
  static get observedAttributes() {
    return ['title', 'description', 'filters', 'column-labels', 'entries', 'date-range-label', 'export-label'];
  }

  constructor() {
    super();
    this._bound = false;
  }

  connectedCallback() {
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
    if (this._bound === false && this.innerHTML === '') return;
    this._render();
  }

  _onClick(event) {
    const filter = event.target.closest('[data-eventlog-filter]');
    if (filter) {
      this.dispatchEvent(new CustomEvent('filter-select', { detail: { filter: filter.getAttribute('data-eventlog-filter') }, bubbles: true }));
      return;
    }
    if (event.target.closest('[data-eventlog-export]')) {
      this.dispatchEvent(new CustomEvent('export', { bubbles: true }));
      return;
    }
    const entry = event.target.closest('[data-eventlog-entry]');
    if (entry) {
      const found = this._entries().find((e) => e.id === entry.getAttribute('data-eventlog-entry'));
      if (found) this.dispatchEvent(new CustomEvent('entry-click', { detail: { entry: found }, bubbles: true }));
    }
  }

  _entries() {
    return parseJsonAttr(this.getAttribute('entries'), DEFAULT_ENTRIES());
  }

  _render() {
    const title = this.getAttribute('title') || 'Event log';
    const description = this.getAttribute('description') || 'Monitor and track a history of changes made by users within your workspace.';
    const dateRangeLabel = this.getAttribute('date-range-label') || 'Select date range';
    const exportLabel = this.getAttribute('export-label') || 'Export CSV';
    const filters = parseJsonAttr(this.getAttribute('filters'), ['Type', 'Source', 'Action', 'Target']);
    const columnLabels = parseJsonAttr(this.getAttribute('column-labels'), ['Type', 'Date', 'Source', 'Action', 'Targets', 'Details']);
    const entries = this._entries();

    const roleCls = (role) => {
      if (role === 'Admin') return 'text-zinc-800 dark:text-zinc-100';
      if (role === 'Viewer') return 'text-zinc-400 dark:text-zinc-500';
      return 'text-zinc-500 dark:text-zinc-400';
    };

    const filtersHtml = filters
      .map((filter) => `<button data-eventlog-filter="${escapeAttribute(filter)}" type="button" class="rounded-lg border border-zinc-200 px-3 py-1.5 text-sm text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800">${escapeAttribute(filter)} <span aria-hidden="true" class="text-zinc-400">⌄</span></button>`)
      .join('');

    const columnsHtml = columnLabels
      .map((label) => `<th class="px-6 py-2.5 font-semibold">${escapeAttribute(label)}</th>`)
      .join('');

    const rowsHtml = entries
      .map((entry) => {
        const muted = Boolean(entry.muted);
        const rowCls = muted ? 'text-zinc-400 dark:text-zinc-500' : 'text-zinc-700 dark:text-zinc-200';
        return `<tr data-eventlog-entry="${escapeAttribute(entry.id)}" data-eventlog-muted="${muted ? 'true' : 'false'}" class="cursor-pointer border-b border-zinc-100 transition-colors last:border-b-0 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800/40 ${rowCls}">
            <td class="px-6 py-3.5 font-semibold">${escapeAttribute(entry.type)}</td>
            <td class="px-6 py-3.5">
              <p class="font-medium">${escapeAttribute(entry.date)}</p>
              <p class="text-xs opacity-70">${escapeAttribute(entry.time)}</p>
            </td>
            <td class="px-6 py-3.5">
              <p class="font-medium ${muted ? '' : 'text-zinc-800 dark:text-zinc-100'}">${escapeAttribute(entry.source)}</p>
              <p class="text-xs ${roleCls(entry.role)}">${escapeAttribute(entry.role)}</p>
            </td>
            <td class="px-6 py-3.5">${escapeAttribute(entry.action)}</td>
            <td class="px-6 py-3.5">${escapeAttribute(entry.targets)}</td>
            <td class="px-6 py-3.5">${escapeAttribute(entry.details)}</td>
          </tr>`;
      })
      .join('');

    this.innerHTML = `
      <div data-eventlog class="w-full overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div data-eventlog-header class="px-6 pt-6">
          <h2 data-eventlog-title class="text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">${escapeAttribute(title)}</h2>
          <p data-eventlog-description class="mt-1 max-w-3xl text-sm text-zinc-500 dark:text-zinc-400">${escapeAttribute(description)}</p>
        </div>
        <div data-eventlog-filters class="flex flex-wrap items-center justify-between gap-3 px-6 py-4">
          <div class="flex flex-wrap items-center gap-2">
            ${filtersHtml}
            <button data-eventlog-daterange type="button" class="rounded-lg border border-zinc-200 px-3 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800">🗓 ${escapeAttribute(dateRangeLabel)}</button>
          </div>
          <button data-eventlog-export type="button" class="rounded-lg border border-zinc-200 px-3 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800">↓ ${escapeAttribute(exportLabel)}</button>
        </div>
        <div class="overflow-x-auto">
          <table data-eventlog-table class="w-full min-w-[820px] text-left text-sm">
            <thead>
              <tr data-eventlog-columns class="border-y border-zinc-100 text-[11px] uppercase tracking-wide text-zinc-400 dark:border-zinc-800 dark:text-zinc-500">${columnsHtml}</tr>
            </thead>
            <tbody>${rowsHtml}</tbody>
          </table>
        </div>
      </div>`;
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('event-log-table')) {
  customElements.define('event-log-table', EventLogTableElement);
}

export default EventLogTableElement;
