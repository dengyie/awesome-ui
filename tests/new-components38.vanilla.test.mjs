/**
 * jsdom tests for the v1.38.0 vanilla components
 * (QaTestTable, AppealRestrictionDialog, ModelPricingCard).
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

test('vanilla QaTestTable — rows, ratings, checkbox toggle events', () => {
  const El = instantiate('QaTestTable.js', 'QaTestTableElement');
  const el = new El();
  el.setAttribute(
    'rows',
    JSON.stringify([
      { id: 'q1', question: 'Does SLMobbin have a community?', rating: 'good' },
      { id: 'q2', question: 'What if I run into an issue?', rating: 'acceptable' },
      { id: 'q3', question: 'Is SLMobbin free?', rating: 'poor' },
      { id: 'q4', question: 'How do I start?', answered: false },
    ])
  );
  window.document.body.appendChild(el);

  assert.ok(el.querySelector('[data-qa-test-table]'), 'host rendered');
  assert.equal(el.querySelectorAll('[data-qa-row]').length, 4, 'four rows');
  assert.ok(el.querySelector('[data-qa-row="q1"]').textContent.includes('community?'), 'question text');
  assert.ok(el.querySelector('[data-qa-rating="good"]'), 'good chip');
  assert.ok(el.querySelector('[data-qa-rating="acceptable"]').textContent.includes('Acceptable'), 'acceptable label');
  assert.ok(el.querySelector('[data-qa-rating="poor"]'), 'poor chip');
  assert.ok(el.textContent.includes('4 questions'), 'count');
  assert.ok(el.textContent.includes('3 answered'), 'answered count');

  let checkedRow = null;
  let checkedState = null;
  let selectedRow = null;
  el.addEventListener('row-check', (e) => { checkedRow = e.detail.row; checkedState = e.detail.checked; });
  el.addEventListener('row-select', (e) => { selectedRow = e.detail.row; });

  el.querySelector('[data-qa-row="q1"] [data-qa-check]')
    .dispatchEvent(new window.CustomEvent('click', { bubbles: true }));
  assert.ok(checkedRow && checkedRow.id === 'q1', 'row-check detail row');
  assert.equal(checkedState, true, 'checked true after toggle');
  assert.ok(el.querySelector('[data-qa-row="q1"] [data-qa-check]').getAttribute('checked') !== null, 'checkbox re-rendered checked');

  el.querySelector('[data-qa-row="q2"]').dispatchEvent(new window.CustomEvent('click', { bubbles: true }));
  assert.ok(selectedRow && selectedRow.id === 'q2', 'row-select detail row');

  el.rows = [{ id: 'solo', question: 'Only one', rating: 'good' }];
  assert.equal(el.querySelectorAll('[data-qa-row]').length, 1, 'property setter re-renders');
});

test('vanilla AppealRestrictionDialog — reason card and appeal/close/back events', () => {
  const El = instantiate('AppealRestrictionDialog.js', 'AppealRestrictionDialogElement');
  const el = new El();
  el.setAttribute('reason-title', 'Unsafe Conduct');
  el.setAttribute('reason-detail', 'Dangerous stunts by non-professionals.');
  window.document.body.appendChild(el);

  assert.ok(el.querySelector('[data-appeal-dialog]'), 'host rendered');
  assert.ok(el.querySelector('[data-appeal-title]').textContent.includes('Request another review'), 'title');
  assert.ok(el.textContent.includes('180 days to appeal'), 'appeal window');
  assert.ok(el.querySelector('[data-appeal-reason-title]').textContent.includes('Unsafe Conduct'), 'reason title');
  assert.ok(el.querySelector('[data-appeal-reason-detail]').textContent.includes('Dangerous stunts'), 'reason detail');
  assert.ok(el.querySelector('[data-appeal-submit]'), 'appeal button');
  assert.ok(el.querySelector('[data-appeal-back]'), 'back button');
  assert.ok(el.querySelector('[data-appeal-close]'), 'close button');

  let appealed = false, closed = false, backed = false;
  el.addEventListener('appeal', () => { appealed = true; });
  el.addEventListener('close', () => { closed = true; });
  el.addEventListener('back', () => { backed = true; });
  el.querySelector('[data-appeal-submit]').dispatchEvent(new window.CustomEvent('click', { bubbles: true }));
  el.querySelector('[data-appeal-close]').dispatchEvent(new window.CustomEvent('click', { bubbles: true }));
  el.querySelector('[data-appeal-back]').dispatchEvent(new window.CustomEvent('click', { bubbles: true }));
  assert.ok(appealed, 'appeal event');
  assert.ok(closed, 'close event');
  assert.ok(backed, 'back event');

  el.setAttribute('open', 'false');
  assert.equal(el.innerHTML, '', 'open=false clears content');
});

test('vanilla ModelPricingCard — pricing rows and copy-id event', () => {
  const El = instantiate('ModelPricingCard.js', 'ModelPricingCardElement');
  const el = new El();
  el.setAttribute('model-name', 'Glm 4.7 Flash');
  el.setAttribute('model-id', 'workers-ai/@cf/zai-org/glm-4.7-flash');
  el.setAttribute('input-per-million', '0.06');
  el.setAttribute('output-per-million', '0.40');
  window.document.body.appendChild(el);

  assert.ok(el.querySelector('[data-model-pricing-card]'), 'host rendered');
  assert.ok(el.querySelector('[data-model-pricing-name]').textContent.includes('Glm 4.7 Flash'), 'model name');
  assert.ok(el.querySelector('[data-model-pricing-id]').textContent.includes('glm-4.7-flash'), 'model id');
  assert.ok(el.querySelector('[data-model-pricing-copy]'), 'copy button');
  assert.ok(el.querySelector('[data-model-pricing-input]').textContent.includes('$ 0.06 / million tokens'), 'input price');
  assert.ok(el.querySelector('[data-model-pricing-output]').textContent.includes('$ 0.40 / million tokens'), 'output price');

  let copiedId = null;
  el.addEventListener('copy-id', (e) => { copiedId = e.detail.modelId; });
  el.querySelector('[data-model-pricing-copy]').dispatchEvent(new window.CustomEvent('click', { bubbles: true }));
  assert.equal(copiedId, 'workers-ai/@cf/zai-org/glm-4.7-flash', 'copy-id detail modelId');

  el.setAttribute('input-per-million', '1.5');
  assert.ok(el.querySelector('[data-model-pricing-input]').textContent.includes('$ 1.50'), 'attribute change re-renders');
});
