/**
 * Vanilla jsdom tests for the v1.32.0 batch
 * (ImageGenGallery, SharedChatViewer, MemoryPanel, ConnectorGrid, ModelComparePane).
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

test('ImageGenGallery — generate event, tile actions and statuses', () => {
  const El = loadElement('ImageGenGallery.js', 'ImageGenGalleryElement');
  const el = window.document.createElement('image-gen-gallery');
  window.document.body.appendChild(el);
  el.images = [
    { id: 'img1', alt: 'Aurora over mountains', aspect: 'landscape', model: 'gpt-image-2' },
    { id: 'img2', alt: 'Sketching…', status: 'generating' },
  ];
  el.prompt = 'sunset over the bay';

  assert.ok(el.querySelector('[data-image-gen]'), 'host hook');
  assert.ok(el.querySelector('[data-gen-input]'), 'prompt input');
  assert.equal(el.querySelector('[data-gen-input]').value, 'sunset over the bay', 'prompt value');
  assert.ok(el.querySelector('[data-gen-tile="img1"]'), 'done tile');
  assert.ok(el.querySelector('[data-gen-tile="img1"] [data-gen-status="done"]'), 'done status');
  assert.ok(el.querySelector('[data-gen-tile="img2"] [data-gen-status="generating"]'), 'generating status');
  assert.ok(el.querySelector('[data-gen-action="delete"]'), 'delete action');
  assert.ok(el.textContent.includes('gpt-image-2'), 'model badge');

  let generated = null;
  el.addEventListener('generate', (e) => { generated = e.detail.prompt; });
  const input = el.querySelector('[data-gen-input]');
  input.value = 'a red barn in snow';
  el.querySelector('[data-gen-generate]').click();
  assert.equal(generated, 'a red barn in snow', 'generate event payload');

  let action = null;
  el.addEventListener('tile-action', (e) => { action = e.detail; });
  el.querySelector('[data-gen-tile="img1"] [data-gen-action="download"]').click();
  assert.deepEqual(action, { id: 'img1', action: 'download' }, 'tile action payload');
  window.document.body.removeChild(el);
});

test('SharedChatViewer — bubbles, meta and cta event', () => {
  const El = loadElement('SharedChatViewer.js', 'SharedChatViewerElement');
  const el = window.document.createElement('shared-chat-viewer');
  el.setAttribute('app-name', 'Nebula');
  el.setAttribute('title', 'Trip planning help');
  el.setAttribute('meta', '12 messages · Mar 3, 2026');
  el.setAttribute('cta-text', 'Try it yourself');
  window.document.body.appendChild(el);
  el.messages = [
    { id: 'm1', role: 'user', text: 'Plan 3 days in Kyoto.' },
    { id: 'm2', role: 'assistant', text: 'Day 1 — Fushimi Inari at sunrise…' },
  ];

  assert.ok(el.querySelector('[data-shared-chat]'), 'host hook');
  assert.ok(el.querySelector('[data-shared-header]'), 'header hook');
  assert.ok(el.querySelector('[data-shared-meta]').textContent.includes('12 messages'), 'meta text');
  assert.ok(el.querySelector('[data-shared-msg="m1"]'), 'user bubble');
  assert.equal(el.querySelector('[data-shared-role="m1"]'), null, 'role hook is on the bubble');
  assert.ok(el.querySelector('[data-shared-msg="m1"] [data-shared-role="user"]'), 'user role');
  assert.ok(el.querySelector('[data-shared-msg="m2"] [data-shared-role="assistant"]'), 'assistant role');
  assert.ok(el.textContent.includes('read-only'), 'default note');

  let fired = false;
  el.addEventListener('cta', () => { fired = true; });
  el.querySelector('[data-shared-cta]').click();
  assert.ok(fired, 'cta event');
  window.document.body.removeChild(el);
});

test('MemoryPanel — add, inline edit, delete and clear', () => {
  const El = loadElement('MemoryPanel.js', 'MemoryPanelElement');
  const el = window.document.createElement('memory-panel');
  window.document.body.appendChild(el);
  el.items = [
    { id: 'mem1', text: 'Prefers dark mode everywhere', source: 'Conversation · Nov 2' },
    { id: 'mem2', text: 'Writes in TypeScript' },
  ];

  assert.ok(el.querySelector('[data-memory-panel]'), 'host hook');
  assert.ok(el.querySelector('[data-memory-item="mem1"]'), 'item hook');
  assert.ok(el.querySelector('[data-memory-text]').textContent.includes('Prefers dark mode'), 'item text');
  assert.ok(el.querySelector('[data-memory-source]'), 'source caption');
  assert.ok(el.querySelector('[data-memory-clear]'), 'clear button');
  assert.ok(el.querySelector('[data-memory-add-input]'), 'add input');

  let added = null;
  let edited = null;
  let deleted = null;
  let cleared = false;
  el.addEventListener('add', (e) => { added = e.detail.text; });
  el.addEventListener('edit', (e) => { edited = e.detail; });
  el.addEventListener('delete', (e) => { deleted = e.detail.id; });
  el.addEventListener('clear', () => { cleared = true; });

  // add flow
  const addInput = el.querySelector('[data-memory-add-input]');
  addInput.value = 'Drinks oat milk lattes';
  el.querySelector('[data-memory-add]').click();
  assert.equal(added, 'Drinks oat milk lattes', 'add event payload');

  // inline edit flow
  el.querySelector('[data-memory-item="mem1"] [data-memory-edit]').click();
  const editInput = el.querySelector('[data-memory-edit-input]');
  assert.ok(editInput, 'edit input appears');
  editInput.value = 'Prefers light mode in terminal';
  el.querySelector('[data-memory-save]').click();
  assert.ok(el.querySelector('[data-memory-edit-input]') === null, 'edit mode closed');
  assert.deepEqual(edited, { id: 'mem1', text: 'Prefers light mode in terminal' }, 'edit event payload');

  // delete flow
  el.querySelector('[data-memory-item="mem2"] [data-memory-delete]').click();
  assert.equal(deleted, 'mem2', 'delete event payload');

  // clear flow
  el.querySelector('[data-memory-clear]').click();
  assert.ok(cleared, 'clear event');
  window.document.body.removeChild(el);
});

test('ConnectorGrid — toggle event and count badge', () => {
  const El = loadElement('ConnectorGrid.js', 'ConnectorGridElement');
  const el = window.document.createElement('connector-grid');
  window.document.body.appendChild(el);
  el.connectors = [
    { id: 'github', name: 'GitHub', description: 'Read issues and PRs', icon: '🐙', connected: true },
    { id: 'notion', name: 'Notion', description: 'Search your workspace' },
  ];

  assert.ok(el.querySelector('[data-connector-grid]'), 'host hook');
  assert.ok(el.querySelector('[data-connector="github"]'), 'connector card');
  assert.ok(el.querySelector('[data-connector-name]').textContent.includes('GitHub'), 'name');
  assert.ok(el.querySelector('[data-connector-desc]').textContent.includes('Read issues'), 'description');
  assert.ok(el.querySelector('[data-connector-count]').textContent.includes('1/2 connected'), 'count');
  assert.ok(el.querySelector('[data-connector="github"] [data-connector-toggle]').textContent.includes('Connected'), 'connected label');

  let toggled = null;
  el.addEventListener('toggle', (e) => { toggled = e.detail; });
  el.querySelector('[data-connector="notion"] [data-connector-toggle]').click();
  assert.deepEqual(toggled, { id: 'notion', connected: true }, 'toggle event payload');
  assert.ok(el.querySelector('[data-connector="notion"]').textContent.includes('Connected'), 'label flipped after toggle');
  assert.ok(el.querySelector('[data-connector-count]').textContent.includes('2/2 connected'), 'count updated');
  window.document.body.removeChild(el);
});

test('ModelComparePane — outputs, statuses and vote event', () => {
  const El = loadElement('ModelComparePane.js', 'ModelComparePaneElement');
  const el = window.document.createElement('model-compare-pane');
  el.setAttribute('prompt', 'Explain CORS in one paragraph.');
  el.setAttribute('model-a', 'GPT-5.2');
  el.setAttribute('model-b', 'Claude 4.5');
  window.document.body.appendChild(el);
  el.outputA = 'CORS is a browser mechanism…';
  el.outputB = 'Cross-Origin Resource Sharing…';
  el.statusA = 'streaming';
  el.statusB = 'error';

  assert.ok(el.querySelector('[data-model-compare]'), 'host hook');
  assert.ok(el.querySelector('[data-compare-prompt]').textContent.includes('Explain CORS'), 'prompt text');
  assert.ok(el.querySelector('[data-compare-col="a"]'), 'column A');
  assert.ok(el.querySelector('[data-compare-model="b"]').textContent.includes('Claude 4.5'), 'model B name');
  assert.ok(el.querySelector('[data-compare-output="a"]').textContent.includes('CORS is a browser'), 'output A');
  assert.ok(el.querySelector('[data-compare-status="a"]').textContent.includes('streaming'), 'streaming chip');
  assert.ok(el.querySelector('[data-compare-output="b"]').textContent.includes('Generation failed'), 'error replaces output');

  let vote = null;
  el.addEventListener('vote', (e) => { vote = e.detail.choice; });
  el.querySelector('[data-compare-vote="B"]').click();
  assert.equal(vote, 'B', 'vote event payload');
  el.querySelector('[data-compare-vote="tie"]').click();
  assert.equal(vote, 'tie', 'tie vote');
  window.document.body.removeChild(el);
});
