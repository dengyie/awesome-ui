/**
 * jsdom tests for the v2.3.0 vanilla components
 * (ApiReferenceViewer, WeekCalendarGrid, VideoProjectSettings, EventStreamPanel).
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

test('vanilla ApiReferenceViewer — params, responses and language switch', () => {
  const El = instantiate('ApiReferenceViewer.js', 'ApiReferenceViewerElement');
  const el = new El();
  el.setAttribute('title', 'List all charges');
  el.setAttribute(
    'params',
    JSON.stringify([{ name: 'limit', type: 'integer', required: false, description: 'Max items' }])
  );
  window.document.body.appendChild(el);

  assert.ok(el.querySelector('[data-api-viewer]'), 'root rendered');
  assert.ok(el.querySelector('[data-api-definition]'), 'definition card');
  assert.ok(el.querySelector('[data-api-title]').textContent.includes('List all charges'), 'title');
  assert.ok(el.querySelector('[data-api-method]').textContent.includes('GET'), 'method badge');
  assert.ok(el.querySelector('[data-api-endpoint]').textContent.includes('petstore.example.com'), 'endpoint');
  assert.ok(el.querySelector('[data-api-param="limit"]'), 'param hook');
  assert.ok(el.querySelector('[data-api-params]').textContent.includes('optional'), 'optional label');
  assert.ok(el.querySelector('[data-api-response="200"]'), '200 response');
  assert.ok(el.querySelector('[data-api-response="404"]'), '404 response');
  assert.ok(el.querySelector('[data-api-response-toggle]'), 'response toggle');
  assert.ok(el.querySelector('[data-api-response-schema]'), 'schema row (200 open by default)');
  assert.ok(el.querySelector('[data-api-code-panel]'), 'code panel');
  assert.ok(el.querySelector('[data-api-code-path]').textContent.includes('/pets'), 'code path');
  assert.ok(el.querySelector('[data-api-language-select]'), 'language select');
  assert.ok(el.querySelector('[data-api-sample]').textContent.includes('curl'), 'sample');
  assert.ok(el.querySelector('[data-api-test]').textContent.includes('Test it'), 'test button');
  assert.ok(el.querySelector('[data-api-json]').textContent.includes('Fluffy'), 'json body');

  // collapse 200 then reopen — schema row disappears / reappears
  el.querySelector('[data-api-response="200"] [data-api-response-toggle]').dispatchEvent(new window.CustomEvent('click', { bubbles: true }));
  assert.equal(el.querySelectorAll('[data-api-response-schema]').length, 0, 'schema hidden after collapse');
  el.querySelector('[data-api-response="200"] [data-api-response-toggle]').dispatchEvent(new window.CustomEvent('click', { bubbles: true }));
  assert.equal(el.querySelectorAll('[data-api-response-schema]').length, 1, 'schema shown after reopen');

  // param click fires param-click
  let picked = null;
  el.addEventListener('param-click', (e) => { picked = e.detail; });
  el.querySelector('[data-api-param="limit"]').dispatchEvent(new window.CustomEvent('click', { bubbles: true }));
  assert.ok(picked && picked.param.name === 'limit', 'param-click detail');

  // language switch fires language-change and updates sample
  let langChanged = null;
  el.addEventListener('language-change', (e) => { langChanged = e.detail; });
  const select = el.querySelector('[data-api-language-select]');
  select.value = 'js';
  select.dispatchEvent(new window.CustomEvent('change', { bubbles: true }));
  assert.ok(langChanged && langChanged.language.label === 'JS', 'language-change detail');
  assert.ok(el.querySelector('[data-api-sample]').textContent.includes('fetch'), 'sample updated');
});

test('vanilla WeekCalendarGrid — view toggle, events and now line', () => {
  const El = instantiate('WeekCalendarGrid.js', 'WeekCalendarGridElement');
  const el = new El();
  el.setAttribute(
    'events',
    JSON.stringify([{ id: 'x1', dayId: 'mon', title: 'Standup', start: 9, end: 10, tone: 'solid', color: 'green' }])
  );
  window.document.body.appendChild(el);

  assert.ok(el.querySelector('[data-week-grid]'), 'root rendered');
  assert.ok(el.querySelector('[data-week-toolbar]'), 'toolbar');
  assert.ok(el.querySelector('[data-week-view="day"]'), 'day toggle');
  assert.ok(el.querySelector('[data-week-view="week"]'), 'week toggle');
  assert.ok(el.querySelector('[data-week-timezone]').textContent.includes('GMT+7'), 'timezone');
  assert.ok(el.querySelector('[data-week-find-time]').textContent.includes('Find time'), 'find time');
  assert.ok(el.querySelector('[data-week-composer]'), 'composer');
  assert.ok(el.querySelector('[data-week-day="mon"]'), 'day header');
  assert.ok(el.querySelector('[data-week-day="fri"]'), 'all five days');
  assert.ok(el.querySelector('[data-week-gutter]'), 'gutter');
  assert.ok(el.querySelector('[data-week-column="mon"]'), 'column');
  assert.ok(el.querySelector('[data-week-event="x1"]').textContent.includes('Standup'), 'event block');
  assert.ok(el.querySelector('[data-week-now]'), 'current-time line');

  // event click fires event-click
  let picked = null;
  el.addEventListener('event-click', (e) => { picked = e.detail; });
  el.querySelector('[data-week-event="x1"]').dispatchEvent(new window.CustomEvent('click', { bubbles: true }));
  assert.ok(picked && picked.event.id === 'x1', 'event-click detail');

  // view switch to day renders only active day
  let viewed = null;
  el.addEventListener('view-change', (e) => { viewed = e.detail; });
  el.querySelector('[data-week-view="day"]').dispatchEvent(new window.CustomEvent('click', { bubbles: true }));
  assert.ok(viewed && viewed.view === 'day', 'view-change detail');
  assert.ok(el.querySelector('[data-week-day="mon"]'), 'active day kept');
  assert.equal(el.querySelectorAll('[data-week-day="tue"]').length, 0, 'other days hidden in day view');

  // composer Enter fires compose-submit
  let composed = null;
  el.addEventListener('compose-submit', (e) => { composed = e.detail; });
  const composer = el.querySelector('[data-week-composer]');
  composer.value = 'Lunch with Alex';
  composer.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
  assert.ok(composed && composed.text === 'Lunch with Alex', 'compose-submit detail');
});

test('vanilla VideoProjectSettings — chapters, thumbnails and inputs', () => {
  const El = instantiate('VideoProjectSettings.js', 'VideoProjectSettingsElement');
  const el = new El();
  el.setAttribute('chapters', JSON.stringify([{ id: 'c1', label: 'Intro', timestamp: '0:00' }]));
  window.document.body.appendChild(el);

  assert.ok(el.querySelector('[data-video-settings]'), 'root rendered');
  assert.ok(el.querySelector('[data-video-chapters]'), 'chapters panel');
  assert.ok(el.querySelector('[data-video-back]'), 'back button');
  assert.ok(el.querySelector('[data-video-close]'), 'close button');
  assert.ok(el.querySelector('[data-video-chapter="c1"]').textContent.includes('Intro'), 'chapter item');
  assert.ok(el.querySelector('[data-video-add-chapter]').textContent.includes('Add a chapter'), 'add chapter');
  assert.ok(el.querySelector('[data-video-title-input]'), 'title input');
  assert.ok(el.querySelector('[data-video-description-input]'), 'description textarea');
  assert.ok(el.querySelector('[data-video-thumbnails]'), 'thumbnail row');
  assert.ok(el.querySelector('[data-video-thumbnail-add]'), 'thumbnail add');
  assert.ok(el.querySelector('[data-video-thumbnail="t1"]'), 'first thumbnail');
  assert.ok(el.querySelector('[data-video-thumbnail="t2"]'), 'second thumbnail');
  assert.ok(el.querySelector('[data-video-storage-badge]').textContent.includes('31MB'), 'storage badge');

  // thumbnail select fires thumbnail-select and re-styles selected
  let picked = null;
  el.addEventListener('thumbnail-select', (e) => { picked = e.detail; });
  el.querySelector('[data-video-thumbnail="t2"]').dispatchEvent(new window.CustomEvent('click', { bubbles: true }));
  assert.ok(picked && picked.thumbnail.id === 't2', 'thumbnail-select detail');
  assert.ok(el.querySelector('[data-video-thumbnail="t2"]').className.includes('ring-2'), 'selected ring');

  // add chapter fires add-chapter
  let added = false;
  el.addEventListener('add-chapter', () => { added = true; });
  el.querySelector('[data-video-add-chapter]').dispatchEvent(new window.CustomEvent('click', { bubbles: true }));
  assert.ok(added, 'add-chapter event');

  // title input fires title-change
  let titled = null;
  el.addEventListener('title-change', (e) => { titled = e.detail; });
  const title = el.querySelector('[data-video-title-input]');
  title.value = 'My launch video';
  title.dispatchEvent(new window.CustomEvent('input', { bubbles: true }));
  assert.ok(titled && titled.value === 'My launch video', 'title-change detail');
});

test('vanilla EventStreamPanel — filter, select and view-event', () => {
  const El = instantiate('EventStreamPanel.js', 'EventStreamPanelElement');
  const el = new El();
  window.document.body.appendChild(el);

  assert.ok(el.querySelector('[data-stream-panel]'), 'root rendered');
  assert.ok(el.querySelector('[data-stream-list]'), 'list card');
  assert.ok(el.querySelector('[data-stream-filter]'), 'filter input');
  assert.ok(el.querySelector('[data-stream-columns]').textContent.includes('Event'), 'column header');
  assert.equal(el.querySelectorAll('[data-stream-event]').length, 5, 'five default events');
  assert.ok(el.querySelector('[data-stream-event="ev1"]').textContent.includes('user.updated'), 'first event name');
  assert.ok(el.querySelector('[data-stream-metadata-title]').textContent.includes('Metadata'), 'metadata title');
  assert.ok(el.querySelector('[data-stream-metadata]').textContent.includes('Sama Lee'), 'metadata value');
  assert.ok(el.querySelector('[data-stream-view-event]').textContent.includes('View event'), 'view button');
  assert.ok(el.querySelector('[data-stream-details-title]').textContent.includes('Event Details'), 'details title');
  assert.ok(el.querySelector('[data-stream-json-lines]').textContent.includes('1'), 'line numbers');
  assert.ok(el.querySelector('[data-stream-pager]').textContent.includes('Previous'), 'pager');

  // event select fires event-select and activates row
  let selected = null;
  el.addEventListener('event-select', (e) => { selected = e.detail; });
  el.querySelector('[data-stream-event="ev3"]').dispatchEvent(new window.CustomEvent('click', { bubbles: true }));
  assert.ok(selected && selected.event.id === 'ev3', 'event-select detail');
  assert.ok(el.querySelector('[data-stream-event="ev3"]').className.includes('bg-zinc-50'), 'active row styled');

  // filter narrows list
  const filter = el.querySelector('[data-stream-filter]');
  filter.value = 'session';
  filter.dispatchEvent(new window.CustomEvent('input', { bubbles: true }));
  assert.equal(el.querySelectorAll('[data-stream-event]').length, 1, 'filtered to one row');
  const filter2 = el.querySelector('[data-stream-filter]');
  filter2.value = 'zzz-nothing';
  filter2.dispatchEvent(new window.CustomEvent('input', { bubbles: true }));
  assert.ok(el.querySelector('[data-stream-items]').textContent.includes('No events match'), 'empty state');

  // view event fires view-event
  el.querySelector('[data-stream-filter]').value = '';
  el.querySelector('[data-stream-filter]').dispatchEvent(new window.CustomEvent('input', { bubbles: true }));
  let viewed = null;
  el.addEventListener('view-event', (e) => { viewed = e.detail; });
  el.querySelector('[data-stream-view-event]').dispatchEvent(new window.CustomEvent('click', { bubbles: true }));
  assert.ok(viewed && viewed.event.id, 'view-event detail');
});
