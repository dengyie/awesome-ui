/**
 * Vanilla jsdom tests for the v1.33.0 batch
 * (SystemPromptEditor, ToolSchemaEditor, FineTuneJobList, PersonaPresetGrid, AgentBuilderCard).
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

test('SystemPromptEditor — edit, save, reset and temperature events', () => {
  const El = loadElement('SystemPromptEditor.js', 'SystemPromptEditorElement');
  const el = window.document.createElement('system-prompt-editor');
  el.setAttribute('title', 'System prompt');
  el.setAttribute('value', 'You are a support agent.');
  el.setAttribute('saved-value', 'You are a support agent.');
  el.setAttribute('version', 'v4');
  el.setAttribute('variables', JSON.stringify(['company', 'tone']));
  el.setAttribute('temperature', '0.7');
  window.document.body.appendChild(el);

  assert.ok(el.querySelector('[data-prompt-editor]'), 'host hook');
  assert.ok(el.querySelector('[data-editor-textarea]'), 'textarea');
  assert.ok(el.querySelector('[data-editor-version]').textContent.includes('v4'), 'version');
  assert.ok(el.querySelector('[data-editor-variables]').textContent.includes('{{company}}'), 'variable chips');
  assert.ok(el.querySelector('[data-editor-temperature]'), 'temp slider');
  assert.equal(el.querySelector('[data-editor-state]').textContent.trim(), 'Saved', 'clean state');
  assert.ok(el.querySelector('[data-editor-save]').hasAttribute('disabled'), 'save disabled when clean');

  // edit → dirty → save
  let saved = null;
  el.addEventListener('save', (e) => { saved = e.detail.text; });
  const ta = el.querySelector('[data-editor-textarea]');
  ta.value = 'You are a pirate. Arrr.';
  // programmatic .value doesn't fire `input` — real typing does
  ta.dispatchEvent(new window.Event('input', { bubbles: true }));
  el.querySelector('[data-editor-save]').click();
  assert.equal(saved, 'You are a pirate. Arrr.', 'save event payload');
  assert.equal(el.getAttribute('saved-value'), 'You are a pirate. Arrr.', 'saved-value updated');

  // reset
  let reset = false;
  el.addEventListener('reset', () => { reset = true; });
  ta.value = 'temporary edit';
  el.querySelector('[data-editor-reset]').click();
  assert.ok(reset, 'reset event');
  assert.equal(el.querySelector('[data-editor-textarea]').value, 'You are a pirate. Arrr.', 'textarea restored');

  // temperature change
  let tempValue = null;
  el.addEventListener('temperature-change', (e) => { tempValue = e.detail.value; });
  const slider = el.querySelector('[data-editor-temperature]');
  slider.value = '1.4';
  slider.dispatchEvent(new window.Event('change', { bubbles: true }));
  assert.equal(tempValue, 1.4, 'temperature event payload');
  window.document.body.removeChild(el);
});

test('ToolSchemaEditor — toggle and validate events', () => {
  const El = loadElement('ToolSchemaEditor.js', 'ToolSchemaEditorElement');
  const el = window.document.createElement('tool-schema-editor');
  window.document.body.appendChild(el);
  el.tools = [
    {
      id: 'search',
      name: 'search_docs',
      description: 'Full-text search across docs',
      method: 'POST',
      endpoint: 'https://api.example.com/v1/search',
      parameters: [
        { name: 'query', type: 'string', required: true },
        { name: 'limit', type: 'number' },
      ],
    },
    { id: 'weather', name: 'get_weather', method: 'GET' },
  ];

  assert.ok(el.querySelector('[data-tool-editor]'), 'host hook');
  assert.ok(el.querySelector('[data-tool-card="search"]'), 'tool card');
  assert.ok(el.querySelector('[data-tool-name]').textContent.includes('search_docs'), 'tool name');
  assert.ok(el.querySelector('[data-tool-method]').textContent.includes('POST'), 'method badge');
  assert.ok(el.querySelector('[data-tool-endpoint]').textContent.includes('/v1/search'), 'endpoint');
  assert.ok(el.querySelector('[data-tool-param="query"]').textContent.includes('string'), 'param type');
  assert.ok(el.querySelector('[data-tool-param="query"] [title="required"], [data-tool-param="query"] .font-bold'), 'required marker');
  assert.ok(el.querySelector('[data-tool-count]').textContent.includes('2/2 enabled'), 'count');

  let toggled = null;
  let validated = null;
  el.addEventListener('toggle', (e) => { toggled = e.detail; });
  el.addEventListener('validate', (e) => { validated = e.detail.tool; });
  el.querySelector('[data-tool-card="weather"] [data-tool-toggle]').click();
  assert.equal(toggled.enabled, false, 'toggle event disabled');
  assert.ok(el.querySelector('[data-tool-count]').textContent.includes('1/2 enabled'), 'count updated');
  assert.ok(el.querySelector('[data-tool-card="weather"]').className.includes('opacity-60'), 'card dimmed');

  el.querySelector('[data-tool-card="search"] [data-tool-validate]').click();
  assert.ok(validated && validated.id === 'search', 'validate event payload');
  window.document.body.removeChild(el);
});

test('FineTuneJobList — statuses, cancel and new', () => {
  const El = loadElement('FineTuneJobList.js', 'FineTuneJobListElement');
  const el = window.document.createElement('finetune-job-list');
  window.document.body.appendChild(el);
  el.jobs = [
    { id: 'job1', model: 'ft:gpt-4.1-mini:support-v2', status: 'training', progress: 62, cost: '$12.40', eta: '23 min', baseModel: 'gpt-4.1-mini' },
    { id: 'job2', model: 'ft:support-v1', status: 'completed' },
  ];

  assert.ok(el.querySelector('[data-finetune-list]'), 'host hook');
  assert.ok(el.querySelector('[data-finetune-job="job1"]'), 'job row');
  assert.ok(el.querySelector('[data-finetune-model]').textContent.includes('support-v2'), 'model name');
  assert.ok(el.querySelector('[data-finetune-status="training"]').textContent.includes('Training'), 'status chip');
  assert.ok(el.querySelector('[data-finetune-cost]').textContent.includes('$12.40'), 'cost');
  assert.ok(el.querySelector('[data-finetune-eta]').textContent.includes('ETA 23 min'), 'eta');
  assert.ok(el.querySelector('[data-finetune-progress]'), 'progress bar');
  assert.ok(el.textContent.includes('62%'), 'progress value');
  assert.ok(el.querySelector('[data-finetune-cancel]'), 'cancel for active job');
  assert.ok(!el.querySelector('[data-finetune-job="job2"] [data-finetune-cancel]'), 'no cancel for completed');

  let cancelled = null;
  let created = false;
  el.addEventListener('cancel', (e) => { cancelled = e.detail.job; });
  el.addEventListener('new', () => { created = true; });
  el.querySelector('[data-finetune-cancel]').click();
  assert.ok(cancelled && cancelled.id === 'job1', 'cancel event payload');
  el.querySelector('[data-finetune-new]').click();
  assert.ok(created, 'new event');
  window.document.body.removeChild(el);
});

test('PersonaPresetGrid — select moves ring and fires event', () => {
  const El = loadElement('PersonaPresetGrid.js', 'PersonaPresetGridElement');
  const el = window.document.createElement('persona-preset-grid');
  window.document.body.appendChild(el);
  el.presets = [
    { id: 'concise', name: 'Concise', description: 'Short, factual answers', emoji: '⚡', temperature: 0.2, selected: true },
    { id: 'teacher', name: 'Teacher', description: 'Explains step by step', emoji: '🎓' },
  ];

  assert.ok(el.querySelector('[data-persona-grid]'), 'host hook');
  assert.ok(el.querySelector('[data-persona-card="concise"]'), 'card hook');
  assert.ok(el.querySelector('[data-persona-name]').textContent.includes('Concise'), 'name');
  assert.ok(el.querySelector('[data-persona-desc]').textContent.includes('Short, factual'), 'description');
  assert.ok(el.querySelector('[data-persona-temp]').textContent.includes('temp 0.2'), 'temp hint');
  assert.ok(el.querySelector('[data-persona-card="concise"] [data-persona-check]'), 'selected check on first');

  let selected = null;
  el.addEventListener('select', (e) => { selected = e.detail.preset; });
  el.querySelector('[data-persona-card="teacher"]').click();
  assert.ok(selected && selected.id === 'teacher', 'select event payload');
  assert.ok(el.querySelector('[data-persona-card="teacher"] [data-persona-check]'), 'ring moved to teacher');
  assert.equal(el.querySelector('[data-persona-card="concise"] [data-persona-check]'), null, 'ring left first card');
  window.document.body.removeChild(el);
});

test('AgentBuilderCard — run, edit and running state', () => {
  const El = loadElement('AgentBuilderCard.js', 'AgentBuilderCardElement');
  const el = window.document.createElement('agent-builder-card');
  el.setAttribute('agent-name', 'Support triage');
  window.document.body.appendChild(el);
  el.nodes = [
    { id: 'n1', label: 'New ticket received', type: 'trigger', status: 'done' },
    { id: 'n2', label: 'search_docs', type: 'tool', status: 'active' },
    { id: 'n3', label: 'Draft reply', type: 'llm', status: 'idle' },
  ];

  assert.ok(el.querySelector('[data-agent-builder]'), 'host hook');
  assert.ok(el.querySelector('[data-builder-agent-name]').textContent.includes('Support triage'), 'agent name');
  assert.ok(el.textContent.includes('3 nodes'), 'node count');
  assert.ok(el.querySelector('[data-builder-node="n2"]'), 'node hook');
  assert.ok(el.querySelector('[data-builder-status="active"]').className.includes('animate-pulse'), 'active pulse');
  assert.ok(el.querySelector('[data-builder-status="done"]').className.includes('bg-emerald-500'), 'done dot');
  assert.ok(el.textContent.includes('search_docs'), 'node label');

  let ran = false;
  let edited = false;
  el.addEventListener('run', () => { ran = true; });
  el.addEventListener('edit', () => { edited = true; });
  el.querySelector('[data-builder-run]').click();
  assert.ok(ran, 'run event');
  el.querySelector('[data-builder-edit]').click();
  assert.ok(edited, 'edit event');

  el.setAttribute('running', 'true');
  assert.ok(el.querySelector('[data-builder-run]').textContent.includes('Running…'), 'running label');
  assert.ok(el.querySelector('[data-builder-run]').hasAttribute('disabled'), 'run disabled while running');
  window.document.body.removeChild(el);
});
