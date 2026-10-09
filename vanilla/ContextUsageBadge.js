import uiIcon from './UiIcon.js';

const escapeAttribute = (value) =>
  String(value).replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  }[char]));

const formatNumber = (num) => {
  const n = Number(num) || 0;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
};

export class ContextUsageBadgeElement extends HTMLElement {
  static get observedAttributes() {
    return ['used-tokens', 'max-tokens', 'model-name', 'compact'];
  }

  constructor() {
    super();
    this._breakdown = [];
    this._isOpen = false;
  }

  get breakdown() {
    return this._breakdown;
  }

  set breakdown(val) {
    this._breakdown = Array.isArray(val) ? val : [];
    this.render();
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback() {
    this.render();
  }

  _applyHostClass(layoutClass) {
    const prev = this._appliedLayout || '';
    let user = this.className || '';
    if (prev && user.startsWith(prev)) user = user.slice(prev.length).trim();
    this._appliedLayout = layoutClass;
    const next = `${layoutClass}${user ? ` ${user}` : ''}`;
    if (this.className !== next) this.className = next;
  }

  render() {
    const used = Math.max(0, parseInt(this.getAttribute('used-tokens') || '0', 10) || 0);
    const max = Math.max(1, parseInt(this.getAttribute('max-tokens') || '1', 10) || 1);
    const model = this.getAttribute('model-name') || '';
    const compact = this.hasAttribute('compact');
    const percentage = Math.min(100, Math.round((used / max) * 100));

    let barColor = 'bg-emerald-500';
    if (percentage >= 90) barColor = 'bg-rose-500';
    else if (percentage >= 70) barColor = 'bg-amber-500';

    this._applyHostClass('relative inline-block text-xs font-sans select-none');

    this.innerHTML = `
      <button
        type="button"
        class="ctx-btn flex items-center gap-2 px-2.5 py-1 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 hover:bg-zinc-50 dark:hover:bg-zinc-800/80 transition-colors shadow-sm"
        aria-label="Context Window Usage"
        aria-expanded="${this._isOpen}"
      >
        ${uiIcon('cpu', { size: 14, className: 'text-zinc-500 dark:text-zinc-400 shrink-0' })}
        ${model && !compact ? `<span class="font-mono text-zinc-700 dark:text-zinc-300 font-medium truncate max-w-[120px]">${escapeAttribute(model)}</span>` : ''}
        <div class="w-16 h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden shrink-0">
          <div class="h-full transition-all duration-300 ${barColor}" style="width: ${percentage}%"></div>
        </div>
        <span class="font-mono text-[11px] font-semibold text-zinc-700 dark:text-zinc-300">${percentage}%</span>
      </button>

      <div
        class="ctx-popover ${this._isOpen ? 'block' : 'hidden'} absolute right-0 bottom-full mb-2 w-64 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xl z-30"
      >
        <div class="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
          <span class="font-semibold text-zinc-800 dark:text-zinc-200">Context Window</span>
          <span class="font-mono text-[11px] text-zinc-500">${formatNumber(used)} / ${formatNumber(max)}</span>
        </div>
        ${model ? `
          <div class="pt-2 text-[11px] text-zinc-500 flex justify-between">
            <span>Model</span>
            <span class="font-mono text-zinc-700 dark:text-zinc-300 font-medium">${escapeAttribute(model)}</span>
          </div>
        ` : ''}
        ${this._breakdown.length > 0 ? `
          <div class="pt-2.5 space-y-1.5">
            <div class="text-[10px] uppercase font-semibold text-zinc-400 tracking-wider">Breakdown</div>
            ${this._breakdown.map((item) => `
              <div class="flex items-center justify-between text-[11px]">
                <span class="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400">
                  <span class="w-2 h-2 rounded-full ${escapeAttribute(item.colorClass || 'bg-zinc-400')}"></span>
                  ${escapeAttribute(item.label)}
                </span>
                <span class="font-mono text-zinc-700 dark:text-zinc-300">${formatNumber(item.count)}</span>
              </div>
            `).join('')}
          </div>
        ` : ''}
      </div>
    `;

    const btn = this.querySelector('.ctx-btn');
    const pop = this.querySelector('.ctx-popover');
    if (btn && pop) {
      btn.addEventListener('click', () => {
        this._isOpen = !this._isOpen;
        btn.setAttribute('aria-expanded', String(this._isOpen));
        if (this._isOpen) pop.classList.remove('hidden');
        else pop.classList.add('hidden');
      });
      btn.addEventListener('blur', () => {
        setTimeout(() => {
          this._isOpen = false;
          btn.setAttribute('aria-expanded', 'false');
          pop.classList.add('hidden');
        }, 200);
      });
    }
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('context-usage-badge')) {
  customElements.define('context-usage-badge', ContextUsageBadgeElement);
}
export default ContextUsageBadgeElement;
