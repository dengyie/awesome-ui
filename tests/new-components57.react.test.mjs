/**
 * v3.2.0 batch — React SSR smoke tests
 * TableSavedViews, BottomTabBar, BentoFeatureGrid, LogoCloud, StatsBand.
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
  const target = join(cacheDir, file.replace(/\.tsx$/, '.n57.mjs'));
  writeFileSync(target, transpile(file));
  return import(pathToFileURL(target).href);
};

const h = React.createElement;

test('React SSR — TableSavedViews tabs and actions', async () => {
  const { default: TableSavedViews } = await load('TableSavedViews.tsx');
  const html = renderToStaticMarkup(h(TableSavedViews, {}));
  assert.ok(html.includes('All records'));
  assert.ok(html.includes('Save view'));
  assert.ok(html.includes('No filters'));
});

test('React SSR — BottomTabBar items and badges', async () => {
  const { default: BottomTabBar } = await load('BottomTabBar.tsx');
  const html = renderToStaticMarkup(h(BottomTabBar, {}));
  assert.ok(html.includes('data-bottomtab-item="home"'));
  assert.ok(html.includes('data-bottomtab-badge="inbox"'));
  assert.ok(html.includes('Primary navigation'));
});

test('React SSR — BentoFeatureGrid tiles with spans', async () => {
  const { default: BentoFeatureGrid } = await load('BentoFeatureGrid.tsx');
  const html = renderToStaticMarkup(h(BentoFeatureGrid, {}));
  assert.ok(html.includes('Ship faster'));
  assert.ok(html.includes('sm:col-span-2'));
  assert.ok(html.includes('Built for the AI era'));
});

test('React SSR — LogoCloud kicker and tiles', async () => {
  const { default: LogoCloud } = await load('LogoCloud.tsx');
  const html = renderToStaticMarkup(h(LogoCloud, {}));
  assert.ok(html.includes('Trusted by teams at'));
  assert.ok(html.includes('Acme Corp'));
});

test('React SSR — StatsBand values and responsive grid', async () => {
  const { default: StatsBand } = await load('StatsBand.tsx');
  const html = renderToStaticMarkup(h(StatsBand, {}));
  assert.ok(html.includes('221+'));
  assert.ok(html.includes('sm:grid-cols-4'));
  assert.ok(html.includes('Production components'));
});
