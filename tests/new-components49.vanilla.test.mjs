/**
 * jsdom tests for the v2.2.0 vanilla components
 * (TaskDetailPanel, DeliveryTrackingPanel, MapPropertyCard).
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { JSDOM } from 'jsdom';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');

const dom = new JSDOM('<!doctype html><html><body></body></html>', { url: 'http://localhost/' });
const { window } = dom;

const stripComponent = (file, className) =>
  readFileSync(join(root, 'vanilla', file), 'utf8')
    .replace(new RegExp(`^export default ${className};\\s*$`, 'm'), '')
    .replace(new RegExp(`^export class ${className}`, 'm'), `class ${className}`);

const instantiate = (file, className) => {
  const src = stripComponent(file, className);
  const factory = new Function(
    'customElements',
    'HTMLElement',
    'CustomEvent',
    'document',
    'MutationObserver',
    `${src}\nreturn ${className};`
  );
  return factory(window.customElements, window.HTMLElement, window.CustomEvent, window.document, window.MutationObserver);
};

test('vanilla TaskDetailPanel — fields, actions and comment submit', () => {
  const El = instantiate('TaskDetailPanel.js', 'TaskDetailPanelElement');
  const el = new El();
  el.setAttribute('title', 'Ship checkout redesign');
  el.setAttribute('status-label', 'IN REVIEW');
  el.setAttribute(
    'fields',
    JSON.stringify([
      { label: 'Assignees', value: 'A', icon: 'person' },
      { label: 'Tags', value: 'checkout', icon: 'tag', tag: true },
    ])
  );
  window.document.body.appendChild(el);

  assert.ok(el.querySelector('[data-task-panel]'), 'root rendered');
  assert.ok(el.querySelector('[data-task-title]').textContent.includes('Ship checkout redesign'), 'title');
  assert.ok(el.querySelector('[data-task-ai-bar]'), 'ai bar rendered');
  assert.ok(el.querySelector('[data-task-field="Status"]'), 'status field');
  assert.ok(el.querySelector('[data-task-status]').textContent.includes('IN REVIEW'), 'status pill');
  assert.equal(el.querySelectorAll('[data-task-field]').length, 3, 'status + two custom fields');
  assert.ok(el.querySelector('[data-task-field-value="checkout"]').textContent.includes('checkout'), 'tag value');
  assert.equal(el.querySelectorAll('[data-task-action]').length, 5, 'default actions');

  // action click fires action-click
  let acted = null;
  el.addEventListener('action-click', (e) => { acted = e.detail; });
  el.querySelector('[data-task-action="subtask"]').dispatchEvent(new window.CustomEvent('click', { bubbles: true }));
  assert.ok(acted && acted.action.id === 'subtask', 'action-click detail');

  // comment submit via send button
  let commented = null;
  el.addEventListener('comment-submit', (e) => { commented = e.detail; });
  const input = el.querySelector('[data-task-comment-input]');
  input.value = 'Looks good to me';
  el.querySelector('[data-task-comment-send]').dispatchEvent(new window.CustomEvent('click', { bubbles: true }));
  assert.ok(commented && commented.text === 'Looks good to me', 'comment-submit detail');
});

test('vanilla DeliveryTrackingPanel — stepper, courier events and details toggle', () => {
  const El = instantiate('DeliveryTrackingPanel.js', 'DeliveryTrackingPanelElement');
  const el = new El();
  el.setAttribute(
    'items',
    JSON.stringify([{ id: 'i1', name: 'Burger', quantity: '1×', price: '$9.99' }])
  );
  window.document.body.appendChild(el);

  assert.ok(el.querySelector('[data-delivery-panel]'), 'root rendered');
  assert.ok(el.querySelector('[data-delivery-map]'), 'map rendered');
  assert.ok(el.querySelector('[data-delivery-pin]'), 'courier pin');
  assert.ok(el.querySelector('[data-delivery-pin-destination]'), 'destination pin');
  assert.ok(el.querySelector('[data-delivery-back]'), 'back button');
  assert.ok(el.querySelector('[data-delivery-help]'), 'help button');
  assert.ok(el.querySelector('[data-delivery-zoom]'), 'zoom controls');
  assert.ok(el.querySelector('[data-delivery-title]').textContent.includes('Heading to Sam Lee'), 'default title');
  assert.ok(el.querySelector('[data-delivery-eta]').textContent.includes('8:35 - 8:41 AM'), 'default eta');
  assert.equal(el.querySelectorAll('[data-delivery-step]').length, 4, 'four steps');
  assert.ok(el.querySelector('[data-delivery-step-state="active"]'), 'active step');
  assert.ok(el.querySelector('[data-delivery-courier-name]').textContent.includes('JOSHUA L'), 'courier name');
  assert.ok(el.querySelector('[data-delivery-call]'), 'call button');
  assert.ok(el.querySelector('[data-delivery-message]'), 'message button');
  assert.ok(el.querySelector('[data-delivery-item="i1"]').textContent.includes('$9.99'), 'item price');
  assert.ok(el.querySelector('[data-delivery-gift]'), 'gift block');
  assert.ok(el.querySelector('[data-delivery-copy-link]'), 'copy link');
  assert.ok(el.querySelector('[data-delivery-text-link]'), 'text link');

  // courier contact events
  let called = false;
  let messaged = false;
  let copied = false;
  let texted = false;
  el.addEventListener('courier-call', () => { called = true; });
  el.addEventListener('courier-message', () => { messaged = true; });
  el.addEventListener('copy-link', () => { copied = true; });
  el.addEventListener('text-link', () => { texted = true; });
  el.querySelector('[data-delivery-call]').dispatchEvent(new window.CustomEvent('click', { bubbles: true }));
  el.querySelector('[data-delivery-message]').dispatchEvent(new window.CustomEvent('click', { bubbles: true }));
  el.querySelector('[data-delivery-copy-link]').dispatchEvent(new window.CustomEvent('click', { bubbles: true }));
  el.querySelector('[data-delivery-text-link]').dispatchEvent(new window.CustomEvent('click', { bubbles: true }));
  assert.ok(called, 'courier-call event');
  assert.ok(messaged, 'courier-message event');
  assert.ok(copied, 'copy-link event');
  assert.ok(texted, 'text-link event');

  // details toggle collapses items
  el.querySelector('[data-delivery-details-toggle]').dispatchEvent(new window.CustomEvent('click', { bubbles: true }));
  assert.equal(el.querySelectorAll('[data-delivery-item]').length, 0, 'items hidden after toggle');
  el.querySelector('[data-delivery-details-toggle]').dispatchEvent(new window.CustomEvent('click', { bubbles: true }));
  assert.equal(el.querySelectorAll('[data-delivery-item]').length, 1, 'items shown after second toggle');
});

test('vanilla MapPropertyCard — pins, preview and pin-click events', () => {
  const El = instantiate('MapPropertyCard.js', 'MapPropertyCardElement');
  const el = new El();
  el.setAttribute(
    'pins',
    JSON.stringify([
      { id: 'q1', price: '$99', x: 30, y: 40 },
      { id: 'q2', price: '$120', x: 60, y: 55 },
    ])
  );
  window.document.body.appendChild(el);

  assert.ok(el.querySelector('[data-mappin-card]'), 'root rendered');
  assert.equal(el.querySelectorAll('[data-mappin-pin]').length, 2, 'two pins');
  assert.ok(el.querySelector('[data-mappin-price="$99"]'), 'pin price');
  assert.ok(el.querySelector('[data-mappin-preview]'), 'preview card');
  assert.ok(el.querySelector('[data-mappin-title]').textContent.includes('Home in Kecamatan Denpasar'), 'default card title');
  assert.ok(el.querySelector('[data-mappin-rating]').textContent.includes('4.93 (27)'), 'rating');
  assert.ok(el.querySelector('[data-mappin-subtitle]'), 'subtitle');
  assert.ok(el.querySelector('[data-mappin-preview] [data-mappin-price]').textContent.includes('$111 for 2 nights'), 'price text');
  assert.ok(el.querySelector('[data-mappin-like]'), 'like button');
  assert.ok(el.querySelector('[data-mappin-close]'), 'close button');
  assert.ok(el.querySelector('[data-mappin-zoom]'), 'zoom controls');

  // pin click fires pin-click and activates pin
  let picked = null;
  el.addEventListener('pin-click', (e) => { picked = e.detail; });
  el.querySelector('[data-mappin-pin="q1"]').dispatchEvent(new window.CustomEvent('click', { bubbles: true }));
  assert.ok(picked && picked.pin.id === 'q1', 'pin-click detail');
  const active = el.querySelector('[data-mappin-pin="q1"]');
  assert.ok(active.className.includes('dark:bg-white'), 'active pin restyled');

  // like fires card-like
  let liked = false;
  el.addEventListener('card-like', () => { liked = true; });
  el.querySelector('[data-mappin-like]').dispatchEvent(new window.CustomEvent('click', { bubbles: true }));
  assert.ok(liked, 'card-like event');

  // close removes preview
  let closed = false;
  el.addEventListener('card-close', () => { closed = true; });
  el.querySelector('[data-mappin-close]').dispatchEvent(new window.CustomEvent('click', { bubbles: true }));
  assert.ok(closed, 'card-close event');
  assert.equal(el.querySelectorAll('[data-mappin-preview]').length, 0, 'preview removed');
});
