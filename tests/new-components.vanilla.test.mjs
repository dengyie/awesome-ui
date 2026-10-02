import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');

const uiIconSource = readFileSync(join(root, 'vanilla/UiIcon.js'), 'utf8')
  .replace(/^export default uiIcon;\s*$/m, '')
  .replace(/^export function uiIcon/m, 'function uiIcon');

const ctxSource = readFileSync(join(root, 'vanilla/ContextUsageBadge.js'), 'utf8')
  .replace(/^import uiIcon from ['"].\/UiIcon.js['"];\s*$/m, '')
  .replace(/^const escapeAttribute = [\s\S]*?;\n/m, '')
  .replace(/^export default ContextUsageBadgeElement;\s*$/m, '')
  .replace(/^export class ContextUsageBadgeElement/m, 'class ContextUsageBadgeElement');

const modelSource = readFileSync(join(root, 'vanilla/ModelSelector.js'), 'utf8')
  .replace(/^import uiIcon from ['"].\/UiIcon.js['"];\s*$/m, '')
  .replace(/^const escapeAttribute = [\s\S]*?;\n/m, '')
  .replace(/^export default ModelSelectorElement;\s*$/m, '')
  .replace(/^export class ModelSelectorElement/m, 'class ModelSelectorElement');

function mountContextUsage(attrs = {}, breakdown = []) {
  const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
    url: 'https://localhost/',
    pretendToBeVisual: true,
  });
  const { window } = dom;
  const factory = new Function(
    'customElements',
    'HTMLElement',
    'CustomEvent',
    'Event',
    'setTimeout',
    `${uiIconSource}\n${ctxSource}\nreturn ContextUsageBadgeElement;`
  );
  factory(
    window.customElements,
    window.HTMLElement,
    window.CustomEvent,
    window.Event,
    window.setTimeout.bind(window)
  );

  const el = window.document.createElement('context-usage-badge');
  for (const [k, v] of Object.entries(attrs)) {
    if (v !== null && v !== undefined) el.setAttribute(k, String(v));
  }
  if (breakdown.length) el.breakdown = breakdown;
  window.document.body.appendChild(el);
  return { dom, window, el };
}

function mountModelSelector(attrs = {}, models = []) {
  const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
    url: 'https://localhost/',
    pretendToBeVisual: true,
  });
  const { window } = dom;
  const factory = new Function(
    'customElements',
    'HTMLElement',
    'CustomEvent',
    'Event',
    'document',
    `${uiIconSource}\n${modelSource}\nreturn ModelSelectorElement;`
  );
  factory(
    window.customElements,
    window.HTMLElement,
    window.CustomEvent,
    window.Event,
    window.document
  );

  const el = window.document.createElement('model-selector');
  for (const [k, v] of Object.entries(attrs)) {
    if (v !== null && v !== undefined) el.setAttribute(k, String(v));
  }
  if (models.length) el.models = models;
  window.document.body.appendChild(el);
  return { dom, window, el };
}

test('ContextUsageBadge — renders percentage, progress bar and breakdown', () => {
  const { el } = mountContextUsage(
    { 'used-tokens': '8000', 'max-tokens': '10000', 'model-name': 'deepseek-r1' },
    [
      { label: 'Prompt', count: 6000, colorClass: 'bg-blue-500' },
      { label: 'Output', count: 2000, colorClass: 'bg-emerald-500' },
    ]
  );

  assert.ok(el.innerHTML.includes('80%'), 'should render 80% usage');
  assert.ok(el.innerHTML.includes('deepseek-r1'), 'should show model name');
  assert.ok(el.innerHTML.includes('Prompt'), 'should render breakdown label');
  assert.ok(el.innerHTML.includes('6.0k'), 'should format token numbers nicely');
});

test('ModelSelector — renders selected model, opens dropdown, and searches', () => {
  const { el, window } = mountModelSelector(
    { 'selected-id': 'claude-3-5-sonnet' },
    [
      { id: 'claude-3-5-sonnet', name: 'Claude 3.5 Sonnet', provider: 'Anthropic', contextLength: '200k' },
      { id: 'gpt-4o', name: 'GPT-4o', provider: 'OpenAI', contextLength: '128k' },
      { id: 'deepseek-r1', name: 'DeepSeek R1', provider: 'DeepSeek', contextLength: '64k' }
    ]
  );

  assert.ok(el.innerHTML.includes('Claude 3.5 Sonnet'), 'should display selected model name');
  assert.ok(el.innerHTML.includes('Anthropic'), 'should display provider info');

  // Trigger dropdown
  const btn = el.querySelector('.model-sel-btn');
  btn.click();
  assert.ok(el.innerHTML.includes('GPT-4o'), 'dropdown shows all models when opened');

  // Search input filter test
  const input = el.querySelector('.model-search-input');
  assert.ok(input, 'search input exists');
  input.value = 'deep';
  input.dispatchEvent(new window.Event('input'));

  const listbox = el.querySelector('[role="listbox"]');
  assert.ok(listbox.innerHTML.includes('DeepSeek R1'), 'filtered list contains DeepSeek');
  assert.ok(!listbox.innerHTML.includes('Claude 3.5 Sonnet'), 'filtered list excludes unmatching Claude');
});
