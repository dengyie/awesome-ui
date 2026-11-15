/**
 * jsdom tests for the v1.43.0 vanilla components
 * (WriterStyleGuide, CampsiteHandoff, ZendeskFieldSuggest).
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

test('vanilla WriterStyleGuide — tabs, entries and tab-change events', () => {
  const El = instantiate('WriterStyleGuide.js', 'WriterStyleGuideElement');
  const el = new El();
  el.setAttribute(
    'entries',
    JSON.stringify([
      { id: 'g1', title: 'Avoid passive voice', description: 'It dilutes meaning.', minutes: 3 },
      { id: 'g2', title: 'Contracted forms', description: 'Write "can\'t".', minutes: 2 },
    ])
  );
  window.document.body.appendChild(el);

  assert.ok(el.querySelector('[data-writer-style-guide]'), 'guide rendered');
  assert.equal(el.querySelectorAll('[data-writer-tab]').length, 3, 'three tabs');
  assert.ok(el.querySelector('[data-writer-tab="company"]').className.includes('border-indigo-500'), 'company active by default');
  assert.equal(el.querySelectorAll('[data-writer-entry]').length, 2, 'two entries');
  assert.ok(el.querySelector('[data-writer-entry-title]').textContent.includes('passive voice'), 'entry title');
  assert.ok(el.querySelector('[data-writer-entry-minutes]').textContent.includes('3 min'), 'minutes text');

  let tabChanged = null;
  let entryPicked = null;
  el.addEventListener('tab-change', (e) => { tabChanged = e.detail.tab; });
  el.addEventListener('entry-click', (e) => { entryPicked = e.detail.entry; });

  el.querySelector('[data-writer-tab="team"]').dispatchEvent(new window.CustomEvent('click', { bubbles: true }));
  assert.equal(tabChanged, 'team', 'tab-change event detail');
  assert.ok(el.querySelector('[data-writer-tab="team"]').className.includes('border-indigo-500'), 'team active after click');

  el.querySelector('[data-writer-entry="g2"]').dispatchEvent(new window.CustomEvent('click', { bubbles: true }));
  assert.ok(entryPicked && entryPicked.id === 'g2', 'entry-click event detail');

  el.entries = [];
  assert.equal(el.querySelectorAll('[data-writer-entry]').length, 0, 'entries cleared on property set');
});

test('vanilla CampsiteHandoff — toggle flips done and updates count', () => {
  const El = instantiate('CampsiteHandoff.js', 'CampsiteHandoffElement');
  const el = new El();
  el.setAttribute(
    'items',
    JSON.stringify([
      { id: 'h1', label: 'Redlines attached', done: true, assignee: 'Alex Smith', due: 'Nov 12' },
      { id: 'h2', label: 'Motion review', done: false, assignee: 'Brook Taylor' },
    ])
  );
  el.setAttribute('summary', '2 tasks, 1 done.');
  window.document.body.appendChild(el);

  assert.ok(el.querySelector('[data-campsite-handoff]'), 'panel rendered');
  assert.equal(el.querySelector('[data-campsite-handoff-count]').textContent, '1/2 done', 'initial count');
  assert.ok(el.querySelector('[data-campsite-handoff-assignee]').textContent, 'assignee initials rendered');
  assert.ok(el.querySelector('[data-campsite-handoff-due]').textContent.includes('Nov 12'), 'due text');
  assert.ok(el.querySelector('[data-campsite-handoff-summary]').textContent.includes('2 tasks, 1 done.'), 'summary text');

  let toggled = null;
  el.addEventListener('toggle', (e) => { toggled = e.detail.item; });
  el.querySelector('[data-campsite-handoff-item="h2"]').dispatchEvent(new window.CustomEvent('click', { bubbles: true }));
  assert.ok(toggled && toggled.id === 'h2' && toggled.done === true, 'toggle event flips done');
  assert.equal(el.querySelector('[data-campsite-handoff-count]').textContent, '2/2 done', 'count updated after toggle');

  el.querySelector('[data-campsite-handoff-item="h2"]').dispatchEvent(new window.CustomEvent('click', { bubbles: true }));
  assert.equal(el.querySelector('[data-campsite-handoff-count]').textContent, '1/2 done', 'count updated after untoggle');

  el.items = [];
  assert.equal(el.querySelectorAll('[data-campsite-handoff-item]').length, 0, 'items cleared on property set');
});

test('vanilla ZendeskFieldSuggest — apply removes chip, dismiss clears', () => {
  const El = instantiate('ZendeskFieldSuggest.js', 'ZendeskFieldSuggestElement');
  const el = new El();
  el.setAttribute(
    'fields',
    JSON.stringify([
      { id: 'f1', label: 'Priority', value: 'Urgent', confidence: 0.94 },
      { id: 'f2', label: 'Type', value: 'Incident', confidence: 0.87 },
    ])
  );
  window.document.body.appendChild(el);

  assert.ok(el.querySelector('[data-zendesk-field-suggest]'), 'bar rendered');
  assert.equal(el.querySelectorAll('[data-zendesk-suggest-field]').length, 2, 'two chips');
  assert.ok(el.querySelector('[data-zendesk-suggest-field="f1"]').textContent.includes('94%'), 'confidence text');

  let applied = null;
  let dismissed = false;
  el.addEventListener('apply', (e) => { applied = e.detail.field; });
  el.addEventListener('dismiss', () => { dismissed = true; });

  el.querySelector('[data-zendesk-suggest-field="f1"]').dispatchEvent(new window.CustomEvent('click', { bubbles: true }));
  assert.ok(applied && applied.id === 'f1', 'apply event detail');
  assert.equal(el.querySelectorAll('[data-zendesk-suggest-field]').length, 1, 'applied chip removed');

  el.querySelector('[data-zendesk-suggest-dismiss]').dispatchEvent(new window.CustomEvent('click', { bubbles: true }));
  assert.ok(dismissed, 'dismiss event fired');
  assert.equal(el.querySelectorAll('[data-zendesk-suggest-field]').length, 0, 'all chips cleared after dismiss');
});
