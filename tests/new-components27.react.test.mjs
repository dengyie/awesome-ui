/**
 * SSR smoke tests for the v1.27.0 batch
 * (FilterQueryBuilder, ColumnVisibilityMenu, StatusCountTabs, EntityMultiSelectPicker, FederatedSearchResultsPanel).
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import ts from 'typescript';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const cacheDir = join(here, 'node_modules', '.cache-components');
mkdirSync(cacheDir, { recursive: true });

const transpile = (file) => {
  const source = readFileSync(join(root, 'react', file), 'utf8');
  return ts
    .transpileModule(source, {
      compilerOptions: {
        module: ts.ModuleKind.ESNext,
        jsx: ts.JsxEmit.React,
        target: ts.ScriptTarget.ES2020,
        esModuleInterop: true,
      },
    })
    .outputText.replace(/from ["']\.\/UiIcon["']/g, 'from "./UiIcon.mjs"')
    .replace(/import\s*{\s*([^}]*)\s*}\s*from\s*["']\.\/UiIcon\.mjs["'];/g, (match) =>
      match.replace(/type\s+/g, '')
    );
};

writeFileSync(join(cacheDir, 'UiIcon.mjs'), transpile('UiIcon.tsx'));

const load = async (file) => {
  const target = join(cacheDir, file.replace(/\.tsx$/, '.n27.mjs'));
  writeFileSync(target, transpile(file));
  return import(pathToFileURL(target).href);
};

const h = React.createElement;

test('React SSR — FilterQueryBuilder rows, operators and controls', async () => {
  const { default: FilterQueryBuilder } = await load('FilterQueryBuilder.tsx');
  const html = renderToStaticMarkup(
    h(FilterQueryBuilder, {
      fields: [
        { name: 'status', label: 'Status', operators: ['equals', 'not-equals'] },
        { name: 'amount', label: 'Amount', operators: ['greater', 'less', 'equals'] },
      ],
      rows: [
        { id: 'f1', conjunction: 'where', field: 'status', operator: 'equals', value: 'paid' },
        { id: 'f2', conjunction: 'and', field: 'amount', operator: 'greater', value: '100' },
      ],
      onChange: () => {},
    })
  );
  assert.ok(html.includes('data-filter-row="f1"'), 'first row hook');
  assert.ok(html.includes('data-filter-row="f2"'), 'second row hook');
  assert.ok(html.includes('where'), 'first conjunction');
  assert.ok(html.includes('and'), 'second conjunction');
  assert.ok(html.includes('Status'), 'field label');
  assert.ok(html.includes('&gt;'), 'operator glyph greater');
  assert.ok(html.includes('data-filter-value'), 'value input');
  assert.ok(html.includes('value="paid"'), 'row value');
  assert.ok(html.includes('+ Add filter'), 'add button');
  assert.ok(html.includes('Clear filters'), 'clear link');

  const empty = renderToStaticMarkup(h(FilterQueryBuilder, { fields: [{ name: 'status', label: 'Status' }], rows: [] }));
  assert.ok(empty.includes('data-filter-empty'), 'empty message');
  assert.ok(empty.includes('No filters applied.'), 'empty text');
  assert.ok(!empty.includes('data-filter-clear'), 'no clear when empty');
});

test('React SSR — ColumnVisibilityMenu counts, locks and toggles', async () => {
  const { default: ColumnVisibilityMenu } = await load('ColumnVisibilityMenu.tsx');
  const html = renderToStaticMarkup(
    h(ColumnVisibilityMenu, {
      columns: [
        { id: 'name', label: 'Name', locked: true },
        { id: 'email', label: 'Email' },
        { id: 'role', label: 'Role', hidden: true },
      ],
      showReorderHandles: true,
    })
  );
  assert.ok(html.includes('Showing'), 'count text');
  assert.ok(html.includes('of 3'), 'total count');
  assert.ok(html.includes('Reset to default'), 'reset link');
  assert.ok(html.includes('data-column-row="name"'), 'locked row');
  assert.ok(html.includes('data-column-row="role"'), 'hidden row');
  assert.ok(html.includes('data-column-toggle'), 'toggle button');
  assert.ok(html.includes('data-column-up') && html.includes('data-column-down'), 'reorder buttons');

  const applyMode = renderToStaticMarkup(
    h(ColumnVisibilityMenu, {
      columns: [
        { id: 'name', label: 'Name' },
        { id: 'email', label: 'Email' },
      ],
      visibleIds: ['name'],
      applyMode: 'apply-button',
    })
  );
  assert.ok(applyMode.includes('data-column-apply'), 'apply button in apply-button mode');
  assert.ok(applyMode.includes('Apply'), 'apply label');
});

test('React SSR — StatusCountTabs segmented strip with counts', async () => {
  const { default: StatusCountTabs } = await load('StatusCountTabs.tsx');
  const html = renderToStaticMarkup(
    h(StatusCountTabs, {
      tabs: [
        { id: 'all', label: 'All', count: 42 },
        { id: 'open', label: 'Open', count: 7 },
        { id: 'closed', label: 'Closed', count: 35 },
      ],
      value: 'open',
      onChange: () => {},
    })
  );
  assert.ok(html.includes('data-status-count-tabs'), 'host hook');
  assert.ok(html.includes('role="tablist"'), 'tablist role');
  assert.ok(html.includes('data-status-tab="all"'), 'all tab');
  assert.ok(html.includes('data-status-tab="open"'), 'open tab');
  assert.ok(html.includes('aria-selected="true"'), 'selected aria');
  assert.ok(html.includes('(42)'), 'all count');
  assert.ok(html.includes('(7)'), 'open count');
  assert.ok(html.includes('rounded-t-lg'), 'docked strip radius');
  assert.ok(html.includes('inset'), 'active inset shadow');

  const sm = renderToStaticMarkup(
    h(StatusCountTabs, { tabs: [{ id: 'a', label: 'A' }], value: 'a', size: 'sm', fullWidth: true })
  );
  assert.ok(sm.includes('px-3 py-1.5'), 'small size padding');
  assert.ok(sm.includes('w-full'), 'full width');
});

test('React SSR — EntityMultiSelectPicker avatars, checkboxes and footer', async () => {
  const { default: EntityMultiSelectPicker } = await load('EntityMultiSelectPicker.tsx');
  const html = renderToStaticMarkup(
    h(EntityMultiSelectPicker, {
      options: [
        { id: 'u1', label: 'Ada Lovelace' },
        { id: 'u2', label: 'Grace Hopper' },
        { id: 'u3', label: 'System', system: true },
        { id: 'u4', label: 'Linus T', avatar: 'https://example.com/a.png' },
      ],
      selected: ['u1'],
      onSelect: () => {},
      onSearch: () => {},
    })
  );
  assert.ok(html.includes('data-entity-picker'), 'host hook');
  assert.ok(html.includes('data-picker-search'), 'search input');
  assert.ok(html.includes('data-picker-option="u1"'), 'option row');
  assert.ok(html.includes('bg-indigo-600'), 'checked checkbox tone');
  assert.ok(html.includes('AL'), 'initials from label');
  assert.ok(html.includes('bg-sky-500'), 'system dot avatar');
  assert.ok(html.includes('https://example.com/a.png'), 'avatar image');
  assert.ok(html.includes('data-picker-confirm'), 'confirm button');
  assert.ok(html.includes('Insert results'), 'confirm label');
  assert.ok(html.includes('data-picker-cancel'), 'cancel button');
  assert.ok(html.includes('bg-blue-50'), 'selected row tone');

  const empty = renderToStaticMarkup(
    h(EntityMultiSelectPicker, { options: [{ id: 'u1', label: 'Ada' }], searchable: false })
  );
  assert.ok(!empty.includes('data-picker-search'), 'no search when unsearchable');
});

test('React SSR — FederatedSearchResultsPanel chips, snippets and legend', async () => {
  const { default: FederatedSearchResultsPanel } = await load('FederatedSearchResultsPanel.tsx');
  const html = renderToStaticMarkup(
    h(FederatedSearchResultsPanel, {
      query: 'deploy',
      results: [
        { id: 'r1', title: 'Deploy runbook', snippet: 'How to deploy safely', source: 'docs' },
        { id: 'r2', title: 'Deploy failures', snippet: 'Common deploy errors', source: 'issues' },
      ],
      sourceFilters: [
        { id: 'docs', label: 'Docs' },
        { id: 'issues', label: 'Issues' },
      ],
      selectedSources: ['docs'],
      onQueryChange: () => {},
      onSourceChange: () => {},
    })
  );
  assert.ok(html.includes('data-federated-search'), 'host hook');
  assert.ok(html.includes('data-federated-input'), 'search input');
  assert.ok(html.includes('Search everything…'), 'placeholder');
  assert.ok(html.includes('data-source-chip="docs"'), 'source chip');
  assert.ok(html.includes('aria-pressed="true"'), 'active chip pressed');
  assert.ok(html.includes('data-federated-result="r1"'), 'result row');
  assert.ok(html.includes('Deploy runbook'), 'result title');
  assert.ok(html.includes('<mark'), 'snippet highlight');
  assert.ok(html.includes('bg-yellow-200'), 'highlight tone');
  assert.ok(html.includes('Docs'), 'source label');
  assert.ok(html.includes('Navigate'), 'keyboard legend');
  assert.ok(html.includes('Press Tab to Ask AI'), 'ask ai pill');

  const filteredOut = renderToStaticMarkup(
    h(FederatedSearchResultsPanel, {
      query: '',
      results: [{ id: 'r1', title: 'Only docs', snippet: 'text', source: 'Docs' }],
      sourceFilters: [{ id: 'issues', label: 'Issues' }],
      selectedSources: ['issues'],
    })
  );
  assert.ok(filteredOut.includes('data-federated-empty'), 'empty state when filter excludes all');
  assert.ok(filteredOut.includes('No results match'), 'empty text');
});
