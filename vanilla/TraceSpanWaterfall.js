/**
 * TraceSpanWaterfall - Vanilla Web Component
 * Usage: <trace-span-waterfall title="Trace waterfall" spans='[...]'></trace-span-waterfall>
 * Attributes: title, spans (JSON: [{id,name,startMs,durationMs,depth?,kind?,costUsd?,tokens?}])
 * Events: span-select (detail {span})
 */
const escapeAttribute = (value) =>
  String(value).replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  }[char]));

const parseJsonAttr = (raw, fallback) => {
  try {
    const parsed = raw ? JSON.parse(raw) : null;
    return parsed ?? fallback;
  } catch (e) {
    return fallback;
  }
};

const kindDot = (kind) =>
  kind === 'tool' ? 'bg-emerald-500' : kind === 'retrieval' ? 'bg-amber-500' : 'bg-indigo-500';

const formatDuration = (ms) => (ms >= 1000 ? `${(ms / 1000).toFixed(1)}s` : `${ms}ms`);

const formatCost = (usd) => (typeof usd === 'number' ? `$${usd.toFixed(3)}` : '');

export class TraceSpanWaterfallElement extends HTMLElement {
  static get observedAttributes() {
    return ['title', 'spans'];
  }

  constructor() {
    super();
    this._bound = false;
    this._spans = [];
  }

  connectedCallback() {
    if (!this._spans.length) this._spans = parseJsonAttr(this.getAttribute('spans'), []);
    this.render();
    if (!this._bound) {
      this._bound = true;
      this.addEventListener('click', (event) => {
        const row = event.target.closest('[data-trace-row]');
        if (!row) return;
        const span = this._spans.find((s) => s.id === row.getAttribute('data-trace-row'));
        if (span) this.dispatchEvent(new CustomEvent('span-select', { detail: { span } }));
      });
    }
  }

  attributeChangedCallback(name) {
    if (name === 'spans' && !this._spans.length) {
      this._spans = parseJsonAttr(this.getAttribute('spans'), []);
    }
    if (this._bound === false && this.innerHTML === '') return;
    this.render();
  }

  get spans() { return this._spans; }
  set spans(v) {
    this._spans = Array.isArray(v) ? v.map((s) => ({ ...s })) : [];
    this.render();
  }

  render() {
    const spans = this._spans;
    const title = escapeAttribute(this.getAttribute('title') || 'Trace waterfall');
    const total = spans.length > 0 ? Math.max(...spans.map((s) => s.startMs + s.durationMs)) : 0;

    const rows = spans.map((span) => {
      const depth = span.depth ?? 0;
      const left = total > 0 ? (span.startMs / total) * 100 : 0;
      const width = total > 0 ? Math.max((span.durationMs / total) * 100, 2) : 0;
      const cost = formatCost(span.costUsd);
      return `
      <button type="button" data-trace-row="${escapeAttribute(span.id)}" class="flex w-full items-center gap-3 rounded-md px-1 py-1 text-left transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/60">
        <span class="flex min-w-0 shrink-0 items-center gap-2 text-xs text-zinc-700 dark:text-zinc-200" style="width: ${Math.max(120 - depth * 14, 88)}px; padding-left: ${depth * 14}px;">
          <span class="h-1.5 w-1.5 shrink-0 rounded-full ${kindDot(span.kind)}"></span>
          <span data-trace-name class="min-w-0 truncate">${escapeAttribute(span.name)}</span>
        </span>
        <span class="relative h-4 min-w-0 flex-1">
          <span data-trace-bar class="absolute top-0.5 h-3 rounded-full ${kindDot(span.kind)}" style="left: ${left}%; width: ${width}%;"></span>
          <span class="absolute top-0.5 whitespace-nowrap text-[10px] tabular-nums text-zinc-500 dark:text-zinc-400" style="left: calc(${left}% + ${width}% + 6px);">${formatDuration(span.durationMs)}${cost ? ` · ${cost}` : ''}</span>
        </span>
      </button>`;
    }).join('');

    this.innerHTML = `<div data-trace-waterfall class="w-full overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
  <div class="flex items-center gap-2 border-b border-zinc-100 px-4 py-2.5 dark:border-zinc-800">
    <span class="text-xs font-semibold text-zinc-700 dark:text-zinc-200">${title}</span>
    <span class="ml-auto text-[11px] tabular-nums text-zinc-400 dark:text-zinc-500">${spans.length} spans · ${formatDuration(total)}</span>
  </div>
  <div class="px-4 py-2">
    <div class="flex items-center gap-4 pb-2 text-[10px] text-zinc-400 dark:text-zinc-500">
      <span class="flex items-center gap-1.5"><span class="h-1.5 w-1.5 rounded-full bg-indigo-500"></span> LLM</span>
      <span class="flex items-center gap-1.5"><span class="h-1.5 w-1.5 rounded-full bg-emerald-500"></span> Tool</span>
      <span class="flex items-center gap-1.5"><span class="h-1.5 w-1.5 rounded-full bg-amber-500"></span> Retrieval</span>
    </div>
    <div data-trace-rows class="space-y-1.5">${rows}</div>
  </div>
</div>`;
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('trace-span-waterfall')) {
  customElements.define('trace-span-waterfall', TraceSpanWaterfallElement);
}

export default TraceSpanWaterfallElement;
