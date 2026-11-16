/**
 * jsdom tests for the v2.4.0 vanilla components
 * (ProjectGanttTimeline, GroupedTaskList, EventLogTable, DocsPageLayout).
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

test('vanilla ProjectGanttTimeline — header, rows and project-click', () => {
  const El = instantiate('ProjectGanttTimeline.js', 'ProjectGanttTimelineElement');
  const el = new El();
  el.setAttribute(
    'projects',
    JSON.stringify([
      { id: 'p1', emoji: '🎧', name: 'AI UX Research Assistant', status: 'Planning', points: 34, start: 0, end: 1.5, tone: 'violet' },
    ])
  );
  window.document.body.appendChild(el);

  assert.ok(el.querySelector('[data-gantt]'), 'root rendered');
  assert.ok(el.querySelector('[data-gantt-header]'), 'header');
  assert.ok(el.querySelector('[data-gantt-today-pill]').textContent.includes('Today'), 'today pill');
  assert.ok(el.querySelector('[data-gantt-today-line]'), 'today line');
  assert.ok(el.querySelector('[data-gantt-project="p1"]'), 'project row');
  assert.ok(el.querySelector('[data-gantt-label]').textContent.includes('AI UX Research Assistant'), 'label');
  assert.ok(el.querySelector('[data-gantt-label]').textContent.includes('Planning'), 'status pill');
  assert.ok(el.querySelector('[data-gantt-label]').textContent.includes('34 pts'), 'points');
  assert.ok(el.querySelector('[data-gantt-bar]'), 'bar area');

  // today month attribute re-renders
  el.setAttribute('today-month', '1');
  assert.ok(el.querySelector('[data-gantt-today-pill]'), 'pill after re-render');

  // project click fires project-click with detail
  let picked = null;
  el.addEventListener('project-click', (e) => { picked = e.detail; });
  el.querySelector('[data-gantt-project="p1"]').dispatchEvent(new window.CustomEvent('click', { bubbles: true }));
  assert.ok(picked && picked.project.id === 'p1' && picked.project.name === 'AI UX Research Assistant', 'project-click detail');
});

test('vanilla GroupedTaskList — sections, detail and events', () => {
  const El = instantiate('GroupedTaskList.js', 'GroupedTaskListElement');
  const el = new El();
  window.document.body.appendChild(el);

  assert.ok(el.querySelector('[data-tasklist]'), 'root rendered');
  assert.ok(el.querySelector('[data-tasklist-list]'), 'list pane');
  assert.ok(el.querySelector('[data-tasklist-toolbar]'), 'toolbar');
  assert.ok(el.querySelector('[data-tasklist-name-header]'), 'name header');
  assert.ok(el.querySelector('[data-tasklist-section="todo"]'), 'todo section');
  assert.ok(el.querySelector('[data-tasklist-section="done"]'), 'done section');
  assert.ok(el.querySelector('[data-tasklist-task="t4"]'), 'task row');
  assert.ok(el.querySelector('[data-tasklist-add-inline]'), 'inline add row');
  assert.ok(el.querySelector('[data-tasklist-detail]'), 'detail pane');
  assert.ok(el.querySelector('[data-tasklist-completed]').textContent.includes('Completed'), 'completed badge');
  assert.ok(el.querySelector('[data-tasklist-title]').textContent.includes('Define Product Demo Goal'), 'detail title');
  assert.ok(el.querySelector('[data-tasklist-project-chip]'), 'project chip');
  assert.ok(el.querySelector('[data-tasklist-fields]').textContent.includes('Estimated time'), 'fields');
  assert.ok(el.querySelector('[data-tasklist-fields]').textContent.includes('High'), 'priority value');
  assert.ok(el.querySelector('[data-tasklist-fields]').textContent.includes('documentation'), 'tags');
  assert.ok(el.querySelector('[data-tasklist-comment-input]'), 'comment input');

  // section toggle collapses items and fires event
  let toggled = null;
  el.addEventListener('section-toggle', (e) => { toggled = e.detail; });
  el.querySelector('[data-tasklist-section-toggle="todo"]').dispatchEvent(new window.CustomEvent('click', { bubbles: true }));
  assert.equal(el.querySelectorAll('[data-tasklist-section="todo"] [data-tasklist-task]').length, 0, 'items collapsed');
  assert.ok(toggled && toggled.sectionId === 'todo' && toggled.open === false, 'section-toggle detail');

  // re-open
  const toggle2 = el.querySelector('[data-tasklist-section-toggle="todo"]');
  toggle2.dispatchEvent(new window.CustomEvent('click', { bubbles: true }));
  assert.ok(el.querySelector('[data-tasklist-task="t1"]'), 'items restored');

  // task click fires task-click
  let task = null;
  el.addEventListener('task-click', (e) => { task = e.detail; });
  el.querySelector('[data-tasklist-task="t4"]').dispatchEvent(new window.CustomEvent('click', { bubbles: true }));
  assert.ok(task && task.task.id === 't4' && task.task.title === 'Define Product Demo Goal', 'task-click detail');

  // comment Enter submits and clears
  let comment = null;
  el.addEventListener('comment-submit', (e) => { comment = e.detail; });
  const input = el.querySelector('[data-tasklist-comment-input]');
  input.value = 'Looks good to me';
  input.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
  assert.ok(comment && comment.text === 'Looks good to me', 'comment-submit detail');
  assert.equal(el.querySelector('[data-tasklist-comment-input]').value, '', 'input cleared after submit');
});

test('vanilla EventLogTable — filters, rows, export and entry-click', () => {
  const El = instantiate('EventLogTable.js', 'EventLogTableElement');
  const el = new El();
  el.setAttribute('title', 'Audit log');
  el.setAttribute(
    'entries',
    JSON.stringify([
      { id: 'l1', type: 'User', date: 'Sep 11, 2024', time: '11:08 AM', source: 'Jane Smith', role: 'Admin', action: 'Login', targets: 'Auth', details: 'Login via Google.' },
      { id: 'l2', type: 'User', date: 'Sep 4, 2024', time: '5:06 PM', source: 'Alexia Smith', role: 'Viewer', action: 'Export', targets: 'Report', details: 'Exported.', muted: true },
    ])
  );
  window.document.body.appendChild(el);

  assert.ok(el.querySelector('[data-eventlog]'), 'root rendered');
  assert.ok(el.querySelector('[data-eventlog-title]').textContent.includes('Audit log'), 'custom title');
  assert.ok(el.querySelector('[data-eventlog-description]'), 'description');
  assert.ok(el.querySelector('[data-eventlog-filter="Type"]'), 'type filter');
  assert.ok(el.querySelector('[data-eventlog-filter="Target"]'), 'target filter');
  assert.ok(el.querySelector('[data-eventlog-daterange]').textContent.includes('Select date range'), 'date range');
  assert.ok(el.querySelector('[data-eventlog-export]').textContent.includes('Export CSV'), 'export button');
  assert.ok(el.querySelector('[data-eventlog-table]'), 'table');
  assert.ok(el.querySelector('[data-eventlog-columns]'), 'columns');
  assert.ok(el.querySelector('[data-eventlog-entry="l1"]'), 'entry row');
  assert.ok(el.querySelector('[data-eventlog-entry="l1"]').textContent.includes('Jane Smith'), 'source cell');
  assert.ok(el.querySelector('[data-eventlog-entry="l2"]').getAttribute('data-eventlog-muted') === 'true', 'muted flag');

  // filter click fires filter-select
  let filter = null;
  el.addEventListener('filter-select', (e) => { filter = e.detail; });
  el.querySelector('[data-eventlog-filter="Source"]').dispatchEvent(new window.CustomEvent('click', { bubbles: true }));
  assert.ok(filter && filter.filter === 'Source', 'filter-select detail');

  // entry click fires entry-click
  let entry = null;
  el.addEventListener('entry-click', (e) => { entry = e.detail; });
  el.querySelector('[data-eventlog-entry="l1"]').dispatchEvent(new window.CustomEvent('click', { bubbles: true }));
  assert.ok(entry && entry.entry.action === 'Login', 'entry-click detail');

  // export click fires export
  let exported = false;
  el.addEventListener('export', () => { exported = true; });
  el.querySelector('[data-eventlog-export]').dispatchEvent(new window.CustomEvent('click', { bubbles: true }));
  assert.ok(exported, 'export event');
});

test('vanilla DocsPageLayout — nav, blocks, TOC and copy', () => {
  const El = instantiate('DocsPageLayout.js', 'DocsPageLayoutElement');
  const el = new El();
  el.setAttribute('title', 'Getting Started');
  el.setAttribute(
    'blocks',
    JSON.stringify([
      { type: 'paragraph', text: 'Welcome to the docs.' },
      { type: 'callout', tone: 'warning', title: 'Heads up', text: 'Breaking change ahead.' },
      { type: 'heading', text: 'Setup', anchor: 'setup' },
      { type: 'code', example: { filename: 'Terminal', language: 'bash', code: 'npm install' } },
      { type: 'cards', cards: [{ title: 'Quickstart', description: 'Run in minutes.', icon: '🚀' }] },
    ])
  );
  el.setAttribute('toc', JSON.stringify([{ id: 'setup', label: 'Setup' }]));
  window.document.body.appendChild(el);

  assert.ok(el.querySelector('[data-docspage]'), 'root rendered');
  assert.ok(el.querySelector('[data-docspage-nav]'), 'nav pane');
  assert.ok(el.querySelector('[data-docspage-toplink="documentation"]'), 'top link');
  assert.ok(el.querySelector('[data-docspage-group="Getting Started"]'), 'nav group');
  assert.ok(el.querySelector('[data-docspage-navitem="quickstart"]'), 'nav item');
  assert.ok(el.querySelector('[data-docspage-navitem="quickstart"]').textContent.includes('Start here'), 'nav badge');
  assert.ok(el.querySelector('[data-docspage-article]'), 'article pane');
  assert.ok(el.querySelector('[data-docspage-title]').textContent.includes('Getting Started'), 'custom title');
  assert.ok(el.querySelector('[data-docspage-copy]'), 'copy button');
  assert.ok(el.querySelector('[data-docspage-content]').textContent.includes('Welcome to the docs.'), 'paragraph block');
  assert.ok(el.querySelector('[data-docspage-callout]'), 'callout block');
  assert.ok(el.querySelector('[data-docspage-heading="setup"]'), 'heading block');
  assert.ok(el.querySelector('[data-docspage-code]').textContent.includes('npm install'), 'code block');
  assert.ok(el.querySelector('[data-docspage-card="Quickstart"]'), 'card block');
  assert.ok(el.querySelector('[data-docspage-toc]'), 'toc pane');
  assert.ok(el.querySelector('[data-docspage-toc]').textContent.includes('On this page'), 'toc title');
  assert.ok(el.querySelector('[data-docspage-tocitem="setup"]'), 'toc item');

  // nav click fires nav-click with item detail
  let nav = null;
  el.addEventListener('nav-click', (e) => { nav = e.detail; });
  el.querySelector('[data-docspage-navitem="quickstart"]').dispatchEvent(new window.CustomEvent('click', { bubbles: true }));
  assert.ok(nav && nav.item.label === 'Quickstart', 'nav-click detail');

  // toc click updates active flag and fires toc-click
  let toc = null;
  el.addEventListener('toc-click', (e) => { toc = e.detail; });
  el.querySelector('[data-docspage-tocitem="setup"]').dispatchEvent(new window.CustomEvent('click', { bubbles: true }));
  assert.ok(toc && toc.item.id === 'setup', 'toc-click detail');
  assert.equal(el.querySelector('[data-docspage-tocitem="setup"]').getAttribute('data-docspage-toc-active'), 'true', 'active toc flag');

  // copy button flips label and fires copy-page
  let copied = false;
  el.addEventListener('copy-page', () => { copied = true; });
  el.querySelector('[data-docspage-copy]').dispatchEvent(new window.CustomEvent('click', { bubbles: true }));
  assert.ok(copied, 'copy-page event');
  assert.ok(el.querySelector('[data-docspage-copy]').textContent.includes('Copied'), 'copied label after click');
});
