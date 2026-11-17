/**
 * v3.1.1 batch — vanilla behavior tests (jsdom)
 * IntegrationConnectGrid, NotificationPrefsMatrix, PermissionDeniedState,
 * NoResultsState.
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

const gridSource = stripComponent('IntegrationConnectGrid.js', 'IntegrationConnectGridElement');
const prefsSource = stripComponent('NotificationPrefsMatrix.js', 'NotificationPrefsMatrixElement');
const deniedSource = stripComponent('PermissionDeniedState.js', 'PermissionDeniedStateElement');
const noresultsSource = stripComponent('NoResultsState.js', 'NoResultsStateElement');

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
  return { el, window };
}

test('IntegrationConnectGrid — tabs filter cards, action toggles state', () => {
  const { el } = mount(gridSource, 'IntegrationConnectGridElement', {
    integrations: JSON.stringify([
      { id: 'gh', name: 'GitHub', category: 'Code', connected: true },
      { id: 'fg', name: 'Figma', category: 'Design', connected: false },
    ]),
  });
  assert.equal(el.querySelectorAll('[data-integration-card]').length, 2);

  // Category tab filters visible cards
  el.querySelector('[data-integration-tab="Design"]').click();
  assert.equal(el.querySelectorAll('[data-integration-card]').length, 1);

  // Connect action flips state and emits
  const events = [];
  el.addEventListener('integration-toggle', (e) => events.push([e.detail.integration.id, e.detail.connected]));
  el.querySelector('[data-integration-action="fg"]').click();
  assert.deepEqual(events, [['fg', true]]);
  assert.ok(el.querySelector('[data-integration-card="fg"] [data-integration-state="connected"]'));
});

test('NotificationPrefsMatrix — matrix cells emit pref-change', () => {
  const { el, window } = mount(prefsSource, 'NotificationPrefsMatrixElement', {
    events: JSON.stringify([
      { id: 'mentions', label: 'Mentions & replies', channels: { inapp: true, email: false, push: false } },
    ]),
  });
  assert.equal(el.querySelectorAll('[data-pref-row]').length, 1);
  assert.equal(el.querySelectorAll('[data-pref-col]').length, 3);

  const events = [];
  el.addEventListener('pref-change', (e) => events.push([e.detail.event.id, e.detail.channel, e.detail.enabled]));
  const cell = el.querySelector('input[data-pref-cell="mentions|email"]');
  cell.checked = true;
  cell.dispatchEvent(new window.Event('change', { bubbles: true }));
  assert.deepEqual(events, [['mentions', 'email', true]]);
});

test('PermissionDeniedState — copy, CTA event and contact link', () => {
  const { el } = mount(deniedSource, 'PermissionDeniedStateElement', {
    title: 'Restricted space',
    'cta-label': 'Ask for access',
  });
  assert.equal(el.querySelector('[data-denied-title]').textContent, 'Restricted space');
  assert.ok(el.querySelector('[data-denied-cta]').textContent.includes('Ask for access'));
  assert.ok(el.querySelector('[data-denied-contact]'));

  const events = [];
  el.addEventListener('request-access', () => events.push('requested'));
  el.querySelector('[data-denied-cta]').click();
  assert.deepEqual(events, ['requested']);
});

test('NoResultsState — query echo, suggestion chips and clear event', () => {
  const { el } = mount(noresultsSource, 'NoResultsStateElement', {
    query: 'deploy',
    suggestions: JSON.stringify(['deployment', 'deploys']),
  });
  assert.ok(el.querySelector('[data-noresults-query]').textContent.includes('deploy'));
  assert.equal(el.querySelectorAll('[data-noresults-suggestion]').length, 2);

  const events = [];
  el.addEventListener('suggestion', (e) => events.push(['s', e.detail.suggestion]));
  el.addEventListener('clear-filters', () => events.push('clear'));
  el.querySelector('[data-noresults-suggestion="deployment"]').click();
  el.querySelector('[data-noresults-clear]').click();
  assert.deepEqual(events, [['s', 'deployment'], 'clear']);
});
