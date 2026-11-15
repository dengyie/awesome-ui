/**
 * Vanilla jsdom tests for the v1.35.0 batch
 * (PromptSaveDialog, AiTemplatePicker, CreationComposer).
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

const loadElement = (file, className) => {
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

test('PromptSaveDialog — folder, variable chips, save payload and close', () => {
  const El = loadElement('PromptSaveDialog.js', 'PromptSaveDialogElement');
  const el = window.document.createElement('prompt-save-dialog');
  el.setAttribute('title', 'Onboarding Ratings');
  el.setAttribute('folder', 'Research');
  el.setAttribute('variables', JSON.stringify(['company', 'audience']));
  window.document.body.appendChild(el);

  assert.ok(el.querySelector('[data-prompt-save]'), 'host hook');
  assert.ok(el.querySelector('[data-prompt-save-folder]').textContent.includes('Research'), 'folder label');
  const title = el.querySelector('[data-prompt-save-title]');
  assert.equal(title.value, 'Onboarding Ratings', 'title value');
  assert.ok(el.querySelector('[data-prompt-save-body]'), 'prompt body');
  assert.ok(el.textContent.includes('+ Add variable'), 'add var CTA');
  assert.equal(el.querySelectorAll('[data-prompt-save-var]').length, 2, 'variable chips');
  assert.ok(el.querySelector('[data-prompt-save-var]').textContent.includes('{{company}}'), 'chip syntax');

  let saved = null;
  let cancelled = false;
  let closed = false;
  el.addEventListener('save', (e) => { saved = e.detail; });
  el.addEventListener('cancel', () => { cancelled = true; });
  el.addEventListener('close', () => { closed = true; });

  title.value = 'Renamed prompt';
  title.dispatchEvent(new window.Event('input', { bubbles: true }));
  el.querySelector('[data-prompt-save-submit]').click();
  assert.equal(saved.title, 'Renamed prompt', 'save payload uses edited title');
  assert.ok(Array.isArray(saved.variables) && saved.variables.length === 2, 'save payload vars');

  el.querySelector('[data-prompt-save-cancel]').click();
  assert.ok(cancelled, 'cancel event');
  el.querySelector('[data-prompt-save-close]').click();
  assert.ok(closed, 'close event');
  assert.equal(el.getAttribute('open'), 'false', 'open attr set false');
  assert.equal(el.innerHTML, '', 'markup cleared when closed');
  window.document.body.removeChild(el);
});

test('AiTemplatePicker — category filter, try payload, custom and close', () => {
  const El = loadElement('AiTemplatePicker.js', 'AiTemplatePickerElement');
  const el = window.document.createElement('ai-template-picker');
  el.setAttribute('categories', JSON.stringify([
    { id: 'all', label: 'All templates', count: 26 },
    { id: 'targeting', label: 'Improve targeting', count: 13 },
  ]));
  el.setAttribute('templates', JSON.stringify([
    { id: 't1', name: 'Research a company', description: 'Determine fit.', category: 'all' },
    { id: 't2', name: 'Summarize news', description: 'Recent news.', category: 'targeting' },
  ]));
  window.document.body.appendChild(el);

  assert.ok(el.querySelector('[data-ai-template-picker]'), 'host hook');
  assert.ok(el.querySelector('[data-ai-templates-rail]'), 'category rail');
  assert.equal(el.querySelectorAll('[data-ai-templates-category]').length, 2, 'category buttons');
  assert.ok(el.querySelector('[data-ai-templates-category="all"]').className.includes('bg-indigo-50'), 'first category active');
  assert.ok(el.querySelector('[data-ai-template-card="t1"]'), 'all-category card shown');
  assert.ok(el.querySelector('[data-ai-templates-category="all"]').textContent.includes('26'), 'count badge');

  let switched = null;
  let tried = null;
  let custom = false;
  let closed = false;
  el.addEventListener('category-change', (e) => { switched = e.detail.id; });
  el.addEventListener('try', (e) => { tried = e.detail.template; });
  el.addEventListener('run-custom', () => { custom = true; });
  el.addEventListener('close', () => { closed = true; });

  el.querySelector('[data-ai-templates-category="targeting"]').click();
  assert.equal(switched, 'targeting', 'category-change event');
  assert.equal(el.getAttribute('active-category'), 'targeting', 'active attr set');
  assert.ok(el.querySelector('[data-ai-template-card="t2"]'), 'targeting card visible after switch');
  assert.equal(el.querySelector('[data-ai-template-card="t1"]'), null, 'all card filtered out');

  el.querySelector('[data-ai-template-try]').click();
  assert.ok(tried && tried.id === 't2', 'try payload is visible template');

  el.querySelector('[data-ai-templates-custom]').click();
  assert.ok(custom, 'run-custom event');
  el.querySelector('[data-ai-templates-close]').click();
  assert.ok(closed, 'close event');
  assert.equal(el.innerHTML, '', 'markup cleared when closed');
  window.document.body.removeChild(el);
});

test('AiTemplatePicker — property setters and empty state', () => {
  const El = loadElement('AiTemplatePicker.js', 'AiTemplatePickerElement');
  const el = window.document.createElement('ai-template-picker');
  window.document.body.appendChild(el);
  el.categories = [{ id: 'x', label: 'Empty cat', count: 0 }];
  el.templates = [];
  assert.ok(el.querySelector('[data-ai-templates-empty]'), 'empty hook');
  assert.ok(el.textContent.includes('No templates in this category yet.'), 'empty text');
  window.document.body.removeChild(el);
});

test('CreationComposer — assist toggle, selects, submit payload', () => {
  const El = loadElement('CreationComposer.js', 'CreationComposerElement');
  const el = window.document.createElement('creation-composer');
  el.setAttribute('image-assist', 'false');
  window.document.body.appendChild(el);

  assert.ok(el.querySelector('[data-creation-composer]'), 'host hook');
  const toggle = el.querySelector('[data-creation-assist-toggle]');
  assert.equal(toggle.getAttribute('aria-checked'), 'false', 'assist off initially');
  assert.ok(el.querySelector('[data-creation-input]'), 'prompt input');
  assert.ok(el.querySelector('[data-creation-resolution]'), 'resolution select');
  assert.ok(el.querySelector('[data-creation-count]'), 'count select');
  assert.ok(el.querySelector('[data-creation-submit]').textContent.includes('Create'), 'create CTA');

  let assistChanged = null;
  let resChanged = null;
  let countChanged = null;
  let submitted = null;
  el.addEventListener('image-assist-change', (e) => { assistChanged = e.detail.enabled; });
  el.addEventListener('resolution-change', (e) => { resChanged = e.detail.resolution; });
  el.addEventListener('count-change', (e) => { countChanged = e.detail.count; });
  el.addEventListener('submit', (e) => { submitted = e.detail; });

  toggle.click();
  assert.equal(assistChanged, true, 'assist toggle event');
  assert.equal(el.getAttribute('image-assist'), 'true', 'assist attr set');
  assert.equal(el.querySelector('[data-creation-assist-toggle]').getAttribute('aria-checked'), 'true', 'aria-checked flips');

  const resSel = el.querySelector('[data-creation-resolution]');
  resSel.value = '4K';
  resSel.dispatchEvent(new window.Event('change', { bubbles: true }));
  assert.equal(resChanged, '4K', 'resolution event');

  const countSel = el.querySelector('[data-creation-count]');
  countSel.value = '2';
  countSel.dispatchEvent(new window.Event('change', { bubbles: true }));
  assert.equal(countChanged, 2, 'count event');

  const input = el.querySelector('[data-creation-input]');
  input.value = 'A hero shot of a sneaker';
  input.dispatchEvent(new window.Event('input', { bubbles: true }));
  el.querySelector('[data-creation-submit]').click();
  assert.equal(submitted.prompt, 'A hero shot of a sneaker', 'submit prompt payload');
  assert.equal(submitted.imageAssist, true, 'submit assist payload');
  assert.equal(submitted.resolution, '4K', 'submit resolution payload');
  assert.equal(submitted.count, 2, 'submit count payload');
  window.document.body.removeChild(el);
});
