/**
 * SSR tests for the v2.6.0 React components
 * (PermissionMatrix, StockPhotoPicker, MapActivityList, SearchResultsPage).
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import ts from 'typescript';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const cacheDir = join(root, 'tests', 'node_modules', '.cache-components');
if (!existsSync(cacheDir)) mkdirSync(cacheDir, { recursive: true });

const loadComponent = (file) => {
  const source = readFileSync(join(root, 'react', file), 'utf8');
  const js = ts.transpileModule(source, {
    compilerOptions: { jsx: ts.JsxEmit.React, module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const cacheFile = join(cacheDir, file.replace(/\.tsx$/, '.n53.mjs'));
  writeFileSync(cacheFile, js);
  return import(pathToFileURL(cacheFile).href);
};

test('react PermissionMatrix — roles table with grouped rows and state cells', async () => {
  const { default: PermissionMatrix } = await loadComponent('PermissionMatrix.tsx');
  const html = renderToStaticMarkup(React.createElement(PermissionMatrix));
  assert.match(html, /data-permmtx/);
  assert.match(html, /data-permmtx-title/);
  assert.match(html, />Roles</);
  assert.match(html, /data-permmtx-tab="details"/);
  assert.match(html, /Permission details/);
  assert.match(html, /data-permmtx-group="employee"/);
  assert.match(html, /Employee Experience/);
  assert.match(html, /data-permmtx-row="onboarding"/);
  assert.match(html, /data-permmtx-role="Editor"/);
  assert.match(html, /data-permmtx-state="edit"/);
  assert.match(html, />Edit</);
  assert.match(html, /data-permmtx-state="na"/);
  assert.match(html, /N \/ A/);
  assert.match(html, /data-permmtx-state="none"/);
  assert.match(html, /No access/);
  assert.match(html, /data-permmtx-state="view"/);
  assert.match(html, /View only/);
});

test('react StockPhotoPicker — search bar, powered-by and photo grid', async () => {
  const { default: StockPhotoPicker } = await loadComponent('StockPhotoPicker.tsx');
  const html = renderToStaticMarkup(React.createElement(StockPhotoPicker));
  assert.match(html, /data-stkpic/);
  assert.match(html, /data-stkpic-title/);
  assert.match(html, />Stock photos</);
  assert.match(html, /data-stkpic-close/);
  assert.match(html, /data-stkpic-input/);
  assert.match(html, /data-stkpic-powered/);
  assert.match(html, /Powered by Unsplash/);
  assert.match(html, /data-stkpic-item="p1"/);
  assert.match(html, /data-stkpic-add="p6"/);
  assert.match(html, /Josephine Baran/);
  assert.match(html, /data-stkpic-grid/);
});

test('react MapActivityList — filter chips, activity cards, map pins', async () => {
  const { default: MapActivityList } = await loadComponent('MapActivityList.tsx');
  const html = renderToStaticMarkup(React.createElement(MapActivityList));
  assert.match(html, /data-mapact/);
  assert.match(html, /data-mapact-filter="Filters"/);
  assert.match(html, /Water activities/);
  assert.match(html, /data-mapact-item="a1"/);
  assert.match(html, /Seine River Sightseeing Evening Cruise with Champagne/);
  assert.match(html, /data-mapact-item-title="a4"/);
  assert.match(html, /4\.7 ★/);
  assert.match(html, /From \$95/);
  assert.match(html, /data-mapact-pin="a3"/);
  assert.match(html, /data-mapact-close/);
  assert.match(html, /Close map/);
});

test('react SearchResultsPage — topbar, filters, related chips and results', async () => {
  const { default: SearchResultsPage } = await loadComponent('SearchResultsPage.tsx');
  const html = renderToStaticMarkup(React.createElement(SearchResultsPage));
  assert.match(html, /data-srchres/);
  assert.match(html, /data-srchres-input/);
  assert.match(html, /value="brainstorming"/);
  assert.match(html, /data-srchres-filter="updated"/);
  assert.match(html, /data-srchres-related-heading/);
  assert.match(html, /Related searches/);
  assert.match(html, /data-srchres-related-chip="brainstorming techniques"/);
  assert.match(html, /data-srchres-result="s1"/);
  assert.match(html, /data-srchres-result-title="s2"/);
  assert.match(html, /Sam Design Guideline Document/);
  assert.match(html, /data-srchres-result-space="s2"/);
  assert.match(html, /5 results/);
});
