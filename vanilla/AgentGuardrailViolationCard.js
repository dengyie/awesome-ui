/**
 * AgentGuardrailViolationCard - Vanilla Web Component
 * Single guardrail-violation detail card: severity badge, trigger input
 * summary with highlighted match, policy ref and Proceed/Block actions.
 *
 * Usage: <agent-guardrail-violation-card rule="PII disclosure"></agent-guardrail-violation-card>
 * Attributes: rule, severity (low|medium|high), run-id, time, input, match, policy-ref,
 *             proceed-label, block-label
 * Events: proceed, block
 */
const escapeAttribute = (value) =>
  String(value).replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  }[char]));

const SEVERITY_BADGE = {
  low: {
    badge: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400',
    label: 'Low severity',
  },
  medium: {
    badge: 'bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400',
    label: 'Medium severity',
  },
  high: {
    badge: 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400',
    label: 'High severity',
  },
};

export class AgentGuardrailViolationCardElement extends HTMLElement {
  static get observedAttributes() {
    return ['rule', 'severity', 'run-id', 'time', 'input', 'match', 'policy-ref', 'proceed-label', 'block-label'];
  }

  constructor() {
    super();
    this._resolved = null;
    this._bound = false;
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;
    this.render();
  }

  connectedCallback() {
    this.render();
    if (!this._bound) {
      this._bound = true;
      this.addEventListener('click', (event) => {
        const blockBtn = event.target.closest('[data-violation-block]');
        if (blockBtn) {
          this._resolved = 'blocked';
          this.render();
          this.dispatchEvent(new CustomEvent('block'));
          return;
        }
        const proceedBtn = event.target.closest('[data-violation-proceed]');
        if (proceedBtn) {
          this._resolved = 'proceeded';
          this.render();
          this.dispatchEvent(new CustomEvent('proceed'));
        }
      });
    }
  }

  _renderInput() {
    const input = this.getAttribute('input') || '';
    if (!input) return '';
    const match = this.getAttribute('match') || '';
    const escaped = escapeAttribute(input);
    if (match && input.includes(match)) {
      const idx = input.indexOf(match);
      const head = escapeAttribute(input.slice(0, idx));
      const mark = escapeAttribute(match);
      const tail = escapeAttribute(input.slice(idx + match.length));
      return `${head}<mark data-violation-match class="rounded bg-rose-100 px-0.5 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300">${mark}</mark>${tail}`;
    }
    return escaped;
  }

  render() {
    const rule = this.getAttribute('rule') || '';
    if (!rule && this.innerHTML === '') {
      // still render an empty shell so SSR/preview never collapses
    }
    const severity = ['low', 'medium', 'high'].includes(this.getAttribute('severity'))
      ? this.getAttribute('severity')
      : 'medium';
    const sev = SEVERITY_BADGE[severity];
    const runId = this.getAttribute('run-id') || '';
    const time = this.getAttribute('time') || '';
    const policyRef = this.getAttribute('policy-ref') || '';
    const proceedLabel = this.getAttribute('proceed-label') || 'Proceed anyway';
    const blockLabel = this.getAttribute('block-label') || 'Block run';
    const inputBlock = this.getAttribute('input')
      ? `<div data-violation-input class="mt-2.5 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs leading-relaxed text-zinc-600 dark:border-zinc-700 dark:bg-zinc-800/60 dark:text-zinc-300">${this._renderInput()}</div>`
      : '';
    const resolvedText = this._resolved === 'blocked'
      ? 'Run blocked by reviewer.'
      : this._resolved === 'proceeded'
        ? 'Marked reviewed — proceeding anyway.'
        : '';
    this.innerHTML = `
      <div data-guardrail-violation role="alert" class="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <div class="flex flex-wrap items-center gap-2">
          <span data-violation-rule class="text-sm font-semibold text-zinc-900 dark:text-zinc-50">${escapeAttribute(rule)}</span>
          <span data-violation-severity class="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${sev.badge}">${sev.label}</span>
          ${time ? `<span data-violation-time class="ml-auto text-[11px] text-zinc-400 dark:text-zinc-500">${escapeAttribute(time)}</span>` : ''}
        </div>
        ${runId ? `<p class="mt-1.5"><code data-violation-run class="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-[11px] text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">${escapeAttribute(runId)}</code></p>` : ''}
        ${inputBlock}
        ${policyRef ? `<p data-violation-policy class="mt-2 text-[11px] text-zinc-400 dark:text-zinc-500">Policy: <code class="font-mono text-zinc-500 dark:text-zinc-400">${escapeAttribute(policyRef)}</code></p>` : ''}
        ${this._resolved
          ? `<p data-violation-resolved class="mt-3 text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">${resolvedText}</p>`
          : `<div class="mt-3 flex items-center justify-end gap-2">
              <button type="button" data-violation-block class="rounded-md bg-rose-600 px-3 py-1.5 text-[11px] font-semibold text-white transition-colors hover:bg-rose-500">${escapeAttribute(blockLabel)}</button>
              <button type="button" data-violation-proceed class="rounded-md border border-zinc-200 px-3 py-1.5 text-[11px] font-semibold text-zinc-600 transition-colors hover:border-zinc-300 hover:text-zinc-800 dark:border-zinc-700 dark:text-zinc-300 dark:hover:text-zinc-100">${escapeAttribute(proceedLabel)}</button>
            </div>`}
      </div>`;
  }
}

export default AgentGuardrailViolationCardElement;

if (!customElements.get('agent-guardrail-violation-card')) {
  customElements.define('agent-guardrail-violation-card', AgentGuardrailViolationCardElement);
}
