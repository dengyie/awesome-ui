/**
 * v3.1.0 batch — vanilla behavior tests (jsdom)
 * InvoiceHistoryTable, UsagePricingBreakdown, CancelRetentionFlow,
 * WebhookConfigPanel.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');

const stripComponent = (file, className) =>
  readFileSync(join(root, 'vanilla', file), 'utf8')
    .replace(new RegExp(`^export default ${className};\\s*$`, 'm'), '')
    .replace(new RegExp(`^export class ${className}`, 'm'), `class ${className}`);

const invoiceSource = stripComponent('InvoiceHistoryTable.js', 'InvoiceHistoryTableElement');
const pricingSource = stripComponent('UsagePricingBreakdown.js', 'UsagePricingBreakdownElement');
const cancelSource = stripComponent('CancelRetentionFlow.js', 'CancelRetentionFlowElement');
const webhookSource = stripComponent('WebhookConfigPanel.js', 'WebhookConfigPanelElement');

function mount(source, exportName, attrs = {}) {
  const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
    url: 'https://localhost/',
    pretendToBeVisual: true,
  });
  const { window } = dom;
  const factory = new Function(
    'customElements',
    'HTMLElement',
    'CustomEvent',
    'document',
    `${source}\nreturn ${exportName};`,
  );
  const Klass = factory(window.customElements, window.HTMLElement, window.CustomEvent, window.document);
  const el = new Klass();
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  window.document.body.appendChild(el);
  return { el, window };
}

test('InvoiceHistoryTable — rows, status badges, paid total and download event', () => {
  const { el } = mount(invoiceSource, 'InvoiceHistoryTableElement', {
    invoices: JSON.stringify([
      { id: 'INV-1', period: 'November 2026', amount: '100.00', status: 'paid', date: 'Nov 1, 2026' },
      { id: 'INV-2', period: 'October 2026', amount: '50.00', status: 'pending', date: 'Oct 1, 2026' },
      { id: 'INV-3', period: 'September 2026', amount: '25.00', status: 'paid', date: 'Sep 1, 2026' },
    ]),
    currency: 'EUR',
  });
  assert.equal(el.querySelectorAll('[data-invoice-row]').length, 3);
  assert.equal(el.querySelector('[data-invoice-currency]').textContent, 'EUR');
  assert.equal(el.querySelector('[data-invoice-total-value]').textContent, 'EUR 125.00');

  const events = [];
  el.addEventListener('invoice-download', (e) => events.push(e.detail.invoice.id));
  el.querySelector('[data-invoice-download="INV-2"]').click();
  assert.deepEqual(events, ['INV-2']);
});

test('UsagePricingBreakdown — tier subtotals, current-tier highlight and total', () => {
  const { el } = mount(pricingSource, 'UsagePricingBreakdownElement', {
    tiers: JSON.stringify([
      { range: 'Tier A', usage: 1000, unitPrice: 0.01, unit: 'calls' },
      { range: 'Tier B', usage: 0, unitPrice: 0.005, unit: 'calls' },
    ]),
  });
  // Row 1 highlighted with subtotal 10.00; total equals sum of subtotals
  const firstRow = el.querySelector('[data-pricing-tier="0"]');
  assert.ok(firstRow.className.includes('bg-violet'));
  assert.equal(el.querySelector('[data-pricing-tier="0"] [data-pricing-subtotal]').textContent, 'USD 10.00');
  assert.equal(el.querySelector('[data-pricing-total-value]').textContent, 'USD 10.00');
  // Zero-usage row keeps neutral styling
  const secondRow = el.querySelector('[data-pricing-tier="1"]');
  assert.ok(!secondRow.className.includes('bg-violet'));
  assert.equal(secondRow.querySelector('[data-pricing-subtotal]').textContent, 'USD 0.00');
});

test('CancelRetentionFlow — reason gating, step transition, keep/cancel events', () => {
  const { el, window } = mount(cancelSource, 'CancelRetentionFlowElement');
  const events = [];
  el.addEventListener('keep', () => events.push('keep'));
  el.addEventListener('confirm-cancel', (e) => events.push(['cancel', e.detail.reason]));
  el.addEventListener('step-change', (e) => events.push(['step', e.detail.step]));

  // Continue disabled until a reason is picked
  const next = el.querySelector('[data-cancel-next]');
  assert.ok(next.disabled);
  const radio = el.querySelector('input[data-cancel-reason="price"]');
  radio.checked = true;
  radio.dispatchEvent(new window.Event('change', { bubbles: true }));
  assert.ok(!el.querySelector('[data-cancel-next]').disabled);

  el.querySelector('[data-cancel-next]').click();
  assert.deepEqual(events, [['step', 2]]);
  assert.ok(el.querySelector('[data-cancel-offer]'), 'offer card visible on step 2');

  el.querySelector('[data-cancel-keep]').click();
  el.querySelector('[data-cancel-confirm]').click();
  assert.ok(events.some((ev) => ev === 'keep'));
  assert.ok(events.some((ev) => Array.isArray(ev) && ev[0] === 'cancel' && ev[1] === 'price'));
});

test('WebhookConfigPanel — endpoint rows, toggle and test events, legend', () => {
  const { el, window } = mount(webhookSource, 'WebhookConfigPanelElement', {
    endpoints: JSON.stringify([
      { id: 'w1', url: 'https://a.example.com/hook', events: ['build.finished'], lastStatus: 200, lastDelivery: 'just now', active: true },
      { id: 'w2', url: 'https://b.example.com/hook', events: ['alert.triggered'], lastStatus: 503, lastDelivery: '1h ago', active: false },
    ]),
    events: JSON.stringify(['build.finished', 'alert.triggered', 'deploy.failed']),
  });
  assert.equal(el.querySelectorAll('[data-webhook-endpoint]').length, 2);
  assert.equal(el.querySelectorAll('[data-webhook-events-legend] > span').length, 3);
  // 503 renders warn styling, inactive row dimmed
  assert.ok(el.querySelector('[data-webhook-delivery="w2"]').innerHTML.includes('503'));
  assert.ok(el.querySelector('[data-webhook-endpoint="w2"]').className.includes('opacity-50'));

  const events = [];
  el.addEventListener('webhook-test', (e) => events.push(['test', e.detail.endpoint.id]));
  el.addEventListener('webhook-toggle', (e) => events.push(['toggle', e.detail.endpoint.id, e.detail.active]));
  el.querySelector('[data-webhook-test="w1"]').click();
  const toggle = el.querySelector('input[data-webhook-toggle="w2"]');
  toggle.checked = true;
  toggle.dispatchEvent(new window.Event('change', { bubbles: true }));
  assert.deepEqual(events, [['test', 'w1'], ['toggle', 'w2', true]]);
});
