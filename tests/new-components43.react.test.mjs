/**
 * SSR smoke tests for the v1.43.0 batch
 * (WriterStyleGuide, CampsiteHandoff, ZendeskFieldSuggest).
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

const load = async (file) => {
  const target = join(cacheDir, file.replace(/\.tsx$/, '.n43.mjs'));
  writeFileSync(target, transpile(file));
  return import(pathToFileURL(target).href);
};

const h = React.createElement;

test('React SSR — WriterStyleGuide tabs, entries and minutes', async () => {
  const { default: WriterStyleGuide } = await load('WriterStyleGuide.tsx');
  const html = renderToStaticMarkup(
    h(WriterStyleGuide, {
      activeTab: 'team',
      entries: [
        { id: 'g1', title: 'Avoid passive voice', description: 'It dilutes meaning.', minutes: 3 },
        { id: 'g2', title: 'Contracted forms', description: 'Write "can\'t".', minutes: 2 },
      ],
    })
  );
  assert.ok(html.includes('data-writer-style-guide'), 'guide hook');
  assert.ok(html.includes('data-writer-tab="company"'), 'company tab');
  assert.ok(html.includes('data-writer-tab="team"'), 'team tab');
  assert.ok(html.includes('data-writer-tab="my"'), 'my tab');
  assert.ok(html.includes('border-indigo-500'), 'active tab underline');
  assert.ok(html.includes('data-writer-entry="g1"'), 'entry g1');
  assert.ok(html.includes('Avoid passive voice'), 'entry title');
  assert.ok(html.includes('data-writer-entry-title'), 'title hook');
  assert.ok(html.includes('data-writer-entry-desc'), 'desc hook');
  assert.ok(html.includes('data-writer-entry-minutes'), 'minutes hook');
  assert.ok(html.includes('3 min'), 'minutes text');
  assert.ok(html.includes('data-writer-add'), 'add CTA');

  const empty = renderToStaticMarkup(h(WriterStyleGuide, { entries: [] }));
  assert.ok(!empty.includes('data-writer-entry='), 'no entries rendered');
});

test('React SSR — CampsiteHandoff checklist, avatars and summary', async () => {
  const { default: CampsiteHandoff } = await load('CampsiteHandoff.tsx');
  const html = renderToStaticMarkup(
    h(CampsiteHandoff, {
      items: [
        { id: 'h1', label: 'Redlines attached', done: true, assignee: 'Alex Smith', due: 'Nov 12' },
        { id: 'h2', label: 'Motion review', done: false, assignee: 'Brook Taylor' },
      ],
      summary: '2 tasks, 1 done.',
    })
  );
  assert.ok(html.includes('data-campsite-handoff'), 'panel hook');
  assert.ok(html.includes('data-campsite-handoff-title'), 'title hook');
  assert.ok(html.includes('data-campsite-handoff-count'), 'count hook');
  assert.ok(html.includes('1/2 done'), 'done count');
  assert.ok(html.includes('data-campsite-handoff-item="h1"'), 'item h1');
  assert.ok(html.includes('data-campsite-handoff-check'), 'checkbox hook');
  assert.ok(html.includes('checked'), 'done checkbox checked');
  assert.ok(html.includes('line-through'), 'done strikethrough');
  assert.ok(html.includes('data-campsite-handoff-assignee'), 'assignee hook');
  assert.ok(html.includes('AS'), 'initials avatar');
  assert.ok(html.includes('data-campsite-handoff-due'), 'due hook');
  assert.ok(html.includes('Nov 12'), 'due text');
  assert.ok(html.includes('data-campsite-handoff-summary'), 'summary hook');
  assert.ok(html.includes('AI summary'), 'summary label');
  assert.ok(html.includes('2 tasks, 1 done.'), 'summary text');
});

test('React SSR — ZendeskFieldSuggest chips, confidence and dismiss', async () => {
  const { default: ZendeskFieldSuggest } = await load('ZendeskFieldSuggest.tsx');
  const html = renderToStaticMarkup(
    h(ZendeskFieldSuggest, {
      fields: [
        { id: 'f1', label: 'Priority', value: 'Urgent', confidence: 0.94 },
        { id: 'f2', label: 'Type', value: 'Incident', confidence: 0.87 },
      ],
    })
  );
  assert.ok(html.includes('data-zendesk-field-suggest'), 'bar hook');
  assert.ok(html.includes('Suggested fields'), 'label text');
  assert.ok(html.includes('data-zendesk-suggest-field="f1"'), 'field f1');
  assert.ok(html.includes('Priority:'), 'field label');
  assert.ok(html.includes('Urgent'), 'field value');
  assert.ok(html.includes('94%'), 'confidence percent');
  assert.ok(html.includes('data-zendesk-suggest-dismiss'), 'dismiss hook');
  assert.ok(html.includes('Ignore'), 'dismiss label');
  assert.ok(html.includes('bg-amber-50'), 'amber tone');

  const empty = renderToStaticMarkup(h(ZendeskFieldSuggest, { fields: [] }));
  assert.ok(!empty.includes('data-zendesk-suggest-field='), 'no chips when empty');
});
