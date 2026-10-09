const escapeAttribute = (value) =>
  String(value).replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  }[char]));

const STATUS_BAR = {
  streaming: 'bg-indigo-500',
  done: 'bg-emerald-500',
  error: 'bg-rose-500',
};

export class StreamingProgressBarElement extends HTMLElement {
  static get observedAttributes() {
    return ['value', 'label', 'status'];
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback() {
    this.render();
  }

  render() {
    const rawValue = this.getAttribute('value');
    const label = this.getAttribute('label') || '';
    const status = this.getAttribute('status') || 'streaming';
    const barColor = STATUS_BAR[status] || STATUS_BAR.streaming;

    const parsed = rawValue === null ? null : Number(rawValue);
    const indeterminate = parsed === null || Number.isNaN(parsed);
    const clamped = indeterminate ? null : Math.min(100, Math.max(0, parsed));

    const labelHtml =
      label || !indeterminate
        ? `<div class="flex items-center justify-between mb-1 text-[11px] font-mono text-zinc-400">
             <span class="truncate">${escapeAttribute(label)}</span>
             ${!indeterminate ? `<span class="tabular-nums shrink-0">${Math.round(clamped)}%</span>` : ''}
           </div>`
        : '';

    const barHtml = indeterminate
      ? `<div class="h-full w-1/3 rounded-full ${barColor} animate-pulse"></div>`
      : `<div class="h-full rounded-full transition-all duration-300 ${barColor}" style="width: ${clamped}%"></div>`;

    this.className = 'block w-full';
    this.innerHTML = `
      ${labelHtml}
      <div
        role="progressbar"
        aria-valuemin="0"
        aria-valuemax="100"
        ${indeterminate ? '' : `aria-valuenow="${Math.round(clamped)}"`}
        aria-label="${escapeAttribute(label || 'Progress')}"
        class="h-1 w-full rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden"
      >${barHtml}</div>`;
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('streaming-progress-bar')) {
  customElements.define('streaming-progress-bar', StreamingProgressBarElement);
}
export default StreamingProgressBarElement;
