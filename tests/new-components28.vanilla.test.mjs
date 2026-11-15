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
    .replace(/^import uiIcon from ['"]\.\/UiIcon\.js['"];\s*$/m, '')
    .replace(new RegExp(`^export default ${className};\\s*$`, 'm'), '')
    .replace(new RegExp(`^export class ${className}`, 'm'), `class ${className}`);

const slotSource = stripComponent('TimeSlotPicker.js', 'TimeSlotPickerElement');
const trackerSource = stripComponent('OrderTracker.js', 'OrderTrackerElement');
const summarySource = stripComponent('OrderSummaryPanel.js', 'OrderSummaryPanelElement');
const paymentSource = stripComponent('PaymentMethodCard.js', 'PaymentMethodCardElement');
const orderSource = stripComponent('OrderCard.js', 'OrderCardElement');

function mount(source, exportName, tag, attrs = {}) {
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
    'FormData',
    `${source}\nreturn ${exportName};`
  );
  factory(window.customElements, window.HTMLElement, window.CustomEvent, window.document, window.FormData);
  const el = window.document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) el.setAttribute(key, value);
  window.document.body.appendChild(el);
  return { el, window, dom };
}

const collect = (el, name) => {
  const seen = [];
  el.addEventListener(name, (event) => seen.push(event.detail ?? event));
  return seen;
};

test('TimeSlotPicker — day switch, slot select, availability and select event', () => {
  const { el } = mount(slotSource, 'TimeSlotPickerElement', 'time-slot-picker');
  const selects = collect(el, 'select');
  el.days = [
    {
      id: 'tue',
      weekday: 'Tue',
      label: 'Aug 12',
      slots: [
        { id: 's1', label: '9:00 AM', period: 'morning', available: 3 },
        { id: 's2', label: '2:00 PM', period: 'afternoon', available: 0 },
      ],
    },
    { id: 'wed', weekday: 'Wed', label: 'Aug 13', slots: [{ id: 'w1', label: '6:00 PM', period: 'evening', available: 1 }] },
  ];
  el.value = { dayId: 'tue', slotId: 's1' };

  assert.ok(el.querySelector('[data-slot-day="tue"]'), 'day chip');
  assert.ok(el.textContent.includes('Morning') && el.textContent.includes('Afternoon'), 'period headings');
  assert.ok(el.textContent.includes('3 available'), 'availability');
  assert.ok(el.textContent.includes('Fully booked'), 'zero availability');
  assert.ok(el.innerHTML.includes('border-indigo-600'), 'selected tone');
  assert.ok(el.querySelector('[data-time-slot="s1"]'), 'slot button');

  // switch day
  el.querySelector('[data-slot-day="wed"]').click();
  assert.ok(el.querySelector('[data-time-slot="w1"]'), 'wed slots rendered');
  assert.ok(!el.querySelector('[data-time-slot="s1"]'), 'tue slots gone');

  // pick slot
  el.querySelector('[data-time-slot="w1"]').click();
  assert.equal(selects.length, 1, 'select fired');
  assert.equal(selects[0].dayId, 'wed', 'select dayId');
  assert.equal(selects[0].slotId, 'w1', 'select slotId');
  assert.equal(selects[0].slot.label, '6:00 PM', 'slot detail');
});

test('OrderTracker — dots, bar, cancel and track event', () => {
  const { el } = mount(trackerSource, 'OrderTrackerElement', 'order-tracker');
  const tracks = collect(el, 'track');
  const stages = [
    { id: 'placed', label: 'Placed', timestamp: 'May 12' },
    { id: 'preparing', label: 'Preparing' },
    { id: 'shipped', label: 'On the way' },
    { id: 'delivered', label: 'Delivered' },
  ];
  el.stages = stages;
  el.setAttribute('current', '2');
  el.setAttribute('eta', 'Arrives by Sat, May 24');
  el.setAttribute('tracking-number', '1Z999AA1');
  el.setAttribute('tracking-url', 'https://t.example');

  assert.ok(el.querySelector('[data-tracker-stage="placed"]'), 'stage hook');
  assert.ok(el.textContent.includes('Arrives by Sat, May 24'), 'eta');
  assert.ok(el.innerHTML.includes('bg-emerald-600'), 'green dots');
  assert.ok(el.innerHTML.includes('ring-2'), 'current ring');
  assert.ok(el.textContent.includes('May 12'), 'timestamp');
  assert.ok(el.querySelector('[data-tracker-track]'), 'track link');

  el.querySelector('[data-tracker-track]').click();
  assert.equal(tracks.length, 1, 'track fired');

  // bar variant
  el.setAttribute('variant', 'bar');
  el.setAttribute('current', '3');
  assert.ok(el.querySelector('[data-tracker-fill]'), 'bar fill');
  assert.ok(el.innerHTML.includes('width:100%'), 'full width');
  assert.ok(!el.querySelector('[data-tracker-track]'), 'no track link in bar');

  // canceled
  el.setAttribute('variant', 'dots');
  el.setAttribute('current', 'canceled');
  el.setAttribute('canceled-reason', 'Canceled on May 15');
  assert.ok(el.textContent.includes('Canceled on May 15'), 'cancel reason');
  assert.ok(!el.innerHTML.includes('bg-emerald-600'), 'no green when canceled');
});

test('OrderSummaryPanel — rows, promo apply/remove, cta event', () => {
  const { el, window } = mount(summarySource, 'OrderSummaryPanelElement', 'order-summary');
  const ctas = collect(el, 'cta');
  const applies = collect(el, 'apply-promo');
  const removals = collect(el, 'remove-promo');
  el.rows = [
    { id: 'r1', label: 'Item(s) total', value: '$23.12', kind: 'item' },
    { id: 'r2', label: 'Shop discount', value: '−$2.56', kind: 'discount' },
    { id: 'r3', label: 'Pickup', value: 'Free', kind: 'fee' },
    { id: 'r4', label: 'Order total', value: '$22.64', kind: 'total' },
  ];
  el.setAttribute('cta-label', 'Place your order');
  el.setAttribute('cta-amount', '$22.64');
  el.setAttribute('applied-promos', JSON.stringify(['WELCOME10']));
  el.setAttribute('trust-footer', 'SSL encrypted payment');

  assert.ok(el.querySelector('[data-summary-row="r1"]'), 'row hook');
  assert.ok(el.textContent.includes('−$2.56'), 'discount value');
  assert.ok(el.innerHTML.includes('text-emerald-600'), 'discount tone');
  assert.ok(el.innerHTML.includes('border-t'), 'total border');
  assert.ok(el.textContent.includes('WELCOME10 applied'), 'applied promo');
  assert.ok(el.textContent.includes('Place your order · $22.64'), 'cta text');
  assert.ok(el.textContent.includes('SSL encrypted payment'), 'trust footer');

  // apply promo via input + Enter
  const input = el.querySelector('[data-promo-input]');
  input.value = 'SUMMER5';
  input.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
  assert.equal(applies.length, 1, 'apply fired');
  assert.equal(applies[0].code, 'SUMMER5', 'promo code detail');

  // remove promo
  el.querySelector('[data-promo-remove="WELCOME10"]').click();
  assert.equal(removals.length, 1, 'remove fired');
  assert.equal(removals[0].code, 'WELCOME10', 'remove detail');

  // cta
  el.querySelector('[data-summary-cta]').click();
  assert.equal(ctas.length, 1, 'cta fired');
});

test('PaymentMethodCard — brand tile, holder, change/add events', () => {
  const { el } = mount(paymentSource, 'PaymentMethodCardElement', 'payment-method-card', {
    brand: 'visa',
    last4: '6008',
    exp: '10 / 2028',
    amount: '$6.53',
    holder: '128 Mulberry St',
  });
  const changes = collect(el, 'change');
  const adds = collect(el, 'add-new');

  assert.ok(el.querySelector('[data-payment-brand]'), 'brand tile');
  assert.ok(el.textContent.includes('VISA'), 'visa label');
  assert.ok(el.innerHTML.includes('bg-blue-700'), 'visa tone');
  assert.ok(el.textContent.includes('Ending in 6008'), 'masked number');
  assert.ok(el.textContent.includes('Exp. 10 / 2028'), 'expiry');
  assert.ok(el.textContent.includes('$6.53'), 'amount');
  assert.ok(el.textContent.includes('128 Mulberry St'), 'holder');
  assert.ok(el.querySelector('[data-payment-change]'), 'change button');
  assert.ok(el.querySelector('[data-payment-add]'), 'add button');

  el.querySelector('[data-payment-change]').click();
  assert.equal(changes.length, 1, 'change fired');

  el.querySelector('[data-payment-add]').click();
  assert.equal(adds.length, 1, 'add-new fired');

  // mastercard without add-new
  const mc = mount(paymentSource, 'PaymentMethodCardElement', 'payment-method-card', { brand: 'mastercard', last4: '2412', 'show-add-new': 'false' });
  assert.ok(mc.el.textContent.includes('MC'), 'mc label');
  assert.ok(!mc.el.querySelector('[data-payment-add]'), 'no add button');
});

test('OrderCard — header, fulfillment, items, badges, open/action events', () => {
  const { el } = mount(orderSource, 'OrderCardElement', 'order-card', {
    'order-number': '200013316005821',
    'placed-at': 'May 12',
    status: 'shipped',
    total: '$24.98',
    fulfillment: JSON.stringify({ type: 'delivery', eta: 'Sat, May 24', store: 'Supercenter #2100' }),
  });
  const opens = collect(el, 'open');
  const actions = collect(el, 'action');
  el.items = [{ id: 'i1', title: 'Equate Vitamin C', price: '$8.99', qty: 1, image: 'https://example.com/p.jpg' }];

  assert.ok(el.textContent.includes('Order# 200013316005821'), 'order number');
  assert.ok(el.textContent.includes('Placed May 12'), 'placed date');
  assert.ok(el.textContent.includes('View details'), 'open button');
  assert.ok(el.textContent.includes('Arrives'), 'fulfillment label');
  assert.ok(el.textContent.includes('by Sat, May 24'), 'eta');
  assert.ok(el.textContent.includes('Supercenter #2100'), 'store');
  assert.ok(el.textContent.includes('On its way'), 'shipped label');
  assert.ok(el.innerHTML.includes('bg-indigo-50'), 'shipped badge tone');
  assert.ok(el.querySelector('[data-order-item="i1"]'), 'item row');
  assert.ok(el.textContent.includes('Qty: 1'), 'qty');
  assert.ok(el.textContent.includes('Buy it again'), 'action link');
  assert.ok(el.textContent.includes('Total $24.98'), 'total');

  el.querySelector('[data-order-open]').click();
  assert.equal(opens.length, 1, 'open fired');

  el.querySelector('[data-order-buy-again]').click();
  assert.equal(actions.length, 1, 'action fired');
  assert.equal(actions[0].action, 'buy-again', 'action detail');

  // canceled variant
  el.setAttribute('status', 'canceled');
  el.setAttribute('fulfillment', JSON.stringify({ type: 'pickup', eta: 'May 15' }));
  el.setAttribute('status-note', 'We apologize for the inconvenience.');
  assert.ok(el.textContent.includes('Canceled on May 15'), 'canceled headline');
  assert.ok(el.textContent.includes('We apologize'), 'status note');
});
