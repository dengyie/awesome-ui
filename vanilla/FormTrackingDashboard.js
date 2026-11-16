/**
 * FormTrackingDashboard - Form tracking dashboard: back arrow header with
 * title, Active pill and Options dropdown, four stat cards with colored
 * icon dots and % progress bars, a two-column form details grid, and a
 * sortable client requests table with avatar rows and status pills
 * (Fresha form tracking pattern).
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

const DEFAULT_STATS = () => [
  { id: 's1', label: 'Sent to', value: 12, pct: 100, tone: 'sky', icon: '📤' },
  { id: 's2', label: 'Completed', value: 8, pct: 67, tone: 'emerald', icon: '✅' },
  { id: 's3', label: 'To be completed', value: 2, pct: 17, tone: 'amber', icon: '⏳' },
  { id: 's4', label: 'Not completed', value: 2, pct: 17, tone: 'rose', icon: '⛔' },
];

const DEFAULT_DETAILS = () => [
  { label: 'Form name', value: 'Consultation form' },
  { label: 'Service', value: 'Initial consultation' },
  { label: 'Sent to', value: '12 clients' },
  { label: 'Created', value: 'Nov 2, 2026' },
  { label: 'Reminder', value: 'Automatic · 3 days' },
  { label: 'Expiration', value: 'No expiration' },
];

const DEFAULT_REQUESTS = () => [
  { id: 'r1', name: 'Anna Kowalski', initials: 'AK', submitted: 'Nov 12, 2026', service: 'Initial consultation', status: 'completed' },
  { id: 'r2', name: 'Ben Carter', initials: 'BC', submitted: 'Nov 13, 2026', service: 'Initial consultation', status: 'to-be-completed' },
  { id: 'r3', name: 'Chen Wei', initials: 'CW', submitted: '—', service: 'Initial consultation', status: 'not-completed' },
  { id: 'r4', name: 'Dana Patel', initials: 'DP', submitted: 'Nov 14, 2026', service: 'Initial consultation', status: 'completed' },
];

const DEFAULT_SORT_OPTIONS = () => ['Newest first', 'Oldest first', 'Name A–Z', 'Status'];

const STATUS_META = {
  completed: { label: 'Completed', cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300' },
  'to-be-completed': { label: 'To be completed', cls: 'bg-amber-100 text-amber-700 dark:bg-amber-950/70 dark:text-amber-300' },
  'not-completed': { label: 'Not completed', cls: 'bg-rose-100 text-rose-700 dark:bg-rose-950/70 dark:text-rose-300' },
};

const TONE_DOT = { sky: 'bg-sky-500', emerald: 'bg-emerald-500', amber: 'bg-amber-500', rose: 'bg-rose-500' };
const TONE_BAR = { sky: 'bg-sky-500', emerald: 'bg-emerald-500', amber: 'bg-amber-500', rose: 'bg-rose-500' };

const clampPct = (n) => Math.min(100, Math.max(0, Number(n) || 0));

class FormTrackingDashboardElement extends HTMLElement {
  static get observedAttributes() {
    return ['title', 'active', 'stats', 'details', 'requests', 'sort-options'];
  }

  constructor() {
    super();
    this._bound = false;
    this._sortOpen = false;
    this._sort = '';
    this._onDocClick = (event) => {
      if (this._sortOpen && !event.target.closest('[data-formtrack-options]') && !event.target.closest('[data-formtrack-sortmenu]')) {
        this._sortOpen = false;
        this._render();
      }
    };
  }

  connectedCallback() {
    if (this._bound === false && this.innerHTML === '') {
      this._bound = true;
    }
    if (!this._sort) this._sort = parseJsonAttr(this.getAttribute('sort-options'), DEFAULT_SORT_OPTIONS())[0] ?? 'Newest first';
    this._render();
    this.addEventListener('click', this._onClick);
    document.addEventListener('click', this._onDocClick);
  }

  disconnectedCallback() {
    this.removeEventListener('click', this._onClick);
    document.removeEventListener('click', this._onDocClick);
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;
    if (this._bound === false && this.innerHTML === '') return;
    if (name === 'sort-options' && !this._sort) {
      this._sort = parseJsonAttr(newValue, DEFAULT_SORT_OPTIONS())[0] ?? 'Newest first';
    }
    this._render();
  }

  _onClick(event) {
    if (event.target.closest('[data-formtrack-back]')) {
      this.dispatchEvent(new CustomEvent('back', { bubbles: true }));
      return;
    }
    if (event.target.closest('[data-formtrack-options]')) {
      this._sortOpen = !this._sortOpen;
      this._render();
      return;
    }
    const sortOption = event.target.closest('[data-formtrack-sortoption]');
    if (sortOption) {
      this._sort = sortOption.getAttribute('data-formtrack-sortoption');
      this._sortOpen = false;
      this.dispatchEvent(new CustomEvent('sort-change', { detail: { option: this._sort }, bubbles: true }));
      this._render();
      return;
    }
    const row = event.target.closest('[data-formtrack-row]');
    if (row) {
      const requests = parseJsonAttr(this.getAttribute('requests'), DEFAULT_REQUESTS());
      const found = requests.find((r) => r.id === row.getAttribute('data-formtrack-row'));
      if (found) this.dispatchEvent(new CustomEvent('request-click', { detail: { row: found }, bubbles: true }));
    }
  }

  _render() {
    const title = this.getAttribute('title') || 'Consultation form';
    const active = this.getAttribute('active') !== 'false';
    const stats = parseJsonAttr(this.getAttribute('stats'), DEFAULT_STATS());
    const details = parseJsonAttr(this.getAttribute('details'), DEFAULT_DETAILS());
    const requests = parseJsonAttr(this.getAttribute('requests'), DEFAULT_REQUESTS());
    const sortOptions = parseJsonAttr(this.getAttribute('sort-options'), DEFAULT_SORT_OPTIONS());

    const statsHtml = stats
      .map(
        (s) => `<div data-formtrack-stat="${escapeAttribute(s.id)}" class="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
            <div class="flex items-center gap-2">
              <span class="h-2.5 w-2.5 rounded-full ${TONE_DOT[s.tone] ?? TONE_DOT.sky}" aria-hidden="true"></span>
              <p class="text-xs font-medium text-zinc-500 dark:text-zinc-400">${s.icon ? `<span aria-hidden="true" class="mr-1">${escapeAttribute(s.icon)}</span>` : ''}${escapeAttribute(s.label)}</p>
            </div>
            <p data-formtrack-stat-value="${escapeAttribute(s.id)}" class="mt-1.5 text-2xl font-black text-zinc-900 dark:text-zinc-50">${escapeAttribute(s.value)}</p>
            <div class="mt-2 h-1.5 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
              <div class="h-full rounded-full ${TONE_BAR[s.tone] ?? TONE_BAR.sky}" style="width:${clampPct(s.pct)}%"></div>
            </div>
            <p class="mt-1 text-[11px] text-zinc-400 dark:text-zinc-500">${clampPct(s.pct)}% of sent</p>
          </div>`
      )
      .join('');

    const detailsHtml = details
      .map(
        (d) => `<div class="flex items-center justify-between gap-4 text-sm">
            <span class="text-zinc-500 dark:text-zinc-400">${escapeAttribute(d.label)}</span>
            <span class="font-medium text-zinc-800 dark:text-zinc-100">${escapeAttribute(d.value)}</span>
          </div>`
      )
      .join('');

    const rowsHtml = requests
      .map((r) => {
        const meta = STATUS_META[r.status] ?? STATUS_META['not-completed'];
        return `<tr data-formtrack-row="${escapeAttribute(r.id)}" class="cursor-pointer border-b border-zinc-100 transition-colors last:border-0 hover:bg-zinc-50 dark:border-zinc-800/60 dark:hover:bg-zinc-800/40">
            <td class="px-4 py-2.5">
              <span class="flex items-center gap-2.5">
                <span class="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-indigo-100 text-xs font-bold text-indigo-700 dark:bg-indigo-950/70 dark:text-indigo-300">${r.avatarUrl ? `<img src="${escapeAttribute(r.avatarUrl)}" alt="${escapeAttribute(r.name)}" class="h-8 w-8 rounded-full object-cover" />` : escapeAttribute(r.initials ?? r.name.slice(0, 2).toUpperCase())}</span>
                <span class="font-medium text-zinc-800 dark:text-zinc-100">${escapeAttribute(r.name)}</span>
              </span>
            </td>
            <td class="whitespace-nowrap px-4 py-2.5 text-zinc-500 dark:text-zinc-400">${escapeAttribute(r.submitted)}</td>
            <td class="px-4 py-2.5 text-zinc-500 dark:text-zinc-400">${escapeAttribute(r.service)}</td>
            <td class="px-4 py-2.5">
              <span data-formtrack-status="${escapeAttribute(r.status)}" class="inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${meta.cls}">${meta.label}</span>
            </td>
          </tr>`;
      })
      .join('');

    const sortMenuHtml = this._sortOpen
      ? `<div data-formtrack-sortmenu class="absolute right-0 z-10 mt-1 w-44 overflow-hidden rounded-xl border border-zinc-200 bg-white py-1 shadow-lg dark:border-zinc-700 dark:bg-zinc-800">${sortOptions
          .map(
            (opt) => `<button data-formtrack-sortoption="${escapeAttribute(opt)}" type="button" class="block w-full px-3 py-1.5 text-left text-xs transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-700 ${opt === this._sort ? 'font-semibold text-indigo-600 dark:text-indigo-300' : 'text-zinc-600 dark:text-zinc-300'}">${escapeAttribute(opt)}</button>`
          )
          .join('')}</div>`
      : '';

    this.innerHTML = `
      <div data-formtrack class="w-full rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900 sm:p-6">
        <div data-formtrack-header class="flex items-center gap-3">
          <button data-formtrack-back aria-label="Back" type="button" class="rounded-lg p-1.5 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-800 dark:hover:bg-zinc-800 dark:hover:text-zinc-100">←</button>
          <h2 data-formtrack-title class="text-xl font-bold text-zinc-900 dark:text-zinc-50">${escapeAttribute(title)}</h2>
          ${active ? '<span data-formtrack-active class="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300">Active</span>' : ''}
          <div class="relative ml-auto">
            <button data-formtrack-options type="button" class="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800">Options ▾</button>
            ${sortMenuHtml}
          </div>
        </div>
        <div data-formtrack-stats class="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">${statsHtml}</div>
        <div data-formtrack-details class="mt-6">
          <p class="text-sm font-bold text-zinc-900 dark:text-zinc-50">Consultation form details</p>
          <div class="mt-2 grid gap-x-8 gap-y-2 rounded-xl border border-zinc-200 p-4 sm:grid-cols-2 dark:border-zinc-800">${detailsHtml}</div>
        </div>
        <div data-formtrack-table class="mt-6">
          <p class="text-sm font-bold text-zinc-900 dark:text-zinc-50">Client form requests</p>
          <div class="mt-2 overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
            <table class="w-full text-left text-sm">
              <thead>
                <tr class="border-b border-zinc-200 bg-zinc-50 text-xs uppercase tracking-wide text-zinc-400 dark:border-zinc-800 dark:bg-zinc-800/50 dark:text-zinc-500">
                  <th class="px-4 py-2.5 font-semibold">Client</th>
                  <th class="px-4 py-2.5 font-semibold">Submitted</th>
                  <th class="px-4 py-2.5 font-semibold">Service</th>
                  <th class="px-4 py-2.5 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>${rowsHtml}</tbody>
            </table>
          </div>
        </div>
      </div>`;
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('form-tracking-dashboard')) {
  customElements.define('form-tracking-dashboard', FormTrackingDashboardElement);
}

export default FormTrackingDashboardElement;
