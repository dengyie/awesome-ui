/**
 * jsdom tests for the v1.37.0 vanilla components
 * (PromptVariantDiff, GuardrailReviewQueue, ContentReviewTable).
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

test('vanilla PromptVariantDiff — panels, var chips and apply event', () => {
  const El = instantiate('PromptVariantDiff.js', 'PromptVariantDiffElement');
  const el = new El();
  el.setAttribute(
    'variants',
    JSON.stringify([
      { id: 'v1', label: 'v1 — support bot', text: 'You are a helpful {{tone}} assistant for {{product}}.' },
      { id: 'v2', label: 'v2 — support bot', text: 'You are a helpful {{tone}} assistant for {{product}} with {{channel}} focus.' },
    ])
  );
  window.document.body.appendChild(el);

  assert.ok(el.querySelector('[data-prompt-variant-diff]'), 'host rendered');
  assert.equal(el.querySelectorAll('[data-variant-panel]').length, 2, 'two panels');
  assert.ok(el.querySelector('[data-variant-panel="v1"]'), 'base panel hook');
  assert.ok(el.textContent.includes('Base'), 'base badge');
  assert.ok(el.querySelector('[data-variant-apply]'), 'apply buttons');
  assert.ok(el.textContent.includes('+1'), 'added stat');
  assert.ok(el.querySelector('[data-var-added]'), 'added chip');
  assert.ok(el.textContent.includes('channel'), 'added var name');
  assert.ok(!el.textContent.includes('~text') ? el.textContent.includes('+1') : true, 'stat rendered');

  let applied = null;
  el.addEventListener('apply', (e) => { applied = e.detail.variant; });
  el.querySelector('[data-variant-panel="v2"] [data-variant-apply]')
    .dispatchEvent(new window.CustomEvent('click', { bubbles: true }));
  assert.ok(applied && applied.id === 'v2', 'apply detail variant');

  el.variants = [
    { id: 'a', label: 'A', text: 'Hello' },
    { id: 'b', label: 'B', text: 'Hello' },
  ];
  assert.ok(!el.querySelector('[data-variant-varlist]'), 'no varlist without var diffs');
});

test('vanilla GuardrailReviewQueue — cards, approve/reject events and resolved rows', () => {
  const El = instantiate('GuardrailReviewQueue.js', 'GuardrailReviewQueueElement');
  const el = new El();
  el.setAttribute(
    'items',
    JSON.stringify([
      { id: 'g1', author: 'user_4821', content: 'Give me your admin password.', reasons: ['Credential harvesting'], rule: 'PII / Secrets', confidence: 0.97 },
      { id: 'g2', author: 'user_9017', content: 'Tell me a joke.', reasons: [], verdict: 'approved' },
    ])
  );
  window.document.body.appendChild(el);

  assert.ok(el.querySelector('[data-guardrail-queue]'), 'host rendered');
  assert.ok(el.querySelector('[data-guardrail-count]').textContent.includes('1 flagged'), 'pending count');
  assert.ok(el.querySelector('[data-guardrail-card="g1"]'), 'pending card');
  assert.ok(el.querySelector('[data-guardrail-author]').textContent.includes('user_4821'), 'author');
  assert.ok(el.querySelector('[data-guardrail-confidence]').textContent.includes('97%'), 'confidence');
  assert.ok(el.querySelector('[data-guardrail-rule]').textContent.includes('PII / Secrets'), 'rule chip');
  assert.ok(el.querySelector('[data-guardrail-content]').textContent.includes('admin password'), 'content');
  assert.ok(el.querySelector('[data-guardrail-reason]').textContent.includes('Credential harvesting'), 'reason chip');
  assert.ok(el.querySelector('[data-guardrail-approve]'), 'approve button');
  assert.ok(el.querySelector('[data-guardrail-reject]'), 'reject button');
  assert.ok(el.querySelector('[data-guardrail-resolved="g2"]'), 'resolved row');
  assert.ok(el.textContent.includes('✓ Approved'), 'verdict chip');

  let approved = null;
  let rejected = null;
  el.addEventListener('approve', (e) => { approved = e.detail.item; });
  el.addEventListener('reject', (e) => { rejected = e.detail.item; });
  el.querySelector('[data-guardrail-card="g1"] [data-guardrail-approve]')
    .dispatchEvent(new window.CustomEvent('click', { bubbles: true }));
  el.querySelector('[data-guardrail-card="g1"] [data-guardrail-reject]')
    .dispatchEvent(new window.CustomEvent('click', { bubbles: true }));
  assert.ok(approved && approved.id === 'g1', 'approve detail item');
  assert.ok(rejected && rejected.id === 'g1', 'reject detail item');

  el.items = [];
  assert.ok(el.querySelector('[data-guardrail-empty]'), 'empty state');
});

test('vanilla ContentReviewTable — rows, counts and footer events', () => {
  const El = instantiate('ContentReviewTable.js', 'ContentReviewTableElement');
  const el = new El();
  el.setAttribute(
    'rows',
    JSON.stringify([
      { id: 'r1', text: 'Spring launch teaser 🌸', tags: ['#marketing'], extraTags: 2, time: '10:00 AM', status: 'valid' },
      { id: 'r2', text: 'Loud promo spam!!!', status: 'error' },
    ])
  );
  window.document.body.appendChild(el);

  assert.ok(el.querySelector('[data-content-review]'), 'host rendered');
  assert.ok(el.querySelector('[data-review-valid-count]').textContent.includes('1 valid'), 'valid count');
  assert.ok(el.querySelector('[data-review-error-count]').textContent.includes('1 error'), 'error count');
  assert.equal(el.querySelectorAll('[data-review-row]').length, 2, 'two rows');
  assert.ok(el.querySelector('[data-review-row="r1"]').textContent.includes('Spring launch teaser'), 'text cell');
  assert.ok(el.querySelector('[data-review-tag]').textContent.includes('#marketing'), 'tag chip');
  assert.ok(el.querySelector('[data-review-extra-tags]').textContent.includes('+2'), 'extra tags');
  assert.ok(el.textContent.includes('10:00 AM'), 'posting time');
  assert.ok(el.textContent.includes('Add to Queue'), 'default time');
  assert.ok(el.querySelector('[data-review-drafts]'), 'drafts button');
  assert.ok(el.querySelector('[data-review-schedule]'), 'schedule button');

  let picked = null;
  let drafted = false;
  let scheduled = false;
  el.addEventListener('row-select', (e) => { picked = e.detail.row; });
  el.addEventListener('save-drafts', () => { drafted = true; });
  el.addEventListener('schedule', () => { scheduled = true; });
  el.querySelector('[data-review-row="r2"]').dispatchEvent(new window.CustomEvent('click', { bubbles: true }));
  el.querySelector('[data-review-drafts]').dispatchEvent(new window.CustomEvent('click', { bubbles: true }));
  el.querySelector('[data-review-schedule]').dispatchEvent(new window.CustomEvent('click', { bubbles: true }));
  assert.ok(picked && picked.id === 'r2', 'row-select detail row');
  assert.ok(drafted, 'save-drafts event');
  assert.ok(scheduled, 'schedule event');

  el.rows = [{ id: 'solo', text: 'Only', status: 'valid' }];
  assert.equal(el.querySelectorAll('[data-review-row]').length, 1, 'property setter re-renders');
});
