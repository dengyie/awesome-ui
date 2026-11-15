/**
 * jsdom tests for the v1.36.0 vanilla components
 * (TraceSpanWaterfall, EvalScoreTable, TokenCostBreakdown).
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

test('vanilla TraceSpanWaterfall — renders bars and fires span-select', () => {
  const El = instantiate('TraceSpanWaterfall.js', 'TraceSpanWaterfallElement');
  const el = new El();
  el.setAttribute(
    'spans',
    JSON.stringify([
      { id: 's1', name: 'planner', startMs: 0, durationMs: 1200, depth: 0, kind: 'llm', costUsd: 0.002 },
      { id: 's2', name: 'web_search', startMs: 1200, durationMs: 300, depth: 1, kind: 'tool' },
    ])
  );
  window.document.body.appendChild(el);

  assert.ok(el.querySelector('[data-trace-waterfall]'), 'host rendered');
  assert.equal(el.querySelectorAll('[data-trace-row]').length, 2, 'two rows');
  assert.ok(el.querySelector('[data-trace-row="s1"]').textContent.includes('planner'), 'name rendered');
  assert.ok(el.querySelector('[data-trace-bar]'), 'bar rendered');
  assert.ok(el.textContent.includes('1.2s'), 'duration formatted');
  assert.ok(el.textContent.includes('$0.002'), 'cost shown');
  assert.ok(el.textContent.includes('2 spans'), 'count');

  let picked = null;
  el.addEventListener('span-select', (e) => { picked = e.detail.span; });
  el.querySelector('[data-trace-row="s2"]').dispatchEvent(new window.CustomEvent('click', { bubbles: true }));
  assert.ok(picked && picked.id === 's2', 'span-select detail span');

  el.spans = [{ id: 's9', name: 'only', startMs: 0, durationMs: 100 }];
  assert.equal(el.querySelectorAll('[data-trace-row]').length, 1, 'property setter re-renders');
});

test('vanilla EvalScoreTable — runs table, criteria, add-criteria and run-select', () => {
  const El = instantiate('EvalScoreTable.js', 'EvalScoreTableElement');
  const el = new El();
  el.setAttribute(
    'runs',
    JSON.stringify([
      { id: 'r1', name: 'Trip Planning.csv', score: 100, grader: 'String check grader' },
      { id: 'r2', name: 'Summary set', score: 42, grader: 'LLM grader', tone: 'warn' },
    ])
  );
  el.setAttribute(
    'criteria',
    JSON.stringify([{ id: 'c1', title: 'String check grader', description: 'Check matches.' }])
  );
  el.setAttribute('add-criteria', 'true');
  window.document.body.appendChild(el);

  assert.ok(el.querySelector('[data-eval-score-table]'), 'host rendered');
  assert.equal(el.querySelectorAll('[data-eval-run]').length, 2, 'run rows');
  assert.ok(el.querySelector('[data-eval-run="r1"]').textContent.includes('100%'), 'score');
  assert.ok(el.querySelector('[data-eval-score-bar]'), 'score bar');
  assert.ok(el.querySelector('[data-eval-criterion="c1"]'), 'criteria card');
  assert.ok(el.querySelector('[data-eval-add-criteria]'), 'add button');

  let picked = null;
  el.addEventListener('run-select', (e) => { picked = e.detail.run; });
  el.querySelector('[data-eval-run="r2"]').dispatchEvent(new window.CustomEvent('click', { bubbles: true }));
  assert.ok(picked && picked.id === 'r2', 'run-select detail run');

  let added = false;
  el.addEventListener('add-criteria', () => { added = true; });
  el.querySelector('[data-eval-add-criteria]').dispatchEvent(new window.CustomEvent('click', { bubbles: true }));
  assert.ok(added, 'add-criteria event');

  el.runs = [{ id: 'r9', name: 'Only', score: 55 }];
  assert.equal(el.querySelectorAll('[data-eval-run]').length, 1, 'property setter re-renders');
});

test('vanilla TokenCostBreakdown — stacked bar, legend, usage and segment-select', () => {
  const El = instantiate('TokenCostBreakdown.js', 'TokenCostBreakdownElement');
  const el = new El();
  el.setAttribute(
    'segments',
    JSON.stringify([
      { id: 'agent', label: 'Custom Agent', amountUsd: 32.05 },
      { id: 'opt', label: 'SuperOptimizer', amountUsd: 1.94 },
    ])
  );
  el.setAttribute(
    'usage-rows',
    JSON.stringify([{ id: 'in', label: 'Input Tokens', tokens: 37654, percent: 13 }])
  );
  el.setAttribute('spend-used', '34.49');
  el.setAttribute('spend-total', '55');
  window.document.body.appendChild(el);

  assert.ok(el.querySelector('[data-token-cost]'), 'host rendered');
  assert.equal(el.querySelectorAll('[data-token-cost-segment]').length, 2, 'segments');
  assert.ok(el.querySelector('[data-token-cost-segment="agent"]'), 'segment hook');
  assert.ok(el.querySelector('[data-token-cost-legend]').textContent.includes('Custom Agent'), 'legend label');
  assert.ok(el.textContent.includes('$34.49 of $55.00'), 'spend header');
  assert.ok(el.querySelector('[data-token-usage-row="in"]'), 'usage row');
  assert.ok(el.textContent.includes('37,654 (13%)'), 'token formatted');

  let picked = null;
  el.addEventListener('segment-select', (e) => { picked = e.detail.segment; });
  el.querySelector('[data-token-cost-segment="opt"]').dispatchEvent(new window.CustomEvent('click', { bubbles: true }));
  assert.ok(picked && picked.id === 'opt', 'segment-select detail segment');

  el.segments = [{ id: 'solo', label: 'Solo', amountUsd: 2 }];
  assert.equal(el.querySelectorAll('[data-token-cost-segment]').length, 1, 'property setter re-renders');
});
