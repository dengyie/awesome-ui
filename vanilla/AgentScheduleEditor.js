/**
 * AgentScheduleEditor - Vanilla Web Component
 * Agent run schedule editor: frequency pills + time input + derived cron
 * expression with next-run preview and a save action.
 *
 * Usage: <agent-schedule-editor title="Run schedule"></agent-schedule-editor>
 * Properties: frequencies ([{id,label,expression}]), activeId, time, nextRun, timezone
 * Attributes: title, description
 * Events: save (detail {frequency, time})
 */
const escapeAttribute = (value) =>
  String(value).replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  }[char]));

export class AgentScheduleEditorElement extends HTMLElement {
  static get observedAttributes() {
    return ['title', 'description'];
  }

  constructor() {
    super();
    this._frequencies = [];
    this._activeId = '';
    this._time = '09:00';
    this._nextRun = '';
    this._timezone = '';
    this._saved = false;
    this._savedTimer = null;
    this._bound = false;
  }

  get frequencies() {
    return this._frequencies;
  }

  set frequencies(value) {
    this._frequencies = Array.isArray(value) ? value.map((f) => ({ ...f })) : [];
    if (!this._activeId && this._frequencies.length > 0) {
      this._activeId = this._frequencies[0].id;
    }
    this.render();
  }

  get activeId() {
    return this._activeId;
  }

  set activeId(value) {
    this._activeId = String(value || '');
    this.render();
  }

  get time() {
    return this._time;
  }

  set time(value) {
    this._time = String(value ?? '09:00');
    this.render();
  }

  get nextRun() {
    return this._nextRun;
  }

  set nextRun(value) {
    this._nextRun = String(value ?? '');
    this.render();
  }

  get timezone() {
    return this._timezone;
  }

  set timezone(value) {
    this._timezone = String(value ?? '');
    this.render();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;
    if (name === 'title' || name === 'description') this.render();
  }

  connectedCallback() {
    this.render();
    if (!this._bound) {
      this._bound = true;
      this.addEventListener('click', (event) => {
        const freqBtn = event.target.closest('[data-schedule-frequency]');
        if (freqBtn) {
          this._activeId = freqBtn.getAttribute('data-schedule-frequency') || '';
          this.render();
          return;
        }
        const saveBtn = event.target.closest('[data-schedule-save]');
        if (saveBtn) {
          const freq = this._frequencies.find((f) => f.id === this._activeId) || this._frequencies[0];
          if (freq) {
            this._saved = true;
            this.render();
            if (this._savedTimer) clearTimeout(this._savedTimer);
            this._savedTimer = setTimeout(() => {
              this._saved = false;
              this.render();
            }, 1600);
            this.dispatchEvent(new CustomEvent('save', {
              detail: { frequency: { ...freq }, time: this._time },
            }));
          }
        }
      });
      this.addEventListener('change', (event) => {
        if (event.target && event.target.matches('[data-schedule-time]')) {
          this._time = event.target.value;
          // keep label in sync without full re-render (input holds focus)
          const next = this.querySelector('[data-schedule-cron]');
          if (next) next.textContent = this._cronFor(this._activeId);
        }
      });
      this.addEventListener('input', (event) => {
        if (event.target && event.target.matches('[data-schedule-time]')) {
          this._time = event.target.value;
        }
      });
    }
  }

  _cronFor(id) {
    const freq = this._frequencies.find((f) => f.id === id) || this._frequencies[0];
    return freq ? freq.expression : '—';
  }

  render() {
    const title = this.getAttribute('title') || 'Run schedule';
    const description = this.getAttribute('description') ||
      'Configure when the agent runs automatically. The cron expression is derived from your selection.';
    const freqPills = this._frequencies.map((f) => {
      const active = f.id === this._activeId;
      return `<button type="button" data-schedule-frequency="${escapeAttribute(f.id)}" aria-pressed="${active}"
        class="${active
          ? 'rounded-full bg-indigo-600 px-3 py-1 text-[11px] font-semibold text-white transition-colors hover:bg-indigo-500'
          : 'rounded-full border border-zinc-200 px-3 py-1 text-[11px] font-semibold text-zinc-500 transition-colors hover:border-zinc-300 hover:text-zinc-700 dark:border-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200'}">${escapeAttribute(f.label)}</button>`;
    }).join('');
    const tz = this._timezone
      ? `<span data-schedule-timezone class="text-[11px] text-zinc-400 dark:text-zinc-500">${escapeAttribute(this._timezone)}</span>`
      : '';
    const nextRun = this._nextRun || '—';
    this.innerHTML = `
      <div data-schedule-editor class="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <p data-schedule-title class="text-sm font-semibold text-zinc-900 dark:text-zinc-50">${escapeAttribute(title)}</p>
        <p data-schedule-description class="mt-1 text-xs text-zinc-500 dark:text-zinc-400">${escapeAttribute(description)}</p>
        <div data-schedule-frequencies class="mt-3 flex flex-wrap gap-1.5">${freqPills}</div>
        <div class="mt-3 flex flex-wrap items-center gap-2">
          <label data-schedule-time-wrap class="flex items-center gap-2">
            <span class="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">Run at</span>
            <input data-schedule-time type="time" value="${escapeAttribute(this._time)}"
              class="rounded-md border border-zinc-200 bg-white px-2 py-1.5 font-mono text-xs text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200" />
          </label>
          ${tz}
        </div>
        <div class="mt-3 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-800/60">
          <span class="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">Cron</span>
          <code data-schedule-cron class="ml-2 font-mono text-xs text-zinc-700 dark:text-zinc-200">${escapeAttribute(this._cronFor(this._activeId))}</code>
          <span class="mx-2 text-zinc-300 dark:text-zinc-600">|</span>
          <span class="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">Next run</span>
          <span data-schedule-next class="ml-2 text-xs text-zinc-700 dark:text-zinc-200">${escapeAttribute(nextRun)}</span>
        </div>
        <div class="mt-3 flex items-center justify-end gap-2">
          ${this._saved ? '<span data-schedule-saved class="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">Schedule saved</span>' : ''}
          <button type="button" data-schedule-save
            class="rounded-md bg-indigo-600 px-3 py-1.5 text-[11px] font-semibold text-white transition-colors hover:bg-indigo-500">Save schedule</button>
        </div>
      </div>`;
  }
}

export default AgentScheduleEditorElement;

if (!customElements.get('agent-schedule-editor')) {
  customElements.define('agent-schedule-editor', AgentScheduleEditorElement);
}
