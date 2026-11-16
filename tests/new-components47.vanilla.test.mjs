/**
 * jsdom tests for the v1.47.0 vanilla components
 * (EvalRunResults, EventTagGrid, PromptTunerResult).
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

test('vanilla EvalRunResults — sections, rows and result-click events', () => {
  const El = instantiate('EvalRunResults.js', 'EvalRunResultsElement');
  const el = new El();
  el.setAttribute(
    'sections',
    JSON.stringify([
      {
        id: 'judge',
        name: 'tone_judge',
        subtitle: 'AI-Powered / LLM as a Judge',
        results: [
          { id: 'r1', status: 'passed', reason: 'Tone is neutral.', response: 'Key Points: Q2 grew.', variables: [{ name: 'CATEGORY', value: 'Finance' }] },
          { id: 'r2', status: 'failed', reason: 'Invented forecast.', response: 'Key Points: 40% claim.' },
        ],
      },
    ])
  );
  window.document.body.appendChild(el);

  assert.ok(el.querySelector('[data-eval-run-results]'), 'root rendered');
  assert.ok(el.querySelector('[data-eval-score]').textContent.includes('64.00%'), 'default score');
  assert.ok(el.querySelector('[data-eval-counter="passed"]').textContent.includes('64'), 'counter');
  assert.ok(el.querySelector('[data-eval-filter]').textContent.includes('has any of'), 'filter chip');
  assert.equal(el.querySelectorAll('[data-eval-section]').length, 1, 'one section');
  assert.ok(el.querySelector('[data-eval-section-name]').textContent.includes('tone_judge'), 'section name');
  assert.equal(el.querySelectorAll('[data-eval-row]').length, 2, 'two rows');
  assert.ok(el.querySelector('[data-eval-row-status="failed"]').textContent.includes('Failed'), 'failed label');
  assert.ok(el.querySelector('[data-eval-var="CATEGORY"]'), 'variable chip');

  let picked = null;
  el.addEventListener('result-click', (e) => { picked = e.detail; });
  el.querySelector('[data-eval-row="r2"]').dispatchEvent(new window.CustomEvent('click', { bubbles: true }));
  assert.ok(picked && picked.result.id === 'r2', 'result-click detail');
  assert.ok(picked.section && picked.section.id === 'judge', 'result-click section');
});

test('vanilla EventTagGrid — scope switch and tag-click events', () => {
  const El = instantiate('EventTagGrid.js', 'EventTagGridElement');
  const el = new El();
  el.setAttribute(
    'groups',
    JSON.stringify([
      { id: 'left', title: 'left', tags: [{ key: 'level', value: 'error' }, { key: 'transaction', value: '/checkout', link: true }] },
      { id: 'right', title: 'right', tags: [{ key: 'handled', value: 'no' }] },
    ])
  );
  window.document.body.appendChild(el);

  assert.ok(el.querySelector('[data-tag-grid]'), 'grid rendered');
  assert.ok(el.querySelector('[data-tag-grid-title]').textContent.includes('Tags'), 'title');
  assert.equal(el.querySelectorAll('[data-tag-scope]').length, 5, 'five scopes');
  assert.ok(el.querySelector('[data-tag-scope="All"]').getAttribute('aria-pressed') === 'true', 'default scope active');
  assert.equal(el.querySelectorAll('[data-tag-group]').length, 2, 'two groups');
  assert.equal(el.querySelectorAll('[data-tag-row]').length, 3, 'three tag rows');
  assert.ok(el.querySelector('[data-tag-value="/checkout"]'), 'link value');

  let scope = null;
  let tag = null;
  el.addEventListener('scope-change', (e) => { scope = e.detail.scope; });
  el.addEventListener('tag-click', (e) => { tag = e.detail; });

  el.querySelector('[data-tag-scope="Client"]').dispatchEvent(new window.CustomEvent('click', { bubbles: true }));
  assert.equal(scope, 'Client', 'scope-change detail');
  assert.ok(el.querySelector('[data-tag-scope="Client"]').getAttribute('aria-pressed') === 'true', 'active scope updated');

  el.querySelector('[data-tag-value="error"]').dispatchEvent(new window.CustomEvent('click', { bubbles: true }));
  assert.ok(tag && tag.tag.key === 'level', 'tag-click detail');
  assert.ok(tag.group && tag.group.id === 'left', 'tag-click group');
});

test('vanilla PromptTunerResult — copy and completion-change events', () => {
  const El = instantiate('PromptTunerResult.js', 'PromptTunerResultElement');
  const el = new El();
  el.setAttribute(
    'completions',
    JSON.stringify([
      { id: 'x1', label: 'Completion #9', text: 'First variant output.' },
      { id: 'x2', label: 'Completion #10', text: 'Second variant output.' },
    ])
  );
  el.setAttribute('optimized-prompt', 'Summarize the document in exactly three sections.');
  window.document.body.appendChild(el);

  assert.ok(el.querySelector('[data-prompt-tuner]'), 'tuner rendered');
  assert.ok(el.querySelector('[data-tuner-prompt-text]').textContent.includes('Summarize the document'), 'prompt text');
  assert.ok(el.querySelector('[data-tuner-copy]').textContent.includes('Copy'), 'copy button');
  assert.equal(el.querySelectorAll('option').length, 2, 'two options');
  assert.ok(el.querySelector('[data-tuner-completion-text]').textContent.includes('First variant output.'), 'default completion shown');

  let copied = false;
  let picked = null;
  el.addEventListener('copy-prompt', () => { copied = true; });
  el.addEventListener('completion-change', (e) => { picked = e.detail.completion; });

  el.querySelector('[data-tuner-copy]').dispatchEvent(new window.CustomEvent('click', { bubbles: true }));
  assert.ok(copied, 'copy-prompt event');

  const select = el.querySelector('[data-tuner-completion-select]');
  select.value = 'x2';
  select.dispatchEvent(new window.CustomEvent('change', { bubbles: true }));
  assert.ok(picked && picked.id === 'x2', 'completion-change detail');
  assert.ok(el.querySelector('[data-tuner-completion-text]').textContent.includes('Second variant output.'), 'completion swapped');
});
