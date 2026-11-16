/**
 * v2.4.0 — Vue regression tests
 * Compiles each SFC with @vue/compiler-sfc (+ TypeScript transpile),
 * evaluates the real component and SSR-renders it through
 * @vue/server-renderer, checking structure markers.
 * Interactive behavior is covered by the vanilla jsdom suite.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { parse, compileScript, compileTemplate } from '@vue/compiler-sfc';
import { renderToString } from '@vue/server-renderer';
import ts from 'typescript';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const require = createRequire(import.meta.url);
const vueModule = require('vue');

const renderSfc = async (file, props) => {
  const source = readFileSync(join(root, 'vue', file), 'utf8');
  const { descriptor, errors } = parse(source, { filename: file });
  assert.equal(errors.length, 0, `SFC parse errors in ${file}`);
  const script = compileScript(descriptor, { id: 'n51' });
  const template = compileTemplate({
    id: 'n51',
    filename: file,
    source: descriptor.template.content,
    compilerOptions: { bindingMetadata: script.bindings },
  });
  assert.equal(template.errors.length, 0, `template errors in ${file}`);

  // Transpile the compiled script (ESM w/ vue import + TS types) to CJS,
  // then evaluate it with `vue` and the render fn provided.
  const cjs = ts.transpileModule(script.content, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText
    // script-setup re-exports types (type-only) — strip leftover ESM exports
    .replace(/^export\s+\{[^}]*\};?\s*$/gm, '');
  const templateCode = template.code
    .replace(/^import\s*{([^}]*)}\s*from\s*["']vue["'];?/m, (_, bindings) => {
      const destructuring = bindings.replace(/\s*(\w+)\s+as\s+(\w+)\s*/g, ' $1: $2 ');
      return `const {${destructuring}} = vueMod;`;
    })
    .replace(/^export function render\(/m, 'function render(');

  const factory = new Function('vueMod', 'exports', 'requireShim', `
    const require = (name) => (name === 'vue' ? vueMod : requireShim(name));
    ${cjs}
    ${templateCode}
    return { default: exports.default, render };
  `);
  const exportsShim = {};
  const { default: component, render } = factory(vueModule, exportsShim, require);
  component.render = render;

  const app = vueModule.createSSRApp(component, props);
  return renderToString(app);
};

test('vue SSR — ProjectGanttTimeline header, rows and today marker', async () => {
  const html = await renderSfc('ProjectGanttTimeline.vue', {
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
  assert.ok(html.includes('data-gantt-today-pill'), 'today pill');
  assert.ok(html.includes('data-gantt-today-line'), 'today line');
  assert.ok(html.includes('data-gantt-rows'), 'rows hook');
  assert.ok(html.includes('data-gantt-project="p1"'), 'project row');
  assert.ok(html.includes('AI UX Research Assistant'), 'project name');
  assert.ok(html.includes('Planning'), 'status pill');
  assert.ok(html.includes('34 pts'), 'points');
  assert.ok(html.includes('bg-violet-200'), 'violet bar tone');

  const defaults = await renderSfc('ProjectGanttTimeline.vue', {});
  assert.ok(defaults.includes('JAN 2026'), 'default month label');
  assert.ok(defaults.includes('E-commerce Platform Launch'), 'default project name');
});

test('vue SSR — GroupedTaskList sections, rows and detail pane', async () => {
  const html = await renderSfc('GroupedTaskList.vue', {
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
  assert.ok(html.includes('data-tasklist-section="todo"'), 'section hook');
  assert.ok(html.includes('data-tasklist-section-toggle="todo"'), 'section toggle');
  assert.ok(html.includes('data-tasklist-task="t1"'), 'task row');
  assert.ok(html.includes('Prepare Demo Materials'), 'task title');
  assert.ok(html.includes('Jan 2, 2026'), 'due date');
  assert.ok(html.includes('bg-amber-400'), 'assignee avatar');
  assert.ok(html.includes('data-tasklist-detail'), 'detail hook');
  assert.ok(html.includes('Define Product Demo Goal'), 'default detail title');
  assert.ok(html.includes('data-tasklist-project-chip'), 'project chip');
  assert.ok(html.includes('Estimated time'), 'fields grid');
  assert.ok(html.includes('bg-red-100'), 'rose tone');
  assert.ok(html.includes('documentation'), 'tags');
  assert.ok(html.includes('data-tasklist-comment-input'), 'comment input');

  const defaults = await renderSfc('GroupedTaskList.vue', {});
  assert.ok(defaults.includes('To Do'), 'default section');
  assert.ok(defaults.includes('Create a Template for Demo Script'), 'default done task');
});

test('vue SSR — EventLogTable filters, columns and muted rows', async () => {
  const html = await renderSfc('EventLogTable.vue', {
    title: 'Audit log',
    entries: [
      { id: 'l1', type: 'User', date: 'Sep 11, 2024', time: '11:08 AM', source: 'Jane Smith', role: 'Admin', action: 'Login', targets: 'Auth', details: 'Login via Google.' },
      { id: 'l2', type: 'User', date: 'Sep 4, 2024', time: '5:06 PM', source: 'Alexia Smith', role: 'Viewer', action: 'Export', targets: 'Report', details: 'Exported.', muted: true },
    ],
  });
  assert.ok(html.includes('data-eventlog'), 'root hook');
  assert.ok(html.includes('Audit log'), 'custom title');
  assert.ok(html.includes('data-eventlog-filters'), 'filters hook');
  assert.ok(html.includes('data-eventlog-filter="Type"'), 'type filter');
  assert.ok(html.includes('data-eventlog-daterange'), 'date range button');
  assert.ok(html.includes('data-eventlog-export'), 'export button');
  assert.ok(html.includes('data-eventlog-table'), 'table hook');
  assert.ok(html.includes('data-eventlog-columns'), 'columns hook');
  assert.ok(html.includes('data-eventlog-entry="l1"'), 'entry row');
  assert.ok(html.includes('Jane Smith'), 'source');
  assert.ok(html.includes('data-eventlog-muted="true"'), 'muted flag');

  const defaults = await renderSfc('EventLogTable.vue', {});
  assert.ok(defaults.includes('Event log'), 'default title');
  assert.ok(defaults.includes('Send personnel reminder'), 'default action');
});

test('vue SSR — DocsPageLayout nav, article blocks and TOC', async () => {
  const html = await renderSfc('DocsPageLayout.vue', {
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
  assert.ok(html.includes('data-docspage-group="Getting Started"'), 'nav group');
  assert.ok(html.includes('data-docspage-article'), 'article hook');
  assert.ok(html.includes('Getting Started'), 'custom title');
  assert.ok(html.includes('data-docspage-copy'), 'copy button');
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
  assert.ok(html.includes('data-docspage-tocitem="setup"'), 'toc item');
  assert.ok(html.includes('data-docspage-toc-active="true"'), 'active toc');

  const defaults = await renderSfc('DocsPageLayout.vue', {});
  assert.ok(defaults.includes('Quickstart'), 'default title');
  assert.ok(defaults.includes('npx mintlify init'), 'default code');
});
