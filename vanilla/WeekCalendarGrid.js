/**
 * WeekCalendarGrid - Week-view calendar grid: hour gutter, day columns with
 * absolutely positioned event blocks (solid or dashed focus blocks), red
 * current-time line, Day/Week segmented toggle, timezone label, "Find time"
 * button and a "Schedule or reschedule…" composer input
 * (Clockwise week calendar pattern).
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

const HOUR_HEIGHT = 56;

const DEFAULT_DAYS = () => [
  { id: 'mon', label: 'Mon', date: '16' },
  { id: 'tue', label: 'Tue', date: '17' },
  { id: 'wed', label: 'Wed', date: '18' },
  { id: 'thu', label: 'Thu', date: '19' },
  { id: 'fri', label: 'Fri', date: '20' },
];

const DEFAULT_EVENTS = () => [
  { id: 'e1', dayId: 'mon', title: 'Alex // Sam', start: 9, end: 10, tone: 'solid', color: 'blue' },
  { id: 'e2', dayId: 'mon', title: 'Focus Time', start: 10, end: 12, tone: 'dashed', color: 'blue' },
  { id: 'e3', dayId: 'mon', title: 'Lunch', start: 12, end: 13, tone: 'solid', color: 'amber' },
  { id: 'e4', dayId: 'mon', title: 'Focus Time', start: 13, end: 17, tone: 'dashed', color: 'blue' },
  { id: 'e5', dayId: 'tue', title: 'Lunch', start: 12, end: 13, tone: 'solid', color: 'amber' },
  { id: 'e6', dayId: 'wed', title: 'Team Sync', start: 9, end: 10, tone: 'solid', color: 'green' },
  { id: 'e7', dayId: 'wed', title: 'Lunch', start: 12, end: 13, tone: 'solid', color: 'amber' },
  { id: 'e8', dayId: 'thu', title: 'Lunch', start: 12, end: 13, tone: 'solid', color: 'amber' },
  { id: 'e9', dayId: 'fri', title: 'Lunch', start: 12, end: 13, tone: 'solid', color: 'amber' },
];

const EVENT_STYLES = {
  blue: {
    solid: 'bg-blue-500/90 text-white dark:bg-blue-500/80',
    dashed: 'border border-dashed border-blue-400 bg-blue-50/60 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300',
  },
  green: {
    solid: 'bg-emerald-500/90 text-white dark:bg-emerald-500/80',
    dashed: 'border border-dashed border-emerald-400 bg-emerald-50/60 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300',
  },
  amber: {
    solid: 'bg-amber-400/90 text-amber-950 dark:bg-amber-400/80',
    dashed: 'border border-dashed border-amber-400 bg-amber-50/60 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300',
  },
};

const hourLabel = (h) => {
  const suffix = h < 12 ? 'am' : 'pm';
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}${suffix}`;
};

const eventCls = (ev) => {
  const styles = EVENT_STYLES[ev.color ?? 'blue'] ?? EVENT_STYLES.blue;
  return (ev.tone ?? 'solid') === 'dashed' ? styles.dashed : styles.solid;
};

class WeekCalendarGridElement extends HTMLElement {
  static get observedAttributes() {
    return ['days', 'events', 'start-hour', 'end-hour', 'time-zone', 'view', 'active-day-id', 'now-hour', 'composer-placeholder'];
  }

  constructor() {
    super();
    this._bound = false;
    this._view = 'week';
    this._activeDayId = 'mon';
  }

  connectedCallback() {
    this._view = this.getAttribute('view') || 'week';
    this._activeDayId = this.getAttribute('active-day-id') || 'mon';
    if (this._bound === false && this.innerHTML === '') {
      this._bound = true;
    }
    this._render();
    this.addEventListener('click', this._onClick);
    this.addEventListener('keydown', this._onKeydown);
  }

  disconnectedCallback() {
    this.removeEventListener('click', this._onClick);
    this.removeEventListener('keydown', this._onKeydown);
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;
    if (this._bound === false && this.innerHTML === '') return;
    if (name === 'view') this._view = newValue || 'week';
    if (name === 'active-day-id') this._activeDayId = newValue || 'mon';
    this._render();
  }

  _onClick(event) {
    const viewBtn = event.target.closest('[data-week-view]');
    if (viewBtn) {
      this._view = viewBtn.getAttribute('data-week-view');
      this._render();
      this.dispatchEvent(new CustomEvent('view-change', { detail: { view: this._view }, bubbles: true }));
      return;
    }
    const evBtn = event.target.closest('[data-week-event]');
    if (evBtn) {
      const found = this._events().find((ev) => ev.id === evBtn.getAttribute('data-week-event'));
      if (found) this.dispatchEvent(new CustomEvent('event-click', { detail: { event: found }, bubbles: true }));
      return;
    }
    if (event.target.closest('[data-week-find-time]')) {
      this.dispatchEvent(new CustomEvent('find-time', { bubbles: true }));
    }
  }

  _onKeydown(event) {
    const composer = event.target.closest('[data-week-composer]');
    if (composer && event.key === 'Enter') {
      this.dispatchEvent(new CustomEvent('compose-submit', { detail: { text: composer.value }, bubbles: true }));
    }
  }

  _days() {
    return parseJsonAttr(this.getAttribute('days'), DEFAULT_DAYS());
  }

  _events() {
    return parseJsonAttr(this.getAttribute('events'), DEFAULT_EVENTS());
  }

  _render() {
    const startHour = Number(this.getAttribute('start-hour') ?? 6);
    const endHour = Number(this.getAttribute('end-hour') ?? 18);
    const timeZone = this.getAttribute('time-zone') || 'GMT+7';
    const nowHour = Number(this.getAttribute('now-hour') ?? 15.83);
    const composerPlaceholder = this.getAttribute('composer-placeholder') || 'Schedule or reschedule…';
    const days = this._days();
    const events = this._events();
    const hours = [];
    for (let h = startHour; h <= endHour; h++) hours.push(h);
    const visibleDays = this._view === 'day' ? days.filter((d) => d.id === this._activeDayId) : days;
    const gridHeight = (endHour - startHour) * HOUR_HEIGHT;
    const gridTemplate = `64px repeat(${Math.max(visibleDays.length, 1)}, minmax(0, 1fr))`;

    const headerHtml = visibleDays
      .map((day) => {
        const activeCls = day.id === this._activeDayId ? 'rounded-md bg-zinc-50 dark:bg-zinc-800/60' : '';
        const dateCls = day.id === this._activeDayId ? 'text-zinc-900 dark:text-zinc-50' : 'text-zinc-700 dark:text-zinc-200';
        return `<div data-week-day="${escapeAttribute(day.id)}" class="pb-2 text-center ${activeCls}">
            <p class="text-xs font-medium text-zinc-500 dark:text-zinc-400">${escapeAttribute(day.label)}</p>
            <p class="text-sm font-bold ${dateCls}">${escapeAttribute(day.date)}</p>
          </div>`;
      })
      .join('');

    const gutterHtml = hours
      .map((h, i) => `<span class="absolute -translate-y-1/2 pr-3 text-right text-[11px] font-medium text-zinc-400 dark:text-zinc-500" style="top:${i * HOUR_HEIGHT}px">${hourLabel(h)}</span>`)
      .join('');

    const columnsHtml = visibleDays
      .map((day) => {
        const lines = hours
          .map((h, i) => `<div class="absolute w-full border-t border-zinc-100 dark:border-zinc-800" style="top:${i * HOUR_HEIGHT}px"></div>`)
          .join('');
        const evs = events
          .filter((ev) => ev.dayId === day.id)
          .map((ev) => `<button data-week-event="${escapeAttribute(ev.id)}" type="button" style="top:${(ev.start - startHour) * HOUR_HEIGHT}px;height:${(ev.end - ev.start) * HOUR_HEIGHT - 4}px" class="absolute left-1 right-1.5 z-10 overflow-hidden rounded-md px-2 py-1 text-left text-xs font-semibold ${eventCls(ev)}">${escapeAttribute(ev.title)}${ev.subtitle ? `<span class="block truncate text-[10px] font-normal opacity-80">${escapeAttribute(ev.subtitle)}</span>` : ''}</button>`)
          .join('');
        const nowLine = nowHour >= startHour && nowHour <= endHour
          ? `<div data-week-now class="pointer-events-none absolute left-0 right-0 z-20 border-t-2 border-red-500" style="top:${(nowHour - startHour) * HOUR_HEIGHT}px"><span class="absolute -left-1 -top-[5px] h-2 w-2 rounded-full bg-red-500"></span></div>`
          : '';
        return `<div data-week-column="${escapeAttribute(day.id)}" class="relative border-l border-zinc-100 dark:border-zinc-800" style="height:${gridHeight}px">${lines}${evs}${nowLine}</div>`;
      })
      .join('');

    const viewBtn = (v) => {
      const active = this._view === v;
      const cls = active
        ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900'
        : 'bg-white text-zinc-600 hover:bg-zinc-50 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800';
      return `<button data-week-view="${v}" type="button" class="px-3 py-1.5 text-xs font-semibold capitalize transition-colors ${cls}">${v}</button>`;
    };

    this.innerHTML = `
      <div data-week-grid class="w-full rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div data-week-toolbar class="flex items-center justify-between gap-4">
          <div class="flex items-center gap-3">
            <div data-week-view-toggle class="flex overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-700">${viewBtn('day')}${viewBtn('week')}</div>
            <span data-week-timezone class="text-xs font-medium text-zinc-400 dark:text-zinc-500">${escapeAttribute(timeZone)}</span>
          </div>
          <button data-week-find-time type="button" class="rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200">Find time</button>
        </div>
        <input data-week-composer type="text" placeholder="${escapeAttribute(composerPlaceholder)}" class="mt-4 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm text-zinc-800 placeholder-zinc-400 outline-none focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-950/60 dark:text-zinc-100 dark:placeholder-zinc-500">
        <div class="mt-4 grid" style="grid-template-columns:${gridTemplate}">
          <div></div>
          ${headerHtml}
        </div>
        <div data-week-body class="relative grid overflow-hidden" style="grid-template-columns:${gridTemplate}">
          <div data-week-gutter class="relative" style="height:${gridHeight}px">${gutterHtml}</div>
          ${columnsHtml}
        </div>
      </div>`;
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('week-calendar-grid')) {
  customElements.define('week-calendar-grid', WeekCalendarGridElement);
}

export default WeekCalendarGridElement;
