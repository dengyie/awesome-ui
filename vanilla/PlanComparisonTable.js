/**
 * PlanComparisonTable - Vanilla Web Component
 * Usage: <plan-comparison-table plans='[{"id":"free","name":"Free"}]' sections='[...]'></plan-comparison-table>
 * Attributes: plans (JSON [{id,name,highlighted?}]), sections (JSON [{id,title,rows:[{id,label,values:[{value:true|false|"note"}]}]}]), cta-text
 * Property: plans, sections
 * Events: select (detail.planId)
 */
const escapeAttribute = (value) =>
  String(value).replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  }[char]));

const CHECK_SVG = '<svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16" aria-hidden="true"><path d="M10 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16Zm-1.2-5.4 5-5-1.13-1.13L8.8 10.34 7.33 8.87 6.2 10l2.6 2.6Z"/></svg>';
const MINUS_SVG = '<svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16" aria-hidden="true"><path d="M10 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16ZM6.5 9.25h7v1.5h-7v-1.5Z"/></svg>';

export class PlanComparisonTableElement extends HTMLElement {
  static get observedAttributes() {
    return ['plans', 'sections', 'cta-text'];
  }

  constructor() {
    super();
    this._plans = [];
    this._sections = [];
    this._bound = false;
  }

  connectedCallback() {
    if (!this._plans.length) {
      const rawPlans = this.getAttribute('plans');
      if (rawPlans) { try { this._plans = JSON.parse(rawPlans); } catch { this._plans = []; } }
    }
    if (!this._sections.length) {
      const rawSections = this.getAttribute('sections');
      if (rawSections) { try { this._sections = JSON.parse(rawSections); } catch { this._sections = []; } }
    }
    this.render();
    if (!this._bound) {
      this._bound = true;
      this.addEventListener('click', (event) => {
        const cta = event.target.closest('[data-comparison-cta]');
        if (cta) {
          this.dispatchEvent(new CustomEvent('select', { detail: { planId: cta.getAttribute('data-comparison-cta') } }));
        }
      });
    }
  }

  get plans() { return this._plans; }
  set plans(v) {
    this._plans = Array.isArray(v) ? v : [];
    this.render();
  }

  get sections() { return this._sections; }
  set sections(v) {
    this._sections = Array.isArray(v) ? v : [];
    this.render();
  }

  attributeChangedCallback(name) {
    if (name === 'plans' && this.getAttribute(name)) {
      try { this._plans = JSON.parse(this.getAttribute(name)); } catch { /* keep */ }
    }
    if (name === 'sections' && this.getAttribute(name)) {
      try { this._sections = JSON.parse(this.getAttribute(name)); } catch { /* keep */ }
    }
    if (this._plans.length) this.render();
  }

  _gridStyle(count) {
    return `grid-template-columns: minmax(180px, 1.4fr) repeat(${count}, minmax(120px, 1fr));`;
  }

  _cell(value) {
    if (value === true) return `<span data-comparison-check class="text-indigo-600">${CHECK_SVG}</span>`;
    if (value === false || value === undefined) return `<span data-comparison-empty class="text-zinc-300">${MINUS_SVG}</span>`;
    return `<span data-comparison-check class="text-indigo-600">${CHECK_SVG}</span><span data-comparison-note class="text-xs text-zinc-600">${escapeAttribute(value)}</span>`;
  }

  render() {
    const plans = this._plans;
    const ctaText = escapeAttribute(this.getAttribute('cta-text') || 'Choose plan');
    const gs = this._gridStyle(plans.length);

    const headCells = plans.map((p) => `
  <div data-comparison-plan="${escapeAttribute(p.id)}" class="border-b border-zinc-200 px-4 py-3 ${p.highlighted ? 'bg-indigo-50/60' : ''}">
    <span class="text-sm font-semibold text-zinc-900">${escapeAttribute(p.name)}</span>
  </div>`).join('');

    const body = this._sections.map((section) => `
<div data-comparison-section="${escapeAttribute(section.id)}" class="bg-zinc-900 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-zinc-50">${escapeAttribute(section.title)}</div>
${section.rows.map((row) => `
<div data-comparison-row="${escapeAttribute(row.id)}" class="grid border-b border-zinc-100" style="${gs}">
  <div class="px-4 py-2.5 text-sm text-zinc-700">${escapeAttribute(row.label)}</div>
  ${plans.map((p, idx) => `
  <div class="flex items-center gap-2 px-4 py-2.5 ${p.highlighted ? 'bg-indigo-50/60' : ''}">${this._cell((row.values[idx] || {}).value)}</div>`).join('')}
</div>`).join('')}`).join('');

    const footCells = plans.map((p) => `
  <div class="px-4 py-3 ${p.highlighted ? 'bg-indigo-50/60' : ''}">
    <button type="button" data-comparison-cta="${escapeAttribute(p.id)}" class="w-full rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${p.highlighted ? 'bg-indigo-600 text-white hover:bg-indigo-500' : 'border border-zinc-300 text-zinc-700 hover:border-zinc-400'}">${ctaText}</button>
  </div>`).join('');

    this.innerHTML = `<div data-plan-comparison class="overflow-hidden rounded-xl border border-zinc-200">
<div class="grid" style="${gs}">
  <div class="border-b border-zinc-200 px-4 py-3"></div>${headCells}
</div>${body}
<div class="grid border-t border-zinc-200" style="${gs}">
  <div class="px-4 py-3"></div>${footCells}
</div>
</div>`;
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('plan-comparison-table')) {
  customElements.define('plan-comparison-table', PlanComparisonTableElement);
}

export default PlanComparisonTableElement;
