import uiIcon from './UiIcon.js';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

const pad = (n) => String(n).padStart(2, '0');
const toIso = (year, month, day) => `${year}-${pad(month + 1)}-${pad(day)}`;

const parseIso = (iso) => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || '');
  if (!match) return null;
  return { year: Number(match[1]), month: Number(match[2]) - 1, day: Number(match[3]) };
};

const todayIso = () => {
  const now = new Date();
  return toIso(now.getFullYear(), now.getMonth(), now.getDate());
};

/**
 * DatePicker - Vanilla Web Component
 * Usage: <date-picker value="2026-11-14" min="2026-01-01" max="2026-12-31"></date-picker>
 * Events: change (detail: 'YYYY-MM-DD')
 */
const escapeAttribute = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

export class DatePickerElement extends HTMLElement {
  static get observedAttributes() {
    return ['value', 'min', 'max', 'week-starts-on', 'show-today', 'disabled'];
  }

  constructor() {
    super();
    const initial = parseIso(this.getAttribute('value')) || parseIso(todayIso());
    this._view = { year: initial.year, month: initial.month };
  }

  get value() {
    return this.getAttribute('value') || '';
  }

  set value(next) {
    if (next) this.setAttribute('value', next);
    else this.removeAttribute('value');
  }

  connectedCallback() {
    const selected = parseIso(this.getAttribute('value'));
    if (selected) this._view = { year: selected.year, month: selected.month };
    this.render();
  }

  attributeChangedCallback() {
    const selected = parseIso(this.getAttribute('value'));
    if (selected) this._view = { year: selected.year, month: selected.month };
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

  _shift(delta) {
    const next = new Date(this._view.year, this._view.month + delta, 1);
    this._view = { year: next.getFullYear(), month: next.getMonth() };
    this.render();
  }

  render() {
    this._applyHostClass('block');

    const value = this.getAttribute('value') || '';
    const min = this.getAttribute('min') || '';
    const max = this.getAttribute('max') || '';
    const weekStartsOn = Number(this.getAttribute('week-starts-on') || 1) === 0 ? 0 : 1;
    const showToday = this.getAttribute('show-today') !== 'false';
    const disabled = this.hasAttribute('disabled') && this.getAttribute('disabled') !== 'false';
    const today = todayIso();

    const iso = (day) => toIso(this._view.year, this._view.month, day);
    const isDisabled = (day) => {
      if (disabled) return true;
      const candidate = iso(day);
      if (min && candidate < min) return true;
      if (max && candidate > max) return true;
      return false;
    };

    const first = new Date(this._view.year, this._view.month, 1).getDay();
    const lead = (first - weekStartsOn + 7) % 7;
    const total = new Date(this._view.year, this._view.month + 1, 0).getDate();
    const cells = Array.from({ length: lead }, () => null);
    for (let day = 1; day <= total; day += 1) cells.push(day);
    while (cells.length % 7 !== 0) cells.push(null);

    const weekdays = Array.from({ length: 7 }, (_, i) => WEEKDAYS[(i + weekStartsOn) % 7]);

    this.innerHTML = `
      <div class="w-full max-w-[17rem] rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-3">
        <div class="flex items-center gap-1">
          <button type="button" class="date-prev rounded-md p-1 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200" aria-label="Previous month">${uiIcon('chevron-left', { size: 14 })}</button>
          <span class="flex-1 text-center text-xs font-semibold text-zinc-800 dark:text-zinc-100">${MONTHS[this._view.month]} ${this._view.year}</span>
          <button type="button" class="date-next rounded-md p-1 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200" aria-label="Next month">${uiIcon('chevron-right', { size: 14 })}</button>
        </div>

        <div class="mt-2 grid grid-cols-7 gap-0.5">
          ${weekdays
            .map((label) => `<span class="py-1 text-center text-[10px] font-medium uppercase text-zinc-400">${escapeAttribute(label)}</span>`)
            .join('')}
          ${cells
            .map((day) => {
              if (day === null) return '<span></span>';
              const date = iso(day);
              const blocked = isDisabled(day);
              const selected = value === date;
              const isToday = date === today;
              const tone = selected
                ? 'bg-indigo-600 font-semibold text-white hover:bg-indigo-500'
                : isToday
                  ? 'font-semibold text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-950/40'
                  : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800';
              return `<button type="button" class="date-day flex h-7 items-center justify-center rounded-md text-[11px] tabular-nums transition-colors disabled:cursor-not-allowed disabled:text-zinc-300 disabled:hover:bg-transparent dark:disabled:text-zinc-600 ${tone}"
                data-date="${date}" aria-label="${date}" aria-pressed="${selected}" ${blocked ? 'disabled' : ''}>${day}</button>`;
            })
            .join('')}
        </div>

        ${
          showToday
            ? `<div class="mt-2 border-t border-zinc-100 pt-2 dark:border-zinc-800">
                <button type="button" class="date-today w-full rounded-md py-1 text-[11px] font-medium text-indigo-600 transition-colors hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-950/40">Today</button>
              </div>`
            : ''
        }
      </div>`;

    this.querySelector('.date-prev').addEventListener('click', () => this._shift(-1));
    this.querySelector('.date-next').addEventListener('click', () => this._shift(1));

    this.querySelectorAll('.date-day').forEach((button) => {
      button.addEventListener('click', () => {
        if (button.hasAttribute('disabled')) return;
        this.dispatchEvent(new CustomEvent('change', { detail: button.getAttribute('data-date') }));
      });
    });

    const todayButton = this.querySelector('.date-today');
    if (todayButton) {
      todayButton.addEventListener('click', () => {
        if (disabled) return;
        if ((min && today < min) || (max && today > max)) return;
        this.dispatchEvent(new CustomEvent('change', { detail: today }));
      });
    }
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('date-picker')) {
  customElements.define('date-picker', DatePickerElement);
}
export default DatePickerElement;
