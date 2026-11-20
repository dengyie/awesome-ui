/**
 * v3.6.0 batch — vanilla behavior tests (jsdom)
 * BillingAddressForm, UsageCreditsDonut, SeatBillingTable.
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

const billingSource = stripComponent('BillingAddressForm.js', 'BillingAddressFormElement');
const donutSource = stripComponent('UsageCreditsDonut.js', 'UsageCreditsDonutElement');
const seatSource = stripComponent('SeatBillingTable.js', 'SeatBillingTableElement');

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

test('vanilla — BillingAddressForm validation gating and submit event', () => {
  const { el, events } = mount(billingSource, 'BillingAddressFormElement');
  const submitBtn = () => el.querySelector('[data-billing-address-submit]');
  assert.equal(submitBtn().getAttribute('disabled'), '');

  input(el, el.querySelector('[data-billing-address1]'), '77 Robinson Rd');
  input(el, el.querySelector('[data-billing-city]'), 'Singapore');
  input(el, el.querySelector('[data-billing-zip]'), '068896');
  assert.ok(!submitBtn().hasAttribute('disabled'));

  click(el, submitBtn());
  assert.equal(events.length, 1);
  assert.equal(events[0].type, 'billing-address-submit');
  assert.equal(events[0].detail.address.city, 'Singapore');
  assert.ok(el.querySelector('[data-billing-address-saved]'));
  assert.ok(el.innerHTML.includes('Saved Singapore'));
  assert.ok(!el.querySelector('[data-billing-address-hint]'));
});

test('vanilla — BillingAddressForm country select, optional hide and XSS escape', () => {
  const { el } = mount(billingSource, 'BillingAddressFormElement', { 'show-optional': 'false' });
  assert.ok(el.querySelector('[data-billing-country]'));
  assert.ok(!el.querySelector('[data-billing-address2]'));
  assert.ok(!el.querySelector('[data-billing-state]'));

  el.labels = { address1: 'Street <b>bold</b>' };
  assert.ok(!el.innerHTML.includes('<b>bold</b>'));
  assert.ok(el.innerHTML.includes('&lt;b&gt;bold&lt;/b&gt;'));

  el.countries = ['Japan', 'France'];
  const select = el.querySelector('[data-billing-country]');
  assert.equal(select.options.length, 2);
  select.value = 'France';
  select.dispatchEvent(new el.ownerDocument.defaultView.Event('change', { bubbles: true }));
  input(el, el.querySelector('[data-billing-address1]'), '1 Chiyoda');
  input(el, el.querySelector('[data-billing-city]'), 'Tokyo');
  input(el, el.querySelector('[data-billing-zip]'), '100-0001');
  click(el, el.querySelector('[data-billing-address-submit]'));
  assert.ok(el.innerHTML.includes('Saved Tokyo, France'));
});

test('vanilla — UsageCreditsDonut arcs, legend, hover and range event', () => {
  const { el, events } = mount(donutSource, 'UsageCreditsDonutElement');
  el.slices = [
    { id: 'chat', label: 'Chat completions', value: 2.4 },
    { id: 'embed', label: 'Embeddings', value: 0.8 },
    { id: 'agent', label: 'Agent runs', value: 0.34 },
  ];
  assert.ok(el.querySelector('[data-usage-donut-chart]'));
  assert.equal(el.querySelectorAll('[data-usage-donut-arc]').length, 3);
  assert.ok(el.innerHTML.includes('3.54 credits'));
  assert.ok(el.querySelector('[data-usage-donut-slice="chat"]'));
  assert.ok(el.innerHTML.includes('Chat completions'));

  // hover legend slice → center text swaps to slice label
  const slice = el.querySelector('[data-usage-donut-slice="embed"]');
  slice.dispatchEvent(new el.ownerDocument.defaultView.MouseEvent('mouseover', { bubbles: true }));
  assert.ok(el.querySelector('[data-usage-donut-center-name]').textContent.includes('Embeddings'));
  assert.equal(el.querySelector('[data-usage-donut-arc="embed"]').getAttribute('opacity'), '1');
  assert.equal(el.querySelector('[data-usage-donut-arc="chat"]').getAttribute('opacity'), '0.35');
  slice.dispatchEvent(new el.ownerDocument.defaultView.MouseEvent('mouseout', { bubbles: true }));
  assert.ok(el.querySelector('[data-usage-donut-center-name]').textContent.includes('%'));

  // range dropdown fires range-change
  const select = el.querySelector('[data-usage-donut-range]');
  select.value = 'Last 30 days';
  select.dispatchEvent(new el.ownerDocument.defaultView.Event('change', { bubbles: true }));
  const rangeEvt = events.find((e) => e.type === 'range-change');
  assert.ok(rangeEvt);
  assert.equal(rangeEvt.detail.range, 'Last 30 days');
});

test('vanilla — UsageCreditsDonut empty state and XSS escape in labels', () => {
  const { el } = mount(donutSource, 'UsageCreditsDonutElement');
  el.slices = [];
  assert.ok(el.querySelector('[data-usage-donut-empty]'));
  assert.ok(el.querySelector('circle'));

  el.slices = [{ id: 'x', label: '<img src=x onerror=alert(1)>', value: 1 }];
  assert.ok(!el.innerHTML.includes('<img src=x'));
  assert.ok(el.innerHTML.includes('&lt;img'));
});

test('vanilla — SeatBillingTable rows, search filter and total', () => {
  const { el, events } = mount(seatSource, 'SeatBillingTableElement', { period: 'Monthly · Nov 2026' });
  el.rows = [
    { id: 'u1', user: 'Ada Lovelace', email: 'ada@example.com', seat: 'Admin', cost: 30, usage: '1.2 credits', status: 'active' },
    { id: 'u2', user: 'Grace Hopper', email: 'grace@example.com', seat: 'Member', cost: 20, usage: '0.4 credits', status: 'invited' },
    { id: 'u3', user: 'Old Account', seat: 'Member', cost: 20, status: 'suspended' },
  ];
  assert.equal(el.querySelectorAll('[data-seat-row]').length, 3);
  assert.ok(el.innerHTML.includes('Invited'));
  assert.ok(el.innerHTML.includes('$30.00'));
  assert.ok(el.innerHTML.includes('Monthly · Nov 2026'));
  assert.ok(el.innerHTML.includes('2 billed seats'));
  assert.ok(el.innerHTML.includes('$50.00'));

  // search filters rows (search box keeps focus/value after re-render)
  const search = el.querySelector('[data-seat-search]');
  input(el, search, 'grace');
  assert.equal(el.querySelectorAll('[data-seat-row]').length, 1);
  assert.ok(el.innerHTML.includes('Grace Hopper'));
  const searchEvt = events.find((e) => e.type === 'seat-search');
  assert.ok(searchEvt);
  assert.equal(searchEvt.detail.query, 'grace');
  const searchAfter = el.querySelector('[data-seat-search]');
  assert.equal(searchAfter.value, 'grace');
  assert.equal(el.ownerDocument.activeElement, searchAfter);

  // no match → empty message
  input(el, el.querySelector('[data-seat-search]'), 'zzz');
  assert.ok(el.querySelector('[data-seat-empty]'));
  assert.ok(el.innerHTML.includes('No users match your search'));
});

test('vanilla — SeatBillingTable empty state and searchable=false', () => {
  const { el } = mount(seatSource, 'SeatBillingTableElement', { searchable: 'false' });
  el.rows = [];
  assert.ok(!el.querySelector('[data-seat-search]'));
  assert.ok(el.querySelector('[data-seat-empty]'));
  assert.ok(el.innerHTML.includes('No seats billed this period'));
});
