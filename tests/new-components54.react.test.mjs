/**
 * SSR tests for the v2.7.0 React components
 * (SessionDiagnosticsPanel, HelpCenterHome, AccountSecurityPanel, MasonryDensityControls).
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
  const cacheFile = join(cacheDir, file.replace(/\.tsx$/, '.n54.mjs'));
  writeFileSync(cacheFile, js);
  return import(pathToFileURL(cacheFile).href);
};

test('react SessionDiagnosticsPanel — devices, quality tracks and event log', async () => {
  const { default: SessionDiagnosticsPanel } = await loadComponent('SessionDiagnosticsPanel.tsx');
  const html = renderToStaticMarkup(React.createElement(SessionDiagnosticsPanel));
  assert.match(html, /data-sdiag/);
  assert.match(html, /data-sdiag-title/);
  assert.match(html, /data-sdiag-device="Browser"/);
  assert.match(html, /Chrome 126\.0\.0\.0/);
  assert.match(html, /data-sdiag-track="camera"/);
  assert.match(html, /data-sdiag-track="network"/);
  assert.match(html, /data-sdiag-window="good"/);
  assert.match(html, /data-sdiag-window="bad"/);
  assert.match(html, /data-sdiag-events/);
  assert.match(html, /data-sdiag-event="1"/);
  assert.match(html, /data-sdiag-search/);
  assert.match(html, /Search for an event/);
});

test('react HelpCenterHome — search form and expandable topics', async () => {
  const { default: HelpCenterHome } = await loadComponent('HelpCenterHome.tsx');
  const html = renderToStaticMarkup(React.createElement(HelpCenterHome));
  assert.match(html, /data-helpct/);
  assert.match(html, /data-helpct-title/);
  assert.match(html, /data-helpct-form/);
  assert.match(html, /data-helpct-input/);
  assert.match(html, /data-helpct-topic-btn="management"/);
  assert.match(html, /data-helpct-article="Refund policy"/);
  assert.match(html, /data-helpct-browse/);
  assert.match(html, /Or browse by topic/);
});

test('react AccountSecurityPanel — tabs, password row and sessions card', async () => {
  const { default: AccountSecurityPanel } = await loadComponent('AccountSecurityPanel.tsx');
  const html = renderToStaticMarkup(React.createElement(AccountSecurityPanel));
  assert.match(html, /data-acctsec/);
  assert.match(html, /data-acctsec-heading/);
  assert.match(html, /data-acctsec-tab="Security"/);
  assert.match(html, /data-acctsec-panel/);
  assert.match(html, /data-acctsec-password-value/);
  assert.match(html, /data-acctsec-edit-password/);
  assert.match(html, /data-acctsec-sessions-title/);
  assert.match(html, /Manage verified sessions/);
  assert.match(html, /data-acctsec-session="s1"/);
  assert.match(html, /data-acctsec-remove="s2"/);
  assert.match(html, /data-acctsec-done/);
});

test('react MasonryDensityControls — sliders, meta readout and masonry grid', async () => {
  const { default: MasonryDensityControls } = await loadComponent('MasonryDensityControls.tsx');
  const html = renderToStaticMarkup(React.createElement(MasonryDensityControls));
  assert.match(html, /data-masn/);
  assert.match(html, /data-masn-controls/);
  assert.match(html, /data-masn-size/);
  assert.match(html, /data-masn-padding/);
  assert.match(html, /data-masn-close/);
  assert.match(html, /data-masn-meta/);
  assert.match(html, /4 cols · 12px/);
  assert.match(html, /data-masn-grid/);
  assert.match(html, /data-masn-item="m1"/);
  assert.match(html, /images\.unsplash\.com/);
});
