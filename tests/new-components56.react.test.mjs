/**
 * v3.1.1 batch — React SSR smoke tests
 * IntegrationConnectGrid, NotificationPrefsMatrix, PermissionDeniedState,
 * NoResultsState.
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
    .outputText.replace(/from ["']\.\/UiIcon["']/g, 'from "./UiIcon.mjs"');
};

const load = async (file) => {
  const target = join(cacheDir, file.replace(/\.tsx$/, '.n56.mjs'));
  writeFileSync(target, transpile(file));
  return import(pathToFileURL(target).href);
};

const h = React.createElement;

test('React SSR — IntegrationConnectGrid tabs and cards', async () => {
  const { default: IntegrationConnectGrid } = await load('IntegrationConnectGrid.tsx');
  const html = renderToStaticMarkup(h(IntegrationConnectGrid, {}));
  assert.ok(html.includes('Integrations'));
  assert.ok(html.includes('data-integration-card="gh"'));
  assert.ok(html.includes('Connected'));
  assert.ok(html.includes('Not connected'));
});

test('React SSR — NotificationPrefsMatrix rows and columns', async () => {
  const { default: NotificationPrefsMatrix } = await load('NotificationPrefsMatrix.tsx');
  const html = renderToStaticMarkup(h(NotificationPrefsMatrix, {}));
  assert.ok(html.includes('Mentions &amp; replies'));
  assert.ok(html.includes('data-pref-cell="mentions|email"'));
  assert.ok(html.includes('In-app'));
});

test('React SSR — PermissionDeniedState copy and CTA', async () => {
  const { default: PermissionDeniedState } = await load('PermissionDeniedState.tsx');
  const html = renderToStaticMarkup(h(PermissionDeniedState, { title: 'Restricted' }));
  assert.ok(html.includes('Restricted'));
  assert.ok(html.includes('Request access'));
  assert.ok(html.includes('data-denied-contact'));
});

test('React SSR — NoResultsState query echo and suggestions', async () => {
  const { default: NoResultsState } = await load('NoResultsState.tsx');
  const html = renderToStaticMarkup(h(NoResultsState, { query: 'deploy', suggestions: ['deployment'] }));
  assert.ok(html.includes('deploy'));
  assert.ok(html.includes('deployment'));
  assert.ok(html.includes('Clear all filters'));
});
