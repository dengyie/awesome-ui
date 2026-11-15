/**
 * jsdom tests for the v1.46.0 vanilla components
 * (MonitorRunList, EvalTurnBuilder, AgentSessionTimeline).
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

test('vanilla MonitorRunList — range switch and run-click events', () => {
  const El = instantiate('MonitorRunList.js', 'MonitorRunListElement');
  const el = new El();
  el.setAttribute(
    'runs',
    JSON.stringify([
      { id: 'r1', name: 'Product Performance Metrics', startedAt: 'Oct 14, 1:00 AM', latencyMs: 7000, ok: true },
      { id: 'r2', name: 'Slow draft', startedAt: 'Oct 13, 9:00 PM', latencyMs: 4287, ok: false },
    ])
  );
  window.document.body.appendChild(el);

  assert.ok(el.querySelector('[data-monitor-run-list]'), 'list rendered');
  assert.equal(el.querySelectorAll('[data-monitor-run]').length, 2, 'two run rows');
  assert.ok(el.querySelector('[data-monitor-run-latency]').textContent.includes('7 s'), 'latency formatted');
  assert.ok(el.querySelector('[data-monitor-range="24 hrs"]').getAttribute('aria-pressed') === 'true', 'default range active');

  let picked = null;
  let range = null;
  el.addEventListener('run-click', (e) => { picked = e.detail.run; });
  el.addEventListener('range-change', (e) => { range = e.detail.range; });

  el.querySelector('[data-monitor-run="r2"]').dispatchEvent(new window.CustomEvent('click', { bubbles: true }));
  assert.ok(picked && picked.id === 'r2', 'run-click detail');

  el.querySelector('[data-monitor-range="7 days"]').dispatchEvent(new window.CustomEvent('click', { bubbles: true }));
  assert.equal(range, '7 days', 'range-change detail');
  assert.ok(el.querySelector('[data-monitor-range="7 days"]').getAttribute('aria-pressed') === 'true', 'active range updated');
});

test('vanilla EvalTurnBuilder — remove turn and add-turn events', () => {
  const El = instantiate('EvalTurnBuilder.js', 'EvalTurnBuilderElement');
  const el = new El();
  el.setAttribute(
    'turns',
    JSON.stringify([
      { id: 't1', role: 'system', turn: 0, content: 'You are Riley.', mock: false },
      { id: 't2', role: 'user', turn: 1, content: 'Hi, can I reschedule?', mock: true },
    ])
  );
  window.document.body.appendChild(el);

  assert.ok(el.querySelector('[data-eval-turn-builder]'), 'builder rendered');
  assert.equal(el.querySelectorAll('[data-eval-turn]').length, 2, 'two turns');
  assert.ok(el.querySelector('[data-eval-turn-badge="system"]').textContent.includes('SYSTEM'), 'system badge');
  assert.ok(el.querySelector('[data-eval-turn-mock]'), 'mock tag shown');
  assert.ok(el.querySelector('[data-eval-turn-content]').textContent.includes('You are Riley.'), 'content text');
  assert.equal(el.querySelectorAll('[data-eval-add-turn]').length, 3, 'three add buttons');

  let removed = null;
  let added = null;
  el.addEventListener('turn-remove', (e) => { removed = e.detail.turn; });
  el.addEventListener('add-turn', (e) => { added = e.detail.role; });

  el.querySelector('[data-eval-turn="t2"] [data-eval-turn-remove]').dispatchEvent(new window.CustomEvent('click', { bubbles: true }));
  assert.ok(removed && removed.id === 't2', 'turn-remove detail');
  assert.equal(el.querySelectorAll('[data-eval-turn]').length, 1, 'turn removed from DOM');

  el.querySelector('[data-eval-add-turn="tool"]').dispatchEvent(new window.CustomEvent('click', { bubbles: true }));
  assert.equal(added, 'tool', 'add-turn detail');
});

test('vanilla AgentSessionTimeline — steps, strip and step-click', () => {
  const El = instantiate('AgentSessionTimeline.js', 'AgentSessionTimelineElement');
  const el = new El();
  el.setAttribute(
    'steps',
    JSON.stringify([
      { id: 's1', kind: 'prompt', label: 'Summarize top 5', at: '0:00' },
      { id: 's2', kind: 'tool', label: 'Fetch API', at: '0:14' },
    ])
  );
  el.setAttribute(
    'requests',
    JSON.stringify([
      { id: 'q1', url: 'techcrunch.com', method: 'HTTP probe', status: 'HTTP 200', duration: '0:03', ok: true },
      { id: 'q2', url: 'techcrunch.com/rate-limited', status: 'HTTP 429', duration: '0:50', ok: false },
    ])
  );
  window.document.body.appendChild(el);

  assert.ok(el.querySelector('[data-agent-session-timeline]'), 'timeline rendered');
  assert.ok(el.querySelector('[data-agent-session-title]').textContent.includes('techcrunch.com'), 'default title');
  assert.ok(el.querySelector('[data-agent-session-status]').textContent.includes('Complete'), 'status text');
  assert.ok(el.querySelector('[data-agent-session-duration]').textContent.includes('1m 11s'), 'duration');
  assert.equal(el.querySelectorAll('[data-agent-session-strip] span').length, 2, 'strip segments');
  assert.equal(el.querySelectorAll('[data-agent-step]').length, 2, 'two steps');
  assert.ok(el.querySelector('[data-agent-step-badge="prompt"]'), 'prompt badge');
  assert.equal(el.querySelectorAll('[data-agent-request]').length, 2, 'two requests');
  assert.ok(el.querySelector('[data-agent-request-status]').textContent.includes('HTTP 200 · HTTP probe'), 'request meta');

  let picked = null;
  el.addEventListener('step-click', (e) => { picked = e.detail.step; });
  el.querySelector('[data-agent-step="s2"]').dispatchEvent(new window.CustomEvent('click', { bubbles: true }));
  assert.ok(picked && picked.id === 's2', 'step-click detail');
});
