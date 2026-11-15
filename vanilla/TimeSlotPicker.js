/**
 * TimeSlotPicker - Vanilla Web Component
 * Usage: <time-slot-picker days='[...]' timezone="GMT+8"></time-slot-picker>
 * Attributes: days (JSON), value (JSON), timezone, days-label, slots-label
 * Properties: days, value
 * Events: select (detail {dayId, slotId, slot})
 */
const escapeAttribute = (value) =>
  String(value).replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  }[char]));

const PERIOD_LABELS = { morning: 'Morning', afternoon: 'Afternoon', evening: 'Evening' };

export class TimeSlotPickerElement extends HTMLElement {
  static get observedAttributes() {
    return ['days', 'value', 'timezone', 'days-label', 'slots-label'];
  }

  constructor() {
    super();
    this._days = [];
    this._value = null;
    this._activeDayId = null;
    this._bound = false;
  }

  connectedCallback() {
    if (!this._days.length) {
      const raw = this.getAttribute('days');
      if (raw) {
        try { this._days = JSON.parse(raw); } catch { this._days = []; }
      }
    }
    if (!this._value) {
      const raw = this.getAttribute('value');
      if (raw) {
        try { this._value = JSON.parse(raw); } catch { this._value = null; }
      }
    }
    if (!this._activeDayId) {
      this._activeDayId = (this._value && this._value.dayId) || (this._days.find((day) => !day.disabled) || this._days[0] || {}).id || '';
    }
    this.render();
    if (!this._bound) {
      this._bound = true;
      this.addEventListener('click', (event) => {
        const dayEl = event.target.closest('[data-slot-day]');
        if (dayEl && !dayEl.disabled) {
          this._activeDayId = dayEl.getAttribute('data-slot-day');
          this.render();
          return;
        }
        const slotEl = event.target.closest('[data-time-slot]');
        if (slotEl && !slotEl.disabled) {
          const slotId = slotEl.getAttribute('data-time-slot');
          const day = this._days.find((item) => item.id === this._activeDayId);
          const slot = day && day.slots.find((item) => item.id === slotId);
          if (!slot || slot.disabled) return;
          this._value = { dayId: this._activeDayId, slotId };
          this.render();
          this.dispatchEvent(new CustomEvent('select', { detail: { dayId: this._activeDayId, slotId, slot } }));
        }
      });
    }
  }

  attributeChangedCallback() {
    this.render();
  }

  get days() {
    return this._days;
  }

  set days(value) {
    this._days = Array.isArray(value) ? value : [];
    this._activeDayId = (this._days.find((day) => !day.disabled) || this._days[0] || {}).id || '';
    this.render();
  }

  get value() {
    return this._value;
  }

  set value(value) {
    this._value = value || null;
    if (this._value) this._activeDayId = this._value.dayId;
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
    const daysLabel = this.getAttribute('days-label') || 'Date';
    const slotsLabel = this.getAttribute('slots-label') || 'Select a time';
    const timezone = this.getAttribute('timezone') || '';
    const activeDay = this._days.find((day) => day.id === this._activeDayId) || this._days[0];
    const daysHtml = this._days
      .map((day) => {
        const active = day.id === this._activeDayId;
        const cls = active
          ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
          : 'bg-zinc-50 text-zinc-700 hover:bg-zinc-100 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700';
        return `<button type="button" data-slot-day="${escapeAttribute(day.id)}"${day.disabled ? ' disabled' : ''} class="min-w-[64px] rounded-lg px-2 py-2 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-40 ${cls}">
          <span class="block text-[10px] font-medium uppercase tracking-wide opacity-70">${escapeAttribute(day.weekday)}</span>
          <span class="block text-sm font-semibold">${escapeAttribute(day.label)}</span>
        </button>`;
      })
      .join('');
    const periodsHtml = activeDay
      ? ['morning', 'afternoon', 'evening']
          .map((period) => {
            const slots = activeDay.slots.filter((slot) => (slot.period || 'morning') === period);
            if (!slots.length) return '';
            const slotButtons = slots
              .map((slot) => {
                const isSelected = this._value && this._value.dayId === this._activeDayId && this._value.slotId === slot.id;
                const cls = isSelected
                  ? 'border-indigo-600 bg-indigo-50 dark:border-indigo-500 dark:bg-indigo-950/60'
                  : 'border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800';
                const labelCls = isSelected ? 'text-indigo-700 dark:text-indigo-300' : 'text-zinc-800 dark:text-zinc-100';
                const availability = slot.available != null
                  ? `<span class="mt-0.5 block text-[10px] ${slot.available > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-400'}">${slot.available > 0 ? `${slot.available} available` : 'Fully booked'}</span>`
                  : '';
                return `<button type="button" data-time-slot="${escapeAttribute(slot.id)}"${slot.disabled ? ' disabled' : ''} class="rounded-lg border px-2 py-2 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-40 ${cls}">
                  <span class="block text-xs font-semibold ${labelCls}">${escapeAttribute(slot.label)}</span>
                  ${availability}
                </button>`;
              })
              .join('');
            return `<div>
              <p class="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">${PERIOD_LABELS[period]}</p>
              <div class="grid grid-cols-2 gap-1.5 sm:grid-cols-3">${slotButtons}</div>
            </div>`;
          })
          .join('')
      : '';

    this.innerHTML = `<div data-time-slot-picker class="w-full rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <div class="border-b border-zinc-100 px-4 pt-3 dark:border-zinc-800">
        <p class="text-xs font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">${escapeAttribute(daysLabel)}</p>
        <div class="mt-2 flex gap-1.5 overflow-x-auto pb-3">${daysHtml}</div>
      </div>
      <div class="p-4">
        <div class="flex items-center justify-between">
          <p data-slot-heading class="text-sm font-semibold text-zinc-900 dark:text-zinc-50">${escapeAttribute(slotsLabel)}${activeDay ? `<span class="ml-1 font-normal text-zinc-400">· ${escapeAttribute(activeDay.weekday)} ${escapeAttribute(activeDay.label)}</span>` : ''}</p>
          ${timezone ? `<span class="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">${escapeAttribute(timezone)}</span>` : ''}
        </div>
        ${activeDay ? `<div data-slot-periods class="mt-3 space-y-4">${periodsHtml}</div>` : ''}
      </div>
    </div>`;
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('time-slot-picker')) {
  customElements.define('time-slot-picker', TimeSlotPickerElement);
}

export default TimeSlotPickerElement;
