/**
 * v3.5.0 batch — vanilla behavior tests (jsdom)
 * AgentScheduleEditor, AgentGuardrailViolationCard, AgentModelFallbackList.
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

const scheduleSource = stripComponent('AgentScheduleEditor.js', 'AgentScheduleEditorElement');
const violationSource = stripComponent('AgentGuardrailViolationCard.js', 'AgentGuardrailViolationCardElement');
const fallbackSource = stripComponent('AgentModelFallbackList.js', 'AgentModelFallbackListElement');

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

test('vanilla — AgentScheduleEditor pill switch updates cron and fires save', () => {
  const { el, events } = mount(scheduleSource, 'AgentScheduleEditorElement');
  el.frequencies = [
    { id: 'hourly', label: 'Every hour', expression: '0 * * * *' },
    { id: 'daily', label: 'Daily', expression: '0 9 * * *' },
  ];
  assert.ok(el.querySelector('[data-schedule-frequency="hourly"]'));
  assert.ok(el.innerHTML.includes('0 * * * *'));

  el.querySelector('[data-schedule-frequency="daily"]').dispatchEvent(
    new el.ownerDocument.defaultView.MouseEvent('click', { bubbles: true })
  );
  assert.ok(el.innerHTML.includes('0 9 * * *'));
  assert.ok(!el.innerHTML.includes('0 * * * *'));

  el.querySelector('[data-schedule-save]').dispatchEvent(
    new el.ownerDocument.defaultView.MouseEvent('click', { bubbles: true })
  );
  assert.equal(events.length, 1);
  assert.equal(events[0].type, 'save');
  assert.equal(events[0].detail.frequency.id, 'daily');
  assert.equal(events[0].detail.time, '09:00');
  assert.ok(el.innerHTML.includes('Schedule saved'));
});

test('vanilla — AgentGuardrailViolationCard severity badge, match mark and block', () => {
  const { el, events } = mount(violationSource, 'AgentGuardrailViolationCardElement', {
    rule: 'PII disclosure',
    severity: 'high',
    'run-id': 'run_7c2a',
    input: 'User email is jane@example.com, send it to marketing.',
    match: 'jane@example.com',
    'policy-ref': 'policy/security#pii-1',
  });
  assert.ok(el.querySelector('[data-guardrail-violation]'));
  assert.ok(el.innerHTML.includes('High severity'));
  assert.ok(el.innerHTML.includes('run_7c2a'));
  assert.ok(el.querySelector('[data-violation-match]'));
  assert.ok(el.innerHTML.includes('policy/security#pii-1'));

  el.querySelector('[data-violation-block]').dispatchEvent(
    new el.ownerDocument.defaultView.MouseEvent('click', { bubbles: true })
  );
  assert.equal(events[0].type, 'block');
  assert.ok(el.innerHTML.includes('Run blocked by reviewer.'));
  assert.ok(!el.querySelector('[data-violation-proceed]'));
});

test('vanilla — AgentGuardrailViolationCard proceed path and empty-input robustness', () => {
  const { el, events } = mount(violationSource, 'AgentGuardrailViolationCardElement', {
    rule: 'Toxic content <script>alert(1)</script>',
    severity: 'low',
  });
  assert.ok(!el.innerHTML.includes('<script>alert(1)'));
  assert.ok(el.innerHTML.includes('Low severity'));
  assert.ok(!el.querySelector('[data-violation-input]'));

  el.querySelector('[data-violation-proceed]').dispatchEvent(
    new el.ownerDocument.defaultView.MouseEvent('click', { bubbles: true })
  );
  assert.equal(events[0].type, 'proceed');
  assert.ok(el.innerHTML.includes('Marked reviewed'));
});

test('vanilla — AgentModelFallbackList promote/demote fires reorder with ids', () => {
  const { el, events } = mount(fallbackSource, 'AgentModelFallbackListElement');
  el.entries = [
    { id: 'm1', model: 'the-model-4-5', provider: 'Anthropic', health: 'healthy', condition: 'primary', latency: '420ms' },
    { id: 'm2', model: 'gpt-5-2', provider: 'OpenAI', health: 'degraded', condition: 'on rate limit' },
    { id: 'm3', model: 'gemini-3-pro', health: 'down' },
  ];
  assert.equal(el.querySelectorAll('[data-fallback-row]').length, 3);
  assert.ok(el.innerHTML.includes('Primary'));
  assert.ok(el.innerHTML.includes('on rate limit'));

  // promote m2 (first up button belongs to row 2)
  const secondRow = el.querySelector('[data-fallback-row="m2"]');
  secondRow.querySelector('[data-fallback-up]').dispatchEvent(
    new el.ownerDocument.defaultView.MouseEvent('click', { bubbles: true })
  );
  assert.equal(events[0].type, 'reorder');
  assert.deepEqual(events[0].detail.ids, ['m2', 'm1', 'm3']);
  assert.ok(el.innerHTML.includes('order updated'));

  // first row's up button is disabled
  const firstUp = el.querySelector('[data-fallback-row="m2"] [data-fallback-up]');
  assert.equal(firstUp.getAttribute('disabled'), '');
});

test('vanilla — AgentModelFallbackList empty state', () => {
  const { el } = mount(fallbackSource, 'AgentModelFallbackListElement');
  el.entries = [];
  assert.ok(el.querySelector('[data-fallback-empty]'));
});
