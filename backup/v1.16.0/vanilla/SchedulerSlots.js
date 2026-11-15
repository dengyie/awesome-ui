import uiIcon from './UiIcon.js';

const escapeAttribute = (value) =>
  String(value).replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  }[char]));

const PERIODS = [
  { key: 'morning', label: 'Morning', range: [6, 12] },
  { key: 'afternoon', label: 'Afternoon', range: [12, 17] },
  { key: 'evening', label: 'Evening', range: [17, 24] },
];

const humanDate = (iso) => {
  const [year, month, day] = String(iso || '').split('-').map(Number);
  if (!year || !month || !day) return iso || '';
  return new Date(year, month - 1, day).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
};

const hourOf = (time) => {
  const [hour] = String(time || '').split(':').map(Number);
  return Number.isFinite(hour) ? hour : -1;
};

const amPm = (time) => {
  const [hour, minute] = String(time || '').split(':').map(Number);
  if (!Number.isFinite(hour) || !Number.isFinite(minute)) return time;
  const suffix = hour >= 12 ? 'PM' : 'AM';
  const display = hour % 12 === 0 ? 12 : hour % 12;
  return `${display}:${String(minute).padStart(2, '0')} ${suffix}`;
};

/**
 * SchedulerSlots - Vanilla Web Component
 * Usage: <scheduler-slots date="2026-11-20" timezone="GMT+8"></scheduler-slots>
 * Properties: slots (SchedulerSlot[])
 * Events: select (detail: slot)
 */
export class SchedulerSlotsElement extends HTMLElement {
  static get observedAttributes() {
    return ['date', 'selected-id', 'timezone', 'empty-text'];
  }

  constructor() {
    super();
    this._slots = [];
  }

  get slots() {
    return this._slots;
  }

  set slots(value) {
    this._slots = Array.isArray(value) ? value : [];
    this.render();
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback() {
    this.render();
  }

  _applyHostClass(hostClass) {
    const prev = this._appliedLayout || '';
    let user = this.className || '';
    if (prev && user.startsWith(prev)) user = user.slice(prev.length).trim();
    this._appliedLayout = hostClass;
    const next = `${hostClass}${user ? ` ${user}` : ''}`;
    if (this.className !== next) this.className = next;
  }

  render() {
    this._applyHostClass('block');

    const date = this.getAttribute('date') || '';
    const selectedId = this.getAttribute('selected-id') || '';
    const timezone = this.getAttribute('timezone') || '';
    const emptyText = this.getAttribute('empty-text') || 'No slots available for this day.';

    const groups = PERIODS.map((period) => ({
      period,
      slots: this._slots.filter((slot) => {
        const hour = hourOf(slot.time);
        return hour >= period.range[0] && hour < period.range[1];
      }),
    })).filter((group) => group.slots.length > 0);

    const openCount = this._slots.filter((slot) => slot.available !== false).length;

    const body = groups.length
      ? `<div class="mt-2 space-y-3">
          ${groups
            .map(({ period, slots }) => {
              const buttons = slots
                .map((slot) => {
                  const disabled = slot.available === false;
                  const selected = String(slot.id) === String(selectedId);
                  const tone = selected
                    ? 'border-indigo-600 bg-indigo-600 font-medium text-white'
                    : disabled
                      ? 'cursor-not-allowed border-zinc-100 text-zinc-300 line-through dark:border-zinc-800 dark:text-zinc-600'
                      : 'border-zinc-200 text-zinc-700 hover:border-indigo-300 hover:bg-indigo-50/60 dark:border-zinc-700 dark:text-zinc-200 dark:hover:border-indigo-500 dark:hover:bg-indigo-950/20';
                  return `<button type="button" class="slot flex items-center justify-between rounded-lg border px-2 py-1.5 text-[11px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${tone}"
                    data-slot="${escapeAttribute(slot.id)}" aria-pressed="${selected}" ${disabled ? 'disabled' : ''}>
                    <span class="tabular-nums">${escapeAttribute(amPm(slot.time))}</span>
                    ${selected ? uiIcon('check', { size: 11 }) : disabled ? uiIcon('lock', { size: 11 }) : ''}
                  </button>`;
                })
                .join('');
              const notes = slots.filter((slot) => slot.note).map((slot) => slot.note);
              return `<fieldset>
                <legend class="text-[10px] font-medium uppercase tracking-wide text-zinc-400">${period.label}</legend>
                <div class="mt-1 grid grid-cols-2 gap-1.5">${buttons}</div>
                ${notes.length ? `<p class="mt-1 text-[10px] text-zinc-400">${escapeAttribute(notes.join(' · '))}</p>` : ''}
              </fieldset>`;
            })
            .join('')}
        </div>`
      : `<p class="py-8 text-center text-[11px] text-zinc-400">${escapeAttribute(emptyText)}</p>`;

    this.innerHTML = `
      <div class="rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900">
        <header class="flex items-center gap-2 border-b border-zinc-100 pb-2 dark:border-zinc-800">
          <span class="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400">${uiIcon('calendar', { size: 14 })}</span>
          <div class="min-w-0 flex-1">
            <h3 class="text-xs font-semibold text-zinc-800 dark:text-zinc-100">${escapeAttribute(humanDate(date))}</h3>
            ${timezone ? `<p class="text-[10px] text-zinc-400">All times in ${escapeAttribute(timezone)}</p>` : ''}
          </div>
          <span class="rounded-full bg-zinc-100 px-1.5 py-0.5 text-[10px] font-medium tabular-nums text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">${openCount} open</span>
        </header>
        ${body}
      </div>`;

    this.querySelectorAll('.slot').forEach((button) => {
      button.addEventListener('click', () => {
        if (button.hasAttribute('disabled')) return;
        const id = button.getAttribute('data-slot');
        const slot = this._slots.find((entry) => String(entry.id) === String(id));
        if (slot) this.dispatchEvent(new CustomEvent('select', { detail: slot }));
      });
    });
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('scheduler-slots')) {
  customElements.define('scheduler-slots', SchedulerSlotsElement);
}
export default SchedulerSlotsElement;
