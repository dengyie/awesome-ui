/**
 * jsdom tests for the v1.39.0 vanilla components
 * (AiResearchPanel, ApiKeyTable, VoiceSessionHistory).
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

test('vanilla AiResearchPanel — template cards, run/close events', () => {
  const El = instantiate('AiResearchPanel.js', 'AiResearchPanelElement');
  const el = new El();
  el.setAttribute(
    'templates',
    JSON.stringify([
      { id: 'r1', title: 'Research and evaluate a company for fit', description: 'Research a company to determine fit.' },
      { id: 'r2', title: 'Confirm decision-maker', description: 'Determine if a contact is a valid decision-maker.' },
    ])
  );
  window.document.body.appendChild(el);

  assert.ok(el.querySelector('[data-ai-research-panel]'), 'host rendered');
  assert.ok(el.querySelector('[data-ai-research-title]').textContent.includes('Research with AI'), 'title');
  assert.equal(el.querySelectorAll('[data-research-card]').length, 2, 'two cards');
  assert.ok(el.querySelector('[data-research-card="r1"]').textContent.includes('Research and evaluate'), 'card text');
  assert.ok(el.querySelector('[data-research-run]'), 'try CTA');
  assert.ok(el.querySelector('[data-ai-research-custom]'), 'custom CTA');
  assert.ok(el.querySelector('[data-ai-research-close]'), 'close button');

  let ranTemplate = null;
  let custom = false;
  let closed = false;
  el.addEventListener('run', (e) => { ranTemplate = e.detail.template; });
  el.addEventListener('run-custom', () => { custom = true; });
  el.addEventListener('close', () => { closed = true; });

  el.querySelector('[data-research-card="r2"] [data-research-run]')
    .dispatchEvent(new window.CustomEvent('click', { bubbles: true }));
  assert.ok(ranTemplate && ranTemplate.id === 'r2', 'run event detail template');

  el.querySelector('[data-ai-research-custom]').dispatchEvent(new window.CustomEvent('click', { bubbles: true }));
  el.querySelector('[data-ai-research-close]').dispatchEvent(new window.CustomEvent('click', { bubbles: true }));
  assert.ok(custom, 'run-custom event');
  assert.ok(closed, 'close event');

  el.templates = [];
  assert.ok(el.querySelector('[data-ai-research-empty]'), 'empty state on property set');
});

test('vanilla ApiKeyTable — rows, revoke hides actions, copy/revoke events', () => {
  const El = instantiate('ApiKeyTable.js', 'ApiKeyTableElement');
  const el = new El();
  el.setAttribute(
    'keys',
    JSON.stringify([
      { id: 'k1', name: 'Production key', preview: 'sk-proj-••••4x8f', created: 'Nov 12, 2026', status: 'active' },
      { id: 'k2', name: 'Legacy key', preview: 'sk-proj-••••9q2m', status: 'revoked' },
    ])
  );
  window.document.body.appendChild(el);

  assert.ok(el.querySelector('[data-api-key-table]'), 'host rendered');
  assert.ok(el.querySelector('[data-api-key-count]').textContent.includes('1 active'), 'active count');
  assert.ok(el.querySelector('[data-api-key-create]'), 'create CTA');
  assert.equal(el.querySelectorAll('[data-api-key-row]').length, 2, 'two rows');
  assert.ok(el.querySelector('[data-api-key-row="k1"]').textContent.includes('Production key'), 'row name');
  assert.ok(el.querySelector('[data-api-key-row="k1"] [data-api-key-status]').textContent.includes('Active'), 'active badge');
  assert.ok(el.querySelector('[data-api-key-row="k2"] [data-api-key-status]').textContent.includes('Revoked'), 'revoked badge');
  assert.ok(el.querySelector('[data-api-key-row="k1"]').textContent.includes('created Nov 12, 2026'), 'created meta');
  assert.ok(el.querySelector('[data-api-key-row="k1"] [data-api-key-copy]'), 'copy on active row');
  assert.ok(el.querySelector('[data-api-key-row="k1"] [data-api-key-revoke]'), 'revoke on active row');
  assert.equal(el.querySelector('[data-api-key-row="k2"] [data-api-key-copy]'), null, 'no copy on revoked row');
  assert.equal(el.querySelector('[data-api-key-row="k2"] [data-api-key-revoke]'), null, 'no revoke on revoked row');

  let copiedRow = null;
  let revokedRow = null;
  el.addEventListener('copy', (e) => { copiedRow = e.detail.row; });
  el.addEventListener('revoke', (e) => { revokedRow = e.detail.row; });

  el.querySelector('[data-api-key-row="k1"] [data-api-key-copy]')
    .dispatchEvent(new window.CustomEvent('click', { bubbles: true }));
  assert.ok(copiedRow && copiedRow.id === 'k1', 'copy event detail row');

  el.querySelector('[data-api-key-row="k1"] [data-api-key-revoke]')
    .dispatchEvent(new window.CustomEvent('click', { bubbles: true }));
  assert.ok(revokedRow && revokedRow.id === 'k1', 'revoke event detail row');

  el.keys = [];
  assert.ok(el.querySelector('[data-api-key-empty]'), 'empty state on property set');
});

test('vanilla VoiceSessionHistory — rows, statuses, select/play events', () => {
  const El = instantiate('VoiceSessionHistory.js', 'VoiceSessionHistoryElement');
  const el = new El();
  el.setAttribute(
    'sessions',
    JSON.stringify([
      { id: 's1', title: 'Homepage walkthrough', date: 'Today', duration: '04:12', status: 'completed' },
      { id: 's2', title: 'Weekly sync notes', date: 'Yesterday', duration: '11:38', status: 'in-progress' },
      { id: 's3', title: 'Broken recording', duration: '00:00', status: 'failed' },
    ])
  );
  window.document.body.appendChild(el);

  assert.ok(el.querySelector('[data-voice-history]'), 'host rendered');
  assert.ok(el.querySelector('[data-voice-history-count]'), 'count hook');
  assert.equal(el.querySelectorAll('[data-voice-session]').length, 3, 'three sessions');
  assert.ok(el.querySelector('[data-voice-session="s1"]').textContent.includes('Homepage walkthrough'), 'session title');
  assert.ok(el.querySelector('[data-voice-session="s1"]').textContent.includes('Today · 04:12'), 'meta text');
  assert.ok(el.querySelector('[data-voice-session="s1"] [data-voice-session-status]').textContent.includes('Completed'), 'completed label');
  assert.ok(el.querySelector('[data-voice-session="s2"] [data-voice-session-status]').textContent.includes('Running'), 'running label');
  assert.ok(el.querySelector('[data-voice-session="s3"] [data-voice-session-status]').textContent.includes('Failed'), 'failed label');
  assert.ok(el.querySelector('[data-voice-session-play]'), 'play button');

  let selected = null;
  let played = null;
  el.addEventListener('select', (e) => { selected = e.detail.session; });
  el.addEventListener('play', (e) => { played = e.detail.session; });

  el.querySelector('[data-voice-session="s2"]').dispatchEvent(new window.CustomEvent('click', { bubbles: true }));
  assert.ok(selected && selected.id === 's2', 'select event detail session');

  el.querySelector('[data-voice-session="s1"] [data-voice-session-play]')
    .dispatchEvent(new window.CustomEvent('click', { bubbles: true }));
  assert.ok(played && played.id === 's1', 'play event detail session');

  el.sessions = [];
  assert.ok(el.querySelector('[data-voice-history-empty]'), 'empty state on property set');
});
