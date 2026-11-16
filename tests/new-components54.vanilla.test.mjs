/**
 * jsdom tests for the v2.7.0 vanilla components
 * (SessionDiagnosticsPanel, HelpCenterHome, AccountSecurityPanel, MasonryDensityControls).
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

test('vanilla SessionDiagnosticsPanel — search filters events inline and event-click fires', () => {
  const El = instantiate('SessionDiagnosticsPanel.js', 'SessionDiagnosticsPanelElement');
  const el = new El();
  window.document.body.appendChild(el);

  assert.ok(el.querySelector('[data-sdiag]'), 'root rendered');
  assert.ok(el.querySelector('[data-sdiag-device="Browser"]'), 'device card');
  assert.ok(el.querySelector('[data-sdiag-track="network"]'), 'quality track');
  assert.ok(el.querySelector('[data-sdiag-window]'), 'quality windows');
  const eventRows = () => el.querySelectorAll('[data-sdiag-event]');
  assert.ok(eventRows().length >= 3, 'event rows rendered');
  assert.equal(el.querySelector('[data-sdiag-empty]'), null, 'empty state absent initially');

  // click a row → event-click detail
  let picked = null;
  el.addEventListener('event-click', (e) => { picked = e.detail; });
  el.querySelector('[data-sdiag-event="1"]').dispatchEvent(new window.CustomEvent('click', { bubbles: true }));
  assert.ok(picked && picked.no === 1, 'event-click detail');

  // typing in search filters the list inline (input event, list only re-renders)
  const input = el.querySelector('[data-sdiag-search]');
  let searched = null;
  el.addEventListener('search', (e) => { searched = e.detail; });
  input.focus();
  input.value = 'displayName';
  input.dispatchEvent(new window.CustomEvent('input', { bubbles: true }));
  assert.ok(searched && searched.query === 'displayName', 'search event detail');
  const remaining = Array.from(el.querySelectorAll('[data-sdiag-event]'));
  assert.equal(remaining.length, 1, 'only matching row remains');
  assert.ok(remaining[0].textContent.includes('displayName'), 'matched row content');
  assert.equal(window.document.activeElement, input, 'search keeps focus after inline re-render');

  // a query with no matches → empty state
  input.value = 'zzzz-no-match';
  input.dispatchEvent(new window.CustomEvent('input', { bubbles: true }));
  assert.ok(el.querySelector('[data-sdiag-empty]'), 'empty state shown');
});

test('vanilla HelpCenterHome — submit, topic toggle and article click', () => {
  const El = instantiate('HelpCenterHome.js', 'HelpCenterHomeElement');
  const el = new El();
  window.document.body.appendChild(el);

  assert.ok(el.querySelector('[data-helpct]'), 'root rendered');
  assert.ok(el.querySelector('[data-helpct-topic-btn="management"]'), 'topic row');
  assert.ok(el.querySelector('[data-helpct-article]'), 'expanded articles shown (default open)');

  let searched = null;
  el.addEventListener('search-submit', (e) => { searched = e.detail; });
  const form = el.querySelector('[data-helpct-form]');
  const input = el.querySelector('[data-helpct-input]');
  input.value = 'refund';
  form.dispatchEvent(new window.CustomEvent('submit', { bubbles: true, cancelable: true }));
  assert.ok(searched && searched.query === 'refund', 'search-submit detail');

  // collapse the open topic → articles disappear
  el.querySelector('[data-helpct-topic-btn="management"]').dispatchEvent(new window.CustomEvent('click', { bubbles: true }));
  assert.equal(el.querySelector('[data-helpct-article]'), null, 'articles collapsed');
  // expand again
  el.querySelector('[data-helpct-topic-btn="management"]').dispatchEvent(new window.CustomEvent('click', { bubbles: true }));
  assert.ok(el.querySelector('[data-helpct-article]'), 'articles re-expanded');

  // click an article
  let article = null;
  el.addEventListener('article-click', (e) => { article = e.detail; });
  el.querySelector('[data-helpct-article]').dispatchEvent(new window.CustomEvent('click', { bubbles: true }));
  assert.ok(article && typeof article.article === 'string' && article.article.length > 0, 'article-click detail');
});

test('vanilla AccountSecurityPanel — tab switch, edit password, remove session', () => {
  const El = instantiate('AccountSecurityPanel.js', 'AccountSecurityPanelElement');
  const el = new El();
  window.document.body.appendChild(el);

  assert.ok(el.querySelector('[data-acctsec]'), 'root rendered');
  assert.ok(el.querySelector('[data-acctsec-panel]'), 'security panel by default');
  assert.ok(el.querySelector('[data-acctsec-session="s1"]'), 'session row');

  let tabEvt = null;
  el.addEventListener('tab-click', (e) => { tabEvt = e.detail; });
  el.querySelector('[data-acctsec-tab="Billing"]').dispatchEvent(new window.CustomEvent('click', { bubbles: true }));
  assert.ok(tabEvt && tabEvt.tab === 'Billing', 'tab-click detail');
  assert.ok(el.querySelector('[data-acctsec-placeholder]'), 'non-security placeholder shown');
  assert.equal(el.querySelector('[data-acctsec-panel]'), null, 'security panel hidden');

  // back to Security
  el.querySelector('[data-acctsec-tab="Security"]').dispatchEvent(new window.CustomEvent('click', { bubbles: true }));
  assert.ok(el.querySelector('[data-acctsec-panel]'), 'security panel back');

  let edited = false;
  el.addEventListener('edit-password', () => { edited = true; });
  el.querySelector('[data-acctsec-edit-password]').dispatchEvent(new window.CustomEvent('click', { bubbles: true }));
  assert.ok(edited, 'edit-password fired');

  let removed = null;
  el.addEventListener('remove-session', (e) => { removed = e.detail; });
  el.querySelector('[data-acctsec-remove="s2"]').dispatchEvent(new window.CustomEvent('click', { bubbles: true }));
  assert.ok(removed && removed.id === 's2', 'remove-session detail');
});

test('vanilla MasonryDensityControls — sliders sync grid live, item click and close', () => {
  const El = instantiate('MasonryDensityControls.js', 'MasonryDensityControlsElement');
  const el = new El();
  window.document.body.appendChild(el);

  assert.ok(el.querySelector('[data-masn]'), 'root rendered');
  assert.ok(el.querySelector('[data-masn-controls]'), 'control bar');
  const meta = el.querySelector('[data-masn-meta]');
  assert.ok(meta.textContent.includes('4 cols · 12px'), 'initial meta');
  const grid = el.querySelector('[data-masn-grid]');
  assert.ok(el.querySelector('[data-masn-item="m1"]'), 'masonry item');
  assert.equal(grid.style.columnCount, '4', 'initial column count');

  // size slider input → grid + meta update live
  const sizeSlider = el.querySelector('[data-masn-size]');
  sizeSlider.value = '6';
  sizeSlider.dispatchEvent(new window.CustomEvent('input', { bubbles: true }));
  assert.equal(grid.style.columnCount, '6', 'columnCount updated');
  assert.ok(el.querySelector('[data-masn-meta]').textContent.includes('6 cols'), 'meta updated');

  // padding slider input → gap updates
  const padSlider = el.querySelector('[data-masn-padding]');
  padSlider.value = '24';
  padSlider.dispatchEvent(new window.CustomEvent('input', { bubbles: true }));
  assert.equal(grid.style.columnGap, '24px', 'columnGap updated');
  assert.ok(el.querySelector('[data-masn-item="m1"]').style.marginBottom === '24px', 'item margin updated');

  // item click
  let item = null;
  el.addEventListener('item-click', (e) => { item = e.detail; });
  el.querySelector('[data-masn-item="m3"]').dispatchEvent(new window.CustomEvent('click', { bubbles: true }));
  assert.ok(item && item.id === 'm3', 'item-click detail');

  // close → empty render
  let closed = false;
  el.addEventListener('close', () => { closed = true; });
  el.querySelector('[data-masn-close]').dispatchEvent(new window.CustomEvent('click', { bubbles: true }));
  assert.ok(closed, 'close fired');
  assert.equal(el.innerHTML, '', 'gallery emptied after close');
});
