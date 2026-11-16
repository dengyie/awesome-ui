/**
 * v2.4.0 — React regression tests
 * Compiles each TSX with the TypeScript compiler, evaluates the real
 * component and SSR-renders it through react-dom/server, checking
 * structure markers. Interactive behavior is covered by the vanilla suite.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';
import ts from 'typescript';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const require = createRequire(import.meta.url);
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');

const cacheDir = join(here, 'node_modules', '.cache-components');
mkdirSync(cacheDir, { recursive: true });

const renderTsx = async (file, props) => {
  const source = require('fs').readFileSync(join(root, 'react', file), 'utf8');
  const out = ts.transpileModule(source, {
    compilerOptions: {
      jsx: ts.JsxEmit.React,
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2020,
    },
    fileName: file,
  }).outputText;
  const cacheFile = join(cacheDir, file.replace(/\.tsx$/, '.n51.mjs'));
  writeFileSync(cacheFile, out);
  const mod = await import(pathToFileURL(cacheFile).href);
  const h = React.createElement;
  return renderToStaticMarkup(h(mod.default, props));
};

test('react SSR — ProjectGanttTimeline header, rows and today marker', async () => {
  const html = await renderTsx('ProjectGanttTimeline.tsx', {
    months: [
      { label: 'AUG', weeks: 4 },
      { label: 'SEP', weeks: 5 },
    ],
    projects: [
      { id: 'p1', emoji: '🎧', name: 'AI UX Research Assistant', status: 'Planning', points: 34, start: 0, end: 1.5, tone: 'violet' },
    ],
    todayMonth: 0,
    todayFraction: 0.5,
  });
  assert.ok(html.includes('data-gantt'), 'root hook');
  assert.ok(html.includes('data-gantt-header'), 'header hook');
  assert.ok(html.includes('AUG'), 'first month');
  assert.ok(html.includes('SEP'), 'second month');
  assert.ok(html.includes('data-gantt-today-pill'), 'today pill');
  assert.ok(html.includes('Today'), 'today label');
  assert.ok(html.includes('data-gantt-today-line'), 'today line');
  assert.ok(html.includes('bg-red-500'), 'red today accent');
  assert.ok(html.includes('data-gantt-rows'), 'rows hook');
  assert.ok(html.includes('data-gantt-project="p1"'), 'project row');
  assert.ok(html.includes('data-gantt-label'), 'label block');
  assert.ok(html.includes('AI UX Research Assistant'), 'project name');
  assert.ok(html.includes('Planning'), 'status pill');
  assert.ok(html.includes('34 pts'), 'points');
  assert.ok(html.includes('data-gantt-bar'), 'bar hook');
  assert.ok(html.includes('bg-violet-200'), 'violet bar tone');

  const defaults = await renderTsx('ProjectGanttTimeline.tsx', {});
  assert.ok(defaults.includes('JAN 2026'), 'default month label');
  assert.ok(defaults.includes('data-gantt-project="p4"'), 'default project 4');
  assert.ok(defaults.includes('E-commerce Platform Launch'), 'default project name');
  assert.ok(defaults.includes('90 pts'), 'default points');
});

test('react SSR — GroupedTaskList sections, rows and detail pane', async () => {
  const html = await renderTsx('GroupedTaskList.tsx', {
    sections: [
      {
        id: 'todo',
        label: 'To Do',
        tasks: [{ id: 't1', title: 'Prepare Demo Materials', due: 'Jan 2, 2026', done: false, likes: 1, comments: 2, subtasks: 1, assignee: 'JM' }],
      },
    ],
  });
  assert.ok(html.includes('data-tasklist'), 'root hook');
  assert.ok(html.includes('data-tasklist-list'), 'list hook');
  assert.ok(html.includes('data-tasklist-toolbar'), 'toolbar hook');
  assert.ok(html.includes('Add task'), 'add task button');
  assert.ok(html.includes('data-tasklist-name-header'), 'name header');
  assert.ok(html.includes('data-tasklist-section="todo"'), 'section hook');
  assert.ok(html.includes('data-tasklist-section-toggle="todo"'), 'section toggle');
  assert.ok(html.includes('data-tasklist-items'), 'items list');
  assert.ok(html.includes('data-tasklist-task="t1"'), 'task row');
  assert.ok(html.includes('Prepare Demo Materials'), 'task title');
  assert.ok(html.includes('👍'), 'likes icon');
  assert.ok(html.includes('💬'), 'comments icon');
  assert.ok(html.includes('⑂'), 'subtasks icon');
  assert.ok(html.includes('Jan 2, 2026'), 'due date');
  assert.ok(html.includes('bg-amber-400'), 'assignee avatar');
  assert.ok(html.includes('data-tasklist-add-inline'), 'inline add row');
  assert.ok(html.includes('data-tasklist-detail'), 'detail hook');
  assert.ok(html.includes('data-tasklist-completed'), 'completed badge');
  assert.ok(html.includes('Define Product Demo Goal'), 'default detail title');
  assert.ok(html.includes('data-tasklist-project-chip'), 'project chip');
  assert.ok(html.includes('Estimated time'), 'fields grid');
  assert.ok(html.includes('3h 45m'), 'field value');
  assert.ok(html.includes('Priority'), 'priority row');
  assert.ok(html.includes('bg-red-100'), 'rose tone');
  assert.ok(html.includes('documentation'), 'tags');
  assert.ok(html.includes('data-tasklist-comment-input'), 'comment input');
});

test('react SSR — EventLogTable filters, columns and muted rows', async () => {
  const html = await renderTsx('EventLogTable.tsx', {
    title: 'Audit log',
    entries: [
      { id: 'l1', type: 'User', date: 'Sep 11, 2024', time: '11:08 AM', source: 'Jane Smith', role: 'Admin', action: 'Login', targets: 'Auth', details: 'Login via Google.' },
      { id: 'l2', type: 'User', date: 'Sep 4, 2024', time: '5:06 PM', source: 'Alexia Smith', role: 'Viewer', action: 'Export', targets: 'Report', details: 'Exported.', muted: true },
    ],
  });
  assert.ok(html.includes('data-eventlog'), 'root hook');
  assert.ok(html.includes('Audit log'), 'custom title');
  assert.ok(html.includes('data-eventlog-description'), 'description hook');
  assert.ok(html.includes('data-eventlog-filters'), 'filters hook');
  assert.ok(html.includes('data-eventlog-filter="Type"'), 'type filter');
  assert.ok(html.includes('data-eventlog-filter="Target"'), 'target filter');
  assert.ok(html.includes('data-eventlog-daterange'), 'date range button');
  assert.ok(html.includes('Select date range'), 'date range label');
  assert.ok(html.includes('data-eventlog-export'), 'export button');
  assert.ok(html.includes('Export CSV'), 'export label');
  assert.ok(html.includes('data-eventlog-table'), 'table hook');
  assert.ok(html.includes('data-eventlog-columns'), 'columns hook');
  assert.ok(html.includes('data-eventlog-entry="l1"'), 'entry row');
  assert.ok(html.includes('Jane Smith'), 'source');
  assert.ok(html.includes('data-eventlog-entry="l2"'), 'muted entry');
  assert.ok(html.includes('data-eventlog-muted="true"'), 'muted flag');

  const defaults = await renderTsx('EventLogTable.tsx', {});
  assert.ok(defaults.includes('Event log'), 'default title');
  assert.ok(defaults.includes('Send personnel reminder'), 'default action');
  assert.ok(defaults.includes('View-only Admin'), 'default role');
});

test('react SSR — DocsPageLayout nav, article blocks and TOC', async () => {
  const html = await renderTsx('DocsPageLayout.tsx', {
    title: 'Getting Started',
    blocks: [
      { type: 'paragraph', text: 'Welcome to the docs.' },
      { type: 'callout', tone: 'warning', title: 'Heads up', text: 'Breaking change ahead.' },
      { type: 'heading', text: 'Setup', anchor: 'setup' },
      { type: 'code', example: { filename: 'Terminal', language: 'bash', code: 'npm install' } },
      { type: 'cards', cards: [{ title: 'Quickstart', description: 'Run in minutes.', icon: '🚀' }] },
    ],
    toc: [{ id: 'setup', label: 'Setup' }],
    activeTocId: 'setup',
  });
  assert.ok(html.includes('data-docspage'), 'root hook');
  assert.ok(html.includes('data-docspage-nav'), 'nav hook');
  assert.ok(html.includes('data-docspage-toplink="documentation"'), 'top link');
  assert.ok(html.includes('Documentation'), 'top link label');
  assert.ok(html.includes('data-docspage-group="Getting Started"'), 'nav group');
  assert.ok(html.includes('data-docspage-navitem="quickstart"'), 'nav item');
  assert.ok(html.includes('Start here'), 'nav badge');
  assert.ok(html.includes('data-docspage-article'), 'article hook');
  assert.ok(html.includes('Getting Started'), 'custom title');
  assert.ok(html.includes('data-docspage-copy'), 'copy button');
  assert.ok(html.includes('Copy page'), 'copy label');
  assert.ok(html.includes('data-docspage-content'), 'content hook');
  assert.ok(html.includes('Welcome to the docs.'), 'paragraph');
  assert.ok(html.includes('data-docspage-callout'), 'callout');
  assert.ok(html.includes('bg-amber-50'), 'warning tone');
  assert.ok(html.includes('data-docspage-heading="setup"'), 'heading anchor');
  assert.ok(html.includes('data-docspage-code'), 'code block');
  assert.ok(html.includes('npm install'), 'code content');
  assert.ok(html.includes('data-docspage-cards'), 'cards grid');
  assert.ok(html.includes('data-docspage-card="Quickstart"'), 'card');
  assert.ok(html.includes('data-docspage-toc'), 'toc hook');
  assert.ok(html.includes('On this page'), 'toc title');
  assert.ok(html.includes('data-docspage-tocitem="setup"'), 'toc item');
  assert.ok(html.includes('data-docspage-toc-active="true"'), 'active toc');

  const defaults = await renderTsx('DocsPageLayout.tsx', {});
  assert.ok(defaults.includes('Quickstart'), 'default title');
  assert.ok(defaults.includes('npx mintlify init'), 'default code');
});
