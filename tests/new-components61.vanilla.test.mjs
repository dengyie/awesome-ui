/**
 * v3.7.0 batch — vanilla behavior tests (jsdom)
 * CreditBalanceCard, SpendTrendChart, TopUpBalanceDialog.
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

const balanceSource = stripComponent('CreditBalanceCard.js', 'CreditBalanceCardElement');
const trendSource = stripComponent('SpendTrendChart.js', 'SpendTrendChartElement');
const topupSource = stripComponent('TopUpBalanceDialog.js', 'TopUpBalanceDialogElement');

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
  const events = [];
  el.dispatchEvent = ((orig) => (evt) => { events.push(evt); return orig.call(el, evt); })(el.dispatchEvent.bind(el));
  return { el, events, window };
}

const click = (el, node) =>
  node.dispatchEvent(new el.ownerDocument.defaultView.MouseEvent('click', { bubbles: true }));
const input = (el, node, value) => {
  node.value = value;
  node.dispatchEvent(new el.ownerDocument.defaultView.Event('input', { bubbles: true }));
};

test('vanilla — CreditBalanceCard render, actions and events', () => {
  const { el, events } = mount(balanceSource, 'CreditBalanceCardElement', { balance: '6.68', currency: '$' });
  assert.ok(el.querySelector('[data-credit-balance-card]'));
  assert.equal(el.querySelector('[data-credit-balance-value]').textContent.trim(), '$6.68');
  assert.ok(el.querySelector('[data-credit-balance-plan]').textContent.includes('Current plan'));
  assert.ok(el.querySelector('[data-credit-balance-buy]'));
  assert.ok(el.querySelector('[data-credit-balance-coupon]'));
  assert.ok(!el.querySelector('[data-credit-balance-warning]'));

  click(el, el.querySelector('[data-credit-balance-buy]'));
  const buyEvt = events.find((e) => e.type === 'credit-buy');
  assert.ok(buyEvt);

  click(el, el.querySelector('[data-credit-balance-coupon]'));
  const couponEvt = events.find((e) => e.type === 'credit-coupon');
  assert.ok(couponEvt);
});

test('vanilla — CreditBalanceCard low-balance warning and XSS escape', () => {
  const { el } = mount(balanceSource, 'CreditBalanceCardElement', { balance: '2.1', 'warn-below': '5' });
  assert.ok(el.querySelector('[data-credit-balance-warning]'));
  assert.ok(el.innerHTML.includes('running low'));

  el.setAttribute('plan', 'Pro <b>max</b>');
  assert.ok(!el.innerHTML.includes('<b>max</b>'));
  assert.ok(el.innerHTML.includes('&lt;b&gt;max&lt;/b&gt;'));
});

test('vanilla — SpendTrendChart bars, total and granularity event', () => {
  const { el, events } = mount(trendSource, 'SpendTrendChartElement', { unit: '$' });
  el.points = {
    Daily: [
      { label: '2026-03-01', value: 4.2 },
      { label: '2026-03-02', value: 7.5 },
      { label: '2026-03-03', value: 0 },
    ],
    Weekly: [{ label: '2026-W09', value: 11.7 }],
  };
  assert.ok(el.querySelector('[data-spend-trend-svg]'));
  assert.equal(el.querySelectorAll('[data-spend-trend-bar]').length, 3);
  assert.ok(el.querySelector('[data-spend-trend-total]').textContent.includes('$11.70'));
  assert.ok(el.querySelector('[data-spend-trend-granularity-option="Daily"]').getAttribute('aria-selected') === 'true');

  // switch to Weekly → bars re-render, total stays, event fires
  click(el, el.querySelector('[data-spend-trend-granularity-option="Weekly"]'));
  const evt = events.find((e) => e.type === 'granularity-change');
  assert.ok(evt);
  assert.equal(evt.detail.granularity, 'Weekly');
  assert.equal(el.querySelectorAll('[data-spend-trend-bar]').length, 1);
  assert.ok(el.querySelector('[data-spend-trend-granularity-option="Weekly"]').getAttribute('aria-selected') === 'true');
  assert.ok(el.querySelector('[data-spend-trend-total]').textContent.includes('Weekly'));
});

test('vanilla — SpendTrendChart empty state', () => {
  const { el } = mount(trendSource, 'SpendTrendChartElement');
  el.points = {};
  assert.ok(el.innerHTML.includes('No spend recorded'));
  assert.equal(el.querySelectorAll('[data-spend-trend-bar]').length, 0);
});

test('vanilla — TopUpBalanceDialog open, quick chips, summary and confirm', () => {
  const { el, events } = mount(topupSource, 'TopUpBalanceDialogElement', { balance: '6.68' });
  assert.ok(!el.querySelector('[data-topup-overlay]'));

  click(el, el.querySelector('[data-topup-open]'));
  assert.ok(el.querySelector('[data-topup-overlay]'));
  assert.ok(el.querySelector('[data-topup-billto]'));
  assert.ok(el.querySelector('[data-topup-currency]'));
  assert.ok(el.querySelector('[data-topup-amount]'));

  // invalid amount → validation error, no confirm event
  input(el, el.querySelector('[data-topup-amount]'), '5');
  click(el, el.querySelector('[data-topup-confirm]'));
  assert.ok(el.querySelector('[data-topup-error]'));
  assert.ok(!events.some((e) => e.type === 'topup-confirm'));

  // quick chip fills amount and summary updates live
  click(el, el.querySelector('[data-topup-quick-amount="100"]'));
  assert.equal(el.querySelector('[data-topup-amount]').value, '100');
  assert.ok(el.querySelector('[data-topup-summary-value]').textContent.includes('$106.68'));

  click(el, el.querySelector('[data-topup-confirm]'));
  const evt = events.find((e) => e.type === 'topup-confirm');
  assert.ok(evt);
  assert.equal(evt.detail.amount, 100);
  assert.equal(evt.detail.currency, 'USD');
  assert.ok(el.querySelector('[data-topup-confirmed]'));
  assert.ok(el.innerHTML.includes('billed to'));

  click(el, el.querySelector('[data-topup-done]'));
  assert.ok(!el.querySelector('[data-topup-overlay]'));
});

test('vanilla — TopUpBalanceDialog cancel closes and fires event', () => {
  const { el, events } = mount(topupSource, 'TopUpBalanceDialogElement', { balance: '6.68' });
  click(el, el.querySelector('[data-topup-open]'));
  click(el, el.querySelector('[data-topup-cancel]'));
  const evt = events.find((e) => e.type === 'topup-cancel');
  assert.ok(evt);
  assert.ok(!el.querySelector('[data-topup-overlay]'));
});
